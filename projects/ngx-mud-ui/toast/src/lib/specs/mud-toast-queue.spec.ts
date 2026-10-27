import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { MudToast } from '../mud-toast.service';
import { MUD_TOAST_DEFAULT_OPTIONS } from '../mud-toast-config';

function toasts(): HTMLElement[] {
  return [...document.querySelectorAll('mud-toast-item')] as HTMLElement[];
}

async function settle(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}

describe('MudToast queue', () => {
  afterEach(() => TestBed.inject(MudToast).dismissAll());

  it('shows at most maxVisible toasts and queues the rest', async () => {
    const toast = TestBed.inject(MudToast);

    for (const message of ['a', 'b', 'c', 'd']) toast.open({ data: { message }, duration: 0 });
    await settle();

    expect(toasts()).toHaveLength(3);
    expect(document.body.textContent).not.toContain('d');
  });

  it('promotes the queued toast when a slot frees', async () => {
    const toast = TestBed.inject(MudToast);
    const first = toast.open({ data: { message: 'a' }, duration: 0 });

    for (const message of ['b', 'c', 'd']) toast.open({ data: { message }, duration: 0 });
    await settle();

    first.dismiss();
    await settle();

    expect(toasts()).toHaveLength(3);
    expect(document.body.textContent).toContain('d');
  });

  it('does not over-promote the queue when dismiss() is called twice before the exit animation resolves', async () => {
    const toast = TestBed.inject(MudToast);
    const refs = ['a', 'b', 'c', 'd', 'e'].map((message) => toast.open({ data: { message }, duration: 0 }));

    await settle();

    // A double-click (or a stray timeout racing a manual close) fires dismiss()
    // twice before the first call's `await playExit()` has a chance to resolve
    // and set `_settled`. Without re-entrancy guarding, both calls would run
    // their own `finally` — decrementing `_visible` twice and shifting two
    // entries off the queue for a single freed slot.
    refs[0].dismiss();
    refs[0].dismiss();
    await settle();

    expect(toasts()).toHaveLength(3);
  });

  it('counts the cap across positions, not per corner', async () => {
    const toast = TestBed.inject(MudToast);

    toast.open({ data: { message: 'a' }, duration: 0, verticalPosition: 'top' });
    toast.open({ data: { message: 'b' }, duration: 0, verticalPosition: 'top' });
    toast.open({ data: { message: 'c' }, duration: 0, verticalPosition: 'bottom' });
    toast.open({ data: { message: 'd' }, duration: 0, verticalPosition: 'bottom' });
    await settle();

    expect(toasts()).toHaveLength(3);
  });

  it('drops a queued toast on dismiss() and it never appears among the rendered toasts', async () => {
    const toast = TestBed.inject(MudToast);

    for (const message of ['a', 'b', 'c']) toast.open({ data: { message }, duration: 0 });
    const queued = toast.open({ data: { message: 'd' }, duration: 0 });

    await settle();

    const seen: string[] = [];

    queued.dismissed.subscribe((reason) => seen.push(reason));
    queued.dismiss();
    await settle();

    expect(seen).toEqual(['action']);
    expect(toasts()).toHaveLength(3);
    expect(document.body.textContent).not.toContain('d');
  });

  it('dismissAll clears queued toasts too', async () => {
    const toast = TestBed.inject(MudToast);

    for (const message of ['a', 'b', 'c', 'd', 'e']) toast.open({ data: { message }, duration: 0 });
    await settle();

    toast.dismissAll();
    await settle();

    expect(toasts()).toHaveLength(0);
  });
});

describe('MudToast queue with an app-configured cap', () => {
  it('honours MUD_TOAST_DEFAULT_OPTIONS.maxVisible', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: MUD_TOAST_DEFAULT_OPTIONS, useValue: { maxVisible: 1 } }],
    });

    const toast = TestBed.inject(MudToast);

    toast.open({ data: { message: 'a' }, duration: 0 });
    toast.open({ data: { message: 'b' }, duration: 0 });
    await settle();

    expect(toasts()).toHaveLength(1);
    toast.dismissAll();
  });
});

describe('MudToast focus restoration', () => {
  afterEach(() => TestBed.inject(MudToast).dismissAll());

  it('moves focus to the next toast when the focused toast is dismissed', async () => {
    const toast = TestBed.inject(MudToast);

    toast.open({ data: { message: 'older' }, duration: 0 });
    const newer = toast.open({ data: { message: 'newer' }, duration: 0 });

    await settle();

    const closeButtons = [...document.querySelectorAll('.mud-toast__close')] as HTMLButtonElement[];

    closeButtons[0].focus();
    expect(document.activeElement).toBe(closeButtons[0]);

    newer.dismiss('close-button');
    await settle();

    expect(document.activeElement).not.toBe(document.body);
    expect((document.activeElement as HTMLElement).closest('mud-toast-item')).not.toBeNull();
  });

  it('restores focus to the opener when the last toast is dismissed', async () => {
    const opener = document.createElement('button');

    document.body.appendChild(opener);
    opener.focus();

    const toast = TestBed.inject(MudToast);
    const ref = toast.open({ data: { message: 'only' }, duration: 0 });

    await settle();

    document.querySelector<HTMLButtonElement>('.mud-toast__close')!.focus();
    ref.dismiss('close-button');
    await settle();

    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('leaves focus alone when it was never inside the toast', async () => {
    const outside = document.createElement('button');

    document.body.appendChild(outside);

    const toast = TestBed.inject(MudToast);
    const ref = toast.open({ data: { message: 'only' }, duration: 0 });

    await settle();

    outside.focus();
    ref.dismiss();
    await settle();

    expect(document.activeElement).toBe(outside);
    outside.remove();
  });
});

// This suite runs in real headless Chromium (see vitest.config.ts), not jsdom —
// but no animation is running here regardless: the component renders without
// _toast.scss loaded, so getAnimations() legitimately returns []. That is the
// same shape prefers-reduced-motion produces in a real app (animation: none),
// so this test is a valid regression guard for the CLASS of bug — an exit
// path that waits unconditionally on animationend and never resolves — not a
// test of either individual guard line in _settleAnimations. Verified by
// experiment: removing the `typeof el.getAnimations === 'function'` check
// alone, or the `animations.length === 0` early return alone, still leaves
// the test below green, because getAnimations exists in this browser and
// legitimately returns [] either way. Only replacing the method with an
// unconditional wait on animationend makes it fail.
describe('MudToast without a running animation', () => {
  afterEach(() => TestBed.inject(MudToast).dismissAll());

  it('survives dismissing every toast in sequence without stranding the queue', async () => {
    const toast = TestBed.inject(MudToast);
    const refs = ['a', 'b', 'c', 'd', 'e', 'f'].map((message) => toast.open({ data: { message }, duration: 0 }));

    await settle();

    for (const ref of refs) {
      ref.dismiss();
      await settle();
    }

    expect(toasts()).toHaveLength(0);
  });
});
