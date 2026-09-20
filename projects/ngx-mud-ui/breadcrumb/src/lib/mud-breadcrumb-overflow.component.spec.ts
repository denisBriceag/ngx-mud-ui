import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudBreadcrumbOverflow } from './mud-breadcrumb-overflow.component';
import { MudBreadcrumbItem } from './mud-breadcrumb-item.directive';
import { withSwappedVirtualConsole } from './virtual-console.test-helper';

@Component({
  imports: [MudBreadcrumbOverflow, MudBreadcrumbItem],
  template: `
    <ol>
      <li mudBreadcrumbItem><a href="/servicii" (click)="onClick($event)">Servicii</a></li>
      <li mudBreadcrumbItem><a href="/acte">Acte</a></li>
      <li mudBreadcrumbItem><span>Fără link</span></li>
      <mud-breadcrumb-overflow [items]="items()" [label]="label()" />
    </ol>
  `,
})
class Host {
  readonly items = signal<readonly MudBreadcrumbItem[]>([]);
  readonly label = signal('Show collapsed pages');
  clicked = 0;

  onClick(event: MouseEvent): void {
    // jsdom has no navigation; forwarding a click re-clicks this real anchor,
    // and without this it logs "Not implemented: navigation to another
    // Document" on every run (see mud-breadcrumb-item.directive.spec.ts).
    event.preventDefault();
    this.clicked += 1;
  }
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  // The crumbs in the template are stand-ins for the ones the container
  // would have collapsed; feed them to the panel directly.
  const crumbs = fixture.debugElement
    .queryAll((node) => node.nativeElement?.hasAttribute?.('mudBreadcrumbItem'))
    .map((node) => node.injector.get(MudBreadcrumbItem));

  fixture.componentInstance.items.set(crumbs);
  await fixture.whenStable();

  const trigger = fixture.nativeElement.querySelector(
    '.mud-breadcrumb__overflow-trigger',
  ) as HTMLButtonElement;

  return {
    fixture,
    host: fixture.componentInstance,
    trigger,
    crumbs,
    panel: () => document.querySelector('.mud-breadcrumb__panel') as HTMLElement | null,
    links: () =>
      [...(document.querySelectorAll('.mud-breadcrumb__panel-item') ?? [])] as HTMLElement[],
    open: async () => {
      trigger.click();
      await fixture.whenStable();
    },
  };
}

describe('MudBreadcrumbOverflow', () => {
  it('renders a collapsed disclosure trigger', async () => {
    const { trigger, panel } = await render();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toBe('Show collapsed pages');
    expect(panel()).toBeNull();
  });

  it('opens the panel and pairs aria-controls with the panel id', async () => {
    const { trigger, open, panel } = await render();

    await open();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel()).not.toBeNull();
    expect(trigger.getAttribute('aria-controls')).toBe(panel()?.id);
  });

  it('renders a link per collapsed crumb, mirroring text and href', async () => {
    const { open, links } = await render();

    await open();

    expect(links().map((el) => el.textContent?.trim())).toEqual(['Servicii', 'Acte', 'Fără link']);
    expect(links()[0].getAttribute('href')).toBe('/servicii');
  });

  it('renders a button, not an anchor, for a crumb with no href', async () => {
    const { open, links } = await render();

    await open();

    expect(links()[2].tagName).toBe('BUTTON');
  });

  it('moves focus to the first link on open', async () => {
    const { open, links } = await render();

    await open();

    expect(document.activeElement).toBe(links()[0]);
  });

  it('forwards a plain click to the original crumb', async () => {
    const { host, open, links, fixture } = await render();

    await open();
    links()[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(host.clicked).toBe(1);
  });

  it('leaves a modified click to the browser so open-in-new-tab still works', async () => {
    const { host, open, links, fixture } = await render();

    await open();

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });

    // By design this click's default is deliberately left un-prevented, so the
    // mirrored anchor's own (jsdom-simulated) activation behaviour runs and
    // jsdom attempts to navigate. See withSwappedVirtualConsole for why that
    // attempt has to be captured rather than left to print, and why it is
    // itself the strongest evidence the click's default was genuinely left
    // alone.
    const navigationAttempted = await withSwappedVirtualConsole(async () => {
      links()[0].dispatchEvent(event);
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(event.defaultPrevented).toBe(false);
    expect(host.clicked).toBe(0);
    expect(navigationAttempted).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Not implemented: navigation to another Document'),
      }),
    );
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    const { trigger, open, panel, fixture } = await render();

    await open();
    document
      .querySelector('.mud-breadcrumb__panel')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Tab and hands focus back to the trigger', async () => {
    // Tab's default is deliberately NOT prevented: the browser resolves the
    // next tabbable AFTER this handler runs, so landing on the trigger first
    // makes Tab continue from the trigger's place in the document instead of
    // from a now-disposed overlay parked at the end of <body>.
    const { trigger, open, panel, fixture } = await render();

    await open();

    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

    document.querySelector('.mud-breadcrumb__panel')?.dispatchEvent(event);
    await fixture.whenStable();

    expect(event.defaultPrevented).toBe(false);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on an outside click WITHOUT stealing focus from what was clicked', async () => {
    // CDK reports outsidePointerEvents on `click`, by which point the browser
    // has already focused the clicked element. An unconditional
    // trigger.focus() in close() therefore yanks focus out of whatever the
    // user just tapped — a real a11y defect, not a nit.
    const { trigger, open, panel, fixture } = await render();

    const outside = document.createElement('input');

    document.body.appendChild(outside);

    try {
      await open();
      expect(document.activeElement).not.toBe(outside);

      outside.focus();
      outside.dispatchEvent(new PointerEvent('click', { bubbles: true, cancelable: true }));
      await fixture.whenStable();

      expect(panel()).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(outside);
    } finally {
      outside.remove();
    }
  });

  it('wraps arrow-key focus around the link list', async () => {
    const { open, links, panel, fixture } = await render();

    await open();

    const press = async (key: string) => {
      panel()?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await fixture.whenStable();
    };

    await press('ArrowUp');
    expect(document.activeElement).toBe(links()[2]);

    await press('ArrowDown');
    expect(document.activeElement).toBe(links()[0]);

    await press('End');
    expect(document.activeElement).toBe(links()[2]);

    await press('Home');
    expect(document.activeElement).toBe(links()[0]);
  });
});
