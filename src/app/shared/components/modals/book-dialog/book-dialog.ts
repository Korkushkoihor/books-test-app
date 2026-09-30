import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Book } from '../../../types';

@Component({
  selector: 'app-book-dialog',
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  templateUrl: './book-dialog.html',
  styleUrl: './book-dialog.scss',
})
export class BookDialog {
  private matDialogRef = inject(MatDialogRef<BookDialog>);
  readonly data = inject<Partial<Book> | undefined>(MAT_DIALOG_DATA, { optional: true });

  form = new FormGroup<{
    title: FormControl<string>;
      pages: FormControl<number | undefined>;
    author: FormControl<string>;
  }>({
    title: new FormControl('', { nonNullable: true, validators: Validators.required }),
    pages: new FormControl<number | undefined>(undefined, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    author: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        title: this.data.title ?? '',
        pages: this.data.pages ?? undefined,
        author: this.data.author ?? '',
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const book: Book = {
        ...this.form.getRawValue(),
        ...(this.data?.id === undefined ? {} : { id: this.data.id }),
      };
      this.matDialogRef.close(book);
    }
  }

  onCancel() {
    this.matDialogRef.close(null);
  }

}
