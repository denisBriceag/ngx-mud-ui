import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-breadcrumb-narrow',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <div class="card">
      <nav mudBreadcrumb>
        <ol>
          <li mudBreadcrumbItem><a href="#">Acasă</a></li>
          <li mudBreadcrumbItem><a href="#servicii">Servicii</a></li>
          <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
        </ol>
      </nav>
    </div>
  `,
  styles: `
    .card {
      width: 360px;
      max-width: 100%;
      padding: 12px;
      border: 1px dashed var(--mud-color-border-base-default);
    }
  `,
})
export class BreadcrumbNarrowExample {}
