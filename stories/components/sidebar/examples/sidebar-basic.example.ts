import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudSidebar, MudSidebarGroup, MudSidebarItem } from 'ngx-mud-ui/sidebar';

// The icons are registered once in app.config.ts: provideMudIcons([group, chart, document, settings, download])
@Component({
  selector: 'app-sidebar-basic',
  imports: [
    MudSidebar,
    MudSidebarGroup,
    MudSidebarItem,
    MudIconComponent,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    <mud-sidebar aria-label="Main navigation">
      <mud-sidebar-group heading="Services">
        @for (page of pages; track page.url) {
          <a
            mud-sidebar-item
            [routerLink]="page.url"
            routerLinkActive
            #rla="routerLinkActive"
            [selected]="rla.isActive"
          >
            <mud-icon icon [name]="page.icon" [scale]="20" />
            <mud-icon selectedIcon [name]="page.icon" variant="filled" [scale]="20" />
            {{ page.label }}
          </a>
        }
      </mud-sidebar-group>
      <mud-sidebar-group heading="Account">
        <a mud-sidebar-item routerLink="/downloads"
          ><mud-icon icon name="download" [scale]="20" />Downloads</a
        >
        <a mud-sidebar-item routerLink="/settings"
          ><mud-icon icon name="settings" [scale]="20" />Settings</a
        >
      </mud-sidebar-group>
    </mud-sidebar>
  `,
})
export class SidebarBasicExample {
  readonly pages = [
    { url: '/overview', icon: 'group', label: 'Overview' },
    { url: '/analytics', icon: 'chart', label: 'Analytics' },
    { url: '/documents', icon: 'document', label: 'Documents' },
  ] as const;
}
