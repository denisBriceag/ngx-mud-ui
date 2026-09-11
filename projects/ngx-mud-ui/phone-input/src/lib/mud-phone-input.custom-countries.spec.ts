import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPhoneInput } from './mud-phone-input.component';
import { MudLabel } from '../../../label/src/public-api';
import { provideMudPhoneCountries } from './provide-mud-phone-countries';
import type { MudPhoneCountry } from './phone-countries';

/** Poland is deliberately NOT in the curated table. */
const POLAND: MudPhoneCountry = {
  iso: 'PL',
  dialCode: '+48',
  name: 'Poland',
  mask: 'XXX XXX XXX',
  minDigits: 9,
  maxDigits: 9,
};

const FLAG = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E';

@Component({
  imports: [MudPhoneInput, MudLabel],
  template: `
    <mud-phone-input mode="international" [(value)]="value" [(country)]="country" [countries]="countries()">
      <mud-label>Telefon</mud-label>
    </mud-phone-input>
  `,
})
class Host {
  readonly value = signal('');
  readonly country = signal('MD');
  readonly countries = signal<readonly (string | MudPhoneCountry)[] | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-phone-input') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    trigger: () => el.querySelector('.phone-field__trigger') as HTMLButtonElement,
    dialCode: () => el.querySelector('.phone-field__trigger .phone-field__dial-code')?.textContent?.trim(),
    native: () => el.querySelector('.phone-field__native') as HTMLInputElement,
    options: () => Array.from(document.querySelectorAll<HTMLElement>('.menu-panel__option')),
    isos: () =>
      Array.from(document.querySelectorAll<HTMLElement>('.menu-panel__option')).map((o) =>
        o.getAttribute('data-iso'),
      ),
  };
}

describe('MudPhoneInput custom countries', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('accepts country objects alongside ISO strings, in the given order', async () => {
    const harness = await render();

    harness.host.countries.set(['MD', POLAND, 'RO']);
    await harness.fixture.whenStable();
    harness.trigger().click();
    await harness.fixture.whenStable();

    expect(harness.isos()).toEqual(['MD', 'PL', 'RO']);
    expect(harness.options()[1].textContent).toContain('Poland');
    expect(harness.options()[1].textContent).toContain('+48');
  });

  it('lets `country` select a supplied country and masks with its format', async () => {
    const harness = await render();

    harness.host.countries.set(['MD', POLAND]);
    harness.host.country.set('PL');
    await harness.fixture.whenStable();

    expect(harness.dialCode()).toBe('+48');
    expect(harness.native().getAttribute('placeholder')).toBe('XXX XXX XXX');

    harness.native().value = '601234567';
    harness.native().dispatchEvent(new Event('input', { bubbles: true }));
    await harness.fixture.whenStable();

    expect(harness.native().value).toBe('601 234 567');
    expect(harness.host.value()).toBe('+48601234567');
    expect(warn).not.toHaveBeenCalled();
  });

  it('infers a supplied country from an externally written E.164', async () => {
    const harness = await render();

    harness.host.countries.set(['MD', POLAND]);
    await harness.fixture.whenStable();

    harness.host.value.set('+48601234567');
    await harness.fixture.whenStable();

    expect(harness.host.country()).toBe('PL');
    expect(harness.native().value).toBe('601 234 567');
  });

  it('renders a supplied flag, and omits the image when none is given', async () => {
    const harness = await render();

    harness.host.countries.set([POLAND, { ...POLAND, iso: 'CZ', dialCode: '+420', name: 'Czechia', flag: FLAG }]);
    await harness.fixture.whenStable();
    harness.trigger().click();
    await harness.fixture.whenStable();

    const [poland, czechia] = harness.options();

    // No flag data for PL, so no broken <img> with an empty src.
    expect(poland.querySelector('.phone-field__flag')).toBeNull();
    expect(czechia.querySelector('.phone-field__flag')?.getAttribute('src')).toContain('data:image');
  });

  it('lets a supplied entry override a built-in country flag', async () => {
    const harness = await render();

    // Render the built-in MD flag first so it is in the trusted-URL cache…
    harness.host.countries.set(['MD']);
    await harness.fixture.whenStable();
    harness.trigger().click();
    await harness.fixture.whenStable();
    expect(harness.options()[0].querySelector('.phone-field__flag')?.getAttribute('src')).toContain(
      'data:image/webp',
    );

    // …then override it. A cache keyed only on the ISO would keep serving the
    // built-in flag.
    harness.host.countries.set([{ ...POLAND, iso: 'MD', dialCode: '+373', name: 'Moldova', flag: FLAG }]);
    await harness.fixture.whenStable();

    expect(harness.options()[0].querySelector('.phone-field__flag')?.getAttribute('src')).toBe(FLAG);
  });

  it('falls back to the first OFFERED country, never one absent from the list', async () => {
    const harness = await render();

    // The common path: narrow the list but leave `country` at its 'MD' default.
    harness.host.countries.set(['RO', 'IT']);
    await harness.fixture.whenStable();

    expect(harness.dialCode()).toBe('+40');
    expect(harness.native().getAttribute('placeholder')).toBe('XXX XXX XXX');

    // …and the model is told what actually took effect, rather than still
    // reporting a country the field cannot show.
    expect(harness.host.country()).toBe('RO');

    harness.trigger().click();
    await harness.fixture.whenStable();
    expect(harness.isos()).toEqual(['RO', 'IT']);
  });

  it('still falls back to Moldova when no list is configured', async () => {
    const harness = await render();

    harness.host.country.set('ZZ');
    await harness.fixture.whenStable();

    // The full table is the offered list, and Moldova heads it.
    expect(harness.dialCode()).toBe('+373');
    expect(harness.host.country()).toBe('MD');
    expect(warn).toHaveBeenCalled();
  });

  it('leaves a valid country alone, including its casing', async () => {
    const harness = await render();

    harness.host.countries.set(['RO', 'IT']);
    harness.host.country.set('it');
    await harness.fixture.whenStable();

    expect(harness.dialCode()).toBe('+39');
    // Resolution is case-insensitive, so there is nothing to correct.
    expect(harness.host.country()).toBe('it');
    expect(warn).not.toHaveBeenCalled();
  });

  it('warns and drops an unknown ISO code instead of failing silently', async () => {
    const harness = await render();

    harness.host.countries.set(['MD', 'ZZ', 'RO']);
    await harness.fixture.whenStable();
    harness.trigger().click();
    await harness.fixture.whenStable();

    expect(harness.isos()).toEqual(['MD', 'RO']);
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls.flat().join(' ')).toContain('ZZ');
  });

  it('takes its default list from provideMudPhoneCountries', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudPhoneCountries(['RO', POLAND, 'MD'])],
    });

    const harness = await render();

    // No `countries` input on the field: the app-wide configuration applies.
    expect(harness.host.countries()).toBeUndefined();

    harness.trigger().click();
    await harness.fixture.whenStable();

    expect(harness.isos()).toEqual(['RO', 'PL', 'MD']);
    expect(warn).not.toHaveBeenCalled();
  });

  it('lets a configured country be selected and inferred', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudPhoneCountries(['MD', POLAND])],
    });

    const harness = await render();

    harness.host.country.set('PL');
    await harness.fixture.whenStable();
    expect(harness.dialCode()).toBe('+48');

    harness.host.value.set('+48601234567');
    await harness.fixture.whenStable();
    expect(harness.host.country()).toBe('PL');
    expect(harness.native().value).toBe('601 234 567');
  });

  it('lets the countries input override the provider for one field', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudPhoneCountries(['RO', POLAND])],
    });

    const harness = await render();

    harness.host.countries.set(['MD', 'IT']);
    await harness.fixture.whenStable();
    harness.trigger().click();
    await harness.fixture.whenStable();

    expect(harness.isos()).toEqual(['MD', 'IT']);
  });

  it('validates provider entries the same way as input entries', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudPhoneCountries(['MD', 'ZZ'])],
    });

    const harness = await render();

    harness.trigger().click();
    await harness.fixture.whenStable();

    expect(harness.isos()).toEqual(['MD']);
    expect(warn.mock.calls.flat().join(' ')).toContain('ZZ');
  });

  it('warns about a malformed supplied country but still offers it', async () => {
    const harness = await render();

    // The mask holds 9 digits while maxDigits claims 11: applyMask would
    // silently truncate anything past the mask.
    harness.host.countries.set([{ ...POLAND, maxDigits: 11 }]);
    await harness.fixture.whenStable();
    harness.trigger().click();
    await harness.fixture.whenStable();

    expect(harness.isos()).toEqual(['PL']);
    expect(warn.mock.calls.flat().join(' ')).toContain('PL');
  });
});
