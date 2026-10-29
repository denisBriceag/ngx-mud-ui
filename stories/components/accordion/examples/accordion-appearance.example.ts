import { Component } from '@angular/core';
import {
  MudAccordion,
  MudAccordionGroup,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';

@Component({
  selector: 'app-accordion-appearance',
  imports: [MudAccordionGroup, MudAccordion, MudAccordionHeader, MudAccordionTitle],
  template: `
    <h4>Trail sites</h4>
    <mud-accordion-group appearance="trail-sites">
      <mud-accordion expanded>
        <mud-accordion-header>
          <mud-accordion-title>Cum obțin o semnătură electronică?</mud-accordion-title>
        </mud-accordion-header>
        Semnătura electronică se obține prin serviciul MSign.
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Cum achit serviciile publice?</mud-accordion-title>
        </mud-accordion-header>
        Plățile se efectuează prin MPay.
      </mud-accordion>
    </mud-accordion-group>

    <h4>Small, toggle on the left</h4>
    <mud-accordion-group size="small" iconPosition="left">
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Acte necesare</mud-accordion-title>
        </mud-accordion-header>
        Buletinul de identitate și certificatul de naștere.
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Termen de eliberare</mud-accordion-title>
        </mud-accordion-header>
        10 zile lucrătoare.
      </mud-accordion>
    </mud-accordion-group>
  `,
  styles: `
    :host {
      display: block;
      max-width: 720px;
    }
    h4 {
      margin: 24px 0 8px;
    }
    h4:first-child {
      margin-top: 0;
    }
  `,
})
export class AccordionAppearanceExample {}
