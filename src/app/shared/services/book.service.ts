import { Injectable } from '@angular/core';
import { Book, BookFilter } from '../types';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private get _books(): Book[] {
    let booksFromStorage = localStorage.getItem('books');
    if (booksFromStorage) {
      return JSON.parse(booksFromStorage);
    } else {
      return [
        { id: 0, title: 'Book 1', pages: 100, author: 'Author 1' },
        { id: 1, title: 'Book 2', pages: 200, author: 'Author 2' },
        { id: 2, title: 'Book 3', pages: 300, author: 'Author 3' },
      ];
    }
  }

  public getBooks(filter: BookFilter): Observable<Book[]> {
    const filteredBooks = this._books.filter(book => book.title?.toLowerCase().includes(filter.searchValue.toLowerCase()));

    if (filter.sortState.direction === 'asc') {
      filteredBooks.sort((a, b) => {
        const aValue = a[filter.sortState.active] ?? '';
        const bValue = b[filter.sortState.active] ?? '';

        if (filter.sortState.active === 'id' || filter.sortState.active === 'pages') {
          return +aValue - +bValue;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    } else if (filter.sortState.direction === 'desc') {
      filteredBooks.sort((a, b) => {
        const aValue = a[filter.sortState.active] ?? '';
        const bValue = b[filter.sortState.active] ?? '';
        if (filter.sortState.active === 'id' || filter.sortState.active === 'pages') {
          return +bValue - +aValue;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }
    return of(filteredBooks);
  }

  public getBookById(id: number): Observable<Book> {
    const books = this._books;
    return of(books[id]);
  }

  public addBook(book: Book): Observable<Book> {
    const books = this._books;
    books.push({...book, id: this.getNextId()});
    localStorage.setItem('books', JSON.stringify(books));
    return of(book);  
  }

  public addBooks(newBooks: Book[]): Observable<Book[]> {
    const books = this._books;
    let nextId = books.length > 0 ? Math.max(...books.map((book) => book.id ?? 0)) + 1 : 0;
    const importedBooks = newBooks.map((book) => ({ ...book, id: nextId++ }));
    localStorage.setItem('books', JSON.stringify([...books, ...importedBooks]));
    return of(importedBooks);
  }

  public updateBook(updatedBook: Book): Observable<Book> {
    const books = this._books;
    const index = books.findIndex((book) => book.id === updatedBook.id);
    if (index !== -1) {
      books[index] = updatedBook;
      localStorage.setItem('books', JSON.stringify(books));
    }
    return of(books[index]);
  }

  public deleteBook(id: number): Observable<boolean> {
    const books = this._books;
    const index = books.findIndex((book) => book.id === id);
    if (index !== -1) {
      books.splice(index, 1);
      localStorage.setItem('books', JSON.stringify(books));
    }
    return of(index !== -1);  
  }

  public deleteBooks(ids: number[]): Observable<boolean> {
    const books = this._books;
    const initialLength = books.length;
    const remainingBooks = books.filter((book) => !ids.includes(book.id ?? -1));
    localStorage.setItem('books', JSON.stringify(remainingBooks));
    return of(remainingBooks.length < initialLength);  
  }

  public getNextId(): number {
    const books = this._books;
    return books.length > 0 ? Math.max(...books.map((book) => book.id || 0)) + 1 : 0;
  }
}