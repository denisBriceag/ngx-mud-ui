import { Component } from '@angular/core';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icons are registered once in app.config.ts: provideMudIcons([plusSmall, plusLarge, chevronBottom])
@Component({
  selector: 'app-button-icons',
  imports: [MudButton, MudIconButton, MudIconComponent],
  template: `
    <div class="row">
      <button type="button" mudButton>
        <mud-icon name="plus-small" [scale]="20" /> Add document
      </button>
      <button type="button" mudButton="outlined">
        More <mud-icon name="chevron-bottom" [scale]="20" />
      </button>
    </div>
    <div class="row">
      <button type="button" mudIconButton aria-label="Add">
        <mud-icon name="plus-large" [scale]="20" />
      </button>
      <button type="button" mudIconButton size="small" aria-label="Add">
        <mud-icon name="plus-small" [scale]="16" />
      </button>
      <button type="button" mudIconButton aria-label="Add" disabled>
        <mud-icon name="plus-large" [scale]="20" />
      </button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
})
export class ButtonIconsExample {}
