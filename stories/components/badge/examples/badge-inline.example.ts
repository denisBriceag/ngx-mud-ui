import { Component } from '@angular/core';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-badge-inline',
  imports: [MudBadge, MudButton],
  template: `
    <button type="button" mudButton color="secondary">
      Filters <mud-badge [count]="3" variant="neutral" size="lg" />
    </button>
    <button type="button" mudButton="outlined" color="strict">
      Drafts <mud-badge [count]="12" variant="accent" size="lg" />
    </button>
    <span class="item">Inbox <mud-badge [count]="5" aria-label="5 unread messages" /></span>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }
    .item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `,
})
export class BadgeInlineExample {}
