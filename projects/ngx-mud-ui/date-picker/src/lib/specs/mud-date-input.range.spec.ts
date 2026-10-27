import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDateInput } from '../mud-date-input.component';
import { MudLabel } from '../../../../label/src/public-api';
import type { MudDateRange } from '../date-value';

@Component({
  imports: [MudDateInput, MudLabel],
  template: `<mud-date-input
    mode="range"
    [(value)]="value"
    [required]="required()"
    [max]="max()"
    [placeholder]="placeholder()"
    [aria-label]="ariaLabel()"
    locale="en-GB"
  >
    @if (withLabel()) {
      <mud-label>Perioada</mud-label>
    }
  </mud-date-input>`,
})
class Host {
  readonly value = signal<MudDateRange | null>(null);
  readonly required = signal(false);
  readonly withLabel = signal(true);
  readonly max = signal<string | undefined>(undefined);
  readonly placeholder = signal<string | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-date-input') as HTMLElement;
  const inputs = Array.from(el.querySelectorAll<HTMLInputElement>('input'));

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    start: inputs[0],
    end: inputs[1],
    toggle: () => el.querySelector<HTMLButtonElement>('.date-field__toggle')!,
    ghost: (native: HTMLInputElement) =>
      native.closest('.date-field__entry')!.querySelector('.date-field__ghost')!.textContent,
    /** The accessible name AT computes: every `aria-labelledby` target's text,
     *  in order, which is the whole point of composing rather than overriding. */
    accessibleName: (native: HTMLInputElement) =>
      (native.getAttribute('aria-labelledby') ?? '')
        .split(' ')
        .map((id) => el.querySelector(`#${id}`)!.textContent!.trim())
        .join(' '),
    async type(native: HTMLInputElement, text: string) {
      native.value = text;
      native.dispatchEvent(new Event('input', { bubbles: true }));
      await fixture.whenStable();
    },
    async press(native: HTMLInputElement, key: string) {
      native.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await fixture.whenStable();
    },
    async blur(native: HTMLInputElement) {
      native.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
      await fixture.whenStable();
    },
  };
}

describe('MudDateInput range mode', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  it('composes each accessible name from the field label plus the segment', async () => {
    const view = await render();

    // `aria-label="Start date"` on the inputs (what this used to do) OVERRIDES
    // the <label>, so `label="Perioada"` never reached AT at all.
    expect(view.start.getAttribute('aria-label')).toBeNull();
    expect(view.end.getAttribute('aria-label')).toBeNull();
    expect(view.accessibleName(view.start)).toBe('Perioada Start date');
    expect(view.accessibleName(view.end)).toBe('Perioada End date');
    expect(view.el.querySelectorAll('input')).toHaveLength(2);
  });

  it('falls back to the consumer aria-label when there is no visible label', async () => {
    const view = await render();

    view.host.withLabel.set(false);
    view.host.ariaLabel.set('Perioada de valabilitate');
    await view.fixture.whenStable();

    expect(view.accessibleName(view.start)).toBe('Perioada de valabilitate Start date');
    expect(view.accessibleName(view.end)).toBe('Perioada de valabilitate End date');
  });

  it('names each segment on its own when the field has no name at all', async () => {
    const view = await render();

    view.host.withLabel.set(false);
    await view.fixture.whenStable();

    expect(view.accessibleName(view.start)).toBe('Start date');
    expect(view.accessibleName(view.end)).toBe('End date');
  });

  it('commits each endpoint independently', async () => {
    const view = await render();

    await view.type(view.start, '15/04/2026');
    expect(view.host.value()).toEqual({ start: '2026-04-15', end: null });

    await view.type(view.end, '20/04/2026');
    expect(view.host.value()).toEqual({ start: '2026-04-15', end: '2026-04-20' });
  });

  it('keeps an incomplete entry visible instead of snapping back to empty', async () => {
    const view = await render();

    // An incomplete segment commits `null`, which — like the single-input
    // field — must not wipe out what was just typed. Range mode has an extra
    // trap here: emitting rebuilds `{ start, end }` as a fresh object every
    // time, so BOTH drafts' linkedSignal sources look "changed" on every
    // keystroke in either field, not just the one whose value changed.
    await view.type(view.start, '15/0');

    expect(view.start.getAttribute('value')).toBe('15/0');
  });

  it('preserves an incomplete end entry when a later commit only touches start', async () => {
    const view = await render();

    // `_range()` rebuilds `{ start, end }` as a fresh object on every commit,
    // so a naive object-shaped draft source would see BOTH `_startDraft` and
    // `_endDraft` as "changed" here, even though this commit never touches
    // `end`. That would silently wipe the in-progress end entry.
    await view.type(view.end, '15/0');

    expect(view.end.getAttribute('value')).toBe('15/0');
    expect(view.ghost(view.end)).toBe('M/YYYY');

    await view.type(view.start, '01/04/2026');

    expect(view.end.getAttribute('value')).toBe('15/0');
    expect(view.ghost(view.end)).toBe('M/YYYY');
  });

  it('preserves an incomplete start entry when a later commit only touches end', async () => {
    const view = await render();

    await view.type(view.start, '15/0');

    expect(view.start.getAttribute('value')).toBe('15/0');
    expect(view.ghost(view.start)).toBe('M/YYYY');

    await view.type(view.end, '20/04/2026');

    expect(view.start.getAttribute('value')).toBe('15/0');
    expect(view.ghost(view.start)).toBe('M/YYYY');
  });

  it('still resets a draft when an external value write changes that endpoint', async () => {
    const view = await render();

    await view.type(view.start, '15/0');

    // The primitive-key source must not become so narrow that it stops
    // noticing a real external change to the SAME endpoint it is keyed on.
    view.host.value.set({ start: '2026-04-10', end: null });
    await view.fixture.whenStable();

    expect(view.start.getAttribute('value')).toBe('10/04/2026');
  });

  it('advances focus to the end input once the start is complete', async () => {
    const view = await render();

    await view.type(view.start, '15/04/2026');

    expect(document.activeElement).toBe(view.end);
  });

  // These four are the only range tests where an input genuinely HAS focus.
  // Without that, `.focus()` on the sibling segment dispatches no `blur` at all
  // (activeElement is <body>), which is exactly how the handoff blanking a
  // refused entry stayed invisible to this suite.
  it('keeps a refused start entry on screen when the handoff moves focus to the end', async () => {
    const view = await render();

    view.start.focus();

    // 31 February: complete, so the handoff fires, but impossible, so the
    // commit is refused. The handoff's own synchronous blur must not settle the
    // entry the user has only just finished typing.
    await view.type(view.start, '31/02/2026');

    expect(document.activeElement).toBe(view.end);
    expect(view.start.value).toBe('31/02/2026');
    expect(view.start.getAttribute('value')).toBe('31/02/2026');
    expect(view.host.value()).toEqual({ start: null, end: null });
  });

  it('keeps an out-of-bounds start entry on screen when the handoff moves focus', async () => {
    const view = await render();

    view.host.max.set('2026-12-31');
    view.host.value.set({ start: '2026-04-10', end: null });
    await view.fixture.whenStable();

    view.start.focus();

    // Retyping over the existing date takes the field through an incomplete
    // state, so the LAST keystroke is a transition into completeness and the
    // handoff fires. (Editing a still-complete date in place does not hand off
    // at all, which is why the previous value has to be retyped to reach this.)
    await view.type(view.start, '15/04/203');
    await view.type(view.start, '15/04/2030');

    // The out-of-bounds variant is the quieter one: rather than blanking, it
    // silently restored '10/04/2026', with no signal anything was refused.
    expect(document.activeElement).toBe(view.end);
    expect(view.start.value).toBe('15/04/2030');
    expect(view.host.value()).toEqual({ start: null, end: null });
  });

  it('hands off without reverting when the completed start is usable', async () => {
    const view = await render();

    view.start.focus();
    await view.type(view.start, '15/04/2026');

    expect(document.activeElement).toBe(view.end);
    expect(view.start.value).toBe('15/04/2026');
    expect(view.host.value()).toEqual({ start: '2026-04-15', end: null });
  });

  it('walks back from the end without settling the entry being deleted', async () => {
    const view = await render();

    await view.type(view.start, '10/04/2026');

    view.end.focus();
    await view.type(view.end, '15/0');
    view.end.setSelectionRange(0, 0);
    await view.press(view.end, 'Backspace');

    expect(document.activeElement).toBe(view.start);
    expect(view.end.value).toBe('15/0');
  });

  it('does not move focus to end when correcting an already-complete start', async () => {
    const view = await render();

    view.host.value.set({ start: '2026-04-15', end: null });
    await view.fixture.whenStable();

    view.start.focus();

    // Simulates fixing one digit mid-field: the field already reads a full
    // 10-character display, and the correction is still 10 characters — this
    // is not the transition into completeness the handoff should fire on.
    await view.type(view.start, '16/04/2026');

    expect(document.activeElement).toBe(view.start);
  });

  it('marks both start and end aria-required when the field is required', async () => {
    const view = await render();

    view.host.required.set(true);
    await view.fixture.whenStable();

    expect(view.start.getAttribute('aria-required')).toBe('true');
    expect(view.end.getAttribute('aria-required')).toBe('true');
  });

  it('walks focus back to the start on Backspace at the head of the end input', async () => {
    const view = await render();

    view.end.focus();
    view.end.setSelectionRange(0, 0);
    await view.press(view.end, 'Backspace');

    expect(document.activeElement).toBe(view.start);
  });

  it('normalizes a reversed typed range instead of nullifying the end', async () => {
    const view = await render();

    await view.type(view.start, '15/04/2026');
    await view.type(view.end, '10/04/2026');

    // The calendar swaps the endpoints for the same user intent ("I entered the
    // later date first"); nullifying the end here both threw away a date the
    // user had typed and left it on screen next to `end: null`. Both paths go
    // through `normalizeRange` now.
    expect(view.host.value()).toEqual({ start: '2026-04-10', end: '2026-04-15' });

    // The displayed endpoints follow the swap: both drafts are keyed on the
    // committed endpoints.
    expect(view.start.getAttribute('value')).toBe('10/04/2026');
    expect(view.end.getAttribute('value')).toBe('15/04/2026');
  });

  it('deletes a complete endpoint one character at a time all the way to empty', async () => {
    const view = await render();

    view.host.value.set({ start: '2026-04-15', end: '2026-04-20' });
    await view.fixture.whenStable();

    for (const native of [view.start, view.end]) {
      const seen: string[] = [];

      for (let i = 0; i < 10; i += 1) {
        native.value = native.value.slice(0, -1);
        native.dispatchEvent(new Event('input', { bubbles: true }));
        await view.fixture.whenStable();
        seen.push(native.value);
      }

      // An eagerly-appended separator trapped this at '15/04/' forever.
      expect(seen[3]).toBe(native === view.start ? '15/04' : '20/04');
      expect(seen[5]).toBe(native === view.start ? '15' : '20');
      expect(seen.at(-1)).toBe('');
    }

    expect(view.host.value()).toEqual({ start: null, end: null });
  });

  it('reverts a refused endpoint to its last usable value on blur', async () => {
    const view = await render();

    view.host.max.set('2026-12-31');
    await view.fixture.whenStable();

    await view.type(view.start, '10/04/2026');
    await view.type(view.end, '20/04/2026');
    expect(view.host.value()).toEqual({ start: '2026-04-10', end: '2026-04-20' });

    await view.type(view.end, '20/04/2030');
    expect(view.host.value()).toEqual({ start: '2026-04-10', end: null });

    await view.blur(view.end);

    expect(view.end.getAttribute('value')).toBe('20/04/2026');
    expect(view.host.value()).toEqual({ start: '2026-04-10', end: '2026-04-20' });
  });

  it('leaves a valid endpoint alone on blur', async () => {
    const view = await render();

    await view.type(view.start, '10/04/2026');
    await view.blur(view.start);

    expect(view.start.getAttribute('value')).toBe('10/04/2026');
    expect(view.host.value()).toEqual({ start: '2026-04-10', end: null });
  });

  it('settles only the endpoint that blurred, not the one focus is moving into', async () => {
    const view = await render();

    // Focus leaving start must not wipe an end entry the user is mid-way
    // through — that segment is very often where focus is heading.
    await view.type(view.end, '15/0');
    await view.type(view.start, '10/04/2026');
    await view.blur(view.start);

    expect(view.end.getAttribute('value')).toBe('15/0');
  });

  it('renders a pre-set range into both inputs', async () => {
    const view = await render();

    view.host.value.set({ start: '2026-04-15', end: '2026-04-20' });
    await view.fixture.whenStable();

    expect(view.start.getAttribute('value')).toBe('15/04/2026');
    expect(view.end.getAttribute('value')).toBe('20/04/2026');
  });

  it('fills both endpoints from the calendar without closing early', async () => {
    const view = await render();

    // The picker opens on the range start when one is set, otherwise today —
    // pin a COMPLETE range in April 2026 so that month is visible regardless
    // of run date. A lone (unfinished) start here would not do: clicking
    // 2026-04-15 against a lone start completes the range on the very first
    // click (see MudDatePicker's third-click-restarts-a-range rule, which
    // only fires once both start and end are already set), which would close
    // the popover before this test gets to exercise the "still open" case.
    view.host.value.set({ start: '2026-04-01', end: '2026-04-05' });
    await view.fixture.whenStable();

    view.toggle().click();
    await view.fixture.whenStable();

    document.querySelector<HTMLButtonElement>('[data-iso="2026-04-15"] button')?.click();
    await view.fixture.whenStable();

    // Still open: a range needs a second pick.
    expect(document.querySelector('.date-picker')).not.toBeNull();

    document.querySelector<HTMLButtonElement>('[data-iso="2026-04-20"] button')!.click();
    await view.fixture.whenStable();

    expect(view.host.value()).toEqual({ start: '2026-04-15', end: '2026-04-20' });
    expect(document.querySelector('.date-picker')).toBeNull();
  });
  it('leaves an untouched endpoint alone on blur when the bounds changed after it was committed', async () => {
    const view = await render();

    await view.type(view.start, '15/04/2026');
    await view.type(view.end, '20/04/2026');
    expect(view.host.value()).toEqual({ start: '2026-04-15', end: '2026-04-20' });

    view.host.max.set('2026-04-01');
    await view.fixture.whenStable();

    await view.blur(view.start);
    await view.blur(view.end);

    expect(view.host.value()).toEqual({ start: '2026-04-15', end: '2026-04-20' });
    expect(view.start.getAttribute('value')).toBe('15/04/2026');
    expect(view.end.getAttribute('value')).toBe('20/04/2026');
  });

  it('applies a same-shape placeholder to both segments and their ghosts', async () => {
    const view = await render();

    view.host.placeholder.set('ZZ/LL/AAAA');
    await view.fixture.whenStable();

    expect(view.start.getAttribute('placeholder')).toBe('ZZ/LL/AAAA');
    expect(view.end.getAttribute('placeholder')).toBe('ZZ/LL/AAAA');

    await view.type(view.end, '2');
    expect(view.el.querySelectorAll('.date-field__ghost')[1].textContent).toBe('Z/LL/AAAA');
  });

});
