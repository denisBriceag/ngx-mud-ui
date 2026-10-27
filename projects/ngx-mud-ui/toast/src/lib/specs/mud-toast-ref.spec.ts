import { describe, expect, it, vi } from 'vitest';
import { MudToastRef } from '../mud-toast-ref';
import type { MudToastDismissReason } from '../mud-toast-config';

describe('MudToastRef', () => {
  it('emits dismissed once and then completes', () => {
    // Verify repeated _settle() calls do not double-emit through the public API.
    const ref = new MudToastRef();
    const next = vi.fn();
    const complete = vi.fn();

    ref.dismissed.subscribe({ next, complete });

    ref._settle('timeout');
    ref._settle('close-button'); // a second settle must be ignored

    expect(next).toHaveBeenCalledExactlyOnceWith('timeout');
    expect(complete).toHaveBeenCalledOnce();
  });

  it('emits opened once and then completes', () => {
    const ref = new MudToastRef();
    const next = vi.fn();
    const complete = vi.fn();

    ref.opened.subscribe({ next, complete });

    ref._markOpened();

    expect(next).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledOnce();
  });

  it('routes dismiss() to the service via _dismissRequests, defaulting to action', () => {
    const ref = new MudToastRef();
    const seen: MudToastDismissReason[] = [];

    ref._dismissRequests.subscribe((reason) => seen.push(reason));

    ref.dismiss();
    ref.dismiss('close-button');

    expect(seen).toEqual(['action', 'close-button']);
  });

  it('ignores dismiss() once settled, so a dismissing toast cannot be re-queued', () => {
    // Verify repeated dismiss() calls after _settle() do not emit through the public API.
    const ref = new MudToastRef();
    const seen: MudToastDismissReason[] = [];

    ref._dismissRequests.subscribe((reason) => seen.push(reason));

    ref._settle('timeout');
    ref.dismiss('action');

    expect(seen).toEqual([]);
  });

  it('inert() is already settled, for the SSR path', () => {
    const ref = MudToastRef.inert();
    const dismissedNext = vi.fn();
    const dismissedComplete = vi.fn();
    const openedNext = vi.fn();
    const openedComplete = vi.fn();

    ref.dismissed.subscribe({ next: dismissedNext, complete: dismissedComplete });
    ref.opened.subscribe({ next: openedNext, complete: openedComplete });

    ref.dismiss();

    expect(dismissedNext).not.toHaveBeenCalled();
    expect(dismissedComplete).toHaveBeenCalledOnce();
    expect(openedNext).not.toHaveBeenCalled();
    expect(openedComplete).toHaveBeenCalledOnce();
  });
});
