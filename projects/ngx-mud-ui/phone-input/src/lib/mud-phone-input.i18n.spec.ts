import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import type { MudLabelsPartial } from 'ngx-mud-ui/i18n';
import { MudPhoneInput } from './mud-phone-input.component';

@Component({
  imports: [MudPhoneInput],
  template: `
    <mud-phone-input
      mode="international"
      country="MD"
      clearable
      [value]="'+37362123456'"
      aria-label="Telefon"
      [countries]="['MD', 'RO']"
      [countryLabel]="countryLabel()"
      [countryListLabel]="list()"
      [countrySearchLabel]="search()"
      [countryEmptyText]="empty()"
      [clearLabel]="clear()"
    />
  `,
})
class Host {
  readonly countryLabel = signal<((name: string, dialCode: string) => string) | undefined>(undefined);
  readonly list = signal<string | undefined>(undefined);
  readonly search = signal<string | undefined>(undefined);
  readonly empty = signal<string | undefined>(undefined);
  readonly clear = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    trigger: () => el.querySelector('.phone-field__trigger') as HTMLButtonElement,
    search: () => document.querySelector('.phone-field__search') as HTMLInputElement,
    listbox: () => document.querySelector('.phone-field__listbox') as HTMLElement,
    names: () => Array.from(document.querySelectorAll('.phone-field__option-name')).map((n) => n.textContent?.trim()),
  };
}

async function open(h: Awaited<ReturnType<typeof render>>) {
  h.trigger().click();
  await h.fixture.whenStable();
}

describe('MudPhoneInput i18n', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('country trigger name is one function: default, then an instance function', async () => {
    const h = await render();

    expect(h.trigger().getAttribute('aria-label')).toBe('Country: Moldova +373');

    h.host.countryLabel.set((n, d) => d + ' ' + n);
    await h.fixture.whenStable();
    expect(h.trigger().getAttribute('aria-label')).toBe('+373 Moldova');
  });

  it('uses the Romanian pack for the trigger name', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();
    const name = new Intl.DisplayNames(['en-US'], { type: 'region' }).of('MD')!;

    expect(h.trigger().getAttribute('aria-label')).toBe(MUD_LABELS_RO.phoneInput!.country!(name, '+373'));
  });

  it('country names follow the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ro-MD')] });
    const h = await render();

    await open(h);

    const ro = new Intl.DisplayNames(['ro-MD'], { type: 'region' }).of('MD')!;
    const en = new Intl.DisplayNames(['en-US'], { type: 'region' }).of('MD')!;

    expect(ro).not.toBe(en);
    expect(h.names()).toContain(ro);
    expect(h.names()).not.toContain(en);
  });

  it('string inputs: labels by default, Romanian pack, instance wins, blank falls back', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    expect(h.el.querySelector('.phone-field__clear')?.getAttribute('aria-label')).toBe(MUD_LABELS_RO.phoneInput!.clear);
    await open(h);
    expect(h.search().getAttribute('aria-label')).toBe(MUD_LABELS_RO.phoneInput!.countrySearch);

    h.host.search.set('Mine');
    h.host.clear.set('Wipe');
    await h.fixture.whenStable();
    expect(h.search().getAttribute('aria-label')).toBe('Mine');
    expect(h.el.querySelector('.phone-field__clear')?.getAttribute('aria-label')).toBe('Wipe');

    h.host.search.set('  ');
    h.host.clear.set('');
    await h.fixture.whenStable();
    expect(h.search().getAttribute('aria-label')).toBe(MUD_LABELS_RO.phoneInput!.countrySearch);
    expect(h.el.querySelector('.phone-field__clear')?.getAttribute('aria-label')).toBe(MUD_LABELS_RO.phoneInput!.clear);
  });

  it('an open country list updates live when the labels change', async () => {
    const labels = signal<MudLabelsPartial>({});

    TestBed.configureTestingModule({ providers: [provideMudLabels(labels)] });
    const h = await render();

    await open(h);
    h.search().value = 'zzzz';
    h.search().dispatchEvent(new Event('input', { bubbles: true }));
    await h.fixture.whenStable();

    const empty = () => document.querySelector('.menu-panel__empty')?.textContent?.trim();

    expect(h.search().getAttribute('aria-label')).toBe('Search country');
    expect(empty()).toBe('No countries found');

    labels.set({ phoneInput: { countrySearch: 'Caută', countryEmpty: 'Nimic găsit' } });
    await h.fixture.whenStable();
    expect(h.search().getAttribute('aria-label')).toBe('Caută');
    expect(empty()).toBe('Nimic găsit');
  });

  it('empty text comes from the labels and an instance wins', async () => {
    const h = await render();

    await open(h);
    h.search().value = 'zzzz';
    h.search().dispatchEvent(new Event('input', { bubbles: true }));
    await h.fixture.whenStable();

    const empty = () => document.querySelector('.menu-panel__empty')?.textContent?.trim();

    expect(empty()).toBe('No countries found');
    h.host.empty.set('Nimic');
    await h.fixture.whenStable();
    expect(empty()).toBe('Nimic');
  });

  it('the listbox has its own name that does not follow the selected country', async () => {
    const h = await render();

    await open(h);
    expect(h.listbox().getAttribute('aria-label')).toBe('Country');
    expect(h.listbox().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('the listbox name comes from the Romanian pack', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    await open(h);
    expect(h.listbox().getAttribute('aria-label')).toBe('Țară');
  });

  it('countryListLabel wins over the labels; blank falls back', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    h.host.list.set('Alege țara');
    await h.fixture.whenStable();
    await open(h);
    expect(h.listbox().getAttribute('aria-label')).toBe('Alege țara');

    h.host.list.set('  ');
    await h.fixture.whenStable();
    expect(h.listbox().getAttribute('aria-label')).toBe('Țară');
  });
});
