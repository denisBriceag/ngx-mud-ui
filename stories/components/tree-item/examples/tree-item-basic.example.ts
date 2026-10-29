import { Component, signal } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudTreeItem } from 'ngx-mud-ui/tree-item';

// The icons are registered once in app.config.ts: provideMudIcons([group, document, settings])
@Component({
  selector: 'app-tree-item-basic',
  imports: [MudTreeItem, MudIconComponent],
  template: `
    <nav aria-label="Settings">
      @for (page of pages; track page.id) {
        <!-- In an app: [routerLink]="page.url" routerLinkActive #rla="routerLinkActive" [selected]="rla.isActive" -->
        <a
          mud-tree-item
          href="#"
          [selected]="page.id === current()"
          (click)="current.set(page.id); $event.preventDefault()"
        >
          <mud-icon icon [name]="page.icon" [scale]="20" />
          <mud-icon selectedIcon [name]="page.icon" variant="filled" [scale]="20" />
          {{ page.label }}
        </a>
      }
      <button mud-tree-item type="button" disabled>
        <mud-icon icon name="settings" [scale]="20" />Advanced (disabled)
      </button>
    </nav>
  `,
  styles: `
    nav {
      display: flex;
      flex-direction: column;
      max-width: 320px;
    }
  `,
})
export class TreeItemBasicExample {
  readonly pages = [
    { id: 'profile', icon: 'group', label: 'Profile' },
    { id: 'documents', icon: 'document', label: 'Documents' },
  ] as const;
  readonly current = signal('profile');
}
