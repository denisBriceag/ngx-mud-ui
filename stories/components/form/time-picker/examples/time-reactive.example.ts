import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTimeInput } from 'ngx-mud-ui/time-picker';

@Component({
  selector: 'app-time-reactive',
  imports: [ReactiveFormsModule, MudTimeInput, MudLabel, MudInlineMessage],
  template: `
    <mud-time-input
      [formControl]="start"
      required
      clearable
      [invalid]="start.touched && start.invalid"
    >
      <mud-label>Ora de început</mud-label>
      @if (start.touched && start.invalid) {
        <mud-inline-message variant="error">Alegeți o oră.</mud-inline-message>
      }
    </mud-time-input>
  `,
  styles: `
    :host {
      display: block;
      max-width: 320px;
    }
  `,
})
export class TimeReactiveExample {
  readonly start = new FormControl<string | null>(null, Validators.required);
}
