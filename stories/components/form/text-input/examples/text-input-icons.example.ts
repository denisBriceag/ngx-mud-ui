import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

// The icons are registered once in app.config.ts: provideMudIcons([search, envelope])
@Component({
  selector: 'app-text-input-icons',
  imports: [MudTextInput, MudLabel, MudIconComponent],
  template: `
    <mud-text-input type="search" clearable value="pașaport">
      <mud-label>Căutare</mud-label>
      <mud-icon icon-start name="search" [scale]="20" />
    </mud-text-input>
    <mud-text-input type="email" autocomplete="email" placeholder="nume@exemplu.md">
      <mud-label>E-mail</mud-label>
      <mud-icon icon-end name="envelope" [scale]="20" />
    </mud-text-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 420px;
    }
  `,
})
export class TextInputIconsExample {}
