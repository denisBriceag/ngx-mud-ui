import { Component, signal } from '@angular/core';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-checkbox-basic',
  imports: [MudCheckbox, MudLabel, MudInlineMessage],
  template: `
    <mud-checkbox [(checked)]="newsletter">
      <mud-label>Vreau să primesc noutăți prin e-mail</mud-label>
      <mud-inline-message hideIcon>Cel mult un e-mail pe lună.</mud-inline-message>
    </mud-checkbox>
    <p>checked: {{ newsletter() }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class CheckboxBasicExample {
  readonly newsletter = signal(false);
}
