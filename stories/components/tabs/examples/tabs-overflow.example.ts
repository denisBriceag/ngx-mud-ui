import { Component } from '@angular/core';
import { MudTab, MudTabGroup } from 'ngx-mud-ui/tabs';

@Component({
  selector: 'app-tabs-overflow',
  imports: [MudTabGroup, MudTab],
  template: `
    <mud-tab-group aria-label="Profile sections">
      @for (section of sections; track section) {
        <mud-tab [label]="section"
          ><p>{{ section }}</p></mud-tab
        >
      }
    </mud-tab-group>
  `,
  styles: `
    :host {
      display: block;
      max-width: 520px;
    }
    p {
      margin: 16px 0 0;
    }
  `,
})
export class TabsOverflowExample {
  readonly sections = [
    'Overview',
    'Details',
    'Documents',
    'History',
    'Payments',
    'Notifications',
    'Permissions',
    'Settings',
  ];
}
