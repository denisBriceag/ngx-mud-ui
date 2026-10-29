import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-breadcrumb-long-label',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb>
      <ol>
        <li mudBreadcrumbItem><a href="#">Acasă</a></li>
        <li mudBreadcrumbItem>
          <a href="#directia">Direcția generală pentru eliberarea actelor de identitate</a>
        </li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  `,
})
export class BreadcrumbLongLabelExample {}
