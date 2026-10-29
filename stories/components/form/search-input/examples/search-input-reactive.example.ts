import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

@Component({
  selector: 'app-search-input-reactive',
  imports: [ReactiveFormsModule, MudSearchInput, MudLabel, MudInlineMessage],
  template: `
    <mud-search-input
      [formControl]="query"
      [minLength]="3"
      placeholder="Caută servicii"
      [invalid]="query.touched && query.invalid"
    >
      <mud-label>Căutare</mud-label>
      @if (query.touched && query.invalid) {
        <mud-inline-message variant="error">Introduceți cel puțin 3 caractere.</mud-inline-message>
      }
    </mud-search-input>
    <p>value: {{ value() || '—' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
    p {
      margin: 16px 0 0;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SearchInputReactiveExample {
  readonly query = new FormControl('', { nonNullable: true, validators: Validators.minLength(3) });
  readonly value = toSignal(this.query.valueChanges, { initialValue: '' });
}
