import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-text-input-basic',
  imports: [MudTextInput, MudLabel, MudInlineMessage],
  template: `
    <mud-text-input [(value)]="name" autocomplete="name">
      <mud-label>Nume complet</mud-label>
      <mud-inline-message hideIcon>Așa cum apare în actul de identitate.</mud-inline-message>
    </mud-text-input>
    <p>value: {{ name() || '—' }}</p>
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
export class TextInputBasicExample {
  readonly name = signal('');
}
