import { Component, signal } from '@angular/core';
import type { MudDateRange } from 'ngx-mud-ui/date-picker';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-range',
  imports: [MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <mud-date-input mode="range" [(value)]="period" clearable>
      <mud-label>Perioada</mud-label>
      <mud-inline-message hideIcon
        >După data de început, focusul trece la data de sfârșit.</mud-inline-message
      >
    </mud-date-input>
    <p>value: {{ period() ? period()!.start + ' → ' + period()!.end : 'null' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class DateRangeExample {
  readonly period = signal<MudDateRange | null>(null);
}
