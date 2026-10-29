import { Component } from '@angular/core';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionGroup,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';
import { MudTag } from 'ngx-mud-ui/tag';

@Component({
  selector: 'app-accordion-long-content',
  imports: [
    MudAccordionGroup,
    MudAccordion,
    MudAccordionHeader,
    MudAccordionTitle,
    MudAccordionDescription,
    MudTag,
  ],
  template: `
    <mud-accordion-group>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>
            Cerere pentru eliberarea certificatului de atribuire a numărului de identificare de stat
            al persoanei fizice pentru cetățenii străini cu drept de ședere permanentă
          </mud-accordion-title>
        </mud-accordion-header>
        A long title wraps onto as many lines as it needs.
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Documente necesare</mud-accordion-title>
          <mud-accordion-description>
            Buletinul de identitate, certificatul de naștere, certificatul de căsătorie, adeverința
            de la locul de muncă și dovada achitării taxei de stat
          </mud-accordion-description>
        </mud-accordion-header>
        A long description stays on one line and ends in an ellipsis.
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title
            >https://servicii.gov.md/cereri/certificat-de-atribuire-idnp-2001234567890</mud-accordion-title
          >
        </mud-accordion-header>
        A long unbroken word breaks anywhere instead of overflowing.
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Plata</mud-accordion-title>
          <mud-tag trailing color="neutral">În așteptarea confirmării de la banca emitentă</mud-tag>
        </mud-accordion-header>
        Long trailing content wraps; a tag too long for the space ends in an ellipsis.
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
export class AccordionLongContentExample {}
