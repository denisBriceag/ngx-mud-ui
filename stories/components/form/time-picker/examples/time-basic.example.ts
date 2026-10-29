import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTimeInput } from 'ngx-mud-ui/time-picker';

@Component({
  selector: 'app-time-basic',
  imports: [MudTimeInput, MudLabel, MudInlineMessage],
  template: `
    <mud-time-input [(value)]="time" clearable placeholder="OO:MM">
      <mud-label>Ora de început</mud-label>
      <mud-inline-message hideIcon>Scrieți ora sau alegeți-o din listă.</mud-inline-message>
    </mud-time-input>
    <p>value: {{ time() ?? 'null' }}</p>
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
export class TimeBasicExample {
  // Always 24-hour HH:MM, or null. Never a Date.
  readonly time = signal<string | null>('09:30');
}
