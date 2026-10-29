import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MudIconButton } from 'ngx-mud-ui/button';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import {
  MudSidebar,
  MudSidebarGroup,
  MudSidebarHeader,
  MudSidebarItem,
  MudSidebarToggle,
} from 'ngx-mud-ui/sidebar';

// The icons are registered once in app.config.ts: provideMudIcons([sidebar, group, chart, document, settings])
@Component({
  selector: 'app-sidebar-compact',
  imports: [
    MudSidebar,
    MudSidebarHeader,
    MudSidebarGroup,
    MudSidebarItem,
    MudSidebarToggle,
    MudIconButton,
    MudIconComponent,
    RouterLink,
  ],
  template: `
    <mud-sidebar aria-label="Main navigation" [(collapsed)]="collapsed">
      <!-- Keep the toggle outside any @if, so it keeps focus when the rail switches. -->
      <div mudSidebarHeader class="header">
        <button mudIconButton mudSidebarToggle aria-label="Menu">
          <mud-icon name="sidebar" [scale]="20" />
        </button>
      </div>
      <mud-sidebar-group heading="Services">
        <a mud-sidebar-item routerLink="/overview" selected>
          <mud-icon icon name="group" [scale]="20" />
          <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />
          Overview
        </a>
        <a mud-sidebar-item routerLink="/analytics"
          ><mud-icon icon name="chart" [scale]="20" />Analytics</a
        >
        <a mud-sidebar-item routerLink="/documents"
          ><mud-icon icon name="document" [scale]="20" />Documents</a
        >
      </mud-sidebar-group>
      <mud-sidebar-group>
        <a mud-sidebar-item routerLink="/settings"
          ><mud-icon icon name="settings" [scale]="20" />Settings</a
        >
      </mud-sidebar-group>
    </mud-sidebar>
    <p>collapsed: {{ collapsed() }}</p>
  `,
  styles: `
    /* The toggle sits at the end of the header in the full sidebar; the rail centers it. */
    mud-sidebar:not(.mud-sidebar--compact) .header {
      align-items: flex-end;
    }
    p {
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SidebarCompactExample {
  readonly collapsed = signal(true);
}
