import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';

@Component({
  selector: 'app-segmented-control-reactive',
  imports: [ReactiveFormsModule, MudSegmentedControl, MudSegment],
  template: `
    <mud-segmented-control aria-label="Monedă" [formControl]="currency">
      <button mud-segment value="MDL">MDL</button>
      <button mud-segment value="EUR">EUR</button>
      <button mud-segment value="USD">USD</button>
    </mud-segmented-control>
    <p>value: {{ currency.value }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SegmentedControlReactiveExample {
  readonly currency = new FormControl('MDL', { nonNullable: true });
}
