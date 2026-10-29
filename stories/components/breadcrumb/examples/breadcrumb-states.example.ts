import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-breadcrumb-states',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb>
      <ol>
        <li mudBreadcrumbItem><a href="#">Acasă</a></li>
        <li mudBreadcrumbItem disabled><a href="#arhiva">Arhivă</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  `,
})
export class BreadcrumbStatesExample {}
