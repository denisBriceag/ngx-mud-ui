import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icon is registered once in app.config.ts: provideMudIcons([homeLine])
@Component({
  selector: 'app-breadcrumb-icon',
  imports: [MudBreadcrumb, MudBreadcrumbItem, MudIconComponent],
  template: `
    <nav mudBreadcrumb aria-label="Breadcrumb with icon">
      <ol>
        <li mudBreadcrumbItem>
          <a href="#"><mud-icon icon-start name="home-line" [scale]="16" />Acasă</a>
        </li>
        <li mudBreadcrumbItem><a href="#servicii">Servicii</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>

    <!-- Icon only: name the link, and give the crumb a label for the overflow menu and back link. -->
    <nav mudBreadcrumb aria-label="Breadcrumb with icon only">
      <ol>
        <li mudBreadcrumbItem label="Acasă">
          <a href="#" aria-label="Acasă"><mud-icon icon-start name="home-line" [scale]="16" /></a>
        </li>
        <li mudBreadcrumbItem><a href="#servicii">Servicii</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  `,
})
export class BreadcrumbIconExample {}
