import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTimePicker } from '../mud-time-picker.component';

@Component({
  imports: [MudTimePicker],
  template: `<mud-time-picker [(value)]="value" [min]="min()" [max]="max()" [minuteStep]="minuteStep()" [timeFilter]="timeFilter()" />`,
})
class Host {
  readonly value = signal<string | null>(null);
  readonly min = signal<string | undefined>(undefined);
  readonly max = signal<string | undefined>(undefined);
  readonly minuteStep = signal<number>(1);
  readonly timeFilter = signal<((t: string) => boolean) | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-time-picker') as HTMLElement;
  const picker = fixture.debugElement.children[0].componentInstance as MudTimePicker;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    picker,
    tabStop: (name: 'hours' | 'minutes') =>
      el.querySelector<HTMLElement>(`[data-column="${name}"] [role="option"][tabindex="0"]`)!,
    focusedValue: () => (document.activeElement as HTMLElement | null)?.dataset['value'],
    focusedColumn: () =>
      (document.activeElement as HTMLElement | null)?.closest<HTMLElement>('[data-column]')?.dataset['column'],
    /** Presses `key` on the focused option, as a real keyboard would. */
    async press(key: string) {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
      );
      await fixture.whenStable();
    },
  };
}

describe('MudTimePicker keyboard', () => {
  it('focus() lands on the active column tab stop', async () => {
    const view = await render();

    view.picker.focus();

    expect(view.focusedColumn()).toBe('hours');
    expect(view.focusedValue()).toBe('0');
  });

  it('moves within a column with Up/Down and jumps with Home/End', async () => {
    const view = await render();

    view.picker.focus();

    await view.press('ArrowDown');
    expect(view.focusedValue()).toBe('1');
    expect(view.tabStop('hours').dataset['value']).toBe('1');

    await view.press('ArrowDown');
    await view.press('ArrowUp');
    expect(view.focusedValue()).toBe('1');

    await view.press('End');
    expect(view.focusedValue()).toBe('23');

    await view.press('ArrowDown');
    expect(view.focusedValue()).toBe('23');

    await view.press('Home');
    expect(view.focusedValue()).toBe('0');

    await view.press('ArrowUp');
    expect(view.focusedValue()).toBe('0');
  });

  it('skips disabled options', async () => {
    const view = await render();

    view.host.min.set('09:00');
    await view.fixture.whenStable();

    view.picker.focus();
    expect(view.focusedValue()).toBe('9');

    await view.press('ArrowUp');
    expect(view.focusedValue()).toBe('9');

    await view.press('Home');
    expect(view.focusedValue()).toBe('9');
  });

  it('switches columns with Right/Left, keeping each column tab stop', async () => {
    const view = await render();

    view.picker.focus();

    await view.press('ArrowDown');
    await view.press('ArrowRight');
    expect(view.focusedColumn()).toBe('minutes');
    expect(view.focusedValue()).toBe('0');

    await view.press('ArrowDown');
    await view.press('ArrowLeft');
    expect(view.focusedColumn()).toBe('hours');
    expect(view.focusedValue()).toBe('1');

    await view.press('ArrowRight');
    expect(view.focusedValue()).toBe('1');

    // Right in the minutes / Left in the hours are no-ops.
    await view.press('ArrowRight');
    expect(view.focusedColumn()).toBe('minutes');
  });

  it('picks with Enter and Space, hour then minute, and moves focus across', async () => {
    const view = await render();

    view.picker.focus();

    await view.press('ArrowDown');
    await view.press('Enter');
    expect(view.focusedColumn()).toBe('minutes');
    expect(view.host.value()).toBeNull();

    await view.press('ArrowDown');
    await view.press('ArrowDown');
    await view.press(' ');
    expect(view.host.value()).toBe('01:02');
  });

  it('focusing an option by pointer makes its column the active one', async () => {
    const view = await render();

    view.el.querySelector<HTMLElement>('[data-column="minutes"] [data-value="5"]')!.focus();
    await view.fixture.whenStable();

    expect(view.el.querySelector('[data-column="minutes"]')!.classList).toContain('is-active');
    expect(view.tabStop('minutes').dataset['value']).toBe('5');
  });

  it('opens on the selected values and scrolls each into its column top', async () => {
    const view = await render();

    view.host.value.set('12:45');
    await view.fixture.whenStable();

    view.picker.focus();
    expect(view.focusedValue()).toBe('12');

    await view.press('ArrowRight');
    expect(view.focusedValue()).toBe('45');
  });

  it('navigates a stepped minute column by rendered option, not by value', async () => {
    const view = await render();

    view.host.minuteStep.set(15);
    await view.fixture.whenStable();

    view.picker.focus();
    await view.press('ArrowRight');
    expect(view.focusedColumn()).toBe('minutes');
    expect(view.focusedValue()).toBe('0');

    await view.press('ArrowDown');
    expect(view.focusedValue()).toBe('15');

    await view.press('End');
    expect(view.focusedValue()).toBe('45');

    await view.press('ArrowDown');
    expect(view.focusedValue()).toBe('45');

    await view.press('Home');
    expect(view.focusedValue()).toBe('0');
  });

  it('skips a filtered-out hour in the middle of the column', async () => {
    const view = await render();

    view.host.value.set('11:00');
    view.host.timeFilter.set((t) => !t.startsWith('12'));
    await view.fixture.whenStable();

    view.picker.focus();
    expect(view.focusedValue()).toBe('11');

    await view.press('ArrowDown');
    expect(view.focusedValue()).toBe('13');

    await view.press('ArrowUp');
    expect(view.focusedValue()).toBe('11');
  });
});
