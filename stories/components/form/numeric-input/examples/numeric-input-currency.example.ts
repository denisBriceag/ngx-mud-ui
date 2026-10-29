import { Component, signal } from '@angular/core';
import type { MudNumericInputErrorKind } from 'ngx-mud-ui/numeric-input';
import { MudNumericInput } from 'ngx-mud-ui/numeric-input';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-numeric-input-currency',
  imports: [MudNumericInput, MudLabel, MudInlineMessage],
  template: `
    <mud-numeric-input
      [(value)]="amount"
      locale="ro-MD"
      [precision]="2"
      [min]="0"
      [max]="100000"
      clearable
      (errored)="error.set($event)"
      (stepped)="error.set(null)"
    >
      <mud-label>Suma</mud-label>
      <span suffix>MDL</span>
      @if (error() === 'out-of-range') {
        <mud-inline-message variant="warning"
          >Suma a fost ajustată la limita permisă.</mud-inline-message
        >
      }
    </mud-numeric-input>
    <mud-numeric-input [value]="1250.5" locale="en-US" [precision]="2" readonly>
      <mud-label>Amount (en-US)</mud-label>
      <span prefix>$</span>
    </mud-numeric-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 320px;
    }
  `,
})
export class NumericInputCurrencyExample {
  readonly amount = signal<number | null>(1250.5);
  readonly error = signal<MudNumericInputErrorKind | null>(null);
}
