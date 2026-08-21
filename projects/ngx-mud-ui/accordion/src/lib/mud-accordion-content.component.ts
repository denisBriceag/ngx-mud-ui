import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'mud-accordion-title',
  template: '<ng-content />',
  host: {
    class: 'accordion__heading',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MudAccordionTitle {}

@Component({
  selector: 'mud-accordion-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content />',
  host: {
    class: 'accordion__supporting',
  },
})
export class MudAccordionDescription {}
