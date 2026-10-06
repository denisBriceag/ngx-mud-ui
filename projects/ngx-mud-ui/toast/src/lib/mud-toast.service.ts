import { Overlay, OverlayConfig, OverlayContainer } from '@angular/cdk/overlay';
import type { OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import type { ComponentType } from '@angular/cdk/portal';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { isPlatformBrowser } from '@angular/common';
import { ErrorHandler, Injectable, Injector, PLATFORM_ID, inject, signal } from '@angular/core';
import type { ComponentRef } from '@angular/core';
import { MudToastRef } from './mud-toast-ref';
import { MudToastStack } from './mud-toast-stack.component';
import { nextToastId } from './mud-toast-entry';
import type { MudToastEntry } from './mud-toast-entry';
import {
  MUD_TOAST_DATA,
  MUD_TOAST_DEFAULT_OPTIONS,
  MUD_TOAST_FALLBACK_OPTIONS,
  resolveToastConfig,
} from './mud-toast-config';
import type {
  MudToastBaseConfig,
  MudToastComponentConfig,
  MudToastConfig,
  MudToastDismissReason,
  ResolvedToastConfig,
} from './mud-toast-config';

/** Focus candidates for _restoreFocusFrom's survivor search — not just the close button, so `showCloseButton: false` toasts still qualify. */
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface StackHandle {
  readonly overlayRef: OverlayRef;
  readonly componentRef: ComponentRef<MudToastStack>;
  /** Plain mutable field, written and pushed to the component's input at the same call site — never bridged via effect. */
  entries: readonly MudToastEntry[];
}

/**
 * ```ts
 * private readonly toast = inject(MudToast);
 * this.toast.open({ variant: 'success', data: { message: 'Cererea a fost trimisă.' } });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MudToast {
  private readonly _overlay = inject(Overlay);
  private readonly _overlayContainer = inject(OverlayContainer);
  private readonly _injector = inject(Injector);
  private readonly _announcer = inject(LiveAnnouncer);
  private readonly _errorHandler = inject(ErrorHandler);
  private readonly _appDefaults = inject(MUD_TOAST_DEFAULT_OPTIONS, { optional: true });
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _stacks = new Map<string, StackHandle>();
  private readonly _queue: MudToastEntry[] = [];
  private _visible = 0;
  private readonly _dismissing = new Set<MudToastEntry>();
  private _otherOverlays: MutationObserver | null = null;

  private get _maxVisible(): number {
    return this._appDefaults?.maxVisible ?? MUD_TOAST_FALLBACK_OPTIONS.maxVisible;
  }

  /** @description Opens a toast using the built-in surface. */
  open(config: MudToastConfig): MudToastRef<void> {
    return this._open<void>(config, config.data);
  }

  /** @description Opens a toast whose body is a custom component. */
  openFromComponent<T, D = unknown>(
    component: ComponentType<T>,
    config: MudToastComponentConfig<D> = {},
  ): MudToastRef<T> {
    return this._open<T>(config, undefined, component, config.data);
  }

  /** @description Dismisses every open toast, including queued ones. */
  dismissAll(): void {
    for (const entry of [...this._queue]) entry.ref.dismiss('dismiss-all');

    for (const handle of [...this._stacks.values()]) {
      for (const entry of handle.entries) entry.ref.dismiss('dismiss-all');
    }
  }

  private _open<T>(
    config: MudToastBaseConfig,
    data?: MudToastConfig['data'],
    component?: ComponentType<T>,
    componentData?: unknown,
  ): MudToastRef<T> {
    if (!this._isBrowser) return MudToastRef.inert<T>();

    const resolved = resolveToastConfig(config, this._appDefaults);
    const opener = document.activeElement as HTMLElement | null;
    const ref = new MudToastRef<T>();

    const entry: MudToastEntry = {
      id: nextToastId(),
      config: resolved,
      ref: ref as MudToastRef<unknown>,
      data,
      componentType: component as ComponentType<unknown> | undefined,
      componentInjector: component
        ? Injector.create({
            parent: this._injector,
            providers: [
              { provide: MUD_TOAST_DATA, useValue: componentData },
              { provide: MudToastRef, useValue: ref },
            ],
          })
        : undefined,
      onComponentRendered: component ? (instance) => (ref.instance = instance as T) : undefined,
      leaving: signal(false),
      opener,
    };

    ref._dismissRequests.subscribe((reason) => void this._dismiss(entry, reason));

    if (this._visible < this._maxVisible) this._show(entry);
    else this._queue.push(entry);

    return ref;
  }

  private _show(entry: MudToastEntry): void {
    const handle = this._handleFor(entry.config);

    this._setEntries(handle, [...handle.entries, entry]);

    if (entry.config.announcementMessage) {
      void this._announcer.announce(
        entry.config.announcementMessage,
        entry.config.variant === 'warning' || entry.config.variant === 'error' ? 'assertive' : 'polite',
      );
    }

    this._visible++;

    // Deliberately not awaited: _show stays synchronous so the queue can promote
    // a toast without blocking. playEnter resolves immediately when there is no
    // animation (reduced motion, jsdom), so `opened` always fires. A throw here
    // (e.g. a consumer template failing during detectChanges) must not strand
    // the toast forever, so `opened` still fires in `finally` and the error is
    // reported rather than swallowed.
    void (async () => {
      try {
        handle.componentRef.changeDetectorRef.detectChanges();
        await handle.componentRef.instance.itemFor(entry.id)?.playEnter();
      } catch (err) {
        this._errorHandler.handleError(err);
      } finally {
        entry.ref._markOpened();
      }
    })();
  }

  private async _dismiss(entry: MudToastEntry, reason: MudToastDismissReason): Promise<void> {
    // MudToastRef only guards on `_settled`, which this method doesn't set
    // until its own `finally` runs — i.e. after `await playExit()`. A second
    // dismiss() call (double-click, or a timeout racing a manual close) would
    // otherwise re-enter here and run its own `finally`, double-decrementing
    // `_visible` and over-promoting the queue for a single freed slot.
    if (this._dismissing.has(entry)) return;

    this._dismissing.add(entry);

    try {
      const queuedIndex = this._queue.indexOf(entry);

      if (queuedIndex !== -1) {
        this._queue.splice(queuedIndex, 1);
        entry.ref._settle(reason);

        return;
      }

      const key = this._keyFor(entry.config);
      const handle = this._stacks.get(key);

      if (!handle || !handle.entries.includes(entry)) return;

      // Same throw-must-not-strand contract as _show: settling the ref and
      // dropping the entry happen in `finally`, so a failure mid-exit can't burn
      // the toast's slot forever (Task 8's queue depends on this).
      try {
        // Flip the signal before detectChanges runs so `[class.mud-toast--leaving]`
        // is already in the DOM by the time playExit reads getAnimations() —
        // under zoneless scheduling the class would otherwise land a render late,
        // and playExit would see no exit animation at all.
        entry.leaving.set(true);
        handle.componentRef.changeDetectorRef.detectChanges();
        await handle.componentRef.instance.itemFor(entry.id)?.playExit();
      } catch (err) {
        this._errorHandler.handleError(err);
      } finally {
        // Must run while `entry` is still mounted, before it leaves `entries`.
        this._restoreFocusFrom(entry, handle);

        this._setEntries(
          handle,
          handle.entries.filter((candidate) => candidate !== entry),
        );
        this._visible--;
        entry.ref._settle(reason);

        const next = this._queue.shift();

        if (next) this._show(next);

        if (this._stacks.get(key) === handle && handle.entries.length === 0) this._disposeStack(key);
      }
    } finally {
      this._dismissing.delete(entry);
    }
  }

  /** Focus must not fall to <body> when the toast holding it disappears. */
  private _restoreFocusFrom(entry: MudToastEntry, handle: StackHandle): void {
    const active = document.activeElement as HTMLElement | null;
    const host = handle.componentRef.location.nativeElement as HTMLElement;
    const leaving = host.querySelector(`[data-toast-id="${entry.id}"]`);

    if (!active || !leaving?.contains(active)) return;

    const survivor = [...host.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].find(
      (candidate) => !leaving.contains(candidate),
    );

    if (survivor) {
      survivor.focus();

      return;
    }

    if (entry.opener?.isConnected) entry.opener.focus();
    else active.blur();
  }

  /** @description Writes the array to both the handle and the stack's live input, in lockstep. */
  private _setEntries(handle: StackHandle, entries: readonly MudToastEntry[]): void {
    handle.entries = entries;
    handle.componentRef.setInput('entries', entries);
  }

  private _handleFor(config: ResolvedToastConfig): StackHandle {
    const key = this._keyFor(config);
    const existing = this._stacks.get(key);

    if (existing) return existing;

    const positionStrategy = this._overlay.position().global();

    if (config.verticalPosition === 'top') positionStrategy.top();
    else positionStrategy.bottom();

    switch (config.horizontalPosition) {
      case 'center':
        positionStrategy.centerHorizontally();
        break;
      case 'left':
        positionStrategy.left();
        break;
      case 'right':
        positionStrategy.right();
        break;
      case 'start':
        positionStrategy.start();
        break;
      default:
        positionStrategy.end();
    }

    const overlayRef = this._overlay.create(
      new OverlayConfig({
        positionStrategy,
        panelClass: 'mud-toast-stack-pane',
        hasBackdrop: false,
        scrollStrategy: this._overlay.scrollStrategies.noop(),
      }),
    );

    const componentRef = overlayRef.attach(new ComponentPortal(MudToastStack, null, this._injector));

    componentRef.setInput('verticalPosition', config.verticalPosition);
    componentRef.setInput('entries', []);

    const handle: StackHandle = { overlayRef, componentRef, entries: [] };

    this._stacks.set(key, handle);
    this._watchOtherOverlays();

    return handle;
  }

  private _disposeStack(key: string): void {
    const handle = this._stacks.get(key);

    if (!handle) return;

    handle.overlayRef.dispose();
    this._stacks.delete(key);

    if (this._stacks.size === 0) {
      this._otherOverlays?.disconnect();
      this._otherOverlays = null;
    }
  }

  // CDK 22 shows overlays in the browser top layer, where z-index is ignored and
  // the last-shown overlay wins — a toast opened before a dialog would sit under
  // its backdrop. Watching the overlay container for any other overlay and
  // re-showing the toast stacks keeps toasts on top whatever the open order.
  private _watchOtherOverlays(): void {
    if (!this._isBrowser || this._otherOverlays || typeof MutationObserver === 'undefined') return;

    this._otherOverlays = new MutationObserver((records) => {
      const ownHosts = new Set<Node>([...this._stacks.values()].map((handle) => handle.overlayRef.hostElement));
      const otherAdded = records.some((record) => [...record.addedNodes].some((node) => !ownHosts.has(node)));

      if (otherAdded) this._raiseStacks();
    });
    this._otherOverlays.observe(this._overlayContainer.getContainerElement(), { childList: true });
  }

  private _raiseStacks(): void {
    for (const { overlayRef } of this._stacks.values()) {
      const host = overlayRef.hostElement;

      // Only top-layer hosts need it; without popover support CDK falls back to
      // z-index, where the stack pane's 1001 already wins.
      if (!host.hasAttribute('popover') || !host.matches(':popover-open')) continue;

      // hide + show is the only way to move an element to the top of the top layer.
      // It doesn't replay the toast's enter animation: CDK's display:flex on the
      // host overrides the hidden popover's display:none, so nothing is re-rendered.
      host.hidePopover();
      host.showPopover();
    }
  }

  private _keyFor(config: ResolvedToastConfig): string {
    return `${config.verticalPosition}-${config.horizontalPosition}`;
  }
}
