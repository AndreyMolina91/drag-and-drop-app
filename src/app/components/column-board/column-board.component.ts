import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnInit, signal } from '@angular/core';
import { CharacterCardComponent } from '../character-card/character-card.component';
import { CharactersService } from '../../services/characters.service';

// importaciones necesarias para utilizar el dragable
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

@Component({
  selector: 'app-column-board',
  standalone: true,
  imports: [CommonModule, CharacterCardComponent],
  templateUrl: './column-board.component.html',
  styleUrl: './column-board.component.scss',
})
export class ColumnBoardComponent implements OnInit, AfterViewInit {
  private _filter = '';
  @Input()
  set filter(value: string) {
    this._filter = value;
    this.applyFilter();
  }
  characters: any[] = [];
  private allCharacters: any[] = [];
  isDraggedOver = signal(false);

  columns: { title: string; id: string; characters: any[] }[] = [
    { title: 'Sin asignar', id: 'unassigned', characters: [] },
    { title: 'Favoritos', id: 'favorites', characters: [] },
    { title: 'Explorados', id: 'explored', characters: [] },
  ];

  constructor(private charactersService: CharactersService) {}

  ngOnInit(): void {
    this.charactersService.getAllCharacters().subscribe((data) => {
      this.allCharacters = data;
      // Por ahora los metemos todos en la primera columna
      this.columns[0].characters = data;
    });
  }

  ngAfterViewInit(): void {
    this.setupDnDMonitor();

    requestAnimationFrame(() => {
      const dropElements = document.querySelectorAll<HTMLElement>('.column');

      dropElements.forEach((el) => {
        const columnId = el.getAttribute('data-column-id');
        if (!columnId) return;

        dropTargetForElements({
          element: el,
          getData: () => ({
            columnId,
            type: 'column',
          }),
          onDragEnter: () => this.isDraggedOver.set(true),
          onDragLeave: () => this.isDraggedOver.set(false),
          onDrop: () => this.isDraggedOver.set(false),
        });
      });
    });
  }

  ngOnChanges(): void {
    this.applyFilter();
  }

  applyFilter() {
    const term = this._filter.toLowerCase();
    this.columns[0].characters = this.allCharacters.filter((char) =>
      char.name.toLowerCase().includes(term)
    );
  }

  setupDnDMonitor(): void {
    monitorForElements({
      onDrag: ({ location }) => {
        // Limpiar todos los resaltados anteriores
        document
          .querySelectorAll('.hover-target')
          .forEach((el) => el.classList.remove('hover-target'));

        // Detectar la card destino sobre la que se está arrastrando
        const destinationCard = location.current.dropTargets.find(
          (t) => t.data?.['type'] === 'card'
        );

        if (destinationCard) {
          const id = destinationCard.data['itemId'];
          const el = document.querySelector(
            `[data-item-id="${id}"]`
          ) as HTMLElement;
          if (el) {
            el.classList.add('hover-target');
          }
        }
      },

      onDrop: ({ source, location }) => {
        // Limpiar cualquier clase visual residual
        document
          .querySelectorAll('.hover-target')
          .forEach((el) => el.classList.remove('hover-target'));

        const { itemId, fromColumnId } = source.data as {
          itemId: string;
          fromColumnId: string;
        };

        if (!itemId || !fromColumnId) return;

        const dropTargets = location.current.dropTargets;
        if (!dropTargets.length) return;

        const destinationColumn = dropTargets.find(
          (t) => t.data?.['type'] === 'column'
        );
        const destinationCard = dropTargets.find(
          (t) => t.data?.['type'] === 'card'
        );

        if (!destinationColumn) return;

        const { columnId: toColumnId } = destinationColumn.data as {
          columnId: string;
        };

        // Reordenamiento dentro de la misma columna
        if (fromColumnId === toColumnId && destinationCard) {
          const { itemId: destinationItemId } = destinationCard.data as {
            itemId: string;
          };

          const destinationEdge = extractClosestEdge(destinationCard.data);

          this.reorderCardWithinColumn({
            columnId: toColumnId,
            itemId,
            destinationItemId,
            destinationEdge,
          });

          return;
        }

        // Misma columna, pero sin destino → ir al final
        if (fromColumnId === toColumnId && !destinationCard) {
          this.reorderCardToEndOfColumn(itemId, fromColumnId);
          return;
        }

        // Mover entre columnas
        if (fromColumnId !== toColumnId) {
          const destinationEdge = destinationCard
            ? extractClosestEdge(destinationCard.data)
            : null;

          const destinationItemId = destinationCard?.data?.['itemId'] as string;

          if (destinationItemId && destinationEdge) {
            this.moveCardBetweenColumns({
              itemId,
              fromColumnId,
              toColumnId,
              destinationItemId,
              destinationEdge,
            });
          } else {
            this.moveCardToColumn(itemId, fromColumnId, toColumnId);
          }
        }
      },
    });
  }

  moveCardBetweenColumns({
    itemId,
    fromColumnId,
    toColumnId,
    destinationItemId,
    destinationEdge,
  }: {
    itemId: string;
    fromColumnId: string;
    toColumnId: string;
    destinationItemId: string;
    destinationEdge: Edge | null;
  }): void {
    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-item-id="${itemId}"]`
      ) as HTMLElement;
      if (el) triggerPostMoveFlash(el);
    });

    const from = this.columns.find((c) => c.id === fromColumnId);
    const to = this.columns.find((c) => c.id === toColumnId);
    if (!from || !to) return;

    const fromIndex = from.characters.findIndex((c) => c.id === itemId);
    const targetIndex = to.characters.findIndex(
      (c) => c.id === destinationItemId
    );

    if (fromIndex === -1 || targetIndex === -1) return;

    const [moved] = from.characters.splice(fromIndex, 1);

    const insertIndex = getReorderDestinationIndex({
      axis: 'vertical',
      startIndex: 0, // irrelevant in cross-column
      indexOfTarget: targetIndex,
      closestEdgeOfTarget: destinationEdge,
    });

    to.characters.splice(insertIndex, 0, moved);

    from.characters = [...from.characters];
    to.characters = [...to.characters];
  }

  reorderCardToEndOfColumn(itemId: string, columnId: string): void {
    const column = this.columns.find((c) => c.id === columnId);
    if (!column) return;

    const index = column.characters.findIndex((c) => c.id === itemId);
    if (index === -1) return;

    const [moved] = column.characters.splice(index, 1);
    column.characters.push(moved);
    column.characters = [...column.characters];
  }

  reorderCardWithinColumn({
    columnId,
    itemId,
    destinationItemId,
    destinationEdge,
  }: {
    columnId: string;
    itemId: string;
    destinationItemId: string;
    destinationEdge: Edge | null;
  }): void {
    triggerPostMoveFlash(
      document.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement
    );

    const column = this.columns.find((c) => c.id === columnId);
    if (!column) return;

    const items = [...column.characters];
    const startIndex = items.findIndex((item) => item.id === itemId);
    const indexOfTarget = items.findIndex(
      (item) => item.id === destinationItemId
    );

    if (startIndex === -1 || indexOfTarget === -1) return;

    const finishIndex = getReorderDestinationIndex({
      axis: 'vertical',
      startIndex,
      indexOfTarget,
      closestEdgeOfTarget: destinationEdge,
    });

    const [moved] = items.splice(startIndex, 1);
    items.splice(finishIndex, 0, moved);
    column.characters = items;
  }

  moveCardToColumn(
    characterId: string,
    fromColumnId: string,
    toColumnId: string
  ): void {
    requestAnimationFrame(() => {
      const el = document.querySelector(
        `[data-item-id="${characterId}"]`
      ) as HTMLElement;
      if (el) triggerPostMoveFlash(el);
    });

    const fromColumn = this.columns.find((col) => col.id === fromColumnId);
    const toColumn = this.columns.find((col) => col.id === toColumnId);

    if (!fromColumn || !toColumn) return;

    const index = fromColumn.characters.findIndex(
      (char) => char.id === characterId
    );
    if (index === -1) return;

    const [movedCharacter] = fromColumn.characters.splice(index, 1);
    toColumn.characters.push(movedCharacter);
    navigator.vibrate?.(100);
  }

  handleFavoriteToggle(character: any) {
    const currentColumn = this.columns.find((col) =>
      col.characters.includes(character)
    );

    const targetColumnId = character.isFavorite ? 'favorites' : 'unassigned';
    const targetColumn = this.columns.find((col) => col.id === targetColumnId);

    if (!currentColumn || !targetColumn) return;

    // Ya está en la columna destino
    if (currentColumn.id === targetColumnId) return;

    // Mover card
    const index = currentColumn.characters.indexOf(character);
    if (index > -1) {
      currentColumn.characters.splice(index, 1);
      targetColumn.characters.unshift(character); // opcional: añadir al inicio
    }
  }

  trackByCharacterId(index: number, item: any): string {
    return item.id;
  }
}
