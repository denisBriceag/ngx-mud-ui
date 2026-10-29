import { Component } from '@angular/core';
import { MudDateInput, MudDatePicker } from 'ngx-mud-ui/date-picker';
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-localized',
  imports: [MudDateInput, MudDatePicker, MudLabel],
  // In an app these usually go in app.config.ts.
  providers: [
    provideMudLabels(MUD_LABELS_RO, {
      // Intl's short month names end in a dot in Romanian; set your own to drop it.
      datePicker: {
        monthNamesShort: [
          'Ian',
          'Feb',
          'Mar',
          'Apr',
          'Mai',
          'Iun',
          'Iul',
          'Aug',
          'Sep',
          'Oct',
          'Noi',
          'Dec',
        ],
      },
    }),
    provideMudFormatLocale('ro'),
  ],
  template: `
    <mud-date-input placeholder="ZZ/LL/AAAA" clearable>
      <mud-label>Data</mud-label>
    </mud-date-input>
    <mud-date-picker aria-label="Calendar" startAt="2026-08-01" headerStyle="dropdown" />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 420px;
    }
  `,
})
export class DateLocalizedExample {}
