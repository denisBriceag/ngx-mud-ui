import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

@Component({
  selector: 'app-select-basic',
  imports: [MudSelectInput, MudLabel, MudInlineMessage],
  template: `
    <mud-select-input [options]="raions" [(value)]="raion" placeholder="Alegeți raionul">
      <mud-label>Raion</mud-label>
      <mud-inline-message hideIcon>Raionul de domiciliu.</mud-inline-message>
    </mud-select-input>
    <p>value: {{ raion() ?? '—' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SelectBasicExample {
  readonly raions: MudSelectOption<string>[] = [
    { value: 'chisinau', label: 'Chișinău' },
    { value: 'balti', label: 'Bălți' },
    { value: 'cahul', label: 'Cahul' },
    { value: 'orhei', label: 'Orhei', disabled: true },
    { value: 'ungheni', label: 'Ungheni' },
  ];
  readonly raion = signal<string | undefined>(undefined);
}
