import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';

// The icons are registered once in app.config.ts: provideMudIcons([bulletList, dotGrid])
@Component({
  selector: 'app-segmented-control-sizes',
  imports: [MudSegmentedControl, MudSegment, MudIconComponent],
  template: `
    <mud-segmented-control aria-label="Perioadă" value="week">
      <button mud-segment value="day">Zi</button>
      <button mud-segment value="week">Săptămână</button>
      <button mud-segment value="month">Lună</button>
    </mud-segmented-control>

    <mud-segmented-control aria-label="Perioadă (sm)" size="sm" value="week">
      <button mud-segment value="day">Zi</button>
      <button mud-segment value="week">Săptămână</button>
      <button mud-segment value="month">Lună</button>
    </mud-segmented-control>

    <mud-segmented-control aria-label="Vizualizare" value="list">
      <button mud-segment value="list"><mud-icon name="bullet-list" [scale]="24" />Listă</button>
      <button mud-segment value="grid"><mud-icon name="dot-grid" [scale]="24" />Grilă</button>
    </mud-segmented-control>

    <mud-segmented-control aria-label="Perioadă (dezactivat)" value="day" disabled>
      <button mud-segment value="day">Zi</button>
      <button mud-segment value="week">Săptămână</button>
    </mud-segmented-control>

    <div class="phone">
      <mud-segmented-control aria-label="Perioadă (fullWidth)" fullWidth value="day">
        <button mud-segment value="day">Zi</button>
        <button mud-segment value="week">Săptămână</button>
        <button mud-segment value="month">Lună</button>
      </mud-segmented-control>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
    }
    .phone {
      width: 360px;
      max-width: 100%;
    }
  `,
})
export class SegmentedControlSizesExample {}
