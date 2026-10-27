import type { ApplicationConfig, Type } from '@angular/core';
import { Component, provideZonelessChangeDetection, ɵsetDocument as setDocument } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵgetDOM as getDOM } from '@angular/common';
import { bootstrapApplication, ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import type { BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudPagination } from 'ngx-mud-ui/pagination';
import { provideMudLabels } from './provide-mud-labels';
import { MUD_LABELS_RO } from './mud-labels-ro';

@Component({
  selector: 'mud-ssr-root',
  imports: [MudBanner, MudPagination],
  template: `
    <mud-banner closable>Mesaj</mud-banner>
    <mud-pagination [length]="200" [pageIndex]="9" />
  `,
})
class Page {}

const config: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideServerRendering(), provideMudLabels(MUD_LABELS_RO)],
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

// Captured at load, before any server render in this file.
const JSDOM_NODE = globalThis.Node;

@Component({ template: `<p>browser test</p>` })
class BrowserProbe {}

describe('Label packs on the server (SSR)', () => {
  it('renders Romanian banner and pagination labels into the server HTML', async () => {
    const html = await renderOnServer(Page);

    expect(html).toContain('Închide');
    expect(html).toContain('Navigare pagini');
    expect(html).toContain('Pagina 10 din 20');
  });

  it('leaves the jsdom test environment intact for the specs that run after it', async () => {
    await renderOnServer(Page);

    expect(globalThis.Node).toBe(JSDOM_NODE);
    expect(getDOM().constructor).toBe(BrowserDomAdapter);

    const fixture = TestBed.createComponent(BrowserProbe);

    await fixture.whenStable();
    expect(fixture.debugElement).not.toBeNull();
  });
});
