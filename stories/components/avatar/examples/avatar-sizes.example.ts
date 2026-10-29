import { Component } from '@angular/core';
import type { MudAvatarSize } from 'ngx-mud-ui/avatar';
import { MudAvatar } from 'ngx-mud-ui/avatar';
import type { MudIconScale } from 'ngx-mud-ui/icons';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icon is registered once in app.config.ts: provideMudIcons([person])
@Component({
  selector: 'app-avatar-sizes',
  imports: [MudAvatar, MudIconComponent],
  template: `
    @for (row of sizes; track row.size) {
      <div class="row">
        <mud-avatar [size]="row.size"
          ><img src="avatars/person-1.svg" alt="Olga Popescu"
        /></mud-avatar>
        <mud-avatar [size]="row.size" name="Olga Popescu" />
        <mud-avatar [size]="row.size" label="Guest"
          ><mud-icon name="person" [scale]="row.icon"
        /></mud-avatar>
        <code>{{ row.size }}</code>
      </div>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
})
export class AvatarSizesExample {
  // Match the icon scale to the avatar: 16px for extra-small, 20px for small and medium, 24px above.
  readonly sizes: { size: MudAvatarSize; icon: MudIconScale }[] = [
    { size: 'xs', icon: 16 },
    { size: 'sm', icon: 20 },
    { size: 'md', icon: 20 },
    { size: 'lg', icon: 24 },
    { size: 'xl', icon: 24 },
  ];
}
