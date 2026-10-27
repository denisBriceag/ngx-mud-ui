import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudNumericInput } from './mud-numeric-input.component';

@Component({
  imports: [MudNumericInput],
  template: `
    <mud-numeric-input
      showSteppers
      clearable
      aria-label="Suma"
      [allowDecimal]="allowDecimal()"
      [precision]="precision()"
      (errored)="errors.push($event)"
      [(value)]="value"
      [locale]="locale()"
      [maxLength]="maxLength()"
      [incrementLabel]="inc()"
      [decrementLabel]="dec()"
      [clearLabel]="clear()"
    />
  `,
})
class Host {
  readonly value = signal<number | null>(1234.5);
  readonly locale = signal<string | undefined>(undefined);
  readonly allowDecimal = signal(true);
  readonly precision = signal<number | undefined>(undefined);
  readonly errors: string[] = [];
  readonly maxLength = signal<number | undefined>(undefined);
  readonly inc = signal<string | undefined>(undefined);
  readonly dec = signal<string | undefined>(undefined);
  readonly clear = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement as HTMLElement;
  const steppers = () => Array.from(el.querySelectorAll('.numeric-field__stepper'));

  return {
    fixture,
    host: fixture.componentInstance,
    display: () => (el.querySelector('input') as HTMLInputElement).value,
    inc: () => steppers()[0]?.getAttribute('aria-label'),
    dec: () => steppers()[1]?.getAttribute('aria-label'),
    clear: () => el.querySelector('.input-field__clear')?.getAttribute('aria-label'),
    counter: () => el.querySelector('.input-field__counter')?.textContent?.replace(/\s+/g, ' ').trim(),
  };
}

describe('MudNumericInput i18n', () => {
  it('uses the English default labels with no provider', async () => {
    const h = await render();

    expect(h.inc()).toBe('Increase');
    expect(h.dec()).toBe('Decrease');
    expect(h.clear()).toBe('Clear');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    expect(h.inc()).toBe(MUD_LABELS_RO.numericInput!.increment);
    expect(h.dec()).toBe(MUD_LABELS_RO.numericInput!.decrement);
    expect(h.clear()).toBe(MUD_LABELS_RO.numericInput!.clear);
  });

  it('instance inputs win over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    h.host.inc.set('Up');
    h.host.dec.set('Down');
    h.host.clear.set('Wipe');
    await h.fixture.whenStable();
    expect([h.inc(), h.dec(), h.clear()]).toEqual(['Up', 'Down', 'Wipe']);
  });

  it('blank inputs fall back', async () => {
    const h = await render();

    h.host.inc.set(' ');
    h.host.dec.set('');
    h.host.clear.set('  ');
    await h.fixture.whenStable();
    expect([h.inc(), h.dec(), h.clear()]).toEqual(['Increase', 'Decrease', 'Clear']);
  });

  it('follows the format locale for the decimal separator when `locale` is unset', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ro-MD')] });

    expect((await render()).display()).toBe('1234,5');
  });

  it('an explicit `locale` input still wins over the format locale and keeps grouping', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ro-MD')] });
    const fixture = TestBed.createComponent(Host);

    fixture.componentInstance.locale.set('en-US');
    await fixture.whenStable();
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('1,234.5');
  });

  // The display-sync effect used to watch only `value`, so a live locale switch left "1234,5" on screen
  // and the next blur parsed it with en-US separators (NaN → a spurious errored event).
  it('reformats the display when the format locale signal changes', async () => {
    const formatLocale = signal('ro-MD');

    TestBed.configureTestingModule({ providers: [provideMudFormatLocale(formatLocale)] });
    const h = await render();

    expect(h.display()).toBe('1234,5');

    formatLocale.set('en-US');
    await h.fixture.whenStable();
    expect(h.display()).toBe('1234.5');

    const native = (h.fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

    native.dispatchEvent(new Event('focus'));
    native.dispatchEvent(new Event('blur'));
    await h.fixture.whenStable();
    expect(h.host.value()).toBe(1234.5);
    expect(h.host.errors).toEqual([]);
  });

  it('parses typed input with the format locale decimal comma', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ro-MD')] });
    const h = await render();
    const native = (h.fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

    native.value = '12,5';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    native.dispatchEvent(new Event('blur'));
    await h.fixture.whenStable();
    expect(h.host.value()).toBe(12.5);
    expect(h.display()).toBe('12,5');
  });

  it('the counter digits follow the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });
    const h = await render();

    h.host.maxLength.set(10);
    await h.fixture.whenStable();

    const nf = new Intl.NumberFormat('ar-EG');

    expect(h.counter()).toBe(`${nf.format(h.display().length)} / ${nf.format(10)}`);
  });

  it('the counter does not group thousands under the default locale', async () => {
    const h = await render();

    h.host.maxLength.set(5000);
    await h.fixture.whenStable();
    expect(h.counter()).toBe(`${h.display().length} / 5000`);
  });

  describe('negative zero', () => {
    async function commit(text: string, setup: (host: Host) => void) {
      const fixture = TestBed.createComponent(Host);

      setup(fixture.componentInstance);
      await fixture.whenStable();

      const native = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

      native.value = text;
      native.dispatchEvent(new Event('input', { bubbles: true }));
      native.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      return native.value;
    }

    it('shows 0, not -0, when allowDecimal=false commits -0.5', async () => {
      expect(await commit('-0.5', (h) => h.allowDecimal.set(false))).toBe('0');
    });

    it('shows 0, not -0, when precision=0 commits -0.4', async () => {
      expect(await commit('-0.4', (h) => h.precision.set(0))).toBe('0');
    });
  });

  describe('native digits (ar-EG)', () => {
    const arDigits = (n: string) => n.replace(/\d/g, (d) => new Intl.NumberFormat('ar-EG', { useGrouping: false }).format(Number(d)));

    it('a pre-filled value round-trips on blur with no error and the same value', async () => {
      TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });
      const fixture = TestBed.createComponent(Host);

      await fixture.whenStable();

      const host = fixture.componentInstance;
      const native = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

      expect(native.value).not.toBe('1234.5');
      native.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(host.errors).toEqual([]);
      expect(host.value()).toBe(1234.5);
    });

    it('typing native digits commits 12.5', async () => {
      TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });
      const fixture = TestBed.createComponent(Host);

      await fixture.whenStable();

      const native = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
      const decimal = new Intl.NumberFormat('ar-EG').formatToParts(1.5).find((p) => p.type === 'decimal')!.value;

      native.value = arDigits('12') + decimal + arDigits('5');
      native.dispatchEvent(new Event('input', { bubbles: true }));
      native.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(fixture.componentInstance.value()).toBe(12.5);
      expect(fixture.componentInstance.errors).toEqual([]);
    });

    it('typing ASCII 12.5 still commits 12.5', async () => {
      TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });
      const fixture = TestBed.createComponent(Host);

      await fixture.whenStable();

      const native = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;

      native.value = '12.5';
      native.dispatchEvent(new Event('input', { bubbles: true }));
      native.dispatchEvent(new Event('blur'));
      await fixture.whenStable();
      expect(fixture.componentInstance.value()).toBe(12.5);
      expect(fixture.componentInstance.errors).toEqual([]);
    });
  });
});
