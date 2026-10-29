import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

@Component({
  selector: 'app-phone-input-states',
  imports: [MudPhoneInput, MudLabel, MudInlineMessage],
  template: `
    <mud-phone-input invalid value="+3736212">
      <mud-label>Eroare</mud-label>
      <mud-inline-message variant="error">Introduceți un număr complet.</mud-inline-message>
    </mud-phone-input>
    <mud-phone-input loading>
      <mud-label>Se încarcă din profil</mud-label>
    </mud-phone-input>
    <mud-phone-input readonly value="+37362123456">
      <mud-label>Doar citire</mud-label>
    </mud-phone-input>
    <mud-phone-input disabled mode="international" value="+37362123456">
      <mud-label>Dezactivat</mud-label>
    </mud-phone-input>
    <mud-phone-input size="large">
      <mud-label>Mare (large)</mud-label>
    </mud-phone-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 420px;
    }
  `,
})
export class PhoneInputStatesExample {}
