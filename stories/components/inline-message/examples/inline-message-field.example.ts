import { Component, computed, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-inline-message-field',
  imports: [MudInlineMessage, MudLabel, MudTextInput],
  template: `
    <!-- Inside a field: the field links it to the input and announces it. -->
    <mud-text-input
      [(value)]="idnp"
      [maxLength]="13"
      [invalid]="invalid()"
      (touch)="touched.set(true)"
    >
      <mud-label>IDNP</mud-label>
      @if (invalid()) {
        <mud-inline-message variant="error"
          >IDNP-ul trebuie să conțină 13 cifre.</mud-inline-message
        >
      } @else {
        <mud-inline-message>13 cifre, de pe actul de identitate.</mud-inline-message>
      }
    </mud-text-input>

    <!-- Outside a field: give it an id and point aria-describedby at it. -->
    <div class="outside">
      <mud-text-input value="12345" aria-describedby="phone-error" invalid>
        <mud-label>Telefon</mud-label>
      </mud-text-input>
      <mud-inline-message id="phone-error" variant="error" size="sm"
        >Numărul este incomplet.</mud-inline-message
      >
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 420px;
    }
    .outside {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `,
})
export class InlineMessageFieldExample {
  readonly idnp = signal('');
  readonly touched = signal(false);
  readonly invalid = computed(() => this.touched() && !/^\d{13}$/.test(this.idnp()));
}
