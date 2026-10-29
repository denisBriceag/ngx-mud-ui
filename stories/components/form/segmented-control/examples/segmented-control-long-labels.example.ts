import { Component } from '@angular/core';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';
import { MudTooltip } from 'ngx-mud-ui/tooltip';

@Component({
  selector: 'app-segmented-control-long-labels',
  imports: [MudSegmentedControl, MudSegment, MudTooltip],
  template: `
    <mud-segmented-control aria-label="Tip solicitant" value="person">
      <button mud-segment value="person">Persoană fizică</button>
      <button
        mud-segment
        value="company"
        mudTooltip="Persoană juridică înregistrată în Registrul de stat"
        [tooltipDescribesTrigger]="false"
      >
        Persoană juridică înregistrată în Registrul de stat
      </button>
    </mud-segmented-control>
  `,
  styles: `
    :host {
      display: block;
      max-width: 360px;
      padding-top: 48px;
    }
  `,
})
export class SegmentedControlLongLabelsExample {}
