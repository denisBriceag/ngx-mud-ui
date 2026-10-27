import { ApplicationRef, createComponent, EnvironmentInjector, inject, Injectable, Injector } from '@angular/core';
import type { ComponentRef, Type } from '@angular/core';

type LoadedStyles = Map<Type<unknown>, ComponentRef<unknown>>;

// Keyed per app so multiple apps (or successive TestBed apps) each inject their own copy.
const ledger = new WeakMap<ApplicationRef, LoadedStyles>();

/**
 * Injects a style host's CSS once per app; Angular adds CSS on creation, so a detached host suffices.
 * ```ts
 * constructor() {
 *   inject(MudStyleLoader).load(_MudBadgeStyles);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MudStyleLoader {
  // ApplicationRef is resolved lazily: an eager inject is circular while ApplicationRef is constructing.
  private readonly _injector = inject(Injector);
  private readonly _environmentInjector = inject(EnvironmentInjector);

  /** Creates `host` once for this application; later calls with the same class are no-ops. */
  load(host: Type<unknown>): void {
    const appRef = this._injector.get(ApplicationRef);
    let loaded = ledger.get(appRef);

    if (!loaded) {
      const entry: LoadedStyles = new Map();

      ledger.set(appRef, entry);
      // Angular's shared styles host counts usages: destroying the refs removes the <style> tags.
      appRef.onDestroy(() => {
        entry.forEach((ref) => ref.destroy());
        ledger.delete(appRef);
      });
      loaded = entry;
    }

    if (loaded.has(host)) return;

    loaded.set(host, createComponent(host, { environmentInjector: this._environmentInjector }));
  }
}
