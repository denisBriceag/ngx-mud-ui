import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudTagColor } from 'ngx-mud-ui/tag';
import { MudTag } from 'ngx-mud-ui/tag';

@Component({
  selector: 'app-tag-status',
  imports: [MudTag, MudButton],
  template: `
    <span>Plata:</span>
    <!-- aria-label makes the tag a live region, so the change is announced. -->
    <mud-tag [color]="status().color" aria-label="Payment status">{{ status().text }}</mud-tag>
    <button type="button" mudButton="outlined" size="small" (click)="next()">Next status</button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `,
})
export class TagStatusExample {
  private readonly _statuses: { text: string; color: MudTagColor }[] = [
    { text: 'În așteptare', color: 'neutral' },
    { text: 'Procesare', color: 'info' },
    { text: 'Achitat', color: 'success' },
  ];
  private _index = 0;

  readonly status = signal(this._statuses[0]);

  next(): void {
    this._index = (this._index + 1) % this._statuses.length;
    this.status.set(this._statuses[this._index]);
  }
}
