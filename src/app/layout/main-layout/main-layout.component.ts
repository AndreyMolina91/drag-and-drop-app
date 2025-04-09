import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ColumnBoardComponent } from '../../components/column-board/column-board.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    ColumnBoardComponent,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  searchOpen = false;
  searchText = '';

  toggleSearch(): void {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) {
      this.searchText = '';
    }
  }

  onSearchChange(value: string) {
    this.searchText = value.trim().toLowerCase();
  }
}
