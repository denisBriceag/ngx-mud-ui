import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudIndicatorStep, MudStepIndicator } from 'ngx-mud-ui/stepper';

@Component({
  selector: 'app-stepper-indicator',
  imports: [MudStepIndicator, MudIndicatorStep, MudButton],
  template: `
    <mud-step-indicator>
      <mud-indicator-step heading="Creați un cont">
        Înregistrați-vă cu actul de identitate.
        <button type="button" mudButton size="sm">Începe</button>
      </mud-indicator-step>
      <mud-indicator-step heading="Confirmați identitatea"
        >Încărcați documentele cerute.</mud-indicator-step
      >
      <mud-indicator-step heading="Primiți documentul"
        >În 10 zile lucrătoare, prin MDelivery.</mud-indicator-step
      >
    </mud-step-indicator>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
})
export class StepperIndicatorExample {}
