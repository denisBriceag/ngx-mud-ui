import { Component } from '@angular/core';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-formats',
  imports: [MudDateInput, MudLabel],
  template: `
    <mud-date-input format="DD/MM/YYYY" placeholder="ZZ/LL/AAAA" value="2026-03-15">
      <mud-label>DD/MM/YYYY (default), Romanian placeholder</mud-label>
    </mud-date-input>
    <mud-date-input format="MM/DD/YYYY" value="2026-03-15">
      <mud-label>MM/DD/YYYY</mud-label>
    </mud-date-input>
    <mud-date-input format="YYYY-MM-DD" value="2026-03-15">
      <mud-label>YYYY-MM-DD</mud-label>
    </mud-date-input>
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
export class DateFormatsExample {}
