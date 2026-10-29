import { Component, signal } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSwitch } from 'ngx-mud-ui/switch';

@Component({
  selector: 'app-switch-basic',
  imports: [MudSwitch, MudLabel],
  template: `
    <mud-switch [(checked)]="emails"><mud-label>Notificări prin e-mail</mud-label></mud-switch>
    <mud-switch [checked]="true" disabled
      ><mud-label>Notificări SMS (indisponibil)</mud-label></mud-switch
    >
    <mud-switch disabled><mud-label>Oprit și dezactivat</mud-label></mud-switch>
    <p>emails: {{ emails() }}</p>
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
export class SwitchBasicExample {
  readonly emails = signal(true);
}
