import { Component, signal } from '@angular/core';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

@Component({
  selector: 'app-search-input-basic',
  imports: [MudSearchInput, MudLabel],
  template: `
    <mud-search-input
      placeholder="Caută servicii"
      [(value)]="query"
      (searched)="search($event)"
      (cleared)="results.set([])"
    >
      <mud-label>Căutare</mud-label>
    </mud-search-input>
    <p>{{ results().length ? results().join(', ') : 'Press Enter to search.' }}</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
    p {
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class SearchInputBasicExample {
  private readonly _services = [
    'Pașaport',
    'Buletin de identitate',
    'Permis de conducere',
    'Cazier judiciar',
  ];

  readonly query = signal('');
  readonly results = signal<string[]>([]);

  search(query: string): void {
    const q = query.trim().toLowerCase();

    this.results.set(this._services.filter((service) => service.toLowerCase().includes(q)));
  }
}
