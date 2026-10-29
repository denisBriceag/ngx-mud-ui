import { Component } from '@angular/core';
import { MudStep, MudStepper } from 'ngx-mud-ui/stepper';

@Component({
  selector: 'app-stepper-layout',
  imports: [MudStepper, MudStep],
  template: `
    <section>
      <h4>Vertical</h4>
      <mud-stepper orientation="vertical">
        <mud-step label="Date personale" supportingText="Cine sunteți"
          ><p>Numele, data nașterii, IDNP.</p></mud-step
        >
        <mud-step label="Adresa"><p>Adresa de domiciliu.</p></mud-step>
        <mud-step label="Confirmare"><p>Verificați datele.</p></mud-step>
      </mud-stepper>
    </section>
    <section class="narrow">
      <h4>Narrower than 600px</h4>
      <mud-stepper>
        <mud-step label="Unu" state="completed"></mud-step>
        <mud-step label="Doi"></mud-step>
        <mud-step label="Trei"></mud-step>
        <mud-step label="Patru"></mud-step>
      </mud-stepper>
    </section>
    <section>
      <h4>Compact</h4>
      <mud-stepper compact>
        <mud-step label="Unu" state="completed"></mud-step>
        <mud-step label="Doi"></mud-step>
        <mud-step label="Trei"></mud-step>
      </mud-stepper>
    </section>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    h4 {
      margin: 0 0 12px;
    }
    .narrow {
      max-width: 360px;
    }
  `,
})
export class StepperLayoutExample {}
