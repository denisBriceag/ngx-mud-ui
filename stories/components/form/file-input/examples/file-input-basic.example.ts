import { Component, signal } from '@angular/core';
import type { MudFileInputRejection } from 'ngx-mud-ui/file-input';
import { MudFileInput } from 'ngx-mud-ui/file-input';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-file-input-basic',
  imports: [MudFileInput, MudLabel, MudInlineMessage],
  template: `
    <mud-file-input
      accept=".pdf,image/*"
      multiple
      [maxFiles]="3"
      [maxSize]="5 * 1024 * 1024"
      [(value)]="files"
      (rejected)="rejection.set($event)"
    >
      <mud-label>Documente</mud-label>
      @if (rejection(); as r) {
        <mud-inline-message variant="error"
          >{{ r.file.name }}: {{ reasons[r.code] }}</mud-inline-message
        >
      }
    </mud-file-input>
    <p>value: {{ names() || '[]' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 520px;
    }
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class FileInputBasicExample {
  // Always a File[], even without multiple.
  readonly files = signal<File[]>([]);
  readonly rejection = signal<MudFileInputRejection | null>(null);
  readonly reasons = {
    type: 'format neacceptat',
    size: 'depășește 5 MB',
    count: 'cel mult 3 fișiere',
  };

  names(): string {
    return this.files()
      .map((file) => file.name)
      .join(', ');
  }
}
