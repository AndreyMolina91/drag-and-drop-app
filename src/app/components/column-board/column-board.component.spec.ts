import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColumnBoardComponent } from './column-board.component';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CharactersService } from '../../services/characters.service';

const mockCharacters = [
  { id: 1, name: 'Rick Sanchez', isFavorite: false },
  { id: 2, name: 'Morty Smith', isFavorite: false },
];

class MockCharactersService {
  getAllCharacters() {
    return of(mockCharacters);
  }
}

describe('ColumnBoardComponent', () => {
  let component: ColumnBoardComponent;
  let fixture: ComponentFixture<ColumnBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, ColumnBoardComponent, HttpClientTestingModule],
      providers: [
        { provide: CharactersService, useClass: MockCharactersService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColumnBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // llama ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with characters in "Sin asignar" column', () => {
    const unassignedColumn = component.columns.find(
      (col) => col.id === 'unassigned'
    );
    expect(unassignedColumn?.characters.length).toBe(2);
    expect(unassignedColumn?.characters[0].name).toBe('Rick Sanchez');
    expect(unassignedColumn?.characters[1].name).toBe('Morty Smith');
  });

  it('should filter characters by name', () => {
    component.columns[0].characters = [
      { id: 1, name: 'Rick Sanchez', isFavorite: false },
      { id: 2, name: 'Morty Smith', isFavorite: false },
    ];
    component['allCharacters'] = [...component.columns[0].characters];

    component.filter = 'Rick';
    fixture.detectChanges();

    const filtered = component.columns[0].characters;
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toContain('Rick');
  });

  it('should move character to favorites on favorite toggle', () => {
    const rick = mockCharacters[0];
    rick.isFavorite = true;

    component.handleFavoriteToggle(rick);

    const favoritesColumn = component.columns.find((c) => c.id === 'favorites');
    expect(favoritesColumn?.characters).toContain(rick);
  });

  it('should move character back to unassigned when unfavorited', () => {
    // Usamos un nuevo objeto para no depender del estado de pruebas anteriores
    const morty = { id: 2, name: 'Morty Smith', isFavorite: false };

    const favoritesColumn = component.columns.find((c) => c.id === 'favorites');
    favoritesColumn?.characters.push(morty);

    component.handleFavoriteToggle(morty);

    const unassignedColumn = component.columns.find(
      (c) => c.id === 'unassigned'
    );
    expect(unassignedColumn?.characters).toContain(morty);
  });
});
