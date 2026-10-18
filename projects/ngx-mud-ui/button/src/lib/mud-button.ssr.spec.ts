import type { ApplicationConfig, Type } from '@angular/core';
import { Component, provideZonelessChangeDetection, ɵsetDocument as setDocument } from '@angular/core';
import { bootstrapApplication, ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import type { BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { MudButton } from './mud-button.directive';

const config: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideServerRendering()],
};

// renderApplication installs domino as the process-wide DOM and never undoes it:
// `Object.assign(globalThis, domino.impl)` replaces jsdom's Node/Element/Event…,
// the root DOM adapter becomes DominoAdapter, and core's cached document becomes
// the domino one. Specs run unisolated in shared workers, so every spec that
// lands after this file would get a mixed DOM (fixture.debugElement turns null
// because jsdom nodes fail `instanceof Node`). Snapshot and restore all three.
async function renderOnServer(root: Type<unknown>): Promise<string> {
  const scope = globalThis as Record<string, unknown>;
  // Only DOM constructors: domino.impl is a bag of classes under string keys.
  // Values, not descriptors — vitest exposes jsdom's globals as get/set
  // accessors, and domino's Object.assign goes through the setters, so every
  // descriptor stays the same while the class behind it is replaced. (The
  // runner's own globals, e.g. expect's symbol-keyed state, must be left alone.)
  const classes = new Map<string, unknown>();

  for (const key of Object.getOwnPropertyNames(scope)) {
    const value = readGlobal(scope, key);

    if (typeof value === 'function') classes.set(key, value);
  }

  try {
    return await renderApplication((context: BootstrapContext) => bootstrapApplication(root, config, context), {
      document: '<!doctype html><html><head></head><body><mud-ssr-root></mud-ssr-root></body></html>',
      url: '/',
    });
  } finally {
    for (const key of Object.getOwnPropertyNames(scope)) {
      const value = readGlobal(scope, key);

      if (typeof value !== 'function') continue;

      if (!classes.has(key)) delete scope[key];
      else if (value !== classes.get(key)) scope[key] = classes.get(key);
    }
    BrowserDomAdapter.makeCurrent();
    setDocument(document);
  }
}

function readGlobal(scope: Record<string, unknown>, key: string): unknown {
  try {
    return scope[key];
  } catch {
    return undefined; // a few jsdom getters throw outside a browsing context
  }
}


@Component({ selector: 'mud-ssr-root', imports: [MudButton], template: `<button mudButton>Go</button>` })
class SsrButton {}

describe('button SSR', () => {
  it('emits the button stylesheet into the server HTML', async () => {
    const html = await renderOnServer(SsrButton);

    expect(html).toMatch(/<style[^>]*>[^<]*\.mud-btn/);
  });
});
