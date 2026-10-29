import { Component } from '@angular/core';
import { MudChip } from 'ngx-mud-ui/chip';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icon is registered once in app.config.ts: provideMudIcons([document])
@Component({
  selector: 'app-chip-content',
  imports: [MudChip, MudIconComponent],
  template: `
    <mud-chip><mud-icon icon-start name="document" [scale]="16" />Acte</mud-chip>
    <mud-chip [count]="12">Cereri</mud-chip>
    <mud-chip type="input" removable label="Ana Popescu">
      <img avatar src="avatars/person-1.svg" alt="" />Ana Popescu
    </mud-chip>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ChipContentExample {}
