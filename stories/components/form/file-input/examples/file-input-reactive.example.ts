import { Component } from '@angular/core';
import type { ValidatorFn } from '@angular/forms';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudFileInput } from 'ngx-mud-ui/file-input';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

// A rule across the whole selection; the per-file limit is maxSize.
const totalSizeUnder =
  (limit: number): ValidatorFn =>
  (control) => {
    const total = (control.value as File[]).reduce((sum, file) => sum + file.size, 0);

    return total > limit ? { totalSize: { limit, total } } : null;
  };

@Component({
  selector: 'app-file-input-reactive',
  imports: [ReactiveFormsModule, MudFileInput, MudLabel, MudInlineMessage],
  template: `
    <!-- The value is the File[] itself, so validators see the real files. -->
    <mud-file-input
      multiple
      required
      accept=".pdf,image/*"
      [maxSize]="2 * 1024 * 1024"
      [formControl]="documents"
      [invalid]="documents.touched && documents.invalid"
    >
      <mud-label>Documente justificative</mud-label>
      @if (documents.touched && documents.hasError('totalSize')) {
        <mud-inline-message variant="error">Documentele depășesc 5 MB în total.</mud-inline-message>
      } @else if (documents.touched && documents.invalid) {
        <mud-inline-message variant="error">Încărcați cel puțin un document.</mud-inline-message>
      }
    </mud-file-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 520px;
    }
  `,
})
export class FileInputReactiveExample {
  readonly documents = new FormControl<File[]>([], {
    nonNullable: true,
    validators: [Validators.required, totalSizeUnder(5 * 1024 * 1024)],
  });
}
