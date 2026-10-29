import { Component, signal } from '@angular/core';
import { MudTimePicker } from 'ngx-mud-ui/time-picker';

@Component({
  selector: 'app-time-picker',
  imports: [MudTimePicker],
  template: `
    <mud-time-picker [(value)]="time" min="08:00" max="18:00" [minuteStep]="5" />
    <p>value: {{ time() ?? 'null' }} (set once an hour and a minute are picked)</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class TimePickerExample {
  readonly time = signal<string | null>(null);
}
