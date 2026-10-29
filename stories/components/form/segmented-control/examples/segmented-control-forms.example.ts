import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';

@Component({
  selector: 'app-segmented-control-forms',
  imports: [ReactiveFormsModule, FormField, MudSegmentedControl, MudSegment],
  template: `
    <!-- Reactive forms -->
    <mud-segmented-control aria-label="Monedă" [formControl]="currency">
      <button mud-segment value="MDL">MDL</button>
      <button mud-segment value="EUR">EUR</button>
      <button mud-segment value="USD">USD</button>
    </mud-segmented-control>

    <!-- Signal forms -->
    <mud-segmented-control aria-label="Sortare" [formField]="filters.order">
      <button mud-segment value="new">Cele mai noi</button>
      <button mud-segment value="old">Cele mai vechi</button>
    </mud-segmented-control>

    <p>currency: {{ currency.value }} · order: {{ model().order }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SegmentedControlFormsExample {
  readonly currency = new FormControl('MDL', { nonNullable: true });

  readonly model = signal({ order: 'new' });
  readonly filters = form(this.model);
}
