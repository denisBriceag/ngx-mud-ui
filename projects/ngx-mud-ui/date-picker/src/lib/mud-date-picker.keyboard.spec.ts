import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDatePicker } from './mud-date-picker.component';

@Component({
  imports: [MudDatePicker],
  template: `<mud-date-picker [(value)]="value" startAt="2026-08-15" locale="en-GB" [min]="min()" />`,
})
class Host {
  readonly value = signal<string | null>(null);
  readonly min = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-date-picker') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    grid: () => el.querySelector<HTMLElement>('[role="grid"]')!,
    button: (iso: string) => el.querySelector<HTMLButtonElement>(`[data-iso="${iso}"] button`)!,
    focused: () => el.querySelector<HTMLElement>('[data-iso] button[tabindex="0"]')!.parentElement!,
    live: () => el.querySelector('[aria-live="polite"]')!.textContent!.trim(),
    title: () => el.querySelector('.date-picker__title')!.textContent!.trim(),
    async press(key: string, init: KeyboardEventInit = {}) {
      this.grid().dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }),
      );
      await fixture.whenStable();
    },
  };
}

describe('MudDatePicker keyboard', () => {
  it('makes the grid a single tab stop', async () => {
    const view = await render();
    const tabbable = view.el.querySelectorAll('[data-iso] button[tabindex="0"]');

    expect(tabbable).toHaveLength(1);
    expect(view.el.querySelectorAll('[data-iso] button[tabindex="-1"]')).toHaveLength(41);
  });

  it('starts the roving focus on startAt', async () => {
    const view = await render();

    expect(view.focused().dataset['iso']).toBe('2026-08-15');
  });

  it('moves by day with left/right', async () => {
    const view = await render();

    await view.press('ArrowRight');
    expect(view.focused().dataset['iso']).toBe('2026-08-16');

    await view.press('ArrowLeft');
    await view.press('ArrowLeft');
    expect(view.focused().dataset['iso']).toBe('2026-08-14');
  });

  it('moves by week with up/down', async () => {
    const view = await render();

    await view.press('ArrowDown');
    expect(view.focused().dataset['iso']).toBe('2026-08-22');

    await view.press('ArrowUp');
    await view.press('ArrowUp');
    expect(view.focused().dataset['iso']).toBe('2026-08-08');
  });

  it('pages the visible month when focus leaves it', async () => {
    const view = await render();

    for (let i = 0; i < 17; i += 1) await view.press('ArrowRight');

    expect(view.focused().dataset['iso']).toBe('2026-09-01');
    expect(view.title()).toBe('September 2026');
  });

  it('changes month with PageUp/PageDown', async () => {
    const view = await render();

    await view.press('PageDown');
    expect(view.title()).toBe('September 2026');
    expect(view.focused().dataset['iso']).toBe('2026-09-15');

    await view.press('PageUp');
    expect(view.title()).toBe('August 2026');
  });

  it('changes year with shift+PageUp/PageDown', async () => {
    const view = await render();

    await view.press('PageDown', { shiftKey: true });

    expect(view.title()).toBe('August 2027');
    expect(view.focused().dataset['iso']).toBe('2027-08-15');
  });

  it('clamps the day when the target month is shorter', async () => {
    const view = await render();

    // 31 Aug + one month would be 31 Sep, which does not exist.
    for (let i = 0; i < 16; i += 1) await view.press('ArrowRight');
    expect(view.focused().dataset['iso']).toBe('2026-08-31');

    await view.press('PageDown');
    expect(view.focused().dataset['iso']).toBe('2026-09-30');
  });

  it('jumps to the start and end of the visible week', async () => {
    const view = await render();

    await view.press('Home');
    expect(view.focused().dataset['iso']).toBe('2026-08-10');

    await view.press('End');
    expect(view.focused().dataset['iso']).toBe('2026-08-16');
  });

  it('selects the focused day with Enter and Space', async () => {
    const view = await render();

    await view.press('Enter');
    expect(view.host.value()).toBe('2026-08-15');

    await view.press('ArrowRight');
    await view.press(' ');
    expect(view.host.value()).toBe('2026-08-16');
  });

  it('refuses to select a disabled focused day', async () => {
    const view = await render();

    view.host.min.set('2026-08-20');
    await view.fixture.whenStable();

    await view.press('Enter');

    expect(view.host.value()).toBeNull();
  });

  it('announces the month after keyboard paging', async () => {
    const view = await render();

    await view.press('PageDown');

    expect(view.live()).toBe('September 2026');
  });

  it('keeps exactly one focusable tab stop when the header nav pages past a disabled first day', async () => {
    const view = await render();

    // Header nav calls _goToMonth, not _focusCell, so the roving target
    // (still 2026-08-15) is left off the new page entirely — the fallback
    // must pick an ENABLED in-month cell, not just the first one.
    view.host.min.set('2026-09-10');
    await view.fixture.whenStable();

    view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!.click();
    await view.fixture.whenStable();

    const tabbable = view.el.querySelectorAll<HTMLButtonElement>('[data-iso] button[tabindex="0"]');

    expect(tabbable).toHaveLength(1);
    expect(tabbable[0].disabled).toBe(false);
    expect(tabbable[0].parentElement!.dataset['iso']).toBe('2026-09-10');
  });

  it('lets arrow-key traversal land the roving focus on a disabled day', async () => {
    const view = await render();

    view.host.min.set('2026-08-20');
    await view.fixture.whenStable();

    await view.press('ArrowRight');

    const focused = view.focused();

    expect(focused.dataset['iso']).toBe('2026-08-16');
    expect(focused.getAttribute('aria-disabled')).toBe('true');
    expect(focused.querySelector('button')!.disabled).toBe(false);
  });

  it('continues arrow navigation from the cell that actually has focus after header paging', async () => {
    const view = await render();

    view.el.querySelector<HTMLButtonElement>('[data-nav="next"]')!.click();
    await view.fixture.whenStable();

    // Tab lands on the fallback cell, not on the stale roving target.
    const landing = view.focused();

    landing.querySelector('button')!.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
    await view.fixture.whenStable();

    await view.press('ArrowRight');

    // Without the sync this walks back into August.
    expect(view.title()).toBe('September 2026');
    expect(view.focused().dataset['iso']!.startsWith('2026-09')).toBe(true);
  });
});
