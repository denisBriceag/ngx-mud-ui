/** Countdown that survives arbitrarily many overlapping pauses without drifting. */
export class MudToastTimer {
  private _remaining: number;
  private _startedAt = 0;
  private _handle: ReturnType<typeof setTimeout> | null = null;
  // Depth, not a boolean: hover and focus pause independently and can overlap.
  private _pauseDepth = 0;
  private _destroyed = false;

  constructor(
    private readonly _duration: number,
    private readonly _onExpire: () => void,
  ) {
    this._remaining = _duration;
  }

  /** @description Starts the countdown. A duration of 0 never expires. */
  start(): void {
    if (this._duration <= 0 || this._destroyed) return;

    // Respect outstanding pause depth: if already paused, do not arm yet.
    if (this._pauseDepth > 0) return;

    this._arm();
  }

  /** @description Suspends the countdown, banking the time left. */
  pause(): void {
    this._pauseDepth++;

    if (this._pauseDepth > 1 || this._handle === null) return;

    clearTimeout(this._handle);
    this._handle = null;
    this._remaining -= Date.now() - this._startedAt;
  }

  /** @description Resumes with the banked remainder once every pause is released. */
  resume(): void {
    if (this._pauseDepth === 0) return;

    this._pauseDepth--;

    if (this._pauseDepth === 0 && this._duration > 0 && !this._destroyed) this._arm();
  }

  /** @description Cancels any pending expiry permanently. */
  destroy(): void {
    this._destroyed = true;

    if (this._handle !== null) clearTimeout(this._handle);

    this._handle = null;
  }

  private _arm(): void {
    // Clear any live handle to prevent double-firing when re-arming.
    if (this._handle !== null) clearTimeout(this._handle);

    this._handle = null;

    if (this._remaining <= 0) {
      // Fires synchronously inside the caller's stack (e.g., pause/resume), not deferred.
      this._onExpire();

      return;
    }

    this._startedAt = Date.now();
    this._handle = setTimeout(() => {
      this._handle = null;
      this._onExpire();
    }, this._remaining);
  }
}
