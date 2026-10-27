import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵgetDOM as getDOM } from '@angular/common';
import { ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import { MudBanner } from 'ngx-mud-ui/banner';
import { MudPagination } from 'ngx-mud-ui/pagination';
import { provideMudLabels } from '../provide-mud-labels';
import { renderOnServer } from '../../../../core/src/lib/specs/render-on-server.test-helper';
import { MUD_LABELS_RO } from '../mud-labels-ro';

@Component({
  selector: 'mud-ssr-root',
  imports: [MudBanner, MudPagination],
  template: `
    <mud-banner closable>Mesaj</mud-banner>
    <mud-pagination [length]="200" [pageIndex]="9" />
  `,
})
class Page {}

// Captured at load, before any server render in this file.
const JSDOM_NODE = globalThis.Node;

@Component({ template: `<p>browser test</p>` })
class BrowserProbe {}

describe('Label packs on the server (SSR)', () => {
  it('renders Romanian banner and pagination labels into the server HTML', async () => {
    const html = await renderOnServer(Page, [provideMudLabels(MUD_LABELS_RO)]);

    expect(html).toContain('Închide');
    expect(html).toContain('Navigare pagini');
    expect(html).toContain('Pagina 10 din 20');
  });

  it('leaves the jsdom test environment intact for the specs that run after it', async () => {
    await renderOnServer(Page, [provideMudLabels(MUD_LABELS_RO)]);

    expect(globalThis.Node).toBe(JSDOM_NODE);
    expect(getDOM().constructor).toBe(BrowserDomAdapter);

    const fixture = TestBed.createComponent(BrowserProbe);

    await fixture.whenStable();
    expect(fixture.debugElement).not.toBeNull();
  });
});
