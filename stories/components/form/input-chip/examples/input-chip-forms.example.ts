import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, minLength } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-input-chip-forms',
  imports: [ReactiveFormsModule, FormField, MudInputChip, MudLabel, MudInlineMessage],
  template: `
    <!-- Reactive forms: the value is string[]. -->
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

    <!-- Signal forms -->
    <mud-input-chip [formField]="profile.skills">
      <mud-label>Competențe</mud-label>
      @if (profile.skills().touched() && profile.skills().invalid()) {
        <mud-inline-message variant="error">Adăugați cel puțin două competențe.</mud-inline-message>
      }
    </mud-input-chip>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 480px;
    }
  `,
})
export class InputChipFormsExample {
  readonly recipients = new FormControl<string[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });

  readonly model = signal({ skills: ['Angular'] });
  readonly profile = form(this.model, (path) => {
    minLength(path.skills, 2);
  });
}
