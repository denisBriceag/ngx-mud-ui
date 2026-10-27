import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPhoneInput } from '../mud-phone-input.component';
import { MudLabel } from '../../../../label/src/public-api';

@Component({
  imports: [MudPhoneInput, MudLabel],
  template: `
    <mud-phone-input
      mode="international"
      [(value)]="value"
      [(country)]="country"
      [countries]="countries()"
      [disabled]="disabled()"
      [readonly]="readonly()"
      [loading]="loading()"
    >
      <mud-label>Telefon</mud-label>
    </mud-phone-input>
  `,
})
class Host {
  readonly value = signal('');
  readonly country = signal('MD');
  readonly countries = signal<readonly string[] | undefined>(undefined);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly loading = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-phone-input') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    trigger: () => el.querySelector('.phone-field__trigger') as HTMLButtonElement | null,
    pill: () => el.querySelector('.phone-field__prefix') as HTMLElement | null,
    native: () => el.querySelector('.phone-field__native') as HTMLInputElement,
    panel: () => document.querySelector('.menu-panel') as HTMLElement | null,
    // `role="listbox"` sits on an inner element, not the panel: a listbox may
    // only contain options, and the panel also holds the search field.
    listbox: () => document.querySelector('.phone-field__listbox') as HTMLElement | null,
    search: () => document.querySelector('.phone-field__search') as HTMLInputElement | null,
    options: () => Array.from(document.querySelectorAll<HTMLElement>('.menu-panel__option')),
    empty: () => document.querySelector('.menu-panel__empty') as HTMLElement | null,
  };
}

async function open(harness: Awaited<ReturnType<typeof render>>) {
  harness.trigger()!.click();
  await harness.fixture.whenStable();
}

async function search(harness: Awaited<ReturnType<typeof render>>, text: string) {
  const field = harness.search()!;

  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  await harness.fixture.whenStable();
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('MudPhoneInput international mode', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('loading disables the country trigger and closes an open list', async () => {
    const harness = await render();

    await open(harness);
    expect(harness.panel()).not.toBeNull();

    harness.host.loading.set(true);
    await harness.fixture.whenStable();

    expect(harness.panel()).toBeNull();
    expect(harness.trigger()!.disabled).toBe(true);

    harness.host.loading.set(false);
    await harness.fixture.whenStable();
    expect(harness.trigger()!.disabled).toBe(false);
  });

  it('renders a combobox trigger instead of the static pill', async () => {
    const { trigger, pill } = await render();

    expect(pill()).toBeNull();
    expect(trigger()).not.toBeNull();
    expect(trigger()?.getAttribute('role')).toBe('combobox');
    expect(trigger()?.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger()?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger()?.textContent).toContain('+373');
    expect(trigger()?.querySelector('.phone-field__flag')).not.toBeNull();
  });

  it('opens the listbox on click and moves focus to the in-panel search field', async () => {
    const harness = await render();

    expect(harness.panel()).toBeNull();

    await open(harness);

    expect(harness.listbox()?.getAttribute('role')).toBe('listbox');
    expect(harness.trigger()?.getAttribute('aria-expanded')).toBe('true');
    expect(harness.options()).toHaveLength(15);
    // The search field owns the keyboard, so it takes focus, not the trigger.
    expect(document.activeElement).toBe(harness.search());
    expect(harness.search()?.getAttribute('aria-controls')).toBe(harness.listbox()?.id);
  });

  it('names the listbox and marks the selected country', async () => {
    const harness = await render();

    await open(harness);

    const named =
      harness.listbox()?.getAttribute('aria-label') ?? harness.listbox()?.getAttribute('aria-labelledby');

    expect(named).toBeTruthy();
    expect(harness.options()[0].getAttribute('aria-selected')).toBe('true');
    expect(harness.options()[1].getAttribute('aria-selected')).toBe('false');
  });

  it('marks the selected country with a glyph, not just a background tint', async () => {
    const harness = await render();

    await open(harness);

    const checks = () => document.querySelectorAll('.menu-panel__option-check');

    // Exactly one, on the selected row: the tint is overridden away in
    // forced-colors mode and is the same tint the active row uses.
    expect(checks()).toHaveLength(1);
    expect(harness.options()[0].querySelector('.menu-panel__option-check')).not.toBeNull();

    harness.host.country.set('IT');
    await harness.fixture.whenStable();

    const italy = harness.options().find((o) => o.getAttribute('data-iso') === 'IT');

    expect(italy?.querySelector('.menu-panel__option-check')).not.toBeNull();
    expect(checks()).toHaveLength(1);
  });

  it('filters by name and dial code', async () => {
    const harness = await render();

    await open(harness);

    await search(harness, 'ital');
    expect(harness.options().map((o) => o.textContent?.trim())).toHaveLength(1);
    expect(harness.options()[0].textContent).toContain('Italy');

    await search(harness, 'german');
    expect(harness.options()[0].textContent).toContain('Germany');

    // Dial code, with and without the plus.
    await search(harness, '+40');
    expect(harness.options()[0].textContent).toContain('Romania');

    await search(harness, '373');
    expect(harness.options()[0].textContent).toContain('Moldova');
  });

  it('shows an announced empty state when nothing matches', async () => {
    const harness = await render();

    await open(harness);
    await search(harness, 'zzzzz');

    expect(harness.options()).toHaveLength(0);
    // A listbox must contain options (axe aria-required-children).
    expect(harness.empty()?.getAttribute('role')).toBe('option');
    expect(harness.empty()?.getAttribute('aria-disabled')).toBe('true');
  });

  it('walks the filtered rows with the arrows and tracks activedescendant', async () => {
    const harness = await render();

    await open(harness);
    await search(harness, 'a');

    const filtered = harness.options().length;

    expect(filtered).toBeGreaterThan(1);

    keydown(harness.search()!, 'ArrowDown');
    await harness.fixture.whenStable();
    expect(harness.search()?.getAttribute('aria-activedescendant')).toBe(harness.options()[0].id);

    keydown(harness.search()!, 'ArrowDown');
    await harness.fixture.whenStable();
    expect(harness.search()?.getAttribute('aria-activedescendant')).toBe(harness.options()[1].id);

    keydown(harness.search()!, 'End');
    await harness.fixture.whenStable();
    expect(harness.search()?.getAttribute('aria-activedescendant')).toBe(
      harness.options()[filtered - 1].id,
    );

    keydown(harness.search()!, 'Home');
    await harness.fixture.whenStable();
    expect(harness.search()?.getAttribute('aria-activedescendant')).toBe(harness.options()[0].id);
  });

  it('keeps the active option scrolled into view while arrowing past the visible window', async () => {
    // jsdom has no layout and no scrollIntoView, so assert the component asks
    // for it on the right row; the actual scrolling is browser-verified.
    const scrolled: (Element | null)[] = [];
    const original = Element.prototype.scrollIntoView;

    Element.prototype.scrollIntoView = function scrollIntoViewStub(this: Element) {
      scrolled.push(this);
    };

    try {
      const harness = await render();

      await open(harness);

      for (let i = 0; i < 8; i += 1) {
        keydown(harness.search()!, 'ArrowDown');
        await harness.fixture.whenStable();
      }

      // Opening primes the highlight on the selected country (index 0), so
      // eight ArrowDowns land on index 8.
      const active = harness.search()?.getAttribute('aria-activedescendant');

      expect(active).toBe(harness.options()[8].id);
      // The most recent scroll request must be for the row now active.
      expect(scrolled.at(-1)).toBe(harness.options()[8]);

      keydown(harness.search()!, 'End');
      await harness.fixture.whenStable();
      expect(scrolled.at(-1)).toBe(harness.options()[harness.options().length - 1]);

      keydown(harness.search()!, 'Home');
      await harness.fixture.whenStable();
      expect(scrolled.at(-1)).toBe(harness.options()[0]);
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it('selects with Enter, keeping the digits and swapping the dial code', async () => {
    const harness = await render();

    // Existing Moldovan number.
    harness.host.value.set('+37362123456');
    await harness.fixture.whenStable();

    await open(harness);
    await search(harness, 'Romania');

    keydown(harness.search()!, 'ArrowDown');
    await harness.fixture.whenStable();
    keydown(harness.search()!, 'Enter');
    await harness.fixture.whenStable();

    expect(harness.host.country()).toBe('RO');
    expect(harness.host.value()).toBe('+4062123456');
    expect(harness.panel()).toBeNull();
    expect(harness.trigger()?.getAttribute('aria-expanded')).toBe('false');
    // Focus comes back to the trigger, never lost to the body.
    expect(document.activeElement).toBe(harness.trigger());
  });

  it('selects on option click', async () => {
    const harness = await render();

    await open(harness);
    await search(harness, 'Ukraine');
    harness.options()[0].click();
    await harness.fixture.whenStable();

    expect(harness.host.country()).toBe('UA');
    expect(harness.panel()).toBeNull();
  });

  it('closes on Escape without changing the country, and restores focus', async () => {
    const harness = await render();

    await open(harness);
    await search(harness, 'Romania');
    keydown(harness.search()!, 'ArrowDown');
    await harness.fixture.whenStable();

    keydown(harness.search()!, 'Escape');
    await harness.fixture.whenStable();

    expect(harness.panel()).toBeNull();
    expect(harness.host.country()).toBe('MD');
    expect(document.activeElement).toBe(harness.trigger());
  });

  it('reopens with a cleared search', async () => {
    const harness = await render();

    await open(harness);
    await search(harness, 'Romania');
    expect(harness.options()).toHaveLength(1);

    keydown(harness.search()!, 'Escape');
    await harness.fixture.whenStable();
    await open(harness);

    expect(harness.search()?.value).toBe('');
    expect(harness.options()).toHaveLength(15);
  });

  it('narrows and reorders the list through the countries whitelist', async () => {
    const harness = await render();

    harness.host.countries.set(['RO', 'MD', 'IT']);
    await harness.fixture.whenStable();
    await open(harness);

    expect(harness.options().map((o) => o.getAttribute('data-iso'))).toEqual(['RO', 'MD', 'IT']);
  });

  it('does not open while disabled or readonly', async () => {
    const harness = await render();

    harness.host.disabled.set(true);
    await harness.fixture.whenStable();
    expect(harness.trigger()?.disabled).toBe(true);

    harness.host.disabled.set(false);
    harness.host.readonly.set(true);
    await harness.fixture.whenStable();

    harness.trigger()!.click();
    await harness.fixture.whenStable();
    expect(harness.panel()).toBeNull();
  });

  it('server-renders the closed combobox without building an overlay', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const harness = await render();

    harness.host.value.set('+37362123456');
    await harness.fixture.whenStable();

    // Injecting the CDK Overlay must not throw during server rendering, and the
    // closed markup has to be complete for hydration to replay from it.
    expect(harness.trigger()).not.toBeNull();
    expect(harness.trigger()?.getAttribute('aria-expanded')).toBe('false');
    expect(harness.trigger()?.getAttribute('aria-controls')).toBeNull();
    expect(harness.native().value).toBe('621 23 456');

    // Opening is a no-op server-side: no overlay container, no stolen focus.
    harness.trigger()!.click();
    await harness.fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-container')).toBeNull();
    expect(harness.panel()).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it('opens with ArrowDown from the trigger', async () => {
    const harness = await render();

    keydown(harness.trigger()!, 'ArrowDown');
    await harness.fixture.whenStable();

    expect(harness.panel()).not.toBeNull();
    expect(document.activeElement).toBe(harness.search());
  });
});
