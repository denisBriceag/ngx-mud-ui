import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';

@Component({
  selector: 'app-segmented-control-signal-forms',
  imports: [FormField, MudSegmentedControl, MudSegment],
  template: `
    <mud-segmented-control aria-label="Sortare" [formField]="filters.order">
      <button mud-segment value="new">Cele mai noi</button>
      <button mud-segment value="old">Cele mai vechi</button>
    </mud-segmented-control>
    <p>value: {{ model().order }}</p>
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
export class SegmentedControlSignalFormsExample {
  readonly model = signal({ order: 'new' });
  readonly filters = form(this.model);
}
