import { Component, signal } from '@angular/core';
import type { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MudButton } from 'ngx-mud-ui/button';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';

@Component({
  selector: 'app-stepper-basic',
  imports: [MudStepper, MudStep, MudButton],
  template: `
    <mud-stepper #stepper [(selectedIndex)]="step" (selectionChange)="changed($event)">
      <mud-step label="Date personale" supportingText="Cine sunteți"
        ><p>Numele, data nașterii, IDNP.</p></mud-step
      >
      <mud-step label="Adresa" supportingText="Unde locuiți"><p>Adresa de domiciliu.</p></mud-step>
      <mud-step label="Confirmare"><p>Verificați datele și trimiteți cererea.</p></mud-step>
    </mud-stepper>
    <div class="actions">
      <button type="button" mudButton="outlined" size="sm" (click)="stepper.previous()">
        Înapoi
      </button>
      <button type="button" mudButton size="sm" (click)="stepper.next()">Continuă</button>
      <button type="button" mudButton="text" size="sm" (click)="stepper.reset()">Reset</button>
    </div>
    <p class="status">selectedIndex: {{ step() }} · last change: {{ lastChange() }}</p>
  `,
  styles: `
    .actions {
      display: flex;
      gap: 8px;
    }
    .status {
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class StepperBasicExample {
  readonly step = signal(0);
  readonly lastChange = signal('—');

  changed(event: StepperSelectionEvent): void {
    this.lastChange.set(`${event.previouslySelectedIndex} → ${event.selectedIndex}`);
  }
}
