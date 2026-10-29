import { Component } from '@angular/core';
import { MudAvatar } from 'ngx-mud-ui/avatar';

@Component({
  selector: 'app-avatar-name',
  imports: [MudAvatar],
  template: `
    <!-- Initials from the first and last word: IP -->
    <mud-avatar name="Ion Popescu" />

    <!-- Your own initials -->
    <mud-avatar name="Maria-Andreea Pop" initials="MA" />

    <!-- The photo fails to load, so the initials from name show instead -->
    <mud-avatar name="Ion Popescu"><img src="missing-photo.jpg" alt="Ion Popescu" /></mud-avatar>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
})
export class AvatarNameExample {}
