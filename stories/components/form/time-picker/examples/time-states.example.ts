import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTimeInput } from 'ngx-mud-ui/time-picker';

@Component({
  selector: 'app-time-states',
  imports: [MudTimeInput, MudLabel, MudInlineMessage],
  template: `
    <mud-time-input invalid value="20:00">
      <mud-label>Eroare</mud-label>
      <mud-inline-message variant="error">Ora este în afara programului.</mud-inline-message>
    </mud-time-input>
    <mud-time-input variant="success" value="09:30"><mud-label>Success</mud-label></mud-time-input>
    <mud-time-input required><mud-label>Obligatoriu</mud-label></mud-time-input>
    <mud-time-input readonly value="09:30"><mud-label>Doar citire</mud-label></mud-time-input>
    <mud-time-input disabled value="09:30"><mud-label>Dezactivat</mud-label></mud-time-input>
    <mud-time-input size="lg" value="09:30"><mud-label>Mare (lg)</mud-label></mud-time-input>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 320px;
    }
  `,
})
export class TimeStatesExample {}
