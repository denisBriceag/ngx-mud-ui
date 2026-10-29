import { Component } from '@angular/core';
import { MudIconButton } from 'ngx-mud-ui/button';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

// The icons are registered once in app.config.ts: provideMudIcons([download, circleInfo])
@Component({
  selector: 'app-tooltip-icon',
  imports: [MudIconButton, MudIconComponent, MudTooltip],
  template: `
    <!-- The tooltip repeats the button's name, so it shouldn't describe it too. -->
    <button
      type="button"
      mudIconButton
      aria-label="Download"
      mudTooltip="Download"
      [tooltipDescribesTrigger]="false"
    >
      <mud-icon name="download" [scale]="20" />
    </button>

    <!-- Here the tooltip adds information, so it describes the button. -->
    <button
      type="button"
      mudIconButton
      aria-label="About the fee"
      mudTooltip="The state fee is 50 lei, paid with MPay."
    >
      <mud-icon name="circle-info" [scale]="20" />
    </button>
  `,
  styles: `
    :host {
      display: flex;
      gap: 16px;
      padding-top: 64px;
    }
  `,
})
export class TooltipIconExample {}
