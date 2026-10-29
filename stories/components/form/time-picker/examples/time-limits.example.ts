import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTimeInput } from 'ngx-mud-ui/time-picker';

@Component({
  selector: 'app-time-limits',
  imports: [MudTimeInput, MudLabel, MudInlineMessage],
  template: `
    <mud-time-input min="09:00" max="17:30" clearable>
      <mud-label>Program (09:00 – 17:30)</mud-label>
      <mud-inline-message hideIcon
        >O oră din afara intervalului nu este acceptată.</mud-inline-message
      >
    </mud-time-input>

    <mud-time-input [timeFilter]="noLunchBreak" min="09:00" max="17:30" [minuteStep]="15" clearable>
      <mud-label>Ora programării</mud-label>
      <mud-inline-message hideIcon>Din 15 în 15 minute, fără pauza de prânz.</mud-inline-message>
    </mud-time-input>
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
export class TimeLimitsExample {
  // true means the time can be picked. Keep it cheap: it runs for every hour and minute.
  readonly noLunchBreak = (time: string): boolean => !time.startsWith('12');
}
