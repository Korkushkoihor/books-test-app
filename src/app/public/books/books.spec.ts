import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BookService, XmlService } from '../../shared/services';
import { Book } from '../../shared/types';
import { Books } from './books';

const books: Book[] = [
  { id: 1, title: 'The Hobbit', pages: 310, author: 'J. R. R. Tolkien' },
  { id: 2, title: 'the question', pages: 412, author: 'john doe' },
];

describe('Books', () => {
  let component: Books;
  let fixture: ComponentFixture<Books>;
  let getBooks = vi.fn(() => of(books));
  let convertToXml = vi.fn();

  beforeEach(async () => {
    getBooks = vi.fn(() => of(books));
    convertToXml = vi.fn();

    await TestBed.configureTestingModule({
      imports: [Books],
      providers: [
        { provide: BookService, useValue: { getBooks } },
        { provide: XmlService, useValue: { convertToXml } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Books);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads books when the component opens', () => {
    expect(component.books()).toEqual(books);
    expect(component.dataSource.data).toEqual(books);
    expect(getBooks).toHaveBeenCalledWith({
      searchValue: '',
      sortState: { active: 'id', direction: 'asc' },
    });
  });

  it('reloads books when the search or sort changes', () => {
    component.onSearchChange('the question');
    expect(getBooks).toHaveBeenLastCalledWith({
      searchValue: 'the question',
      sortState: { active: 'id', direction: 'asc' },
    });
    component.onSortChange({ active: 'title', direction: 'desc' });
    expect(getBooks).toHaveBeenLastCalledWith({
      searchValue: 'the question',
      sortState: { active: 'title', direction: 'desc' },
    });
  });

  it('keeps the selected books in sync and can select all rows', () => {
    component.dataSource.data = books;

    component.selection.select(books[0]);
    expect(component.selectedBooks()).toEqual([books[0]]);
    expect(component.isSomeSelected()).toBe(true);
    expect(component.isAllSelected()).toBe(false);

    component.toggleAllRows();
    expect(component.selection.selected).toEqual(books);
    expect(component.isAllSelected()).toBe(true);

    component.toggleAllRows();
    expect(component.selection.selected).toEqual([]);
    expect(component.isAllSelected()).toBe(false);
  });

  it('exports only selected books', () => {
    component.selection.select(books[1]);

    component.exportSelectedBooks();

    expect(convertToXml).toHaveBeenCalledWith([books[1]]);
  });
});
