import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudInfoBox } from 'ngx-mud-ui/info-box';

// The icon is registered once in app.config.ts: provideMudIcons([lightBulb])
@Component({
  selector: 'app-info-box-icon',
  imports: [MudInfoBox, MudIconComponent],
  template: `
    <mud-info-box variant="moderate" emphasis="strong">
      <mud-icon name="light-bulb" />
      A projected icon replaces the default one.
    </mud-info-box>
    <mud-info-box hideIcon> Without an icon, the text starts at the edge. </mud-info-box>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  `,
})
export class InfoBoxIconExample {}
