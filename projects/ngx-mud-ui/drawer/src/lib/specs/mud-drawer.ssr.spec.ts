import { Component, afterNextRender, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵgetDOM as getDOM } from '@angular/common';
import { ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import { MudDrawer } from '../mud-drawer.service';
import { renderOnServer } from '../../../../core/src/lib/specs/render-on-server.test-helper';
import { MudDrawerTitle } from '../mud-drawer-directives';

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
