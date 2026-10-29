import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudButton } from 'ngx-mud-ui/button';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-stepper-reactive',
  imports: [ReactiveFormsModule, MudStepper, MudStep, MudButton, MudTextInput, MudLabel],
  template: `
    <mud-stepper #stepper linear>
      <mud-step label="Date personale" errorMessage="Completați numele" [stepControl]="identity">
        <form [formGroup]="identity">
          <mud-text-input formControlName="name" required>
            <mud-label>Nume complet</mud-label>
          </mud-text-input>
        </form>
      </mud-step>
      <mud-step label="Adresa" errorMessage="Completați strada" [stepControl]="address">
        <form [formGroup]="address">
          <mud-text-input formControlName="street" required>
            <mud-label>Strada</mud-label>
          </mud-text-input>
        </form>
      </mud-step>
      <mud-step label="Confirmare">
        <p>{{ identity.value.name }}, {{ address.value.street }}</p>
      </mud-step>
    </mud-stepper>
    <div class="actions">
      <button type="button" mudButton="outlined" size="sm" (click)="stepper.previous()">
        Înapoi
      </button>
      <button type="button" mudButton size="sm" (click)="stepper.next()">Continuă</button>
    </div>
  `,
  styles: `
    form {
      max-width: 360px;
      padding: 16px 0;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
  `,
})
export class StepperReactiveExample {
  // linear blocks moving past a step until its stepControl is valid.
  readonly identity = new FormGroup({ name: new FormControl('', Validators.required) });
  readonly address = new FormGroup({ street: new FormControl('', Validators.required) });
}
