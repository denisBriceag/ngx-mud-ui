import { Component, signal } from '@angular/core';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-badge-live',
  imports: [MudBadge, MudButton],
  template: `
    <span class="item">
      Notifications
      <mud-badge live [count]="unread()" [aria-label]="unread() + ' unread notifications'" />
    </span>
    <button type="button" mudButton="outlined" size="sm" (click)="unread.set(unread() + 1)">
      New notification
    </button>
    <button type="button" mudButton="text" size="sm" (click)="unread.set(0)">Mark all read</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
    .item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `,
})
export class BadgeLiveExample {
  readonly unread = signal(2);
}
