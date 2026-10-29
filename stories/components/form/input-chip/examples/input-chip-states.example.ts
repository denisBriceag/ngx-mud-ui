import { Component } from '@angular/core';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-input-chip-states',
  imports: [MudInputChip, MudLabel],
  template: `
    <mud-input-chip [value]="tags" readonly><mud-label>Doar citire</mud-label></mud-input-chip>
    <mud-input-chip [value]="tags" disabled><mud-label>Dezactivat</mud-label></mud-input-chip>
    <mud-input-chip [value]="tags" size="lg"><mud-label>Mare (lg)</mud-label></mud-input-chip>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 480px;
    }
  `,
})
export class InputChipStatesExample {
  readonly tags = ['pașaport', 'buletin'];
}
