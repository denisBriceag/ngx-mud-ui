import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudDateInput } from 'ngx-mud-ui/date-picker';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-date-reactive',
  imports: [ReactiveFormsModule, MudDateInput, MudLabel, MudInlineMessage],
  template: `
    <!-- The value is an ISO date string (YYYY-MM-DD), as most backends send it. -->
    <mud-date-input
      [formControl]="dob"
      required
      headerStyle="dropdown"
      [invalid]="dob.touched && dob.invalid"
    >
      <mud-label>Data nașterii</mud-label>
      @if (dob.touched && dob.invalid) {
        <mud-inline-message variant="error">Alegeți data nașterii.</mud-inline-message>
      }
    </mud-date-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
})
export class DateReactiveExample {
  readonly dob = new FormControl<string | null>('1990-05-15', Validators.required);
}
