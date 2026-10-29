import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import {
  MudMegaMenu,
  MudMegaMenuColumn,
  MudMegaMenuLink,
  MudMegaMenuOrigin,
  MudMegaMenuTrigger,
} from 'ngx-mud-ui/menu';

@Component({
  selector: 'app-menu-mega',
  imports: [
    MudButton,
    MudMegaMenu,
    MudMegaMenuColumn,
    MudMegaMenuLink,
    MudMegaMenuOrigin,
    MudMegaMenuTrigger,
  ],
  template: `
    <header mudMegaMenuOrigin>
      <span class="logo">mpay</span>
      <nav aria-label="Principal">
        <button [mudMegaMenuTriggerFor]="services">Servicii</button>
        <button [mudMegaMenuTriggerFor]="about">Despre</button>
      </nav>
      <button type="button" mudButton shape="circular" size="medium">Autentifică-te</button>
    </header>

    <mud-mega-menu #services>
      @for (column of columns; track column.heading) {
        <mud-mega-menu-column [heading]="column.heading">
          @for (link of column.links; track link) {
            <a mudMegaMenuLink href="#">{{ link }}</a>
          }
        </mud-mega-menu-column>
      }
    </mud-mega-menu>

    <mud-mega-menu #about>
      <mud-mega-menu-column heading="Despre noi">
        <a mudMegaMenuLink href="#">Echipa</a>
        <a mudMegaMenuLink href="#">Contacte</a>
      </mud-mega-menu-column>
    </mud-mega-menu>
  `,
  styles: `
    :host {
      display: block;
      min-height: 420px;
    }
    header {
      display: flex;
      align-items: stretch;
      gap: 24px;
      height: 72px;
      padding: 0 24px;
      border-bottom: 1px solid var(--mud-color-border-base-default);
    }
    .logo {
      align-self: center;
      font-weight: 600;
    }
    nav {
      display: flex;
      align-items: stretch;
    }
    header > button {
      align-self: center;
      margin-left: auto;
    }
  `,
})
export class MenuMegaExample {
  readonly columns = [
    { heading: 'Plăți', links: ['MPay', 'Taxe de stat', 'Amenzi'] },
    { heading: 'Identitate', links: ['MPass', 'MSign', 'Buletin'] },
    { heading: 'Documente', links: ['MDelivery', 'Cazier', 'Certificate'] },
  ];
}
