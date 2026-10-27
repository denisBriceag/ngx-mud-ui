import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPhoneInput } from '../mud-phone-input.component';
import { MudLabel } from '../../../../label/src/public-api';
import type { MudPhoneCountry } from '../phone-countries';

@Component({
  imports: [MudPhoneInput, MudLabel],
  template: `
    <mud-phone-input mode="international" [country]="country()" [locale]="locale()" [countries]="countries()">
      <mud-label>Telefon</mud-label>
    </mud-phone-input>
  `,
})
class Host {
  readonly country = signal('DE');
  readonly locale = signal<string | undefined>(undefined);
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
    triggerLabel: () => el.querySelector('.phone-field__trigger')?.getAttribute('aria-label'),
    names: () =>
      Array.from(document.querySelectorAll<HTMLElement>('.phone-field__option-name')).map((n) =>
        n.textContent?.trim(),
      ),
    search: () => document.querySelector('.phone-field__search') as HTMLInputElement,
  };
}

async function open(h: Awaited<ReturnType<typeof render>>) {
  h.trigger().click();
  await h.fixture.whenStable();
}

async function type(h: Awaited<ReturnType<typeof render>>, text: string) {
  h.search().value = text;
  h.search().dispatchEvent(new Event('input', { bubbles: true }));
  await h.fixture.whenStable();
}

describe('MudPhoneInput country names', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('uses the locale for the trigger and the search, not just the list', async () => {
    const h = await render();

    h.host.locale.set('ro');
    await h.fixture.whenStable();

    expect(h.triggerLabel()).toContain('Germania');

    await open(h);
    await type(h, 'Germania');
    expect(h.names()).toEqual(['Germania']);
  });

  it('still matches the English fallback name whatever the locale', async () => {
    const h = await render();

    h.host.locale.set('ro');
    await h.fixture.whenStable();
    await open(h);

    // A user typing the English name in a Romanian UI must still find it.
    await type(h, 'Germany');
    expect(h.names()).toEqual(['Germania']);
  });

  it('matches consumer-supplied aliases', async () => {
    const h = await render();

    h.host.countries.set([
      {
        iso: 'GB',
        dialCode: '+44',
        name: 'United Kingdom',
        mask: 'XXXX XXX XXX',
        minDigits: 10,
        maxDigits: 10,
        aliases: ['Marea Britanie', 'UK'],
      },
    ]);
    await h.fixture.whenStable();
    await open(h);

    await type(h, 'UK');
    expect(h.names()).toHaveLength(1);

    await type(h, 'Marea Britanie');
    expect(h.names()).toHaveLength(1);
  });

  it('falls back to the plain name when Intl.DisplayNames cannot help', async () => {
    const original = Intl.DisplayNames;

    // Simulate a runtime without it.
    (Intl as { DisplayNames?: unknown }).DisplayNames = undefined;

    try {
      const h = await render();

      await open(h);
      expect(h.names()).toContain('Germany');
    } finally {
      (Intl as { DisplayNames?: unknown }).DisplayNames = original;
    }
  });
});
