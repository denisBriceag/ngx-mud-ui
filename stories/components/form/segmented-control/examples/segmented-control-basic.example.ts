import { Component, signal } from '@angular/core';
import type { MudSegmentedControlChange } from 'ngx-mud-ui/segmented-control';
import { MudSegment, MudSegmentedControl } from 'ngx-mud-ui/segmented-control';

type View = 'list' | 'grid' | 'map';

@Component({
  selector: 'app-segmented-control-basic',
  imports: [MudSegmentedControl, MudSegment],
  template: `
    <mud-segmented-control
      aria-label="Vizualizare"
      [(value)]="view"
      (selectionChange)="changed($event)"
    >
      <button mud-segment value="list">Listă</button>
      <button mud-segment value="grid">Grilă</button>
      <button mud-segment value="map" disabled>Hartă</button>
    </mud-segmented-control>
    <p>value: {{ view() }} · last change: {{ last() }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SegmentedControlBasicExample {
  readonly view = signal<View | undefined>('list');
  readonly last = signal('—');

  changed(event: MudSegmentedControlChange<View>): void {
    this.last.set(String(event.value));
  }
}
