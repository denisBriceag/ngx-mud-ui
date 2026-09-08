import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMudDateLabels } from './date-labels';
import type { MudDateLabels } from './date-labels';
import { MudDatePicker } from './mud-date-picker.component';

@Component({
  imports: [MudDatePicker],
  template: `<mud-date-picker startAt="2026-08-15" [locale]="locale()" [headerStyle]="headerStyle()" />`,
})
class Host {
  readonly headerStyle = signal<'title' | 'dropdown'>('title');
  readonly locale = signal('en-GB');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-date-picker') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    title: () => el.querySelector<HTMLButtonElement>('.date-picker__title')!,
    monthCells: () => Array.from(el.querySelectorAll<HTMLElement>('[data-month]')),
    yearCells: () => Array.from(el.querySelectorAll<HTMLElement>('[data-year]')),
    dayCells: () => Array.from(el.querySelectorAll<HTMLElement>('[data-iso]')),
    async click(target: HTMLElement) {
      target.click();
      await fixture.whenStable();
    },
  };
}

describe('MudDatePicker views', () => {
  it('cycles days to months to years from the title button', async () => {
    const view = await render();

    expect(view.dayCells()).toHaveLength(42);

    await view.click(view.title());
    expect(view.monthCells()).toHaveLength(12);
    expect(view.dayCells()).toHaveLength(0);

    await view.click(view.title());
    expect(view.yearCells()).toHaveLength(12);
  });

  it('shows the year range as the title in years view', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.title());

    expect(view.title().textContent!.trim()).toBe('2016 – 2027');
  });

  it('returns to the day grid on the chosen month', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.monthCells()[10].querySelector('button')!);

    expect(view.dayCells()).toHaveLength(42);
    expect(view.title().textContent!.trim()).toBe('November 2026');
  });

  it('drills years to months rather than straight back to days', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.title());
    await view.click(view.yearCells().find((cell) => cell.dataset['year'] === '2020')!.querySelector('button')!);

    expect(view.monthCells()).toHaveLength(12);
    expect(view.title().textContent!.trim()).toBe('2020');
  });

  it('marks the current month with aria-current', async () => {
    const view = await render();

    await view.click(view.title());

    // Not aria-selected: these are plain buttons in a labelled group, not
    // gridcells, so aria-selected would be invalid here.
    expect(view.monthCells()[7].querySelector('button')!.getAttribute('aria-current')).toBe('true');
    expect(view.monthCells()[0].querySelector('button')!.getAttribute('aria-current')).toBeNull();
  });

  it('relabels the nav arrows when the view changes meaning', async () => {
    const view = await render();
    const next = () => view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!;

    expect(next().getAttribute('aria-label')).toBe('Next month');

    await view.click(view.title());

    // The arrows now step by year, so announcing "Next month" would be a lie.
    expect(next().getAttribute('aria-label')).toBe('Next year');
  });

  it('renders separate month and year chips in dropdown header style', async () => {
    const view = await render();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    const month = view.el.querySelector<HTMLButtonElement>('[data-header="month"]')!;
    const year = view.el.querySelector<HTMLButtonElement>('[data-header="year"]')!;

    expect(month.textContent!.trim()).toBe('August');
    expect(year.textContent!.trim()).toBe('2026');

    await view.click(year);
    expect(view.yearCells()).toHaveLength(12);
  });

  it('shows short month names in the grid, with the full month as the accessible name', async () => {
    const view = await render();

    await view.click(view.title());

    const august = view.monthCells()[7].querySelector('button')!;

    expect(august.textContent!.trim()).toBe('Aug');
    expect(august.getAttribute('aria-label')).toBe('August');
  });

  it('strips the trailing dot Intl puts on short month names, live with the locale input', async () => {
    const view = await render();

    await view.click(view.title());
    expect(view.monthCells()[10].querySelector('button')!.textContent!.trim()).toBe('Nov');

    // Romanian Intl short names carry a dot ("nov.") that would break the
    // visible-label-is-a-prefix-of-the-accessible-name property.
    view.host.locale.set('ro');
    await view.fixture.whenStable();

    const nov = view.monthCells()[10].querySelector('button')!;

    expect(nov.textContent!.trim()).toBe('Nov');
    expect(nov.getAttribute('aria-label')).toBe('Noiembrie');
  });

  it('renders consumer-provided month names from MUD_DATE_LABELS instead of Intl', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideMudDateLabels({
          monthNamesShort: ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'],
          monthNamesLong: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'],
        }),
      ],
    });

    const view = await render();

    // September differs between the override and the en-GB Intl name, unlike
    // the August the calendar opens on.
    await view.click(view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!);
    expect(view.title().textContent!.trim()).toBe('Septembrie 2026');

    await view.click(view.title());

    const january = view.monthCells()[0].querySelector('button')!;

    expect(january.textContent!.trim()).toBe('Ian');
    expect(january.getAttribute('aria-label')).toBe('Ianuarie');
  });

  it('re-renders live when the labels token holds a signal — a global language switch', async () => {
    const lang = signal<Partial<MudDateLabels>>({});

    TestBed.configureTestingModule({ providers: [provideMudDateLabels(lang)] });

    const view = await render();
    const today = () => view.el.querySelector<HTMLButtonElement>('.date-picker__today')!;

    // September, not the August the calendar opens on: 'August' is spelled the
    // same in both languages and would mask a stale render.
    await view.click(view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!);
    expect(today().textContent!.trim()).toBe('Today');
    expect(view.title().textContent!.trim()).toBe('September 2026');

    lang.set({
      today: 'Astăzi',
      monthNamesLong: ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'],
    });
    await view.fixture.whenStable();

    expect(today().textContent!.trim()).toBe('Astăzi');
    expect(view.title().textContent!.trim()).toBe('Septembrie 2026');
  });

  it('repurposes the nav buttons per view', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!);

    // In months view the arrows step by year, not by month.
    expect(view.title().textContent!.trim()).toBe('2027');
  });

  it('steps the year view by a full page and stays page-aligned', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.title());
    expect(view.title().textContent!.trim()).toBe('2016 – 2027');

    await view.click(view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!);
    expect(view.title().textContent!.trim()).toBe('2028 – 2039');

    await view.click(view.el.querySelector<HTMLButtonElement>('[data-nav="prev"]')!);
    expect(view.title().textContent!.trim()).toBe('2016 – 2027');
  });

  it('moves focus to the day grid, not <body>, after choosing a month', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.monthCells()[10].querySelector('button')!);

    const focused = document.activeElement as HTMLElement;

    expect(focused).not.toBe(document.body);
    expect(focused.closest('[data-iso]')?.getAttribute('data-iso')).toBe('2026-11-01');
  });

  it('moves focus to the month grid, not <body>, after choosing a year', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.title());
    await view.click(view.yearCells().find((cell) => cell.dataset['year'] === '2020')!.querySelector('button')!);

    const focused = document.activeElement as HTMLElement;

    expect(focused).not.toBe(document.body);
    expect(focused.closest('[data-month]')?.getAttribute('data-month')).toBe('8');
  });

  it('moves focus to the month chip, not <body>, when the title cycles back to days', async () => {
    const view = await render();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    // In dropdown style the title button only exists while the view is NOT
    // days, so cycling back to days destroys the very button that was pressed.
    await view.click(view.el.querySelector<HTMLButtonElement>('[data-header="month"]')!);
    await view.click(view.title());
    await view.click(view.title());

    const focused = document.activeElement as HTMLElement;

    expect(view.dayCells()).toHaveLength(42);
    expect(focused).not.toBe(document.body);
    expect(focused.dataset['header']).toBe('month');
  });

  it('returns focus to the title button when cycling back to days in title style', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.title());
    await view.click(view.title());

    // Focus was sitting on a year button, which the view change destroys.
    expect(view.dayCells()).toHaveLength(42);
    expect(document.activeElement).toBe(view.title());
  });

  it('moves focus to the year grid, not <body>, when the dropdown year chip opens it', async () => {
    const view = await render();

    view.host.headerStyle.set('dropdown');
    await view.fixture.whenStable();

    await view.click(view.el.querySelector<HTMLButtonElement>('[data-header="year"]')!);

    const focused = document.activeElement as HTMLElement;

    expect(focused).not.toBe(document.body);
    expect(focused.closest('[data-year]')?.getAttribute('data-year')).toBe('2026');
  });
});
