import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

@Component({
  selector: 'app-tooltip-basic',
  imports: [MudButton, MudTooltip],
  template: `
    <button type="button" mudButton="outlined" mudTooltip="The draft is saved every minute.">
      Save draft
    </button>
    <button
      type="button"
      mudButton="outlined"
      mudTooltip="The draft is saved every minute."
      tooltipSize="large"
    >
      Large
    </button>
    <button
      type="button"
      mudButton="outlined"
      mudTooltip="Signed documents can't be edited."
      tooltipTitle="Signing"
      tooltipSize="large"
    >
      With a title
    </button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 72px;
    }
  `,
})
export class TooltipBasicExample {}
