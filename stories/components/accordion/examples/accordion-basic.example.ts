import { Component } from '@angular/core';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';

@Component({
  selector: 'app-accordion-basic',
  imports: [MudAccordion, MudAccordionHeader, MudAccordionTitle, MudAccordionDescription],
  template: `
    <mud-accordion>
      <mud-accordion-header>
        <mud-accordion-title>Cum obțin o semnătură electronică?</mud-accordion-title>
        <mud-accordion-description>MSign, mobil sau cu token</mud-accordion-description>
      </mud-accordion-header>
      Semnătura electronică se obține prin serviciul MSign.
    </mud-accordion>
  `,
  styles: `
    :host {
      display: block;
      max-width: 720px;
    }
  `,
})
export class AccordionBasicExample {}
