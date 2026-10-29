import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudTab, MudTabGroup, MudTabLabel } from 'ngx-mud-ui/tabs';

// The icons are registered once in app.config.ts: provideMudIcons([notification, document, lock])
@Component({
  selector: 'app-tabs-labels',
  imports: [MudTabGroup, MudTab, MudTabLabel, MudIconComponent],
  template: `
    <mud-tab-group aria-label="Account">
      <mud-tab [badgeCount]="3">
        <ng-template mudTabLabel
          ><mud-icon name="notification" [scale]="20" />Notificări</ng-template
        >
        <p>3 notificări noi.</p>
      </mud-tab>
      <mud-tab>
        <ng-template mudTabLabel><mud-icon name="document" [scale]="20" />Documente</ng-template>
        <p>Documentele dumneavoastră.</p>
      </mud-tab>
      <mud-tab disabled>
        <ng-template mudTabLabel><mud-icon name="lock" [scale]="20" />Securitate</ng-template>
        <p>Indisponibil.</p>
      </mud-tab>
    </mud-tab-group>
  `,
  styles: `
    p {
      margin: 16px 0 0;
    }
  `,
})
export class TabsLabelsExample {}
