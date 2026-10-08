import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudMegaMenu } from './mud-mega-menu.component';
import { MudMegaMenuColumn } from './mud-mega-menu-column.component';
import { MudMegaMenuLink } from './mud-mega-menu-link.directive';
import { MudMegaMenuTrigger } from './mud-mega-menu-trigger.component';

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="menu" (closed)="triggerClosed = triggerClosed + 1">
      @if (iconOnly()) {
        <svg aria-hidden="true"></svg>
      } @else {
        Servicii
      }
    </button>
    <mud-mega-menu #menu [aria-label]="label()" [panelClass]="panelClass()" (closed)="panelClosed = panelClosed + 1">
      <mud-mega-menu-column heading="A">
        <a mudMegaMenuLink href="#a1">A1</a>
        <a mudMegaMenuLink href="#a2">A2</a>
      </mud-mega-menu-column>
      <mud-mega-menu-column heading="B">
        <a mudMegaMenuLink href="#b1">B1</a>
      </mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class Host {
  readonly label = signal<string | undefined>(undefined);
  readonly panelClass = signal<string | undefined>(undefined);
  readonly iconOnly = signal(false);
  triggerClosed = 0;
  panelClosed = 0;
}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button id="svc" [mudMegaMenuTriggerFor]="menu">{{ text() }}</button>
    <mud-mega-menu #menu>
      <mud-mega-menu-column heading="A"><a mudMegaMenuLink href="#a1">A1</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class IdHost {
  readonly text = signal('Servicii');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  return {
    fixture,
    host: fixture.componentInstance,
    trigger,
    panel: () => document.querySelector<HTMLElement>('.cdk-overlay-container nav.mega-menu'),
    links: () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container .mega-menu__link')),
    open: async () => {
      trigger.click();
      await fixture.whenStable();
    },
  };
}

async function key(fixture: { whenStable(): Promise<unknown> }, target: HTMLElement, keyName: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, shiftKey });

  target.dispatchEvent(event);
  await fixture.whenStable();

  return event;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('MudMegaMenu (panel)', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('is a nav labelled by its trigger (aria-labelledby) when aria-label is not given', async () => {
    const { open, panel, trigger } = await render();

    await open();
    expect(panel()!.tagName).toBe('NAV');
    expect(panel()!.hasAttribute('aria-label')).toBe(false);
    expect(trigger.id).toMatch(/^mud-mega-menu-trigger-\d+$/);
    expect(panel()!.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(panel()!.getAttribute('role')).toBeNull();
  });

  it('keeps a consumer-provided trigger id and references it', async () => {
    const fixture = TestBed.createComponent(IdHost);

    await fixture.whenStable();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();

    const nav = document.querySelector('.cdk-overlay-container nav.mega-menu')!;

    expect(fixture.nativeElement.querySelector('button').id).toBe('svc');
    expect(nav.getAttribute('aria-labelledby')).toBe('svc');
  });

  it('the name is live by reference: relabelling the trigger while open leaves the reference intact', async () => {
    const fixture = TestBed.createComponent(IdHost);

    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    button.click();
    await fixture.whenStable();
    fixture.componentInstance.text.set('Services');
    await fixture.whenStable();

    const nav = document.querySelector('.cdk-overlay-container nav.mega-menu')!;

    // AT resolves the name from the button at read time, so no re-write of the panel is needed.
    expect(nav.getAttribute('aria-labelledby')).toBe('svc');
    expect(document.getElementById(nav.getAttribute('aria-labelledby')!)!.textContent).toContain('Services');
  });

  it('prefers an explicit aria-label', async () => {
    const { host, fixture, open, panel } = await render();

    host.label.set('Toate serviciile');
    await fixture.whenStable();
    await open();
    expect(panel()!.getAttribute('aria-label')).toBe('Toate serviciile');
    expect(panel()!.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('has no aria-label for an icon-only trigger (the reference still points at the button)', async () => {
    const { host, fixture, open, panel } = await render();

    host.iconOnly.set(true);
    await fixture.whenStable();
    await open();
    expect(panel()!.hasAttribute('aria-label')).toBe(false);
    expect(panel()!.hasAttribute('aria-labelledby')).toBe(true);
  });

  it('applies panelClass', async () => {
    const { host, fixture, open, panel } = await render();

    host.panelClass.set('app-services');
    await fixture.whenStable();
    await open();
    expect(panel()!.classList.contains('mega-menu')).toBe(true);
    expect(panel()!.classList.contains('app-services')).toBe(true);
  });

  it('a link click closes after the click completes, without refocusing, and emits both closed outputs', async () => {
    const { host, fixture, open, panel, links } = await render();

    await open();
    links()[1].click();
    expect(panel()).toBeTruthy(); // still open synchronously: navigation sees the click first
    await tick();
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(host.panelClosed).toBe(1);
    expect(host.triggerClosed).toBe(1);
    expect(document.activeElement).not.toBe(fixture.nativeElement.querySelector('button'));
  });

  it('two rapid clicks on a link still close once: one closed emission per output', async () => {
    const { host, fixture, open, links } = await render();

    await open();
    links()[0].click();
    links()[0].click();
    await tick();
    await fixture.whenStable();

    expect(host.panelClosed).toBe(1);
    expect(host.triggerClosed).toBe(1);
  });

  it('a link click followed by destroying the host before the deferred close never emits or logs NG0953', async () => {
    const { host, fixture, open, links } = await render();

    await open();
    const errorSpy = vi.spyOn(console, 'error');
    const warnSpy = vi.spyOn(console, 'warn');

    links()[0].click();
    fixture.destroy(); // navigation tore the declaring component down before the timer's macrotask
    await tick();

    const ng0953Logged = [...errorSpy.mock.calls, ...warnSpy.mock.calls].some((args) =>
      args.some((arg) => String(arg).includes('NG0953')),
    );

    expect(ng0953Logged).toBe(false);
    expect(host.panelClosed).toBe(0);
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('Escape inside the panel closes and refocuses the trigger', async () => {
    const { host, fixture, trigger, open, panel, links } = await render();

    await open();
    links()[0].focus();
    const event = await key(fixture, links()[0], 'Escape');

    expect(event.defaultPrevented).toBe(true);
    expect(panel()).toBeNull();
    expect(host.panelClosed).toBe(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape with the panel background focused (tabindex -1) still closes and refocuses the trigger', async () => {
    const { host, fixture, trigger, open, panel } = await render();

    await open();
    panel()!.focus();
    expect(document.activeElement).toBe(panel());
    const event = await key(fixture, panel()!, 'Escape');

    expect(event.defaultPrevented).toBe(true);
    expect(panel()).toBeNull();
    expect(host.panelClosed).toBe(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab on the last link closes, refocuses the trigger, and lets the default Tab proceed', async () => {
    const { host, fixture, trigger, open, panel, links } = await render();

    await open();
    const last = links()[links().length - 1];

    last.focus();
    const event = await key(fixture, last, 'Tab');

    expect(event.defaultPrevented).toBe(false);
    expect(panel()).toBeNull();
    expect(host.panelClosed).toBe(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab on a middle link is left to the browser', async () => {
    const { fixture, open, panel, links } = await render();

    await open();
    links()[0].focus();
    const event = await key(fixture, links()[0], 'Tab');

    expect(event.defaultPrevented).toBe(false);
    expect(panel()).toBeTruthy();
  });

  it('Tab from a non-link target (the focused panel) with links present is left to the browser', async () => {
    const { host, fixture, open, panel } = await render();

    await open();
    panel()!.focus();
    const event = await key(fixture, panel()!, 'Tab');

    expect(event.defaultPrevented).toBe(false);
    expect(panel()).toBeTruthy();
    expect(host.panelClosed).toBe(0);
  });

  it('Tab from the focused panel with zero links is left to the browser (index -1 must not match length - 1)', async () => {
    const { host, fixture, open, panel, links } = await render();

    await open();
    links().forEach((l) => l.remove());
    panel()!.focus();
    const event = await key(fixture, panel()!, 'Tab');

    expect(event.defaultPrevented).toBe(false);
    expect(panel()).toBeTruthy();
    expect(host.panelClosed).toBe(0);
  });

  it('Shift+Tab on the first link returns to the trigger and keeps the panel open', async () => {
    const { host, fixture, trigger, open, panel, links } = await render();

    await open();
    links()[0].focus();
    const event = await key(fixture, links()[0], 'Tab', true);

    expect(event.defaultPrevented).toBe(true);
    expect(panel()).toBeTruthy();
    expect(host.panelClosed).toBe(0);
    expect(document.activeElement).toBe(trigger);
  });
});
