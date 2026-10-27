import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ɵgetDOM as getDOM } from '@angular/common';
import { ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
import { MudStepper } from '../mud-stepper.component';
import { renderOnServer } from '../../../../core/src/lib/specs/render-on-server.test-helper';
import { MudStep } from '../mud-step.component';

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
