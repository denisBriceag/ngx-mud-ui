import { Component } from '@angular/core';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';

@Component({
  selector: 'app-accordion-disabled',
  imports: [MudAccordion, MudAccordionHeader, MudAccordionTitle, MudAccordionDescription],
  template: `
    <mud-accordion disabled>
      <mud-accordion-header>
        <mud-accordion-title>Ridicarea actului</mud-accordion-title>
        <mud-accordion-description>Disponibil după aprobare</mud-accordion-description>
      </mud-accordion-header>
      Actul poate fi ridicat de la centrul de servicii.
    </mud-accordion>
  `,
  styles: `
    :host {
      display: block;
      max-width: 720px;
    }
  `,
})
export class AccordionDisabledExample {}
