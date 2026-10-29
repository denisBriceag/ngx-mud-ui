import { Component, signal } from '@angular/core';
import type { MudTabChangeEvent } from 'ngx-mud-ui/tabs';
import { MudTab, MudTabGroup } from 'ngx-mud-ui/tabs';

@Component({
  selector: 'app-tabs-basic',
  imports: [MudTabGroup, MudTab],
  template: `
    <mud-tab-group
      aria-label="Request"
      [(selectedIndex)]="selectedIndex"
      (selectedTabChange)="changed($event)"
    >
      <mud-tab label="Overview"><p>Cererea a fost depusă pe 15 martie 2026.</p></mud-tab>
      <mud-tab label="Documents"><p>buletin.pdf, certificat.pdf</p></mud-tab>
      <mud-tab label="History"><p>3 modificări.</p></mud-tab>
    </mud-tab-group>
    <p class="status">selectedIndex: {{ selectedIndex() }} · last change: {{ lastLabel() }}</p>
  `,
  styles: `
    p {
      margin: 16px 0;
    }
    .status {
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class TabsBasicExample {
  readonly selectedIndex = signal(0);
  readonly lastLabel = signal('none');

  changed(event: MudTabChangeEvent): void {
    this.lastLabel.set(event.tab.label());
  }
}
