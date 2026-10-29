import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-input-chip-basic',
  imports: [MudInputChip, MudLabel, MudInlineMessage],
  template: `
    <mud-input-chip [(value)]="keywords" placeholder="Adăugați cuvinte cheie">
      <mud-label>Cuvinte cheie</mud-label>
      <mud-inline-message hideIcon
        >Apăsați Enter sau virgulă după fiecare cuvânt.</mud-inline-message
      >
    </mud-input-chip>
    <p>value: {{ keywords().join(', ') || '[]' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class InputChipBasicExample {
  readonly keywords = signal(['pașaport', 'buletin']);
}
