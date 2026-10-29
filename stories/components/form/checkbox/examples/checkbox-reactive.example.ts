import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudButton } from 'ngx-mud-ui/button';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-checkbox-reactive',
  imports: [ReactiveFormsModule, MudCheckbox, MudLabel, MudInlineMessage, MudButton],
  template: `
    <mud-checkbox [formControl]="terms" required [invalid]="terms.invalid && terms.touched">
      <mud-label>Accept <a href="#termeni">termenii serviciului</a></mud-label>
      @if (terms.invalid && terms.touched) {
        <mud-inline-message variant="error">Trebuie să acceptați termenii.</mud-inline-message>
      }
    </mud-checkbox>
    <button type="button" mudButton size="small" (click)="terms.markAsTouched()">Continuă</button>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20px;
    }
  `,
})
export class CheckboxReactiveExample {
  readonly terms = new FormControl(false, Validators.requiredTrue);
}
