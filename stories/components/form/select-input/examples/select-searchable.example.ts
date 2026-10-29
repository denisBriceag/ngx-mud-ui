import { Component, signal } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudSelectItem } from 'ngx-mud-ui/select-input';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

@Component({
  selector: 'app-select-searchable',
  imports: [MudSelectInput, MudLabel],
  template: `
    <!-- Type "balti": matching ignores case and diacritics. -->
    <mud-select-input
      searchable
      [options]="places"
      [(value)]="place"
      [(query)]="query"
      placeholder="Alegeți localitatea"
    >
      <mud-label>Localitate</mud-label>
    </mud-select-input>
    <p>value: {{ place() ?? '—' }} · query: "{{ query() }}"</p>
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
export class SelectSearchableExample {
  // Groups put a heading above a run of options; loose options and groups can be mixed.
  readonly places: MudSelectItem<string>[] = [
    {
      label: 'Municipii',
      options: [
        { value: 'chisinau', label: 'Chișinău' },
        { value: 'balti', label: 'Bălți' },
        { value: 'comrat', label: 'Comrat' },
      ],
    },
    {
      label: 'Raioane',
      options: [
        { value: 'cahul', label: 'Cahul' },
        { value: 'orhei', label: 'Orhei' },
        { value: 'stefan-voda', label: 'Ștefan Vodă' },
        { value: 'straseni', label: 'Strășeni' },
      ],
    },
  ];
  readonly place = signal<string | undefined>(undefined);
  readonly query = signal('');
}
