import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSwitch } from 'ngx-mud-ui/switch';

@Component({
  selector: 'app-switch-reactive',
  imports: [ReactiveFormsModule, MudSwitch, MudLabel],
  template: `
    <mud-switch [formControl]="darkMode"><mud-label>Temă întunecată</mud-label></mud-switch>
    <p>value: {{ darkMode.value }}</p>
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
export class SwitchReactiveExample {
  readonly darkMode = new FormControl(false, { nonNullable: true });
}
