import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSwitch } from 'ngx-mud-ui/switch';

@Component({
  selector: 'app-switch-signal-forms',
  imports: [FormField, MudSwitch, MudLabel],
  template: `
    <mud-switch [formField]="settings.autoSave"><mud-label>Salvare automată</mud-label></mud-switch>
    <p>value: {{ model().autoSave }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SwitchSignalFormsExample {
  readonly model = signal({ autoSave: true });
  readonly settings = form(this.model);
}
