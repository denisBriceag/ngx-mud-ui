import type { ApplicationConfig, Type } from '@angular/core';
import { Component, afterNextRender, inject, provideZonelessChangeDetection, ɵsetDocument as setDocument } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵgetDOM as getDOM } from '@angular/common';
import { bootstrapApplication, ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import type { BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { MudDrawer } from './mud-drawer.service';
import { MudDrawerTitle } from './mud-drawer-directives';

@Component({
  imports: [MudDrawerTitle],
  template: `<h2 mudDrawerTitle>Filtre</h2><p class="drawer-body">Conținutul drawer-ului</p>`,
})
class FiltersDrawer {}

@Component({ selector: 'mud-ssr-root', template: `<main class="page">Pagina</main>` })
class InjectsOnly {
  protected readonly drawer = inject(MudDrawer);
}

@Component({ selector: 'mud-ssr-root', template: `<main class="page">Pagina</main>` })
class OpensDuringRender {
  constructor() {
    inject(MudDrawer).open(FiltersDrawer, { position: 'bottom', ariaLabel: 'Filtre' });
  }
}

@Component({ selector: 'mud-ssr-root', template: `<main class="page">Pagina</main>` })
class OpensAfterRender {
  constructor() {
    const drawer = inject(MudDrawer);

    // Browser only: afterNextRender never runs on the server.
    afterNextRender(() => drawer.open(FiltersDrawer));
  }
}

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

// Captured at load, before any server render in this file.
const JSDOM_NODE = globalThis.Node;

@Component({ template: `<p>browser test</p>` })
class BrowserProbe {}

describe('MudDrawer on the server (SSR)', () => {
  it('renders a page that injects MudDrawer, without opening anything', async () => {
    const html = await renderOnServer(InjectsOnly);

    expect(html).toContain('ng-server-context=');
    expect(html).toContain('<main class="page">Pagina</main>');
    expect(html).not.toContain('mud-drawer-container');
  });

  it('opening during the render does not throw, and lands in a platform="server" overlay container', async () => {
    // Documents CDK's behaviour, not a recommendation: the browser removes this
    // server copy on boot and the constructor opens the drawer again — hence the
    // afterNextRender advice in the docs.
    const html = await renderOnServer(OpensDuringRender);

    expect(html).toContain('<main class="page">Pagina</main>');
    expect(html).toMatch(/class="cdk-overlay-container"[^>]*platform="server"|platform="server"[^>]*class="cdk-overlay-container"/);
    expect(html).toContain('drawer drawer--bottom');
    expect(html).toContain('Conținutul drawer-ului');
  });

  it('opening in afterNextRender keeps the drawer out of the server HTML', async () => {
    const html = await renderOnServer(OpensAfterRender);

    expect(html).toContain('<main class="page">Pagina</main>');
    expect(html).not.toContain('mud-drawer-container');
    expect(html).not.toContain('cdk-overlay-container');
  });

  // A server render swaps jsdom's DOM globals and Angular's DOM adapter/document
  // for domino's. Left in place, every later spec in the same worker breaks —
  // e.g. fixture.debugElement turns null because jsdom nodes fail `instanceof Node`.
  it('leaves the jsdom test environment intact for the specs that run after it', async () => {
    await renderOnServer(OpensDuringRender);

    expect(globalThis.Node).toBe(JSDOM_NODE);
    expect(getDOM().constructor).toBe(BrowserDomAdapter);

    const fixture = TestBed.createComponent(BrowserProbe);

    await fixture.whenStable();
    expect(fixture.debugElement).not.toBeNull();
    expect(fixture.nativeElement.ownerDocument).toBe(document);
  });
});
