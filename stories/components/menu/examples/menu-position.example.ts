import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import type { MudMenuPositionX, MudMenuPositionY } from 'ngx-mud-ui/menu';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';

@Component({
  selector: 'app-menu-position',
  imports: [MudButton, MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    @for (position of positions; track $index) {
      <button type="button" mudButton="outlined" size="small" [mudMenuTriggerFor]="menu">
        {{ position.y }} · {{ position.x }}
      </button>
      <mud-menu #menu [yPosition]="position.y" [xPosition]="position.x" aria-label="Actions">
        <mud-menu-item value="edit">Edit</mud-menu-item>
        <mud-menu-item value="delete">Delete</mud-menu-item>
      </mud-menu>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 16px;
      padding: 120px 0;
    }
  `,
})
export class MenuPositionExample {
  readonly positions: { x: MudMenuPositionX; y: MudMenuPositionY }[] = [
    { y: 'below', x: 'after' },
    { y: 'below', x: 'before' },
    { y: 'above', x: 'after' },
    { y: 'above', x: 'before' },
  ];
}
