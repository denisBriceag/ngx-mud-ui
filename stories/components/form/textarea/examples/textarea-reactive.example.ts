import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextarea } from 'ngx-mud-ui/textarea';

@Component({
  selector: 'app-textarea-reactive',
  imports: [ReactiveFormsModule, MudTextarea, MudLabel, MudInlineMessage],
  template: `
    <mud-textarea
      [formControl]="reason"
      required
      [maxLength]="200"
      [invalid]="reason.invalid && reason.touched"
    >
      <mud-label>Motivul cererii</mud-label>
      @if (reason.invalid && reason.touched) {
        <mud-inline-message variant="error">Motivul este obligatoriu.</mud-inline-message>
      }
    </mud-textarea>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
})
export class TextareaReactiveExample {
  readonly reason = new FormControl('', { nonNullable: true, validators: Validators.required });
}
