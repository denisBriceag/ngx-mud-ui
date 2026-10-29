import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icons are registered once in app.config.ts: provideMudIcons([circleCheckmark, warning, deleteIcon])
@Component({
  selector: 'app-icon-color',
  imports: [MudIconComponent],
  template: `
    <span class="status positive"><mud-icon name="circle-checkmark" [scale]="20" /> Aprobat</span>
    <span class="status warning"><mud-icon name="warning" [scale]="20" /> În așteptare</span>
    <button type="button" class="delete">
      <mud-icon name="delete" aria-label="Șterge documentul" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    /* Icons are drawn with currentColor: color them with the semantic icon tokens. */
    .positive mud-icon {
      color: var(--mud-color-icon-positive-default);
    }
    .warning mud-icon {
      color: var(--mud-color-icon-warning-default);
    }
    .delete {
      display: inline-flex;
      padding: 8px;
      border: 0;
      border-radius: 8px;
      background: none;
      color: var(--mud-color-icon-danger-default);
      cursor: pointer;
    }
  `,
})
export class IconColorExample {}
