import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDatePicker } from './mud-date-picker.component';
import type { MudDateRange } from './date-value';

@Component({
  imports: [MudDatePicker],
  template: `<mud-date-picker
    mode="range"
    [(value)]="value"
    [max]="max()"
    startAt="2026-08-15"
    locale="en-GB"
  />`,
})
class RangeHost {
  readonly value = signal<MudDateRange | null>(null);
  readonly max = signal<string | undefined>(undefined);
}

@Component({
  imports: [MudDatePicker],
  template: `<mud-date-picker mode="multi" [(value)]="value" startAt="2026-08-15" locale="en-GB" />`,
})
class MultiHost {
  readonly value = signal<string[] | null>(null);
}

/**
 * No `startAt`, so the anchor really falls through to the selection — which is
 * why the `_selected()[0]` re-paging bug was invisible: every other spec here
 * pins `startAt` and short-circuits the anchor entirely.
 */
@Component({
  imports: [MudDatePicker],
  template: `<mud-date-picker mode="multi" [(value)]="value" locale="en-GB" />`,
})
class MultiSpanningHost {
  readonly value = signal<string[] | null>(['2026-08-05', '2026-12-20']);
}

async function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-date-picker') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    cell: (iso: string) => el.querySelector<HTMLElement>(`[data-iso="${iso}"]`)!,
    live: () => el.querySelector('[aria-live="polite"]')!.textContent!.trim(),
    title: () => el.querySelector('.date-picker__title')!.textContent!.trim(),
    focused: () => el.querySelector<HTMLElement>('[data-iso] button[tabindex="0"]')!.parentElement!,
    async click(iso: string) {
      this.cell(iso).querySelector('button')!.click();
      await fixture.whenStable();
    },
    async hover(iso: string) {
      this.cell(iso).dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      await fixture.whenStable();
    },
  };
}

describe('MudDatePicker range mode', () => {
  it('sets start on the first click and leaves end unset', async () => {
    const view = await render(RangeHost);

    await view.click('2026-08-10');

    expect(view.host.value()).toEqual({ start: '2026-08-10', end: null });
    expect(view.cell('2026-08-10').classList).toContain('is-range-start');
  });

  it('completes the range on the second click', async () => {
    const view = await render(RangeHost);

    await view.click('2026-08-10');
    await view.click('2026-08-14');

    expect(view.host.value()).toEqual({ start: '2026-08-10', end: '2026-08-14' });
    expect(view.cell('2026-08-12').classList).toContain('is-range-middle');
    expect(view.cell('2026-08-14').classList).toContain('is-range-end');
  });

  it('normalizes a backwards range instead of storing end before start', async () => {
    const view = await render(RangeHost);

    await view.click('2026-08-14');
    await view.click('2026-08-10');

    expect(view.host.value()).toEqual({ start: '2026-08-10', end: '2026-08-14' });
  });

  it('starts a new range on the third click', async () => {
    const view = await render(RangeHost);

    await view.click('2026-08-10');
    await view.click('2026-08-14');
    await view.click('2026-08-20');

    expect(view.host.value()).toEqual({ start: '2026-08-20', end: null });
  });

  it('previews the pending range on hover', async () => {
    const view = await render(RangeHost);

    await view.click('2026-08-10');
    await view.hover('2026-08-13');

    expect(view.cell('2026-08-12').classList).toContain('is-range-middle');
  });

  it('announces range progress', async () => {
    const view = await render(RangeHost);

    await view.click('2026-08-10');
    expect(view.live()).toContain('choose end date');

    await view.click('2026-08-14');
    expect(view.live()).toContain('selected');
  });

  it('refuses to preview a range through a disabled day', async () => {
    const view = await render(RangeHost);

    view.host.max.set('2026-08-12');
    await view.fixture.whenStable();

    await view.click('2026-08-10');
    await view.hover('2026-08-20');

    // 2026-08-20 is past `max`, so it can never become the range end — a
    // preview band promising a range the click will refuse is worse than none.
    expect(view.cell('2026-08-11').classList).not.toContain('is-range-middle');
    expect(view.cell('2026-08-20').classList).not.toContain('is-range-end');
  });

  it('clears the preview when the pointer moves onto a disabled day', async () => {
    const view = await render(RangeHost);

    view.host.max.set('2026-08-12');
    await view.fixture.whenStable();

    await view.click('2026-08-10');
    await view.hover('2026-08-11');
    expect(view.cell('2026-08-11').classList).toContain('is-range-end');

    await view.hover('2026-08-20');

    // Returning without clearing left the previous day's band drawn behind the
    // pointer, still promising a range that is no longer on offer.
    expect(view.cell('2026-08-11').classList).not.toContain('is-range-end');
  });

  it('renders a pre-set range from the value', async () => {
    const view = await render(RangeHost);

    view.host.value.set({ start: '2026-08-05', end: '2026-08-07' });
    await view.fixture.whenStable();

    expect(view.cell('2026-08-05').classList).toContain('is-range-start');
    expect(view.cell('2026-08-06').classList).toContain('is-range-middle');
    expect(view.cell('2026-08-07').classList).toContain('is-range-end');
  });
});

describe('MudDatePicker multi mode', () => {
  it('accumulates dates', async () => {
    const view = await render(MultiHost);

    await view.click('2026-08-10');
    await view.click('2026-08-14');

    expect(view.host.value()).toEqual(['2026-08-10', '2026-08-14']);
  });

  it('toggles a selected date off', async () => {
    const view = await render(MultiHost);

    await view.click('2026-08-10');
    await view.click('2026-08-10');

    expect(view.host.value()).toEqual([]);
  });

  it('keeps the list sorted regardless of click order', async () => {
    const view = await render(MultiHost);

    await view.click('2026-08-20');
    await view.click('2026-08-05');

    expect(view.host.value()).toEqual(['2026-08-05', '2026-08-20']);
  });

  it('keeps the visible month put when the earliest selected date is deselected', async () => {
    const view = await render(MultiSpanningHost);

    expect(view.title()).toBe('August 2026');

    await view.click('2026-08-05');

    // Deselecting Aug 5 promotes Dec 20 to `_selected()[0]`, which used to
    // re-page the view and the roving focus to December mid-interaction.
    expect(view.host.value()).toEqual(['2026-12-20']);
    expect(view.title()).toBe('August 2026');
    expect(view.focused().dataset['iso']).toBe('2026-08-05');
  });
});
