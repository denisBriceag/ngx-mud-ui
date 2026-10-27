import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import type { MudLabelsPartial } from 'ngx-mud-ui/i18n';
import { MudDatePicker } from '../mud-date-picker.component';
import { MudDateInput } from '../mud-date-input.component';

@Component({
  imports: [MudDatePicker],
  template: `<mud-date-picker startAt="2026-08-15" [locale]="locale()" [headerStyle]="headerStyle()" />`,
})
class PickerHost {
  readonly headerStyle = signal<'title' | 'dropdown'>('title');
  readonly locale = signal<string | undefined>(undefined);
}

@Component({
  imports: [MudDateInput],
  template: `<mud-date-input [(open)]="open" value="2026-08-15" />`,
})
class InputHost {
  readonly open = signal(false);
}

async function renderPicker() {
  const fixture = TestBed.createComponent(PickerHost);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-date-picker') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    title: () => el.querySelector<HTMLElement>('.date-picker__title')!.textContent!.trim(),
    el,
  };
}

/** The title as Intl spells it for `locale` (the component capitalizes the first letter). */
function intlTitle(locale: string): string {
  const text = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(2026, 7, 15));

  return text.charAt(0).toUpperCase() + text.slice(1);
}

describe('MudDatePicker i18n', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('composes the dropdown chip name through the chooseMonth function', async () => {
    const view = await renderPicker();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    expect(view.el.querySelector('[data-header="month"]')!.getAttribute('aria-label')).toBe('August, Choose month');
  });

  it('accepts a custom chooseMonth function', async () => {
    TestBed.configureTestingModule({
      providers: [provideMudLabels({ datePicker: { chooseMonth: (m) => `Alege luna (${m})` } })],
    });

    const view = await renderPicker();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    expect(view.el.querySelector('[data-header="month"]')!.getAttribute('aria-label')).toBe('Alege luna (August)');
  });

  it('follows the format locale signal, including a live flip', async () => {
    const locale = signal('ru-MD');

    TestBed.configureTestingModule({ providers: [provideMudFormatLocale(locale)] });

    const view = await renderPicker();

    expect(view.title()).toBe(intlTitle('ru-MD'));
    expect(view.title()).not.toBe(intlTitle('ro-MD'));

    locale.set('ro-MD');
    await view.fixture.whenStable();

    expect(view.title()).toBe(intlTitle('ro-MD'));
  });

  it('lets the locale input beat the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ro-MD')] });

    const view = await renderPicker();

    view.host.locale.set('en-US');
    await view.fixture.whenStable();

    expect(view.title()).toBe('August 2026');
  });

  it('falls back to the format locale for an invalid locale input', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ru-MD')] });

    const view = await renderPicker();

    view.host.locale.set('nonsense');
    await view.fixture.whenStable();

    expect(view.title()).toBe(intlTitle('ru-MD'));
  });

  it('switches labels and format locale live while the date input calendar is open', async () => {
    const labels = signal<MudLabelsPartial>({});
    const locale = signal('en-US');

    TestBed.configureTestingModule({
      providers: [provideMudLabels(labels), provideMudFormatLocale(locale)],
    });

    const fixture = TestBed.createComponent(InputHost);

    fixture.componentInstance.open.set(true);
    await fixture.whenStable();

    const prev = () => document.querySelector('.date-picker [data-nav="prev"]')!;
    const title = () => document.querySelector('.date-picker .date-picker__title')!.textContent!.trim();

    expect(prev().getAttribute('aria-label')).toBe('Previous month');
    expect(title()).toBe('August 2026');

    labels.set({ datePicker: { previousMonth: 'Luna precedentă' } });
    locale.set('ru-MD');
    await fixture.whenStable();

    expect(prev().getAttribute('aria-label')).toBe('Luna precedentă');
    expect(title()).toBe(intlTitle('ru-MD'));
  });

  it('Romanian choose labels are lower case after the comma', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });

    const view = await renderPicker();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    expect(view.el.querySelector('[data-header="month"]')!.getAttribute('aria-label')).toMatch(/, alege luna$/);
    expect(view.el.querySelector('[data-header="year"]')!.getAttribute('aria-label')).toBe('2026, alege anul');
  });

  it('shows Latin digits without grouping by default', async () => {
    const view = await renderPicker();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    expect(view.el.querySelector('.date-picker__day-button')!.textContent!.trim()).toMatch(/^\d{1,2}$/);
    expect(view.el.querySelector('[data-header="year"]')!.textContent!.trim()).toBe('2026');

    (view.el.querySelector('[data-header="year"]') as HTMLElement).click();
    await view.fixture.whenStable();
    expect(view.el.querySelector('[data-year="2026"] button')!.textContent!.trim()).toBe('2026');
  });

  it('formats day and year digits through the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });

    const view = await renderPicker();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    const arabic = new Intl.NumberFormat('ar-EG', { useGrouping: false });

    expect(view.el.querySelector('.date-picker__day-button')!.textContent!.trim()).toMatch(/^[\u0660-\u0669]{1,2}$/);
    expect(view.el.querySelector('[data-header="year"]')!.textContent!.trim()).toBe(arabic.format(2026));

    (view.el.querySelector('[data-header="year"]') as HTMLElement).click();
    await view.fixture.whenStable();
    expect(view.el.querySelector('[data-year="2026"] button')!.textContent!.trim()).toBe(arabic.format(2026));
  });
});
