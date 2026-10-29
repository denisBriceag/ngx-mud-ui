import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';

@Component({
  selector: 'app-menu-basic',
  imports: [MudButton, MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button type="button" mudButton="outlined" [mudMenuTriggerFor]="actions">Actions</button>
    <mud-menu #actions aria-label="Document actions" (selected)="lastAction.set($event)">
      <mud-menu-item value="edit">Edit</mud-menu-item>
      <mud-menu-item value="duplicate">Duplicate</mud-menu-item>
      <mud-menu-item value="download">Download</mud-menu-item>
      <mud-menu-item value="delete" disabled>Delete</mud-menu-item>
    </mud-menu>
    <p>Last action: {{ lastAction() }}</p>
  `,
  styles: `
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class MenuBasicExample {
  readonly lastAction = signal('none');
}
