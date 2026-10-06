import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Book } from '../types';
import { BookService } from './book.service';

describe('BookService', () => {
  let service: BookService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookService);
  });

  it('returns the sample books when nothing has been saved yet', async () => {
    const books = await firstValueFrom(
      service.getBooks({
        searchValue: '',
        sortState: { active: 'id', direction: 'asc' },
      }),
    );

    expect(books.map(book => book.title)).toEqual(['Book 1', 'Book 2', 'Book 3']);
  });

  it('filters books by title without matching letter case', async () => {
    const books = await firstValueFrom(
      service.getBooks({
        searchValue: 'BOOK 2',
        sortState: { active: 'title', direction: 'asc' },
      }),
    );

    expect(books.map(book => book.title)).toEqual(['Book 2']);
  });

  it('sorts books by page count from highest to lowest', async () => {
    localStorage.setItem(
      'books',
      JSON.stringify([
        { id: 2, title: 'book 1 ', pages: 100 },
        { id: 1, title: 'book 2', pages: 400 },
        { id: 3, title: 'John Doe book', pages: 250 },
      ]),
    );

    const books = await firstValueFrom(
      service.getBooks({
        searchValue: '',
        sortState: { active: 'pages', direction: 'desc' },
      }),
    );

    expect(books.map(book => book.pages)).toEqual([400, 250, 100]);
  });

  it('adds a book with the next available id', async () => {
    localStorage.setItem(
      'books',
      JSON.stringify([
        { id: 1, title: 'One' },
        { id: 4, title: 'Four' },
      ]),
    );
    const book: Book = { title: 'New book', pages: 150 };

    const addedBook = await firstValueFrom(service.addBook(book));
    const savedBooks = JSON.parse(localStorage.getItem('books')!);

    expect(addedBook).toEqual(book);
    expect(savedBooks[2]).toEqual({ ...book, id: 5 });
  });

  it('updates a saved book', async () => {
    localStorage.setItem('books', JSON.stringify([{ id: 1, title: 'Old title' }]));
    const updatedBook: Book = { id: 1, title: 'New title', pages: 220 };

    const result = await firstValueFrom(service.updateBook(updatedBook));

    expect(result).toEqual(updatedBook);
    expect(JSON.parse(localStorage.getItem('books')!)).toEqual([updatedBook]);
  });

  it('deletes a book and reports whether it was found', async () => {
    localStorage.setItem(
      'books',
      JSON.stringify([
        { id: 1, title: 'Keep' },
        { id: 2, title: 'Remove' },
      ]),
    );

    expect(await firstValueFrom(service.deleteBook(2))).toBe(true);
    expect(await firstValueFrom(service.deleteBook(3))).toBe(false);
    expect(JSON.parse(localStorage.getItem('books')!)).toEqual([{ id: 1, title: 'Keep' }]);
  });

  it('deletes several books at once', async () => {
    localStorage.setItem(
      'books',
      JSON.stringify([
        { id: 1, title: 'One' },
        { id: 2, title: 'Two' },
        { id: 3, title: 'Three' },
      ]),
    );

    const deleted = await firstValueFrom(service.deleteBooks([1, 3]));

    expect(deleted).toBe(true);
    expect(JSON.parse(localStorage.getItem('books')!)).toEqual([{ id: 2, title: 'Two' }]);
  });
});
