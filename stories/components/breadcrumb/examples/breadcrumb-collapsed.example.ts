import { Component } from '@angular/core';
import { MudBreadcrumb, MudBreadcrumbItem } from 'ngx-mud-ui/breadcrumb';

@Component({
  selector: 'app-breadcrumb-collapsed',
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb [maxVisible]="4">
      <ol>
        @for (crumb of trail; track crumb.url) {
          <li mudBreadcrumbItem>
            <a [href]="crumb.url">{{ crumb.label }}</a>
          </li>
        }
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  `,
})
export class BreadcrumbCollapsedExample {
  readonly trail = [
    { label: 'Acasă', url: '#' },
    { label: 'Servicii', url: '#servicii' },
    { label: 'Acte', url: '#acte' },
    { label: 'Buletin', url: '#buletin' },
    { label: 'Cereri', url: '#cereri' },
  ];
}
