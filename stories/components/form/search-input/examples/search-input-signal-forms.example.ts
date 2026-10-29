import { Component, computed, signal } from '@angular/core';
import { form, FormField, minLength } from '@angular/forms/signals';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

@Component({
  selector: 'app-search-input-signal-forms',
  imports: [FormField, MudSearchInput, MudLabel, MudInlineMessage],
  template: `
    <mud-search-input placeholder="Caută servicii" [formField]="search.query">
      <mud-label>Căutare</mud-label>
      @if (search.query().touched() && search.query().invalid()) {
        <mud-inline-message variant="error">Introduceți cel puțin 3 caractere.</mud-inline-message>
      }
    </mud-search-input>
    <ul>
      @for (service of results(); track service) {
        <li>{{ service }}</li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
    ul {
      margin: 16px 0 0;
      padding-inline-start: 20px;
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SearchInputSignalFormsExample {
  private readonly _services = [
    'Pașaport',
    'Buletin de identitate',
    'Permis de conducere',
    'Cazier judiciar',
  ];

  readonly model = signal({ query: '' });
  readonly search = form(this.model, (path) => {
    minLength(path.query, 3);
  });

  // The list filters live while the query is valid.
  readonly results = computed(() => {
    const query = this.model().query.trim().toLowerCase();

    return this.search.query().valid() && query
      ? this._services.filter((service) => service.toLowerCase().includes(query))
      : this._services;
  });
}
