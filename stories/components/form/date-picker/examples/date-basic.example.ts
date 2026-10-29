import { Component, signal } from '@angular/core';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-basic',
  imports: [MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <mud-date-input [(value)]="date" clearable>
      <mud-label>Data depunerii</mud-label>
      <mud-inline-message hideIcon>Scrieți data sau alegeți-o din calendar.</mud-inline-message>
    </mud-date-input>
    <p>value: {{ date() ?? 'null' }}</p>
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
export class DateBasicExample {
  // Always an ISO date string (YYYY-MM-DD), or null. Never a Date.
  readonly date = signal<string | null>('2026-03-15');
}
