import { Component } from '@angular/core';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionGroup,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';
import { MudIconComponent } from 'ngx-mud-ui/icons';

// The icons are registered once in app.config.ts: provideMudIcons([document, wallet, idCard])
@Component({
  selector: 'app-accordion-icon',
  imports: [
    MudAccordionGroup,
    MudAccordion,
    MudAccordionHeader,
    MudAccordionTitle,
    MudAccordionDescription,
    MudIconComponent,
  ],
  template: `
    <mud-accordion-group>
      <mud-accordion expanded>
        <mud-accordion-header>
          <mud-icon icon-start name="document" [scale]="20" />
          <mud-accordion-title>Acte necesare</mud-accordion-title>
        </mud-accordion-header>
        Buletinul de identitate și certificatul de naștere.
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-icon icon-start name="wallet" [scale]="20" />
          <mud-accordion-title>Plata</mud-accordion-title>
          <mud-accordion-description>Prin MPay, cu cardul sau în numerar</mud-accordion-description>
        </mud-accordion-header>
        Taxa de stat se achită înainte de depunere.
      </mud-accordion>
      <mud-accordion disabled>
        <mud-accordion-header>
          <mud-icon icon-start name="id-card" [scale]="20" />
          <mud-accordion-title>Ridicarea actului</mud-accordion-title>
        </mud-accordion-header>
        Disponibil după aprobare.
      </mud-accordion>
    </mud-accordion-group>
  `,
  styles: `
    :host {
      display: block;
      max-width: 720px;
    }
  `,
})
export class AccordionIconExample {}
