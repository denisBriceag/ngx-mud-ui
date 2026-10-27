import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MudToastTimer } from '../mud-toast-timer';

describe('MudToastTimer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('expires after the full duration', () => {
    const onExpire = vi.fn();

    new MudToastTimer(4000, onExpire).start();

    vi.advanceTimersByTime(3999);
    expect(onExpire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('never expires when the duration is 0', () => {
    const onExpire = vi.fn();

    new MudToastTimer(0, onExpire).start();

    vi.advanceTimersByTime(60_000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('resumes with the remaining time, not a fresh full duration', () => {
    const onExpire = vi.fn();
    const timer = new MudToastTimer(4000, onExpire);

    timer.start();

    vi.advanceTimersByTime(3000);
    timer.pause();
    vi.advanceTimersByTime(10_000); // paused: nothing elapses
    expect(onExpire).not.toHaveBeenCalled();

    timer.resume();
    vi.advanceTimersByTime(999);
    expect(onExpire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1); // only the remaining 1000ms was needed
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('repeated hovers cannot extend the toast past its budget', () => {
    const onExpire = vi.fn();
    const timer = new MudToastTimer(4000, onExpire);

    timer.start();

    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(1000);
      timer.pause();
      timer.resume();
    }

    vi.advanceTimersByTime(1000); // 4000ms of *unpaused* time total
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('nests pause/resume so hover and focus can overlap', () => {
    const onExpire = vi.fn();
    const timer = new MudToastTimer(1000, onExpire);

    timer.start();

    timer.pause(); // pointerenter
    timer.pause(); // focusin
    timer.resume(); // pointerleave — still paused by focus
    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();

    timer.resume(); // focusout
    vi.advanceTimersByTime(1000);
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('destroy() cancels a pending expiry', () => {
    const onExpire = vi.fn();
    const timer = new MudToastTimer(1000, onExpire);

    timer.start();
    timer.destroy();

    vi.advanceTimersByTime(5000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('pause before start, then resume → fires exactly once after full duration', () => {
    const onExpire = vi.fn();
    const timer = new MudToastTimer(1000, onExpire);

    timer.pause(); // pause while dormant
    timer.start();
    timer.resume();

    vi.advanceTimersByTime(999);
    expect(onExpire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledOnce();
  });

  it('start called twice → fires exactly once after the duration', () => {
    const onExpire = vi.fn();
    const timer = new MudToastTimer(1000, onExpire);

    timer.start();
    timer.start(); // second start while already running

    vi.advanceTimersByTime(999);
    expect(onExpire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onExpire).toHaveBeenCalledOnce();
  });
});
