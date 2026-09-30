import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookDialog } from './book-dialog';

describe('BookDialog', () => {
  let component: BookDialog;
  let fixture: ComponentFixture<BookDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(BookDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
