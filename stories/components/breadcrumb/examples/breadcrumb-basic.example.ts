import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-breadcrumb-basic',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb>
      <ol>
        <li mudBreadcrumbItem><a href="#">Acasă</a></li>
        <li mudBreadcrumbItem><a href="#servicii">Servicii</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  `,
})
export class BreadcrumbBasicExample {}
