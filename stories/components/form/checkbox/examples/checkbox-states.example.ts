import { Component } from '@angular/core';
import { MudCheckbox } from 'ngx-mud-ui/checkbox';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-checkbox-states',
  imports: [MudCheckbox, MudLabel, MudInlineMessage],
  template: `
    <mud-checkbox><mud-label>Nebifat</mud-label></mud-checkbox>
    <mud-checkbox [checked]="true"><mud-label>Bifat</mud-label></mud-checkbox>
    <mud-checkbox indeterminate><mud-label>Parțial (indeterminate)</mud-label></mud-checkbox>
    <mud-checkbox required invalid>
      <mud-label>Obligatoriu, cu eroare</mud-label>
      <mud-inline-message variant="error">Trebuie să acceptați termenii.</mud-inline-message>
    </mud-checkbox>
    <mud-checkbox [checked]="true" readonly>
      <mud-label>Doar citire</mud-label>
      <mud-inline-message hideIcon>Focusabil, dar nu se poate schimba.</mud-inline-message>
    </mud-checkbox>
    <mud-checkbox disabled><mud-label>Dezactivat</mud-label></mud-checkbox>
    <mud-checkbox size="sm" [checked]="true"><mud-label>Mic (sm)</mud-label></mud-checkbox>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  `,
})
export class CheckboxStatesExample {}
