import { Component } from '@angular/core';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionGroup,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';
import { MudLink } from 'ngx-mud-ui/link';
import { MudTag } from 'ngx-mud-ui/tag';

@Component({
  selector: 'app-accordion-trailing',
  imports: [
    MudAccordionGroup,
    MudAccordion,
    MudAccordionHeader,
    MudAccordionTitle,
    MudAccordionDescription,
    MudLink,
    MudTag,
  ],
  template: `
    <mud-accordion-group>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Date personale</mud-accordion-title>
          <mud-tag trailing color="success">Completat</mud-tag>
          <a trailing mudLink href="#pas-1">Editează</a>
        </mud-accordion-header>
        Ion Popescu, născut la 12.03.1990, IDNP 2001234567890.
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Documente anexate</mud-accordion-title>
          <mud-accordion-description>Buletin, certificat de naștere</mud-accordion-description>
          <mud-tag trailing color="neutral">2 documente</mud-tag>
          <a trailing mudLink href="#pas-2">Editează</a>
        </mud-accordion-header>
        buletin.pdf, certificat-de-nastere.pdf
      </mud-accordion>
      <mud-accordion disabled>
        <mud-accordion-header>
          <mud-accordion-title>Plata</mud-accordion-title>
          <mud-tag trailing color="muted">Indisponibil</mud-tag>
          <a trailing mudLink href="#pas-3">Editează</a>
        </mud-accordion-header>
        Disponibilă după verificare.
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
export class AccordionTrailingExample {}
