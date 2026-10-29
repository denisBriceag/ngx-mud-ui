import { Component, signal } from '@angular/core';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import type { MudStepperStepClick } from 'ngx-mud-ui/stepper';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';

@Component({
  selector: 'app-stepper-step-click',
  imports: [MudStepper, MudStep, MudCheckbox],
  template: `
    <mud-checkbox [(checked)]="unsaved">The current step has unsaved changes</mud-checkbox>
    <mud-stepper (stepClick)="confirmLeave($event)">
      <mud-step label="Date personale"><p>Click another step's header.</p></mud-step>
      <mud-step label="Adresa"><p>Adresa de domiciliu.</p></mud-step>
      <mud-step label="Confirmare"><p>Verificați datele.</p></mud-step>
    </mud-stepper>
  `,
  styles: `
    mud-checkbox {
      display: block;
      margin-bottom: 16px;
    }
  `,
})
export class StepperStepClickExample {
  readonly unsaved = signal(true);

  confirmLeave(event: MudStepperStepClick): void {
    if (this.unsaved() && !confirm('Discard your changes?')) event.preventDefault();
  }
}
