import type { ApplicationConfig, Type } from '@angular/core';
import { Component, provideZonelessChangeDetection, ɵsetDocument as setDocument } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵgetDOM as getDOM } from '@angular/common';
import { bootstrapApplication, ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import type { BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { MudStepper } from './mud-stepper.component';
import { MudStep } from './mud-step.component';

@Component({
  selector: 'mud-ssr-root',
  imports: [MudStepper, MudStep],
  template: `
    <mud-stepper [linear]="true" [selectedIndex]="1">
      <mud-step label="Identitate" supportingText="Cine ești" [completed]="true"><p class="p1">Unu</p></mud-step>
      <mud-step label="Adresă"><p class="p2">Doi</p></mud-step>
      <mud-step label="Revizuire"><p class="p3">Trei</p></mud-step>
    </mud-stepper>
    <mud-stepper orientation="vertical" compact>
      <mud-step label="A"><p class="v1">A</p></mud-step>
      <mud-step label="B"><p class="v2">B</p></mud-step>
    </mud-stepper>
  `,
})
class Page {}

const config: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideServerRendering()],
};

// renderApplication installs domino as the process-wide DOM and never undoes it
// (see mud-drawer.ssr.spec.ts for the full account). Snapshot and restore the
// DOM constructors, the DOM adapter and core's cached document, or every spec
// that lands after this file in the same worker gets a mixed DOM.
async function renderOnServer(root: Type<unknown>): Promise<string> {
  const scope = globalThis as Record<string, unknown>;
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

describe('MudStepper on the server (SSR)', () => {
  it('renders headers, states and panels into the server HTML', async () => {
    const html = await renderOnServer(Page);

    expect(html).toContain('ng-server-context=');
    expect(html.match(/<mud-step-header/g)?.length).toBe(5);
    expect(html).toContain('role="list"');
    // Linear with selectedIndex=1: step 0 completed (text suffix), step 1 current, step 2 gated.
    expect(html).toContain('stepper-step stepper-step--completed');
    expect(html).toContain(', completed');
    expect(html).toContain('aria-current="step"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('stepper stepper--vertical stepper--compact');
    // The inactive panels ship hidden; the ResizeObserver path never runs here.
    expect(html).toMatch(/class="stepper__panel" id="cdk-stepper-0-content-0" hidden=""/);
    expect(html).toMatch(/class="stepper__panel" id="cdk-stepper-0-content-1" aria-labelledby/);
    expect(html).toContain('class="p2"');
  });

  it('leaves the jsdom test environment intact for the specs that run after it', async () => {
    await renderOnServer(Page);

    expect(globalThis.Node).toBe(JSDOM_NODE);
    expect(getDOM().constructor).toBe(BrowserDomAdapter);

    const fixture = TestBed.createComponent(BrowserProbe);

    await fixture.whenStable();
    expect(fixture.debugElement).not.toBeNull();
    expect(fixture.nativeElement.ownerDocument).toBe(document);
  });
});
