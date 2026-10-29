import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextarea } from 'ngx-mud-ui/textarea';

@Component({
  selector: 'app-textarea-states',
  imports: [MudTextarea, MudLabel, MudInlineMessage],
  template: `
    <mud-textarea invalid value="Prea scurt">
      <mud-label>Eroare</mud-label>
      <mud-inline-message variant="error">Scrieți cel puțin 20 de caractere.</mud-inline-message>
    </mud-textarea>
    <mud-textarea variant="warning" value="Verificați textul.">
      <mud-label>Warning</mud-label>
    </mud-textarea>
    <mud-textarea readonly value="Cererea a fost depusă pe 15 martie 2026.">
      <mud-label>Doar citire</mud-label>
    </mud-textarea>
    <mud-textarea disabled>
      <mud-label>Dezactivat</mud-label>
    </mud-textarea>
    <mud-textarea size="lg" resize="none">
      <mud-label>Mare, fără redimensionare</mud-label>
    </mud-textarea>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 480px;
    }
  `,
})
export class TextareaStatesExample {}
