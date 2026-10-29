import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

@Component({
  selector: 'app-tooltip-triggers',
  imports: [MudButton, MudTooltip],
  template: `
    <button
      type="button"
      mudButton="outlined"
      mudTooltip="Opened by a click."
      tooltipTrigger="click"
    >
      Click
    </button>
    <button
      type="button"
      mudButton="outlined"
      mudTooltip="Opened by keyboard focus only."
      tooltipTrigger="focus"
    >
      Focus
    </button>
    <button
      type="button"
      mudButton="outlined"
      mudTooltip="Opened from code."
      tooltipTrigger="manual"
      #tip="mudTooltip"
    >
      Manual
    </button>
    <button type="button" mudButton="text" (click)="tip.isOpen ? tip.hide() : tip.show()">
      Toggle the manual tooltip
    </button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 64px;
    }
  `,
})
export class TooltipTriggersExample {}
