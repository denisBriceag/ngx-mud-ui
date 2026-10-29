import { Component, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, delay, of, switchMap, tap } from 'rxjs';
import { MudLabel } from 'ngx-mud-ui/label';
import type { MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudSelectInput } from 'ngx-mud-ui/select-input';

interface City {
  id: number;
  name: string;
}

// Stands in for an HTTP call: GET /api/cities?q=...
const CITIES: City[] = [
  'Chișinău',
  'Bălți',
  'Cahul',
  'Orhei',
  'Ungheni',
  'Soroca',
  'Comrat',
  'Ștefan Vodă',
  'Strășeni',
].map((name, i) => ({ id: i + 1, name }));
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const searchCities = (q: string) =>
  of(CITIES.filter((city) => fold(city.name).includes(fold(q.trim())))).pipe(delay(400));

@Component({
  selector: 'app-select-server',
  imports: [MudSelectInput, MudLabel],
  template: `
    <mud-select-input
      searchable
      placeholder="Căutați orașul"
      [filterWith]="null"
      [compareWith]="sameCity"
      [loading]="loading()"
      [options]="options()"
      [(query)]="query"
      [(value)]="city"
    >
      <mud-label>Oraș</mud-label>
    </mud-select-input>
    <p>city: {{ city()?.name ?? '—' }}</p>
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
export class SelectServerExample {
  // Server results are new objects, so compare cities by id rather than by reference.
  readonly sameCity = (a: City | undefined, b: City | undefined) => a?.id === b?.id;
  readonly query = signal('');
  readonly loading = signal(false);
  readonly city = signal<City | undefined>(CITIES[0]);
  // Include the selected option once, so the field can show its label.
  readonly options = signal<MudSelectOption<City>[]>([{ value: CITIES[0], label: CITIES[0].name }]);

  constructor() {
    toObservable(this.query)
      .pipe(
        // Closing the list writes '' to the query, so short queries are ignored.
        tap((q) => this.loading.set(q.trim().length >= 2)),
        debounceTime(300),
        // A failed request yields no results instead of ending the stream.
        switchMap((q) =>
          q.trim().length < 2 ? of(null) : searchCities(q).pipe(catchError(() => of([]))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((cities) => {
        this.loading.set(false);

        if (cities) this.options.set(cities.map((city) => ({ value: city, label: city.name })));
      });
  }
}
