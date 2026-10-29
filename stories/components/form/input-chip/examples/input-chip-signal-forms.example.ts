import { Component, signal } from '@angular/core';
import { form, FormField, minLength } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-input-chip-signal-forms',
  imports: [FormField, MudInputChip, MudLabel, MudInlineMessage],
  template: `
    <mud-input-chip [formField]="profile.skills">
      <mud-label>Competențe</mud-label>
      @if (profile.skills().touched() && profile.skills().invalid()) {
        <mud-inline-message variant="error">Adăugați cel puțin două competențe.</mud-inline-message>
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
export class InputChipSignalFormsExample {
  readonly model = signal({ skills: ['Angular'] });
  readonly profile = form(this.model, (path) => {
    minLength(path.skills, 2);
  });
}
