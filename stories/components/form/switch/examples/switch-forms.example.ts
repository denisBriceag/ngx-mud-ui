import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSwitch } from 'ngx-mud-ui/switch';

@Component({
  selector: 'app-switch-forms',
  imports: [ReactiveFormsModule, FormField, MudSwitch, MudLabel],
  template: `
    <!-- Reactive forms -->
    <mud-switch [formControl]="darkMode"><mud-label>Temă întunecată</mud-label></mud-switch>

    <!-- Signal forms -->
    <mud-switch [formField]="settings.autoSave"><mud-label>Salvare automată</mud-label></mud-switch>

    <p>darkMode: {{ darkMode.value }} · autoSave: {{ model().autoSave }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    p {
      margin: 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SwitchFormsExample {
  readonly darkMode = new FormControl(false, { nonNullable: true });

  readonly model = signal({ autoSave: true });
  readonly settings = form(this.model);
}
