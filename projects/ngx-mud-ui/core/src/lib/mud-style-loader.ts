import { ApplicationRef, createComponent, EnvironmentInjector, inject, Injectable, Injector } from '@angular/core';
import type { ComponentRef, Type } from '@angular/core';

/** Per-application ledger: each style host in the document → its ref, for teardown. */
type LoadedStyles = Map<Type<unknown>, ComponentRef<unknown>>;

// Keyed by the application so two Angular apps on one page (or successive TestBed apps) each inject
// their own copy; weak so a destroyed app can be collected.
const ledger = new WeakMap<ApplicationRef, LoadedStyles>();

/**
 * Injects a component's global stylesheet once per application. A *style host* is an empty
 * component (`template: ''`, `ViewEncapsulation.None`) whose only payload is its `styleUrl`;
 * Angular adds a component's CSS to the document when the component is *created*, so creating
 * the host detached — never attached to the DOM — is enough. Directives, which have no template
 * of their own, bring their CSS this way; components share a stylesheet the same way.
 * ```ts
 * constructor() {
 *   inject(MudStyleLoader).load(_MudBadgeStyles);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class MudStyleLoader {
  // ApplicationRef is resolved on first use, not in a field initialiser: the loader may be touched
  // while ApplicationRef itself is still being constructed, and an eager inject would be circular.
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
