import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';

@Component({
  selector: 'app-numeric-input-basic',
  imports: [MudNumericInput, MudLabel, MudInlineMessage],
  template: `
    <mud-numeric-input
      [(value)]="copies"
      [min]="1"
      [max]="10"
      [allowDecimal]="false"
      [allowNegative]="false"
      showSteppers
    >
      <mud-label>Număr de exemplare</mud-label>
      <mud-inline-message hideIcon>Între 1 și 10.</mud-inline-message>
    </mud-numeric-input>
    <p>value: {{ copies() ?? 'null' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 320px;
    }
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class NumericInputBasicExample {
  // null means "nothing entered", not 0.
  readonly copies = signal<number | null>(1);
}
