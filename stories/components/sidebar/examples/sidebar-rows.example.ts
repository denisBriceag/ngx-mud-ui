import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MudBadge } from 'ngx-mud-ui/badge';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudSidebar, MudSidebarGroup, MudSidebarItem } from 'ngx-mud-ui/sidebar';

// The icons are registered once in app.config.ts: provideMudIcons([group, settings, document, chart, filter])
@Component({
  selector: 'app-sidebar-rows',
  imports: [MudSidebar, MudSidebarGroup, MudSidebarItem, MudIconComponent, MudBadge, RouterLink],
  template: `
    <mud-sidebar aria-label="Row examples">
      <mud-sidebar-group heading="Rows">
        <a mud-sidebar-item routerLink="/default"
          ><mud-icon icon name="group" [scale]="20" />Default</a
        >
        <a mud-sidebar-item routerLink="/selected" selected>
          <mud-icon icon name="group" [scale]="20" />
          <mud-icon selectedIcon name="group" variant="filled" [scale]="20" />
          Selected
        </a>
        <!-- Only a button row can be disabled. -->
        <button mud-sidebar-item type="button" disabled>
          <mud-icon icon name="settings" [scale]="20" />Disabled
        </button>
        <a mud-sidebar-item routerLink="/documents">
          <mud-icon icon name="document" [scale]="20" />
          Documents
          <span secondaryLabel>12 new</span>
        </a>
        <a mud-sidebar-item routerLink="/reports">
          <mud-icon icon name="chart" [scale]="20" />
          Reports
          <mud-badge trailing [count]="9" variant="neutral" size="xl" />
        </a>
        <a mud-sidebar-item routerLink="/alerts">
          <mud-icon icon name="filter" [scale]="20" />
          Alerts
          <mud-badge trailing [count]="3" variant="danger" size="xl" />
        </a>
      </mud-sidebar-group>
    </mud-sidebar>
  `,
})
export class SidebarRowsExample {}
