import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { MudToast } from './mud-toast.service';

function toasts(): HTMLElement[] {
  return [...document.querySelectorAll('mud-toast-item')] as HTMLElement[];
}

async function settle(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}

// This suite runs in real headless Chromium (see vitest.config.ts), not jsdom —
// but no animation is running here regardless: the component renders without
// _toast.scss loaded, so getAnimations() legitimately returns []. That is the
// same shape prefers-reduced-motion produces in a real app (animation: none),
// so these tests are a valid regression guard for the CLASS of bug — an exit
// path that waits unconditionally on animationend and never resolves — not a
// test of either individual guard line in _settleAnimations. Verified by
// experiment: removing the `typeof el.getAnimations === 'function'` check
// alone, or the `animations.length === 0` early return alone, still leaves
// both tests below green, because getAnimations exists in this browser and
// legitimately returns [] either way. Only replacing the method with an
// unconditional wait on animationend makes them fail.
describe('MudToast without a running animation', () => {
  afterEach(() => TestBed.inject(MudToast).dismissAll());

  it('still frees the queue slot when no animation runs', async () => {
    const toast = TestBed.inject(MudToast);
    const first = toast.open({ data: { message: 'a' }, duration: 0 });

    for (const message of ['b', 'c', 'd']) toast.open({ data: { message }, duration: 0 });
    await settle();
    expect(toasts()).toHaveLength(3);

    first.dismiss();
    await settle();

    expect(toasts()).toHaveLength(3);
    expect(document.body.textContent).toContain('d');
  });

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
