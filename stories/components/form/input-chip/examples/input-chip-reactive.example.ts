import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-input-chip-reactive',
  imports: [ReactiveFormsModule, MudInputChip, MudLabel, MudInlineMessage],
  template: `
    <!-- The value is string[]. -->
    <mud-input-chip
      [formControl]="recipients"
      required
      [invalid]="recipients.touched && recipients.invalid"
    >
      <mud-label>Destinatari</mud-label>
      @if (recipients.touched && recipients.invalid) {
        <mud-inline-message variant="error">Adăugați cel puțin o adresă.</mud-inline-message>
      }
    </mud-input-chip>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
})
export class InputChipReactiveExample {
  readonly recipients = new FormControl<string[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
}
