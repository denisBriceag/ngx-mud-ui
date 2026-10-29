import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudButton } from 'ngx-mud-ui/button';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudRadio, MudRadioGroup } from 'ngx-mud-ui/radio';

@Component({
  selector: 'app-radio-reactive',
  imports: [ReactiveFormsModule, MudRadioGroup, MudRadio, MudLabel, MudInlineMessage, MudButton],
  template: `
    <mud-radio-group [formControl]="method" required [invalid]="method.touched && method.invalid">
      <mud-label>Metoda de plată</mud-label>
      <mud-radio value="card"><mud-label>Card bancar</mud-label></mud-radio>
      <mud-radio value="mpay">
        <mud-label>MPay</mud-label>
        <mud-inline-message hideIcon>Fără comision.</mud-inline-message>
      </mud-radio>
      @if (method.touched && method.invalid) {
        <mud-inline-message variant="error">Alegeți o metodă de plată.</mud-inline-message>
      }
    </mud-radio-group>
    <button type="button" mudButton size="small" (click)="method.markAsTouched()">Continuă</button>
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
export class RadioReactiveExample {
  readonly method = new FormControl<string | null>(null, Validators.required);
}
