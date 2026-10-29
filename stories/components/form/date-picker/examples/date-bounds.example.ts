import { Component } from '@angular/core';
import { MudDateInput, mudAddDays, mudDateToDate, mudToday } from 'ngx-mud-ui/date-picker';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-bounds',
  imports: [MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <mud-date-input
      [min]="today"
      [max]="inThirtyDays"
      [disabledDates]="holidays"
      [dateFilter]="weekdaysOnly"
    >
      <mud-label>Data programării</mud-label>
      <mud-inline-message hideIcon>Zile lucrătoare din următoarele 30 de zile.</mud-inline-message>
    </mud-date-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class DateBoundsExample {
  readonly today = mudToday();
  readonly inThirtyDays = mudAddDays(this.today, 30);
  readonly holidays = [mudAddDays(this.today, 3)];

  // true means the day can be picked.
  readonly weekdaysOnly = (iso: string): boolean => {
    const day = mudDateToDate(iso).getDay();

    return day !== 0 && day !== 6;
  };
}
