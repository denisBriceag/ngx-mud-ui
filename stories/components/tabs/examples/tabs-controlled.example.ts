import { Component, signal, viewChild } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudTab, MudTabGroup } from 'ngx-mud-ui/tabs';

@Component({
  selector: 'app-tabs-controlled',
  imports: [MudTabGroup, MudTab, MudButton],
  template: `
    <mud-tab-group aria-label="Application steps" [(selectedIndex)]="step">
      <mud-tab label="Date personale"><p>Pasul 1 din 3.</p></mud-tab>
      <mud-tab label="Documente"><p>Pasul 2 din 3.</p></mud-tab>
      <mud-tab label="Confirmare"><p>Pasul 3 din 3.</p></mud-tab>
    </mud-tab-group>
    <div class="actions">
      <button
        type="button"
        mudButton="outlined"
        size="sm"
        [disabled]="step() === 0"
        (click)="go(-1)"
      >
        Înapoi
      </button>
      <button type="button" mudButton size="sm" [disabled]="step() === 2" (click)="go(1)">
        Continuă
      </button>
    </div>
  `,
  styles: `
    p {
      margin: 16px 0;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
})
export class TabsControlledExample {
  private readonly _tabs = viewChild.required(MudTabGroup);

  readonly step = signal(0);

  go(offset: number): void {
    this.step.update((step) => step + offset);
    // Move focus to the new tab, so keyboard users continue from there.
    this._tabs().focusTab(this.step());
  }
}
