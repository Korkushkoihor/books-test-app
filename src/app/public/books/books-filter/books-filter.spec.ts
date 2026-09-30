import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooksFilter } from './books-filter';

describe('BooksFilter', () => {
  let component: BooksFilter;
  let fixture: ComponentFixture<BooksFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooksFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(BooksFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
