import { Component, inject } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudDrawerPosition } from 'ngx-mud-ui/drawer';
import { MUD_DRAWER_DATA, MudDrawer, MudDrawerClose, MudDrawerTitle } from 'ngx-mud-ui/drawer';

@Component({
  selector: 'app-edge-drawer',
  imports: [MudDrawerTitle, MudDrawerClose, MudButton],
  template: `
    <h2 mudDrawerTitle>Drawer: {{ position }}</h2>
    <p>
      Left and right drawers are 382px wide by default; top and bottom ones are as tall as their
      content.
    </p>
    <button mudButton="outlined" mudDrawerClose>Închide</button>
  `,
  styles: `
    :host {
      display: block;
      padding: 24px;
    }
    h2 {
      margin: 0 0 8px;
      font-size: 20px;
    }
  `,
})
export class EdgeDrawer {
  readonly position = inject<MudDrawerPosition>(MUD_DRAWER_DATA);
}

@Component({
  selector: 'app-drawer-positions',
  imports: [MudButton],
  template: `
    @for (position of positions; track position) {
      <button type="button" mudButton="outlined" (click)="open(position)">{{ position }}</button>
    }
    <button type="button" mudButton="outlined" (click)="openWide()">right, 50% wide</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class DrawerPositionsExample {
  private readonly _drawer = inject(MudDrawer);

  readonly positions: MudDrawerPosition[] = ['top', 'right', 'bottom', 'left'];

  open(position: MudDrawerPosition): void {
    this._drawer.open(EdgeDrawer, { position, data: position });
  }

  openWide(): void {
    this._drawer.open(EdgeDrawer, { position: 'right', width: '50%', data: 'right' });
  }
}
