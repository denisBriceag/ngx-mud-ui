import { Component, signal } from '@angular/core';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudPhoneInputChange } from 'ngx-mud-ui/phone-input';
import { MudPhoneInput } from 'ngx-mud-ui/phone-input';

@Component({
  selector: 'app-phone-input-basic',
  imports: [MudPhoneInput, MudLabel, MudInlineMessage],
  template: `
    <mud-phone-input [(value)]="phone" clearable (changed)="last.set($event)">
      <mud-label>Telefon</mud-label>
      @if (last() && !last()!.complete && phone()) {
        <mud-inline-message variant="warning">Numărul pare incomplet.</mud-inline-message>
      }
    </mud-phone-input>
    <p>value: "{{ phone() }}" · complete: {{ last()?.complete ?? '—' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class PhoneInputBasicExample {
  // Always E.164 (+37362123456), or '' while empty.
  readonly phone = signal('');
  readonly last = signal<MudPhoneInputChange | null>(null);
}
