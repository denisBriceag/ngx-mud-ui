import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTimePicker } from './mud-time-picker.component';

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

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    column: (name: 'hours' | 'minutes') => el.querySelector<HTMLElement>(`[data-column="${name}"]`)!,
    option: (name: 'hours' | 'minutes', n: number) =>
      el.querySelector<HTMLElement>(`[data-column="${name}"] [role="option"][data-value="${n}"]`)!,
    tabStop: (name: 'hours' | 'minutes') =>
      el.querySelector<HTMLElement>(`[data-column="${name}"] [role="option"][tabindex="0"]`),
    async pick(name: 'hours' | 'minutes', n: number) {
      this.option(name, n).click();
      await fixture.whenStable();
    },
  };
}

describe('MudTimePicker', () => {
  it('renders two labelled listboxes of 24 hours and 60 minutes, zero-padded', async () => {
    const view = await render();

    expect(view.el.getAttribute('role')).toBe('group');
    expect(view.el.getAttribute('aria-label')).toBe('Time');
    expect(view.column('hours').getAttribute('role')).toBe('listbox');
    expect(view.column('hours').getAttribute('aria-label')).toBe('Hours');
    expect(view.column('minutes').getAttribute('aria-label')).toBe('Minutes');
    expect(view.column('hours').querySelectorAll('[role="option"]')).toHaveLength(24);
    expect(view.column('minutes').querySelectorAll('[role="option"]')).toHaveLength(60);
    expect(view.option('hours', 9).textContent!.trim()).toBe('09');
    expect(view.option('minutes', 0).textContent!.trim()).toBe('00');
    expect(view.el.classList).toContain('time-picker--elevated');
  });

  it('completes a time once both an hour and a minute are picked, hour first', async () => {
    const view = await render();

    await view.pick('hours', 9);
    expect(view.host.value()).toBeNull();
    expect(view.option('hours', 9).getAttribute('aria-selected')).toBe('true');
    // The column being edited moved on to the minutes: the picked hour is
    // now the "other" column's selection (tinted, not solid).
    expect(view.column('minutes').classList).toContain('is-active');
    expect(view.option('hours', 9).classList).toContain('is-selected');
    expect(view.option('hours', 9).classList).not.toContain('is-active');

    await view.pick('minutes', 30);
    expect(view.host.value()).toBe('09:30');
    expect(view.option('minutes', 30).classList).toContain('is-active');
  });

  it('completes a time minute first as well', async () => {
    const view = await render();

    await view.pick('minutes', 15);
    expect(view.host.value()).toBeNull();
    expect(view.column('hours').classList).toContain('is-active');

    await view.pick('hours', 7);
    // Hour picked with a minute already chosen: stays on the hour, emits nothing
    // until a minute is picked again (upstream contract).
    expect(view.host.value()).toBeNull();
    expect(view.column('hours').classList).toContain('is-active');

    await view.pick('minutes', 15);
    expect(view.host.value()).toBe('07:15');
  });

  it('re-editing the hour of a complete time stays on the hour column', async () => {
    const view = await render();

    view.host.value.set('09:30');
    await view.fixture.whenStable();

    await view.pick('hours', 10);

    expect(view.host.value()).toBe('09:30');
    expect(view.column('hours').classList).toContain('is-active');
    expect(view.option('hours', 10).classList).toContain('is-active');
    expect(view.option('minutes', 30).classList).toContain('is-selected');
  });

  it('reflects an external value into both columns', async () => {
    const view = await render();

    view.host.value.set('23:59');
    await view.fixture.whenStable();

    expect(view.option('hours', 23).getAttribute('aria-selected')).toBe('true');
    expect(view.option('minutes', 59).getAttribute('aria-selected')).toBe('true');

    view.host.value.set(null);
    await view.fixture.whenStable();

    expect(view.el.querySelectorAll('[aria-selected="true"]')).toHaveLength(0);
  });

  it('disables hours with no selectable minute and minutes outside the bounds of the chosen hour', async () => {
    const view = await render();

    view.host.min.set('09:30');
    view.host.max.set('17:15');
    await view.fixture.whenStable();

    expect(view.option('hours', 8).getAttribute('aria-disabled')).toBe('true');
    expect(view.option('hours', 9).getAttribute('aria-disabled')).toBeNull();
    expect(view.option('hours', 17).getAttribute('aria-disabled')).toBeNull();
    expect(view.option('hours', 18).getAttribute('aria-disabled')).toBe('true');
    // No hour chosen: every minute is still open.
    expect(view.option('minutes', 0).getAttribute('aria-disabled')).toBeNull();

    await view.pick('hours', 9);
    expect(view.option('minutes', 29).getAttribute('aria-disabled')).toBe('true');
    expect(view.option('minutes', 30).getAttribute('aria-disabled')).toBeNull();

    await view.pick('hours', 17);
    expect(view.option('minutes', 15).getAttribute('aria-disabled')).toBeNull();
    expect(view.option('minutes', 16).getAttribute('aria-disabled')).toBe('true');
  });

  it('ignores a click on a disabled option', async () => {
    const view = await render();

    view.host.min.set('09:00');
    await view.fixture.whenStable();

    await view.pick('hours', 8);
    expect(view.option('hours', 8).getAttribute('aria-selected')).toBe('false');

    await view.pick('hours', 9);
    await view.pick('minutes', 5);
    expect(view.host.value()).toBe('09:05');
  });

  it('clears a chosen minute that a newly picked hour puts out of bounds, and moves on to the minutes', async () => {
    const view = await render();

    view.host.max.set('10:30');
    view.host.value.set('09:45');
    await view.fixture.whenStable();

    await view.pick('hours', 10);

    expect(view.option('minutes', 45).getAttribute('aria-selected')).toBe('false');
    expect(view.column('minutes').classList).toContain('is-active');
    expect(view.host.value()).toBe('09:45');

    await view.pick('minutes', 30);
    expect(view.host.value()).toBe('10:30');
  });

  it('ignores a malformed bound', async () => {
    const view = await render();

    view.host.min.set('9:00');
    await view.fixture.whenStable();

    expect(view.el.querySelectorAll('[aria-disabled="true"]')).toHaveLength(0);
  });

  it('survives inverted bounds with every option disabled and no tab stop', async () => {
    const view = await render();

    view.host.min.set('18:00');
    view.host.max.set('09:00');
    await view.fixture.whenStable();

    expect(view.column('hours').querySelectorAll('[aria-disabled="true"]')).toHaveLength(24);
    expect(view.tabStop('hours')).toBeNull();

    await view.pick('hours', 12);
    expect(view.host.value()).toBeNull();
  });

  it('gives each column exactly one tab stop: the selection, else the first enabled option', async () => {
    const view = await render();

    expect(view.tabStop('hours')!.dataset['value']).toBe('0');
    expect(view.tabStop('minutes')!.dataset['value']).toBe('0');
    expect(view.el.querySelectorAll('[role="option"][tabindex="0"]')).toHaveLength(2);

    view.host.value.set('09:30');
    view.host.min.set('08:00');
    await view.fixture.whenStable();

    expect(view.tabStop('hours')!.dataset['value']).toBe('9');
    expect(view.tabStop('minutes')!.dataset['value']).toBe('30');
  });

  it('switches to the flat appearance', async () => {
    @Component({
      imports: [MudTimePicker],
      template: `<mud-time-picker appearance="flat" />`,
    })
    class FlatHost {}

    const fixture = TestBed.createComponent(FlatHost);

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('mud-time-picker').classList).toContain('time-picker--flat');
    // The embedding dialog is the named landmark; a second "Time" group would be announced twice.
    expect(fixture.nativeElement.querySelector('mud-time-picker').getAttribute('role')).toBeNull();
    expect(fixture.nativeElement.querySelector('mud-time-picker').getAttribute('aria-label')).toBeNull();
  });

  it('renders only the minutes of the step', async () => {
    const view = await render();

    view.host.minuteStep.set(15);
    await view.fixture.whenStable();

    const values = Array.from(view.column('minutes').querySelectorAll<HTMLElement>('[role="option"]')).map(
      (o) => o.dataset['value'],
    );

    expect(values).toEqual(['0', '15', '30', '45']);
    expect(view.column('hours').querySelectorAll('[role="option"]')).toHaveLength(24);
  });

  it('falls back to a 1-minute step for an unlisted value, warning in dev mode', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const view = await render();

    view.host.minuteStep.set(7);
    await view.fixture.whenStable();

    expect(view.column('minutes').querySelectorAll('[role="option"]')).toHaveLength(60);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('[mud-time-picker]'));

    warn.mockRestore();
  });

  it('shows a committed off-step minute as unselected and moves the tab stop to the first enabled minute', async () => {
    const view = await render();

    view.host.minuteStep.set(15);
    view.host.value.set('09:07');
    await view.fixture.whenStable();

    expect(view.option('hours', 9).getAttribute('aria-selected')).toBe('true');
    expect(view.column('minutes').querySelectorAll('[aria-selected="true"]')).toHaveLength(0);
    expect(view.tabStop('minutes')!.dataset['value']).toBe('0');
  });

  it('disables hours the filter leaves without a selectable minute and minutes it refuses for the chosen hour', async () => {
    const view = await render();

    // Working day with a lunch break; 12:xx is never selectable.
    view.host.timeFilter.set((t) => t >= '09:00' && t <= '17:30' && !t.startsWith('12'));
    await view.fixture.whenStable();

    expect(view.option('hours', 8).getAttribute('aria-disabled')).toBe('true');
    expect(view.option('hours', 12).getAttribute('aria-disabled')).toBe('true');
    expect(view.option('hours', 13).getAttribute('aria-disabled')).toBeNull();
    // No hour chosen: a minute is open while some hour makes it selectable.
    expect(view.option('minutes', 45).getAttribute('aria-disabled')).toBeNull();

    await view.pick('hours', 17);
    expect(view.option('minutes', 30).getAttribute('aria-disabled')).toBeNull();
    expect(view.option('minutes', 31).getAttribute('aria-disabled')).toBe('true');

    // A pick on a disabled hour is a no-op: the selection and the value stay.
    await view.pick('hours', 12);
    expect(view.host.value()).toBeNull();
    expect(view.option('hours', 12).getAttribute('aria-selected')).toBe('false');
    expect(view.option('hours', 17).getAttribute('aria-selected')).toBe('true');
  });

  it('disables a minute no hour can select while no hour is chosen', async () => {
    const view = await render();

    view.host.timeFilter.set((t) => t.endsWith(':00') || t.endsWith(':30'));
    await view.fixture.whenStable();

    expect(view.option('minutes', 0).getAttribute('aria-disabled')).toBeNull();
    expect(view.option('minutes', 15).getAttribute('aria-disabled')).toBe('true');
  });

  it('combines step, bounds and filter', async () => {
    const view = await render();

    view.host.minuteStep.set(15);
    view.host.min.set('09:00');
    view.host.max.set('10:15');
    view.host.timeFilter.set((t) => t !== '10:00');
    await view.fixture.whenStable();

    await view.pick('hours', 10);
    expect(view.option('minutes', 0).getAttribute('aria-disabled')).toBe('true');
    expect(view.option('minutes', 15).getAttribute('aria-disabled')).toBeNull();
    expect(view.option('minutes', 30).getAttribute('aria-disabled')).toBe('true');

    await view.pick('minutes', 15);
    expect(view.host.value()).toBe('10:15');
  });
});
