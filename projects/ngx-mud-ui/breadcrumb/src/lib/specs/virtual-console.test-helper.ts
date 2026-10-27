// Test support only — never exported from public-api.ts, so ng-packagr (which
// builds each entry point from its public-api.ts alone) never bundles this.
// Named `*.test-helper.ts`, not `*.spec.ts`, so vitest does not try to run it
// as a suite and fail on finding no tests.
//
// `vi` is imported explicitly (rather than relied on as a global, like spec
// files do) because this file, unlike `*.spec.ts` files, is picked up by the
// Storybook/Compodoc tsconfig (`../*/src/**/*.ts`), which does not carry the
// `vitest/globals` ambient types that `tsconfig.spec.json` adds.
import { vi } from 'vitest';

// Vitest's jsdom environment exposes the underlying JSDOM instance as a
// documented global (typed via `vitest/jsdom`, not enabled project-wide here)
// specifically so tests can reach `virtualConsole`. Minimally typed inline
// rather than adding that types entry for the whole project.
type JsdomVirtualConsoleListener = (error: Error) => void;
interface JsdomVirtualConsole {
  listeners: (event: 'jsdomError') => JsdomVirtualConsoleListener[];
  removeAllListeners: (event: 'jsdomError') => void;
  on: (event: 'jsdomError', listener: JsdomVirtualConsoleListener) => void;
}

/**
 * jsdom has no real navigation: clicking a real `<a href>` whose default was
 * not prevented makes jsdom attempt to navigate, which logs "Not implemented:
 * navigation to another Document" straight to `process.stderr` — jsdom's
 * VirtualConsole forwards `jsdomError` there directly, bypassing `console`
 * spies entirely (verified by instrumenting `process.stderr.write` directly;
 * a `vi.spyOn(console, 'error')` sees nothing even though the warning still
 * prints).
 *
 * For a test that deliberately leaves a click's default un-prevented (to
 * prove open-in-new-tab still works), this swaps the VirtualConsole's
 * `jsdomError` listener for a spy for the duration of `run`, so the resulting
 * navigation attempt is captured instead of printed to the test output — and
 * is itself the strongest evidence the click's default was genuinely left
 * alone, since a buggy guard could satisfy `defaultPrevented === false` via
 * an unrelated early return without ever reaching real navigation. The
 * original listeners are always restored, even if `run` throws.
 *
 * ```ts
 * const navigationAttempted = await withSwappedVirtualConsole(async () => {
 *   el.dispatchEvent(event);
 *   await fixture.whenStable();
 *   await new Promise((resolve) => setTimeout(resolve, 0));
 * });
 *
 * expect(navigationAttempted).toHaveBeenCalledWith(
 *   expect.objectContaining({ message: expect.stringContaining('Not implemented') }),
 * );
 * ```
 */
export async function withSwappedVirtualConsole(
  run: () => Promise<void> | void,
): Promise<ReturnType<typeof vi.fn<JsdomVirtualConsoleListener>>> {
  const virtualConsole = (
    globalThis as unknown as { jsdom: { virtualConsole: JsdomVirtualConsole } }
  ).jsdom.virtualConsole;
  const defaultListeners = virtualConsole.listeners('jsdomError');
  const navigationAttempted = vi.fn<JsdomVirtualConsoleListener>();

  virtualConsole.removeAllListeners('jsdomError');
  virtualConsole.on('jsdomError', navigationAttempted);

  try {
    await run();
  } finally {
    virtualConsole.removeAllListeners('jsdomError');
    defaultListeners.forEach((listener) => virtualConsole.on('jsdomError', listener));
  }

  return navigationAttempted;
}
