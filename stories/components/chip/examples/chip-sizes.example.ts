import { Component } from '@angular/core';
import { MudChip } from 'ngx-mud-ui/chip';

@Component({
  selector: 'app-chip-sizes',
  imports: [MudChip],
  template: `
    <div class="row">
      <mud-chip>Medium</mud-chip>
      <mud-chip [selected]="true">Selected</mud-chip>
      <mud-chip disabled>Disabled</mud-chip>
      <mud-chip type="input" removable>Input</mud-chip>
    </div>
    <div class="row">
      <mud-chip size="small">Small</mud-chip>
      <mud-chip size="small" [selected]="true">Selected</mud-chip>
      <mud-chip size="small" disabled>Disabled</mud-chip>
      <mud-chip size="small" type="input" removable>Input</mud-chip>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class ChipSizesExample {}
