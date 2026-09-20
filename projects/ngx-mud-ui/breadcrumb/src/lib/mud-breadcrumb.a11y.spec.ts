import axe from 'axe-core';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudBreadcrumb } from './mud-breadcrumb.component';
import { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';

@Component({
  imports: [MudBreadcrumb, MudBreadcrumbItem],
  template: `
    <nav mudBreadcrumb [maxVisible]="4">
      <ol>
        <li mudBreadcrumbItem><a href="/">Acasă</a></li>
        <li mudBreadcrumbItem><a href="/servicii">Servicii</a></li>
        <li mudBreadcrumbItem><a href="/acte">Acte</a></li>
        <li mudBreadcrumbItem disabled><a href="/indisponibil">Indisponibil</a></li>
        <li mudBreadcrumbItem><a href="/buletin">Buletin</a></li>
        <li mudBreadcrumbItem active><span>Cerere nouă</span></li>
      </ol>
    </nav>
  `,
})
class Host {}

// axe's colour-contrast checks rasterise the element's backdrop through
// HTMLCanvasElement#getContext to decide whether a background is determinate.
// jsdom has no canvas, so every run printed "Not implemented:
// HTMLCanvasElement's getContext() method" and — since jsdom also has no
// layout — the check could never have produced a real result anyway. Exactly
// two rules are turned off, both of them the canvas-dependent ones; every other
// rule in the default set stays enabled. Contrast is covered for real by the
// token-level audits, not here.
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
  },
};

describe('MudBreadcrumb accessibility', () => {
  // axe skips detached subtrees silently — a fixture never appended to
  // document.body would still "pass" while scanning nothing. Every test here
  // appends its own fixture and removes it afterwards so nothing leaks into
  // later tests in this file.
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('has no axe violations with the trail collapsed', async () => {
    const fixture = TestBed.createComponent(Host);

    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const results = await axe.run(fixture.nativeElement as HTMLElement, AXE_OPTIONS);

    expect(results.violations.map((violation) => violation.id)).toEqual([]);
  });

  // TRAP 4. The <mud-breadcrumb-overflow> host sits between two <li>s inside
  // the consumer's <ol> — an element an <ol> is not allowed to contain. axe's
  // `list` rule is exactly the check that catches it, and `aria-required-parent`
  // is the one that catches a role="listitem" with nowhere to belong. Asserting
  // no violations is not enough on its own: a rule that never RAN also reports
  // no violations, so both are pinned as having actually passed.
  it('still reports a coherent list once the overflow trigger is in the <ol>', async () => {
    const fixture = TestBed.createComponent(Host);

    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    const list = fixture.nativeElement.querySelector('ol') as HTMLElement;
    const overflow = list.querySelector('mud-breadcrumb-overflow');

    // The precondition that makes the rules below worth running at all.
    expect(overflow?.parentElement).toBe(list);
    expect(overflow?.getAttribute('role')).toBe('listitem');

    const results = await axe.run(fixture.nativeElement as HTMLElement, AXE_OPTIONS);
    const ran = new Set([
      ...results.passes.map((result) => result.id),
      ...results.violations.map((result) => result.id),
      ...results.incomplete.map((result) => result.id),
    ]);

    expect(results.violations.map((violation) => violation.id)).toEqual([]);
    expect(ran).toContain('list');
    expect(ran).toContain('aria-required-parent');
    expect(results.passes.map((pass) => pass.id)).toContain('list');
    expect(results.passes.map((pass) => pass.id)).toContain('aria-required-parent');

    // Every crumb plus the trigger is a list item as far as the AX tree is
    // concerned: six <li> and one role="listitem" trigger.
    expect(list.querySelectorAll(':scope > li, :scope > [role="listitem"]').length).toBe(7);
  });

  it('has no axe violations with the overflow panel open', async () => {
    const fixture = TestBed.createComponent(Host);

    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();

    (
      fixture.nativeElement.querySelector(
        '.mud-breadcrumb__overflow-trigger',
      ) as HTMLButtonElement
    ).click();
    await fixture.whenStable();

    // The panel lives in a CDK overlay outside the fixture, so it needs its
    // own scan target — but scanning document.body wholesale trips axe's
    // 'region' rule ("all page content must sit in a landmark") purely
    // because CDK's own .cdk-overlay-container div is a body-level sibling
    // of everything else on the page, not because of anything this
    // component renders. Scanning the fixture and the overlay container as
    // two explicit contexts covers the same surface (trigger button + panel
    // content) without that false positive, and keeps every other rule —
    // including the ones that matter — fully enabled.
    const overlayContainer = document.querySelector('.cdk-overlay-container');

    // Fail loudly if the panel never opened, rather than silently scanning
    // one context instead of two.
    expect(overlayContainer).not.toBeNull();

    const results = await axe.run(
      [fixture.nativeElement as HTMLElement, overlayContainer!],
      AXE_OPTIONS,
    );

    expect(results.violations.map((violation) => violation.id)).toEqual([]);

    // The liveness canary below only validates the axe.run(document.body)
    // form. If the array-of-nodes context ever degraded — a CDK class rename,
    // an axe API change — this test would go green having scanned nothing of
    // the panel. Prove the panel was genuinely in scope by finding at least
    // one PASSING node that lives inside it.
    const panel = document.querySelector('.mud-breadcrumb__panel');

    expect(panel).not.toBeNull();

    const scannedInsidePanel = results.passes
      .flatMap((check) => check.nodes)
      .flatMap((node) => node.target)
      .some((target) => {
        if (typeof target !== 'string') return false;

        const element = document.querySelector(target);

        return element !== null && panel!.contains(element);
      });

    expect(scannedInsidePanel).toBe(true);
  });

  // Proves the harness is actually live rather than green because it scanned
  // an empty/detached subtree: a deliberately broken fixture, attached the
  // same way as above, must produce a real violation.
  it('flags a known violation, proving the harness actually scans attached DOM', async () => {
    const broken = document.createElement('img');

    broken.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    document.body.appendChild(broken);

    const results = await axe.run(document.body, AXE_OPTIONS);

    expect(results.violations.map((violation) => violation.id)).toContain('image-alt');
  });
});
