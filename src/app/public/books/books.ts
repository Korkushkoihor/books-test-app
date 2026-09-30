import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BookService, XmlService } from '../../shared/services';
import { Book, BookFilter } from '../../shared/types';
import { MatIconModule } from '@angular/material/icon';
import { BookDialog } from '../../shared/components/modals/book-dialog/book-dialog';
import { ConfirmDialog } from '../../shared/components/modals/confirm-dialog/confirm-dialog';
import { MatDialog } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BooksFilter } from './books-filter/books-filter';

@Component({
  selector: 'app-books',
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatTableModule, 
    MatSortModule, 
    MatIconModule,
    MatCheckboxModule,
    BooksFilter
  ],
  templateUrl: './books.html',
  styleUrl: './books.scss',
})
export class Books implements OnInit {
  private bookService = inject(BookService);
  private xmlService = inject(XmlService);
  private dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  public books = signal<Book[]>([]);
  public selectedBooks = signal<Book[]>([]);
  public selection = new SelectionModel<Book>(
    true,
  );
  
  public displayedColumns: string[] = ['select', 'id', 'title', 'pages', 'author', 'actions'];
  public dataSource = new MatTableDataSource<Book>([]);
  
  private filter = signal<BookFilter>({ searchValue: '', sortState: { active: 'id', direction: 'asc' } });

  constructor() {
    this.selection.changed
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.selectedBooks.set([...this.selection.selected]));
  }

  ngOnInit(): void {
    this.loadBooks();
  }

  public editBook(book: Book): void {
    const dialogRef = this.dialog.open(BookDialog, {
      width: '420px',
      data: book,
    });

    dialogRef.afterClosed().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((updatedBook: Book | null) => {
      if (updatedBook) {
        this.bookService.updateBook(updatedBook)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.loadBooks();
          });
      }
    });
  }

  public openAddBookDialog(): void {
    const dialogRef = this.dialog.open(BookDialog, {
      width: '420px',
    });

    dialogRef.afterClosed().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((book: Book | undefined) => {
      if (book) {
        this.bookService.addBook(book)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.loadBooks();
        });
      }
    })
  }

  public deleteBook(book: Book): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the book "${book.title}"?`
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && book.id !== undefined) {
        this.bookService.deleteBook(book.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((deleted) => {
            if (deleted) {
              this.loadBooks();
            }
          });
      }
    });
  }

  public onSearchChange(searchValue: string): void {
    this.filter.update((currentFilter) => ({
      ...currentFilter,
      searchValue
    }));
    this.loadBooks();
  }

  public onSortChange(sortState: { active: string; direction: string }): void {
    this.filter.update((currentFilter) => ({
      ...currentFilter,
      sortState: sortState as { active: 'id' | 'title' | 'pages' | 'author'; direction: 'asc' | 'desc' }
    }));
    this.loadBooks();
  }

  private loadBooks(): void {
    this.bookService.getBooks(this.filter())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((books) => {
        this.books.set(books);
        this.dataSource.data = books;
      });
  }

    public toggleAllRows(): void {
      const allDisplayedSelected = this.isAllSelected();
      this.dataSource.data.forEach((book) => {
        if (allDisplayedSelected) {
          this.selection.deselect(book);
        } else {
          this.selection.select(book);
        }
      });
    }

    public isAllSelected(): boolean {
      return this.dataSource.data.length > 0 &&
        this.dataSource.data.every((book) => this.selection.isSelected(book));
    }

    public isSomeSelected(): boolean {
      const selectedDisplayed = this.dataSource.data.filter((book) => this.selection.isSelected(book)).length;
      return selectedDisplayed > 0 && selectedDisplayed < this.dataSource.data.length;
    }

    public exportSelectedBooks(): void {
      const selectedBooks = this.selection.selected;
      if (selectedBooks.length > 0) {
        this.xmlService.convertToXml(selectedBooks);
      }
    }

    public deleteSelectedBooks(): void {
      const selectedBooks = this.selection.selected;
      if (selectedBooks.length > 0) {
        const dialogRef = this.dialog.open(ConfirmDialog, {
          data: {
            title: 'Confirm Delete',
            message: `Are you sure you want to delete the selected ${selectedBooks.length} book(s)?`
          }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            const idsToDelete = selectedBooks.map(book => book.id).filter((id): id is number => id !== undefined);
            this.bookService.deleteBooks(idsToDelete)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((deleted) => {
                if (deleted) {
                  this.selection.clear();
                  this.loadBooks();
                }
              });
            }
          })
        }
    }

    public async importBooksFromXml(file: File): Promise<void> {
      try {
        const importedBooks = this.xmlService.parseXml(await file.text());
        this.bookService.addBooks(importedBooks)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.selection.clear();
            this.loadBooks();
          });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The XML file could not be imported.';
        window.alert(message);
      }
    }
}
