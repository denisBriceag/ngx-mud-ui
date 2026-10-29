import { Component } from '@angular/core';
import type { MudBadgePosition } from 'ngx-mud-ui/badge';
import { MudCornerBadge } from 'ngx-mud-ui/badge';
import { MudButton, MudIconButton } from 'ngx-mud-ui/button';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icon is registered once in app.config.ts: provideMudIcons([notification])
@Component({
  selector: 'app-badge-corner',
  imports: [MudCornerBadge, MudButton, MudIconButton, MudIconComponent],
  template: `
    <div class="row">
      <button
        type="button"
        mudButton="outlined"
        color="strict"
        mudBadge="5"
        badgeDescription="5 unread messages"
      >
        Inbox
      </button>
      <button
        type="button"
        mudIconButton
        aria-label="Notifications"
        mudBadge
        badgeType="dot"
        badgeSize="sm"
        badgeDescription="New activity"
      >
        <mud-icon name="notification" [scale]="20" />
      </button>
      <button
        type="button"
        mudButton="outlined"
        color="strict"
        mudBadge="1204"
        [badgeMax]="99"
        badgeDescription="1204 messages"
      >
        Archive
      </button>
    </div>
    <div class="row">
      @for (position of positions; track position) {
        <span class="tile" mudBadge="1" [badgePosition]="position"></span>
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 32px;
    }
    .tile {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--mud-color-background-base-secondary);
    }
  `,
})
export class BadgeCornerExample {
  readonly positions: MudBadgePosition[] = [
    'above before',
    'above after',
    'below before',
    'below after',
  ];
}
