import { Component } from '@angular/core';
import type { MudSpinnerSize } from 'ngx-mud-ui/spinner';
import { MudSpinner } from 'ngx-mud-ui/spinner';

@Component({
  selector: 'app-spinner-basic',
  imports: [MudSpinner],
  template: `
    @for (size of sizes; track size) {
      <figure>
        <mud-spinner [size]="size" aria-label="Loading documents" />
        <figcaption>{{ size }}</figcaption>
      </figure>
    }
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-end;
      gap: 32px;
    }
    figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    figcaption {
      font-size: 12px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SpinnerBasicExample {
  readonly sizes: MudSpinnerSize[] = ['extra-small', 'small', 'medium', 'large'];
}
