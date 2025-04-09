import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

@Component({
  selector: 'app-character-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './character-card.component.html',
  styleUrls: ['./character-card.component.scss'],
})
export class CharacterCardComponent implements AfterViewInit {
  @Input() character: any;
  @Input() columnId!: string;
  @Output() favoriteToggled = new EventEmitter<{ character: any }>();

  isDragging = signal(false);

  constructor(private hostRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const el = this.hostRef.nativeElement;
    if (!el) return;

    // ✅ Activar como draggable
    draggable({
      element: el,
      getInitialData: () => ({
        type: 'card',
        itemId: this.character.id,
        fromColumnId: this.columnId,
      }),
      onDragStart: () => {
        this.isDragging.set(true);
        el.classList.add('dragging');
      },
      onDrop: () => {
        this.isDragging.set(false);
        el.classList.remove('dragging');
      },
    });

    // ✅ Activar como drop target
    dropTargetForElements({
      element: el,
      getData: () => ({
        type: 'card',
        itemId: this.character.id,
        columnId: this.columnId,
      }),
      onDragEnter: () => el.classList.add('hovered'),
      onDragLeave: () => el.classList.remove('hovered'),
      onDrop: () => el.classList.remove('hovered'),
    });
  }

  toggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    this.character.isFavorite = !this.character.isFavorite;
    this.favoriteToggled.emit({ character: this.character });
  }
}
