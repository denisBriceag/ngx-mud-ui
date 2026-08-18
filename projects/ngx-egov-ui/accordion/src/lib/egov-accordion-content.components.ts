import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'egov-accordion-title',
  template: '<ng-content />',
  host: {
    class: 'accordion__heading',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EgovAccordionTitle {}

@Component({
  selector: 'egov-accordion-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'accordion__supporting',
  },
})
export class EgovAccordionDescription {}
