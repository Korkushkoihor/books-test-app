import { Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime } from 'rxjs';
import { Book } from '../../../shared/types';

@Component({
  selector: 'app-books-filter',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './books-filter.html',
  styleUrl: './books-filter.scss',
})
export class BooksFilter implements OnInit {
  public openAddBookDialogChange = output<void>();
  public importXmlChange = output<File>();
  public exportXmlChange = output<void>();
  public searchValueChange = output<string>();
  public deleteSelectedBooksChange = output<void>();

  public selectedBooks = input<Book[]>([]);
  
  private destroyRef = inject(DestroyRef);

  public searchControl = new FormControl();

  public onImportFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.importXmlChange.emit(file);
    }
    input.value = '';
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300), 
        takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const filterValue = this.searchControl.value;
        this.searchValueChange.emit(filterValue);
      });
  }
}
