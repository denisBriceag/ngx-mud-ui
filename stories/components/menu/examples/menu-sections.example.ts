import { Component } from '@angular/core';
import { MudMenu, MudMenuItem } from 'ngx-mud-ui/menu';

@Component({
  selector: 'app-menu-sections',
  imports: [MudMenu, MudMenuItem],
  template: `
    <!-- open renders the panel in place, without a trigger. -->
    <mud-menu open aria-label="Sections">
      <mud-menu-item value="profile">Profile</mud-menu-item>
      <mud-menu-item value="settings">Settings</mud-menu-item>
      <mud-menu-item heading></mud-menu-item>
      <mud-menu-item value="help">Help</mud-menu-item>
    </mud-menu>
    <mud-menu open aria-label="Sections with headings">
      <mud-menu-item heading>Documents</mud-menu-item>
      <mud-menu-item value="new">New request</mud-menu-item>
      <mud-menu-item value="long">
        Certificate of assignment of the state identification number for foreign citizens with
        permanent residence
      </mud-menu-item>
      <mud-menu-item heading>Account</mud-menu-item>
      <mud-menu-item value="sign-out">Sign out</mud-menu-item>
    </mud-menu>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 24px;
    }
    mud-menu {
      max-inline-size: 280px;
    }
  `,
})
export class MenuSectionsExample {}
