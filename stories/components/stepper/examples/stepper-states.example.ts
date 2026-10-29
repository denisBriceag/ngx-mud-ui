import { Component } from '@angular/core';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';

@Component({
  selector: 'app-stepper-states',
  imports: [MudStepper, MudStep],
  template: `
    <mud-stepper>
      <mud-step label="Current" supportingText="Selected"></mud-step>
      <mud-step label="Completed" state="completed"></mud-step>
      <mud-step label="Available" state="available"></mud-step>
      <mud-step label="Blocked" state="blocked" errorMessage="Fix 2 fields"></mud-step>
      <mud-step label="Incomplete" state="incomplete"></mud-step>
    </mud-stepper>
  `,
})
export class StepperStatesExample {}
