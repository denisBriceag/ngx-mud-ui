import { Component, signal } from '@angular/core';
import type { MudInputChipError } from 'ngx-mud-ui/input-chip';
import { MudInputChip } from 'ngx-mud-ui/input-chip';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';

@Component({
  selector: 'app-input-chip-validation',
  imports: [MudInputChip, MudLabel, MudInlineMessage],
  template: `
    <mud-input-chip
      [(value)]="emails"
      [validatePattern]="emailPattern"
      [maxChips]="3"
      separators=",; "
      (errored)="error.set($event)"
      (chipAdded)="error.set(null)"
    >
      <mud-label>Destinatari (cel mult 3)</mud-label>
      @if (error(); as e) {
        <mud-inline-message variant="error"
          >{{ messages[e.code] }}: {{ e.value }}</mud-inline-message
        >
      }
    </mud-input-chip>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
})
export class InputChipValidationExample {
  readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  readonly emails = signal(['ana@exemplu.md']);
  readonly error = signal<MudInputChipError | null>(null);
  readonly messages = {
    pattern: 'Adresă invalidă',
    duplicate: 'Adresa a fost deja adăugată',
    max: 'Cel mult 3 adrese',
  };
}
