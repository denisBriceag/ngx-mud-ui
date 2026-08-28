import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDatePicker } from './mud-date-picker.component';

@Component({
  imports: [MudDatePicker],
  template: `<mud-date-picker startAt="2026-08-15" locale="en-GB" [headerStyle]="headerStyle()" />`,
})
class Host {
  readonly headerStyle = signal<'title' | 'dropdown'>('title');
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
    expect(view.yearCells()).toHaveLength(24);
  });

  it('shows the year range as the title in years view', async () => {
    const view = await render();

    await view.click(view.title());
    await view.click(view.title());

    expect(view.title().textContent!.trim()).toBe('2016 – 2039');
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
    await view.click(view.yearCells().find((cell) => cell.dataset['year'] === '2030')!.querySelector('button')!);

    expect(view.monthCells()).toHaveLength(12);
    expect(view.title().textContent!.trim()).toBe('2030');
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
    expect(view.yearCells()).toHaveLength(24);
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
    expect(view.title().textContent!.trim()).toBe('2016 – 2039');

    await view.click(view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!);
    expect(view.title().textContent!.trim()).toBe('2040 – 2063');

    await view.click(view.el.querySelector<HTMLButtonElement>('[data-nav="prev"]')!);
    expect(view.title().textContent!.trim()).toBe('2016 – 2039');
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
    await view.click(view.yearCells().find((cell) => cell.dataset['year'] === '2030')!.querySelector('button')!);

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
