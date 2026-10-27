import type { DebugElement } from '@angular/core';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTooltip } from 'ngx-mud-ui/tooltip';
import { MudBreadcrumbItem } from '../mud-breadcrumb-item.directive';

@Component({
  imports: [MudBreadcrumbItem],
  template: `
    <ol>
      <!-- The (click) is deliberately on the <li>, standing in for a consumer
           handler the capture-phase blocker has to beat; keyboard activation is
           the inner anchor's job, not this stand-in's. -->
      <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events -->
      <li
        mudBreadcrumbItem
        [active]="active()"
        [disabled]="disabled()"
        [label]="label()"
        (click)="onClick($event)"
      >
        <a href="/servicii">Servicii</a>
      </li>
    </ol>
  `,
})
class Host {
  readonly active = signal(false);
  readonly disabled = signal(false);
  readonly label = signal<string | undefined>(undefined);
  clicks = 0;

  onClick(event: MouseEvent): void {
    // jsdom has no navigation; without this the anchor's default action logs
    // "Not implemented: navigation to another Document" on every run.
    event.preventDefault();
    this.clicks += 1;
  }
}

@Component({
  imports: [MudBreadcrumbItem],
  // A crumb with no interactive child and no text: text() must fall back to ''
  // when there is neither a label input nor projected text, and the ARIA state
  // has nowhere to go but the <li> itself.
  template: `<ol>
    <li mudBreadcrumbItem [active]="active()" [disabled]="disabled()"></li>
  </ol>`,
})
class TextOnlyHost {
  readonly active = signal(false);
  readonly disabled = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('li') as HTMLLIElement;
  const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
  const directive = fixture.debugElement
    .query((node) => node.nativeElement === el)
    .injector.get(MudBreadcrumbItem);

  return { fixture, host: fixture.componentInstance, el, anchor, directive };
}

async function renderTextOnly() {
  const fixture = TestBed.createComponent(TextOnlyHost);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('li') as HTMLLIElement;
  const directive = fixture.debugElement
    .query((node) => node.nativeElement === el)
    .injector.get(MudBreadcrumbItem);

  return { fixture, host: fixture.componentInstance, el, directive };
}

describe('MudBreadcrumbItem', () => {
  it('carries the base class and no state attributes by default', async () => {
    const { el, anchor } = await render();

    expect(el.classList.contains('mud-breadcrumb__item')).toBe(true);
    expect(anchor.getAttribute('aria-current')).toBeNull();
    expect(anchor.getAttribute('aria-disabled')).toBeNull();
  });

  it('marks the active crumb as the current page', async () => {
    const { fixture, host, el } = await render();

    host.active.set(true);
    await fixture.whenStable();

    expect(el.classList.contains('mud-breadcrumb__item--active')).toBe(true);
  });

  it('blocks activation of a disabled crumb before the consumer handler runs', async () => {
    const { fixture, host, anchor } = await render();

    host.disabled.set(true);
    await fixture.whenStable();

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    // The capture-phase listener is on the <li>, an ANCESTOR of the anchor —
    // capture runs top-down, so it still fires before anything bound to the
    // anchor, and stopImmediatePropagation keeps the event from reaching it.
    expect(host.clicks).toBe(0);
  });

  it('lets an ordinary crumb through to the consumer handler', async () => {
    const { host, anchor } = await render();

    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(host.clicks).toBe(1);
  });

  it('reads its text from content and its href from the resolved attribute', async () => {
    const { directive } = await render();

    expect(directive.text()).toBe('Servicii');
    expect(directive.href()).toBe('/servicii');
  });

  it('prefers an explicit label over the projected text', async () => {
    const { fixture, host, directive } = await render();

    host.label.set('Toate serviciile');
    await fixture.whenStable();

    expect(directive.text()).toBe('Toate serviciile');
  });

  it('falls back to an empty string when there is no label and no projected text', async () => {
    const { directive } = await renderTextOnly();

    expect(directive.text()).toBe('');
  });

  it('reports current when the parent assigns it, without an active input', async () => {
    const { fixture, anchor, directive } = await render();

    directive.setState({ collapsed: false, current: true });
    await fixture.whenStable();

    expect(directive.isCurrent()).toBe(true);
    expect(anchor.getAttribute('aria-current')).toBe('page');
  });

  it('hides a collapsed crumb', async () => {
    const { fixture, el, directive } = await render();

    directive.setState({ collapsed: true, current: false });
    await fixture.whenStable();

    expect(el.classList.contains('mud-breadcrumb__item--collapsed')).toBe(true);
  });
});

// TRAP 1. The directive's host is the <li>, so a host binding would put both
// states on the list item — where no screen reader will ever announce them,
// because a <li> is not what a keyboard user focuses. The WAI-ARIA breadcrumb
// pattern puts aria-current on the LINK; aria-disabled is the same argument
// (it qualifies the control's activation, not the item's position in the list).
describe('MudBreadcrumbItem ARIA state placement', () => {
  it('puts aria-current on the inner link, never on the <li>', async () => {
    const { fixture, host, el, anchor } = await render();

    host.active.set(true);
    await fixture.whenStable();

    expect(anchor.getAttribute('aria-current')).toBe('page');
    expect(el.getAttribute('aria-current')).toBeNull();
  });

  it('puts aria-disabled on the inner link, never on the <li>', async () => {
    const { fixture, host, el, anchor } = await render();

    host.disabled.set(true);
    await fixture.whenStable();

    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(el.getAttribute('aria-disabled')).toBeNull();
    // Deliberately NOT tabindex="-1": a disabled crumb stays reachable so a
    // keyboard user can discover why it is unavailable (accordion precedent).
    expect(anchor.getAttribute('tabindex')).toBeNull();
  });

  it('clears the attributes again when the state goes away', async () => {
    const { fixture, host, anchor } = await render();

    host.active.set(true);
    host.disabled.set(true);
    await fixture.whenStable();

    host.active.set(false);
    host.disabled.set(false);
    await fixture.whenStable();

    expect(anchor.getAttribute('aria-current')).toBeNull();
    expect(anchor.getAttribute('aria-disabled')).toBeNull();
  });

  it('falls back to the <li> for a crumb with no interactive child', async () => {
    // A text crumb has no anchor or button to describe, so the list item is the
    // only element left — and aria-current is a global attribute, valid there.
    const { fixture, host, el } = await renderTextOnly();

    host.active.set(true);
    host.disabled.set(true);
    await fixture.whenStable();

    expect(el.getAttribute('aria-current')).toBe('page');
    expect(el.getAttribute('aria-disabled')).toBe('true');
  });
});

// TRAP 3. forwardCrumbClick and the mirrored panel links both navigate by
// synthesising a click on what the crumb exposes as its target. On a <li> that
// runs nothing at all, and href() would read an attribute a <li> never carries.
describe('MudBreadcrumbItem click target resolution', () => {
  it('resolves the inner anchor as the click-forward target', async () => {
    const { anchor, directive } = await render();

    expect(directive.target()).toBe(anchor);
  });

  it('falls back to the <li> when the crumb has no interactive child', async () => {
    const { el, directive } = await renderTextOnly();

    expect(directive.target()).toBe(el);
    expect(directive.href()).toBeNull();
  });
});

describe('MudBreadcrumbItem structural warning', () => {
  it('stays silent for a crumb authored as an <li> inside a list', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await render();

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('warns once, in dev mode, when the crumb is not an <li> inside a list', async () => {
    @Component({
      imports: [MudBreadcrumbItem],
      template: `<div><a mudBreadcrumbItem href="/a">A</a></div>`,
    })
    class Misplaced {}

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(Misplaced);

    await fixture.whenStable();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('mudBreadcrumbItem belongs on an <li>'),
    );

    warn.mockRestore();
  });
});

describe('MudBreadcrumbItem truncation tooltip', () => {
  const LONG = 'Direcția generală pentru eliberarea actelor de identitate';
  const EXACTLY_30 = 'Acte de identitate provizorii';

  const tooltipFor = (fixture: { debugElement: DebugElement }, el: HTMLElement) =>
    fixture.debugElement.query((node) => node.nativeElement === el).injector.get(MudTooltip);

  it('attaches no tooltip to a short label', async () => {
    const { fixture, el } = await render();

    expect(tooltipFor(fixture, el).content()).toBe('');
  });

  it('pushes the full label once it exceeds 30 characters', async () => {
    const { fixture, host, el } = await render();

    host.label.set(LONG);
    await fixture.whenStable();

    expect(tooltipFor(fixture, el).content()).toBe(LONG);
  });

  it('does not tooltip a label of exactly 30 characters', async () => {
    const { fixture, host, el } = await render();

    host.label.set(EXACTLY_30.padEnd(30, 'x').slice(0, 30));
    await fixture.whenStable();

    expect(tooltipFor(fixture, el).content()).toBe('');
  });

  it('pushes a label of exactly 31 characters (one past the limit)', async () => {
    const { fixture, host, el } = await render();
    const exactly31 = EXACTLY_30.padEnd(31, 'x').slice(0, 31);

    host.label.set(exactly31);
    await fixture.whenStable();

    expect(exactly31.length).toBe(31);
    expect(tooltipFor(fixture, el).content()).toBe(exactly31);
  });

  // TRAP 2. MudTooltip is attached via hostDirectives, so its listeners sit on
  // THIS directive's host — now the <li>. `focus` does not bubble, so focusing
  // the anchor inside would never have reached them and a keyboard user would
  // silently lose the tooltip a mouse user gets. MudTooltip listens for the
  // bubbling focusin/focusout pair instead; nothing in the breadcrumb code
  // itself can express that, which is why this test lives at the seam.
  it('opens on FOCUS of the inner anchor, not just on the <li>', async () => {
    const { fixture, host, anchor } = await render();

    host.label.set(LONG);
    await fixture.whenStable();

    anchor.focus();
    // The anchor being focused for real is the precondition: a dispatched
    // FocusEvent would prove the listener wiring but not that the browser's own
    // focus lands somewhere the tooltip can hear.
    expect(document.activeElement).toBe(anchor);

    // _scheduleShow(0) defers the attach by a macrotask.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();

    const bubble = document.querySelector('[role="tooltip"]');

    expect(bubble).not.toBeNull();
    expect(bubble?.textContent).toContain(LONG);
    // aria-describedby must land on the focused ANCHOR: pointing it at the <li>
    // would render the description unreachable, since nothing ever focuses a
    // list item. The id lives on .tooltip-inner, not on the role="tooltip" host.
    expect(anchor.getAttribute('aria-describedby')).toBe(
      bubble?.querySelector('.tooltip-inner')?.id,
    );
  });

  it('closes again when focus leaves the inner anchor', async () => {
    const { fixture, host, anchor } = await render();

    host.label.set(LONG);
    await fixture.whenStable();

    anchor.focus();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await fixture.whenStable();

    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();

    anchor.blur();
    // focusout schedules the hide behind tooltipHideDelay (150ms).
    await new Promise((resolve) => setTimeout(resolve, 200));
    await fixture.whenStable();

    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(anchor.getAttribute('aria-describedby')).toBeNull();
  });
});
