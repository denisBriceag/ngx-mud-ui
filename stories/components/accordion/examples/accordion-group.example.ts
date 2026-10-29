import { Component } from '@angular/core';
import {
  MudAccordion,
  MudAccordionGroup,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';

@Component({
  selector: 'app-accordion-group',
  imports: [MudAccordionGroup, MudAccordion, MudAccordionHeader, MudAccordionTitle],
  template: `
    <h4>Several open at once (default)</h4>
    <mud-accordion-group>
      @for (item of faq; track item.question) {
        <mud-accordion>
          <mud-accordion-header>
            <mud-accordion-title>{{ item.question }}</mud-accordion-title>
          </mud-accordion-header>
          {{ item.answer }}
        </mud-accordion>
      }
    </mud-accordion-group>

    <h4>One open at a time</h4>
    <mud-accordion-group [multi]="false">
      @for (item of faq; track item.question) {
        <mud-accordion>
          <mud-accordion-header>
            <mud-accordion-title>{{ item.question }}</mud-accordion-title>
          </mud-accordion-header>
          {{ item.answer }}
        </mud-accordion>
      }
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
export class AccordionGroupExample {
  readonly faq = [
    {
      question: 'Cum obțin o semnătură electronică?',
      answer: 'Semnătura electronică se obține prin serviciul MSign.',
    },
    { question: 'Cum achit serviciile publice?', answer: 'Plățile se efectuează prin MPay.' },
    {
      question: 'Unde îmi primesc documentele?',
      answer: 'Documentele se livrează prin MDelivery.',
    },
  ];
}
