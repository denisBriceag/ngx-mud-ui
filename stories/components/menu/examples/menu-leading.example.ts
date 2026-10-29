import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudMenu, MudMenuItem, MudMenuTrigger } from 'ngx-mud-ui/menu';

// The icons are registered once in app.config.ts: provideMudIcons([eyeOpen, download])
@Component({
  selector: 'app-menu-leading',
  imports: [MudButton, MudMenu, MudMenuItem, MudMenuTrigger, MudIconComponent],
  template: `
    <button type="button" mudButton="outlined" [mudMenuTriggerFor]="view">View</button>
    <!-- Stays open so several options can be changed in a row. -->
    <mud-menu #view aria-label="View options" [closeOnSelect]="false" (selected)="choose($event)">
      <mud-menu-item value="preview" leading="icon"
        ><mud-icon icon name="eye-open" [scale]="20" />Preview</mud-menu-item
      >
      <mud-menu-item value="download" leading="icon"
        ><mud-icon icon name="download" [scale]="20" />Download</mud-menu-item
      >
      <mud-menu-item heading>Density</mud-menu-item>
      <mud-menu-item value="compact" leading="radio" [selected]="density() === 'compact'"
        >Compact</mud-menu-item
      >
      <mud-menu-item value="comfortable" leading="radio" [selected]="density() === 'comfortable'"
        >Comfortable</mud-menu-item
      >
      <mud-menu-item heading>Show</mud-menu-item>
      <mud-menu-item value="archived" leading="checkbox" [selected]="showArchived()"
        >Archived documents</mud-menu-item
      >
    </mud-menu>
  `,
})
export class MenuLeadingExample {
  readonly density = signal<'compact' | 'comfortable'>('compact');
  readonly showArchived = signal(false);

  choose(value: string): void {
    if (value === 'compact' || value === 'comfortable') this.density.set(value);

    if (value === 'archived') this.showArchived.update((shown) => !shown);
  }
}
