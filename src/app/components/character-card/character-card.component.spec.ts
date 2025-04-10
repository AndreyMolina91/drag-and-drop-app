import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CharacterCardComponent } from './character-card.component';
import * as DragDropAdapter from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('CharacterCardComponent', () => {
  let component: CharacterCardComponent;
  let fixture: ComponentFixture<CharacterCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterCardComponent);
    component = fixture.componentInstance;

    // 👉 Mocks
    component.character = {
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      gender: 'Male',
      origin: { name: 'Earth' },
      image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
      isFavorite: false,
    };

    component.columnId = 'unassigned';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display character name', () => {
    const titleEl = fixture.debugElement.query(By.css('.character-name'));
    expect(titleEl.nativeElement.textContent).toContain('Rick Sanchez');
  });

  it('should toggle favorite status and emit event', () => {
    spyOn(component.favoriteToggled, 'emit');

    const icon: DebugElement = fixture.debugElement.query(
      By.css('.favorite-icon')
    );
    icon.triggerEventHandler('click', new MouseEvent('click'));

    expect(component.character.isFavorite).toBeTrue();
    expect(component.favoriteToggled.emit).toHaveBeenCalledWith({
      character: component.character,
    });
  });

  it('should apply status-based class (alive)', () => {
    const cardEl = fixture.debugElement.query(By.css('.character-card'));
    expect(cardEl.nativeElement.classList).toContain('alive');
  });

  it('should not throw if ngAfterViewInit is called manually', () => {
    expect(() => component.ngAfterViewInit()).not.toThrow();
  });
});
