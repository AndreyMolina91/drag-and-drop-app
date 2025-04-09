import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnBoardComponent } from './column-board.component';

describe('ColumnBoardComponent', () => {
  let component: ColumnBoardComponent;
  let fixture: ComponentFixture<ColumnBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnBoardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColumnBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
