import { Component } from '@angular/core';
import { MudAvatar } from 'ngx-mud-ui/avatar';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icon is registered once in app.config.ts: provideMudIcons([person])
@Component({
  selector: 'app-avatar-basic',
  imports: [MudAvatar, MudIconComponent],
  template: `
    <mud-avatar><img src="avatars/person-1.svg" alt="Olga Popescu" /></mud-avatar>
    <mud-avatar name="Olga Popescu" />
    <mud-avatar label="Olga Popescu">OP</mud-avatar>
    <mud-avatar label="Guest"><mud-icon name="person" [scale]="20" /></mud-avatar>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
})
export class AvatarBasicExample {}
