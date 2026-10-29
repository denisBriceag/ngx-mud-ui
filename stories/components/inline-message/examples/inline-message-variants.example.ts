import { Component } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

@Component({
  selector: 'app-inline-message-variants',
  imports: [MudInlineMessage],
  template: `
    <div class="column">
      <mud-inline-message variant="info">Câmpul este opțional.</mud-inline-message>
      <mud-inline-message variant="success">Adresa a fost verificată.</mud-inline-message>
      <mud-inline-message variant="warning">Documentul expiră în 30 de zile.</mud-inline-message>
      <mud-inline-message variant="error">Introduceți un IDNP valid.</mud-inline-message>
    </div>
    <div class="column">
      <mud-inline-message variant="info" size="sm">Câmpul este opțional.</mud-inline-message>
      <mud-inline-message variant="success" size="sm">Adresa a fost verificată.</mud-inline-message>
      <mud-inline-message variant="warning" size="sm"
        >Documentul expiră în 30 de zile.</mud-inline-message
      >
      <mud-inline-message variant="error" size="sm">Introduceți un IDNP valid.</mud-inline-message>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 48px;
    }
    .column {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `,
})
export class InlineMessageVariantsExample {}
