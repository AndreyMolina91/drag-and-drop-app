import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MainLayoutComponent } from './main-layout.component';
import { By } from '@angular/platform-browser';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle search open and close', () => {
    expect(component.searchOpen).toBeFalse();

    component.toggleSearch();
    expect(component.searchOpen).toBeTrue();

    component.toggleSearch();
    expect(component.searchOpen).toBeFalse();
    expect(component.searchText).toBe('');
  });

  it('should update searchText on input change', () => {
    component.onSearchChange('  Rick ');
    expect(component.searchText).toBe('rick');

    component.onSearchChange('');
    expect(component.searchText).toBe('');
  });

  it('should bind searchText to ColumnBoardComponent', () => {
    const board = fixture.debugElement.query(By.css('app-column-board'));
    component.searchText = 'morty';
    fixture.detectChanges();

    expect(board.attributes['ng-reflect-filter']).toContain('morty');
  });
});
