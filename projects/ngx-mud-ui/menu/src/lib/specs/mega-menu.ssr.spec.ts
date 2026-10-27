import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵgetDOM as getDOM } from '@angular/common';
import { ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import { MudMegaMenu } from '../mud-mega-menu.component';
import { MudMegaMenuColumn } from '../mud-mega-menu-column.component';
import { MudMegaMenuLink } from '../mud-mega-menu-link.directive';
import { MudMegaMenuOrigin } from '../mud-mega-menu-origin.directive';
import { renderOnServer } from '../../../../core/src/lib/specs/render-on-server.test-helper';
import { MudMegaMenuTrigger } from '../mud-mega-menu-trigger.component';

@Component({
  selector: 'mud-ssr-root',
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuOrigin, MudMegaMenuTrigger],
  template: `
    <header mudMegaMenuOrigin class="bar">
      <button [mudMegaMenuTriggerFor]="services">Servicii</button>
    </header>
    <mud-mega-menu #services>
      <mud-mega-menu-column heading="Plăți"><a mudMegaMenuLink href="/mpay">MPay</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class HeaderPage {}

// Captured at load, before any server render in this file.
const JSDOM_NODE = globalThis.Node;

@Component({ template: `<p>browser test</p>` })
class BrowserProbe {}

describe('Mega menu on the server (SSR)', () => {
  it('renders the collapsed trigger with its chevron and no panel or overlay', async () => {
    const html = await renderOnServer(HeaderPage);

    expect(html).toContain('ng-server-context=');
    expect(html).toMatch(/<button[^>]*class="[^"]*mega-menu-trigger[^"]*"[^>]*aria-expanded="false"/);
    expect(html).toContain('mega-menu-trigger__chevron');
    expect(html).toContain('Servicii');
    expect(html).not.toContain('id="mud-mega-menu-trigger-'); // the id is assigned client-side, at open
    expect(html).not.toContain('class="mega-menu"');
    expect(html).not.toContain('cdk-overlay-container');
    expect(html).not.toContain('MPay'); // panel content lives in an unattached template
  });

  it('leaves the jsdom test environment intact for the specs that run after it', async () => {
    await renderOnServer(HeaderPage);

    expect(globalThis.Node).toBe(JSDOM_NODE);
    expect(getDOM().constructor).toBe(BrowserDomAdapter);

    const fixture = TestBed.createComponent(BrowserProbe);

    await fixture.whenStable();
    expect(fixture.debugElement).not.toBeNull();
    expect(fixture.nativeElement.ownerDocument).toBe(document);
  });
});
