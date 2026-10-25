import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, delay, of, switchMap, tap } from 'rxjs';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MudSelectInput } from 'ngx-mud-ui/select-input';
import type { MudSelectItem, MudSelectOption } from 'ngx-mud-ui/select-input';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudInlineMessage } from 'ngx-mud-ui/inline-message';

const COL = 'display:flex;flex-direction:column;gap:24px;max-width:360px;padding:24px;min-height:360px';

const RAIONS: MudSelectOption<string>[] = [
  { value: 'chisinau', label: 'Chișinău' },
  { value: 'balti', label: 'Bălți' },
  { value: 'cahul', label: 'Cahul' },
  { value: 'orhei', label: 'Orhei' },
  { value: 'soroca', label: 'Soroca', disabled: true },
  { value: 'ungheni', label: 'Ungheni' },
];

const CITIES: MudSelectOption<string>[] = [
  'Chișinău',
  'Bălți',
  'Cahul',
  'Orhei',
  'Ungheni',
  'Soroca',
  'Comrat',
  'Ștefan Vodă',
  'Strășeni',
  'Hîncești',
  'Fălești',
  'Edineț',
].map((label) => ({ value: label, label }));

const GROUPED: MudSelectItem<string>[] = [
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
      { value: 'ungheni', label: 'Ungheni' },
      { value: 'soroca', label: 'Soroca' },
    ],
  },
];

const meta: Meta<MudSelectInput> = {
  title: 'Components/Select input',
  component: MudSelectInput,
  decorators: [moduleMetadata({ imports: [MudSelectInput, MudLabel, MudInlineMessage] })],
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'destructive'] },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    readonly: { control: 'boolean' },
    invalid: { control: 'boolean' },
    placeholder: { control: 'text' },
    searchable: { control: 'boolean' },
    loading: { control: 'boolean' },
    loadingText: { control: 'text' },
    noResultsText: { control: 'text' },
  },
  args: {
    variant: 'default',
    size: 'medium',
    disabled: false,
    required: false,
    readonly: false,
    invalid: false,
    placeholder: 'Alegeți raionul',
    searchable: false,
    loading: false,
    loadingText: 'Loading…',
    noResultsText: 'No results',
  },
};

export default meta;

type Story = StoryObj<MudSelectInput>;

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, options: RAIONS },
    template: `
      <div style="${COL}">
        <mud-select-input
          [variant]="variant"
          [size]="size"
          [disabled]="disabled"
          [required]="required"
          [readonly]="readonly"
          [invalid]="invalid"
          [placeholder]="placeholder"
          [searchable]="searchable"
          [loading]="loading"
          [loadingText]="loadingText"
          [noResultsText]="noResultsText"
          [options]="options"
        >
          <mud-label>Raion</mud-label>
          @if (invalid) {
            <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
          } @else {
            <mud-inline-message hideIcon>Raionul de reședință.</mud-inline-message>
          }
        </mud-select-input>
      </div>
    `,
  }),
};

/** Keyboard: arrows open + move the highlight (focus stays on the trigger), Enter selects, Escape closes. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { options: RAIONS },
    template: `
      <div style="${COL}">
        <mud-select-input value="balti" [options]="options">
          <mud-label>Cu selecție</mud-label>
        </mud-select-input>
        <mud-select-input invalid [options]="options" placeholder="Alegeți">
          <mud-label>Eroare</mud-label>
          <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
        </mud-select-input>
        <mud-select-input value="chisinau" readonly [options]="options">
          <mud-label>Doar citire</mud-label>
        </mud-select-input>
        <mud-select-input disabled [options]="options" placeholder="Indisponibil">
          <mud-label>Dezactivat</mud-label>
        </mud-select-input>
        <mud-select-input [options]="[]" emptyText="Nicio opțiune disponibilă" placeholder="Gol">
          <mud-label>Fără opțiuni</mud-label>
        </mud-select-input>
      </div>
    `,
  }),
};

/** The group is a regular form control: reactive forms with a required validator. */
@Component({
  selector: 'mud-select-reactive-demo',
  imports: [MudSelectInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: `
    <div style="${COL}">
      <mud-select-input
        required
        placeholder="Alegeți raionul"
        [options]="options"
        [formControl]="raion"
        [invalid]="raion.touched && raion.invalid"
      >
        <mud-label>Raion</mud-label>
        @if (raion.touched && raion.invalid) {
          <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
        }
      </mud-select-input>
      <code>value: {{ raion.value || '—' }} | touched: {{ raion.touched }} | valid: {{ raion.valid }}</code>
    </div>
  `,
})
class SelectReactiveDemo {
  readonly options = RAIONS;
  readonly raion = new FormControl<string | null>(null, { validators: [Validators.required] });
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const REACTIVE_FORMS_SOURCE = `
@Component({
  imports: [MudSelectInput, MudLabel, MudInlineMessage, ReactiveFormsModule],
  template: \`
    <mud-select-input
      required
      placeholder="Alegeți raionul"
      [options]="options"
      [formControl]="raion"
      [invalid]="raion.touched && raion.invalid"
    >
      <mud-label>Raion</mud-label>
      @if (raion.touched && raion.invalid) {
        <mud-inline-message variant="error">Alegeți un raion.</mud-inline-message>
      }
    </mud-select-input>
  \`,
})
export class RaionField {
  // Options are data, not projected content — there is no mud-option element.
  readonly options: readonly MudSelectOption<string>[] = [
    { value: 'ch', label: 'Chișinău' },
    { value: 'bl', label: 'Bălți' },
  ];
  readonly raion = new FormControl<string | null>(null, { validators: [Validators.required] });
}
`;

export const ReactiveForms: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: REACTIVE_FORMS_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SelectReactiveDemo] })],
  render: () => ({ template: `<mud-select-reactive-demo />` }),
};

/** Non-string values with Object.is comparison. */
@Component({
  selector: 'mud-select-number-demo',
  imports: [MudSelectInput, MudLabel],
  template: `
    <div style="${COL}">
      <mud-select-input placeholder="Alegeți" [options]="options" [(value)]="copies">
        <mud-label>Numărul de exemplare</mud-label>
      </mud-select-input>
      <code>copies: {{ copies() ?? '—' }} (number)</code>
    </div>
  `,
})
class SelectNumberDemo {
  readonly options: MudSelectOption<number>[] = [
    { value: 1, label: 'Un exemplar' },
    { value: 2, label: 'Două exemplare' },
    { value: 5, label: 'Cinci exemplare' },
  ];
  readonly copies = signal<number | undefined>(undefined);
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const NON_STRING_VALUES_SOURCE = `
@Component({
  imports: [MudSelectInput, MudLabel],
  template: \`
    <mud-select-input placeholder="Alegeți" [options]="options" [(value)]="copies">
      <mud-label>Numărul de exemplare</mud-label>
    </mud-select-input>
  \`,
})
export class CopiesSelect {
  // The component is generic in the option value, so \`copies\` stays a number.
  readonly options: MudSelectOption<number>[] = [
    { value: 1, label: 'Un exemplar' },
    { value: 2, label: 'Două exemplare' },
    { value: 5, label: 'Cinci exemplare' },
  ];
  readonly copies = signal<number | undefined>(undefined);
}
`;

export const NonStringValues: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: NON_STRING_VALUES_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SelectNumberDemo] })],
  render: () => ({ template: `<mud-select-number-demo />` }),
};

/** Browser-side search: type to narrow the list, diacritics and case are ignored (try "balti"). */
export const Searchable: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { options: CITIES },
    template: `
      <div style="${COL}">
        <mud-select-input searchable placeholder="Alegeți orașul" [options]="options">
          <mud-label>Oraș</mud-label>
        </mud-select-input>
      </div>
    `,
  }),
};

/** Server-side search: the app owns the request; the select only shows `loading` and the results. */
interface City {
  id: number;
  name: string;
}

const API_CITIES: City[] = CITIES.map((city, i) => ({ id: i + 1, name: city.label }));

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const fakeApi = (q: string) =>
  of(API_CITIES.filter((city) => fold(city.name).includes(fold(q.trim())))).pipe(delay(400));

@Component({
  selector: 'mud-select-server-demo',
  imports: [MudSelectInput, MudLabel],
  template: `
    <div style="${COL}">
      <mud-select-input
        searchable
        placeholder="Alegeți orașul"
        [filterWith]="null"
        [compareWith]="sameCity"
        [loading]="loading()"
        [options]="options()"
        [(query)]="query"
        [(value)]="city"
      >
        <mud-label>Oraș</mud-label>
      </mud-select-input>
      <code>city: {{ city()?.name ?? '—' }}</code>
    </div>
  `,
})
class SelectServerDemo {
  readonly sameCity = (a: City | undefined, b: City | undefined) => a?.id === b?.id;
  readonly query = signal('');
  readonly loading = signal(false);
  readonly city = signal<City | undefined>(API_CITIES[0]);
  // Include the selected option once, so the field can show its label.
  readonly options = signal<{ value: City; label: string }[]>([
    { value: API_CITIES[0], label: API_CITIES[0].name },
  ]);

  constructor() {
    toObservable(this.query)
      .pipe(
        // Closing the list writes '' to the query, so short queries are ignored.
        tap((q) => this.loading.set(q.trim().length >= 2)),
        debounceTime(300),
        // A failed request yields no results instead of ending the stream.
        switchMap((q) =>
          q.trim().length < 2 ? of(null) : fakeApi(q).pipe(catchError(() => of([]))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((cities) => {
        this.loading.set(false);

        if (cities) this.options.set(cities.map((city) => ({ value: city, label: city.name })));
      });
  }
}

/** Shown as this story's code sample: the story renders a demo component. */
const SERVER_SEARCH_SOURCE = `
interface City { id: number; name: string }

// "api" is your HTTP service; "initialCity" is the city already saved on the record.
@Component({
  imports: [MudSelectInput, MudLabel],
  template: \`
    <mud-select-input
      searchable
      placeholder="Alegeți orașul"
      [filterWith]="null"
      [compareWith]="sameCity"
      [loading]="loading()"
      [options]="options()"
      [(query)]="query"
      [(value)]="city"
    >
      <mud-label>Oraș</mud-label>
    </mud-select-input>
  \`,
})
export class CitySelect {
  readonly sameCity = (a: City | undefined, b: City | undefined) => a?.id === b?.id;
  readonly query = signal('');
  readonly loading = signal(false);
  readonly city = signal<City | undefined>(initialCity);
  // Include the selected option once, so the field can show its label.
  readonly options = signal([{ value: initialCity, label: initialCity.name }]);

  constructor() {
    toObservable(this.query)
      .pipe(
        // Closing the list writes '' to the query, so short queries are ignored.
        tap((q) => this.loading.set(q.trim().length >= 2)),
        debounceTime(300),
        // A failed request yields no results instead of ending the stream.
        switchMap((q) =>
          q.trim().length < 2 ? of(null) : this.api.search(q).pipe(catchError(() => of([]))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((cities) => {
        this.loading.set(false);

        if (cities) this.options.set(cities.map((c) => ({ value: c, label: c.name })));
      });
  }
}
`;

export const ServerSearch: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: SERVER_SEARCH_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [SelectServerDemo] })],
  render: () => ({ template: `<mud-select-server-demo />` }),
};

/** A query that finds nothing shows the "no results" row. */
export const NoResults: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { options: CITIES },
    template: `
      <div style="${COL}">
        <mud-select-input searchable [open]="true" [query]="'xyz'" placeholder="Alegeți orașul" [options]="options">
          <mud-label>Oraș</mud-label>
        </mud-select-input>
      </div>
    `,
  }),
};

/** Groups: a heading per group; searching hides a group that has no match (try "orhei"). */
export const Groups: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { options: GROUPED },
    template: `
      <div style="${COL}">
        <mud-select-input searchable placeholder="Alegeți localitatea" [options]="options">
          <mud-label>Localitate</mud-label>
        </mud-select-input>
      </div>
    `,
  }),
};

/** A decorative icon before the text; a click on it focuses and opens the field. */
export const WithIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { options: CITIES },
    template: `
      <div style="${COL}">
        <mud-select-input placeholder="Alegeți orașul" [options]="options">
          <svg icon-start xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="currentColor" focusable="false" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 1.667a5.833 5.833 0 0 0-5.833 5.833c0 4.167 5.833 10.833 5.833 10.833s5.833-6.666 5.833-10.833A5.833 5.833 0 0 0 10 1.667m0 7.916a2.083 2.083 0 1 1 0-4.166 2.083 2.083 0 0 1 0 4.166"/>
          </svg>
          <mud-label>Oraș</mud-label>
        </mud-select-input>
      </div>
    `,
  }),
};
