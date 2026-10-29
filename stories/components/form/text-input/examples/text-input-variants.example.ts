import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-text-input-variants',
  imports: [MudTextInput, MudLabel, MudInlineMessage],
  template: `
    <mud-text-input variant="warning" value="M-2024">
      <mud-label>Warning</mud-label>
      <mud-inline-message variant="warning">Verificați valoarea.</mud-inline-message>
    </mud-text-input>
    <mud-text-input variant="success" value="2000000000000">
      <mud-label>Success</mud-label>
      <mud-inline-message variant="success">Valoare confirmată.</mud-inline-message>
    </mud-text-input>
    <mud-text-input invalid value="12345">
      <mud-label>Error</mud-label>
      <mud-inline-message variant="error">Introduceți un IDNP valid.</mud-inline-message>
    </mud-text-input>
    <mud-text-input required>
      <mud-label>Obligatoriu</mud-label>
    </mud-text-input>
    <mud-text-input readonly value="2000000000000">
      <mud-label>Doar citire</mud-label>
    </mud-text-input>
    <mud-text-input disabled value="Indisponibil">
      <mud-label>Dezactivat</mud-label>
    </mud-text-input>
    <mud-text-input loading value="Se verifică…">
      <mud-label>Se încarcă</mud-label>
    </mud-text-input>
    <mud-text-input size="large" placeholder="48px">
      <mud-label>Mare (large)</mud-label>
    </mud-text-input>
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
export class TextInputVariantsExample {}
