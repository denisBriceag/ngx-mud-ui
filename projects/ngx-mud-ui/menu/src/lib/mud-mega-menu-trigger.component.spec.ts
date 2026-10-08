import { Component, signal, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudMegaMenu } from './mud-mega-menu.component';
import { MudMegaMenuColumn } from './mud-mega-menu-column.component';
import { MudMegaMenuLink } from './mud-mega-menu-link.directive';
import { MudMegaMenuTrigger } from './mud-mega-menu-trigger.component';

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button class="before">Before</button>
    <button [mudMegaMenuTriggerFor]="menu" (opened)="openedCount = openedCount + 1" (closed)="closedCount = closedCount + 1">
      Servicii
    </button>
    <button class="elsewhere">Elsewhere</button>
    <mud-mega-menu #menu aria-label="Servicii">
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
  openedCount = 0;
  closedCount = 0;
}

// The menu sits in an @if (so it can die first); the trigger reads it through a viewChild signal.
@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="menuRef()!">Servicii</button>
    @if (showMenu()) {
      <mud-mega-menu>
        <mud-mega-menu-column heading="A"><a mudMegaMenuLink href="#a1">A1</a></mud-mega-menu-column>
      </mud-mega-menu>
    }
  `,
})
class DestroyableMenuHost {
  readonly showMenu = signal(true);
  readonly menuRef = viewChild(MudMegaMenu);
  readonly trigger = viewChild.required(MudMegaMenuTrigger);
}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="menu">Empty</button>
    <mud-mega-menu #menu><mud-mega-menu-column heading="A" /></mud-mega-menu>
  `,
})
class EmptyMenuHost {}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="current()" aria-label="Alege">Pick</button>
    <mud-mega-menu #a>
      <mud-mega-menu-column heading="A"><a mudMegaMenuLink href="#a1">A1</a></mud-mega-menu-column>
    </mud-mega-menu>
    <mud-mega-menu #b>
      <mud-mega-menu-column heading="B"><a mudMegaMenuLink href="#b1">B1</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class SwitchingMenuHost {
  readonly a = viewChild.required<MudMegaMenu>('a');
  readonly b = viewChild.required<MudMegaMenu>('b');
  readonly useB = signal(false);
  readonly current = () => (this.useB() ? this.b() : this.a());
}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="menu" aria-label="Servicii"><svg aria-hidden="true"></svg></button>
    <mud-mega-menu #menu>
      <mud-mega-menu-column heading="A"><a mudMegaMenuLink href="#a1">A1</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class LabelledIconHost {}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="menu">Servicii</button>
    <mud-mega-menu #menu>
      <mud-mega-menu-column heading="A"><a mudMegaMenuLink>A1</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class HreflessHost {}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="menu">A</button>
    <button [mudMegaMenuTriggerFor]="menu">B</button>
    <mud-mega-menu #menu>
      <mud-mega-menu-column heading="A"><a mudMegaMenuLink href="#a1">A1</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class SharedMenuHost {
  readonly triggers = viewChildren(MudMegaMenuTrigger);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const trigger = fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement;

  return {
    fixture,
    host: fixture.componentInstance,
    trigger,
    panel: () => document.querySelector<HTMLElement>('.cdk-overlay-container nav.mega-menu'),
    links: () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container .mega-menu__link')),
  };
}

async function key(fixture: { whenStable(): Promise<unknown> }, target: HTMLElement, keyName: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true, shiftKey });

  target.dispatchEvent(event);
  await fixture.whenStable();

  return event;
}

describe('MudMegaMenuTrigger', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('is a collapsed disclosure button with a hidden chevron by default', async () => {
    const { fixture, trigger, panel } = await render();

    expect(panel()).toBeNull();
    expect(fixture.nativeElement.querySelector('.mega-menu')).toBeNull();
    expect(trigger.getAttribute('type')).toBe('button');
    expect(trigger.classList.contains('mega-menu-trigger')).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBeNull();
    expect(trigger.hasAttribute('aria-haspopup')).toBe(false);
    expect(trigger.querySelector('.mega-menu-trigger__label')?.textContent?.trim()).toBe('Servicii');

    const chevron = trigger.querySelector('svg.mega-menu-trigger__chevron')!;

    expect(chevron.getAttribute('aria-hidden')).toBe('true');
    expect(chevron.getAttribute('focusable')).toBe('false');
  });

  it('click opens the nav in the overlay, keeps focus on the trigger, wires aria', async () => {
    const { fixture, host, trigger, panel, links } = await render();

    trigger.focus();
    trigger.click();
    await fixture.whenStable();

    expect(panel()).toBeTruthy();
    expect(panel()!.getAttribute('aria-label')).toBe('Servicii');
    expect(links().length).toBe(3);
    expect(host.openedCount).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
    expect(trigger.classList.contains('is-open')).toBe(true);
    expect(document.activeElement).toBe(trigger);
  });

  it('clicking again closes, restores focus, and emits closed once', async () => {
    const { fixture, host, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(host.closedCount).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.classList.contains('is-open')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('open() while open is a no-op: one overlay, one opened emission', async () => {
    const { fixture, host, trigger, panel } = await render();
    const directive = fixture.debugElement.query((d) => d.nativeElement === trigger).injector.get(MudMegaMenuTrigger);

    directive.open();
    directive.open();
    await fixture.whenStable();

    expect(document.querySelectorAll('.cdk-overlay-container nav.mega-menu').length).toBe(1);
    expect(panel()).toBeTruthy();
    expect(host.openedCount).toBe(1);
  });

  it('Escape on the trigger closes and refocuses; Escape when closed does nothing', async () => {
    const { fixture, host, trigger, panel } = await render();

    await key(fixture, trigger, 'Escape');
    expect(host.closedCount).toBe(0);

    trigger.click();
    await fixture.whenStable();
    await key(fixture, trigger, 'Escape');

    expect(panel()).toBeNull();
    expect(host.closedCount).toBe(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('ArrowDown opens and focuses the first link', async () => {
    const { fixture, trigger, panel, links } = await render();

    await key(fixture, trigger, 'ArrowDown');
    await fixture.whenStable();

    expect(panel()).toBeTruthy();
    expect(document.activeElement).toBe(links()[0]);
  });

  it('Tab on the open trigger moves into the first link instead of leaving the panel behind', async () => {
    const { fixture, trigger, links } = await render();

    trigger.click();
    await fixture.whenStable();
    trigger.focus();
    const event = await key(fixture, trigger, 'Tab');

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(links()[0]);
  });

  it('Shift+Tab on the open trigger closes without refocusing and lets the default proceed', async () => {
    const { fixture, host, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    trigger.focus();
    const event = await key(fixture, trigger, 'Tab', true);

    expect(event.defaultPrevented).toBe(false);
    expect(panel()).toBeNull();
    expect(host.closedCount).toBe(1);
  });

  it('an outside pointer event closes without restoring focus', async () => {
    const { fixture, host, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    const elsewhere = fixture.nativeElement.querySelector('.elsewhere') as HTMLButtonElement;

    elsewhere.focus();
    // CDK listens on body in the capture phase; dispatch on the element so it bubbles there.
    elsewhere.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(host.closedCount).toBe(1);
    expect(document.activeElement).toBe(elsewhere);
  });

  it('a pointer event on the trigger itself is not treated as outside (no double toggle)', async () => {
    const { fixture, host, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    expect(panel()).toBeTruthy();
    // The click handler toggled closed; the outside listener must not reopen or re-close.
    trigger.click();
    await fixture.whenStable();

    expect(panel()).toBeNull();
    expect(host.openedCount).toBe(1);
    expect(host.closedCount).toBe(1);
  });

  it('reopens cleanly after a close: links render again, ArrowDown focuses the first', async () => {
    const { fixture, trigger, links } = await render();

    trigger.click();
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();
    await key(fixture, trigger, 'ArrowDown');
    await fixture.whenStable();

    expect(links().length).toBe(3);
    expect(document.activeElement).toBe(links()[0]);
  });

  it('destroying the trigger while open disposes the overlay and does not emit closed', async () => {
    const { fixture, host, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    expect(panel()).toBeTruthy();

    fixture.destroy();

    expect(panel()).toBeNull();
    expect(host.closedCount).toBe(0);
  });

  it('destroying the menu while open closes the overlay and resets the trigger', async () => {
    const fixture = TestBed.createComponent(DestroyableMenuHost);

    await fixture.whenStable();
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement;

    trigger.click();
    await fixture.whenStable();
    expect(document.querySelector('.cdk-overlay-container nav.mega-menu')).toBeTruthy();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fixture.componentInstance.showMenu.set(false);
    await fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-container nav.mega-menu')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.componentInstance.trigger()._isOpen()).toBe(false);
  });

  it('Tab on the trigger is not swallowed when the panel has no links', async () => {
    const fixture = TestBed.createComponent(EmptyMenuHost);

    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement;

    trigger.click();
    await fixture.whenStable();
    expect(document.querySelector('.cdk-overlay-container nav.mega-menu')).toBeTruthy();

    const event = await key(fixture, trigger, 'Tab');

    expect(event.defaultPrevented).toBe(false);
  });

  it('open() is a no-op when the bound menu is gone: no throw, no overlay, nothing emitted', async () => {
    const fixture = TestBed.createComponent(DestroyableMenuHost);

    await fixture.whenStable();
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement;
    const opened: number[] = [];

    fixture.componentInstance.trigger().opened.subscribe(() => opened.push(1));
    fixture.componentInstance.showMenu.set(false);
    await fixture.whenStable();

    expect(() => trigger.click()).not.toThrow();
    await fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-container nav.mega-menu')).toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(opened).toEqual([]);
  });

  it('keeps pointing at the menu it opened when the binding switches while open, and releases that one on close', async () => {
    const fixture = TestBed.createComponent(SwitchingMenuHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement;
    const panelIdOfA = host.a()._panelId;

    trigger.click();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-controls')).toBe(panelIdOfA);

    host.useB.set(true);
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-controls')).toBe(panelIdOfA);

    trigger.click();
    await fixture.whenStable();
    expect(host.a()._attachedTrigger()).toBeNull();
    expect(host.b()._attachedTrigger()).toBeNull();
    expect(trigger.getAttribute('aria-controls')).toBeNull();
  });

  it('names the panel from the button aria-label when the button has no text (icon-only)', async () => {
    const fixture = TestBed.createComponent(LabelledIconHost);

    await fixture.whenStable();
    (fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement).click();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement;

    // The button's own aria-label is what AT reads through the reference.
    expect(document.querySelector('.cdk-overlay-container nav.mega-menu')!.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('Tab stays native when the first link cannot take focus (an <a> without href is not focusable)', async () => {
    const fixture = TestBed.createComponent(HreflessHost);

    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button.mega-menu-trigger') as HTMLButtonElement;

    trigger.click();
    await fixture.whenStable();
    const event = await key(fixture, trigger, 'Tab');

    expect(event.defaultPrevented).toBe(false);
    expect(document.querySelector('.cdk-overlay-container nav.mega-menu')).toBeTruthy();
  });

  it('two triggers bound to one menu: opening the second takes over, one panel, focus returns to the second', async () => {
    const fixture = TestBed.createComponent(SharedMenuHost);

    await fixture.whenStable();
    const [a, b] = fixture.componentInstance.triggers();
    const [btnA, btnB] = fixture.nativeElement.querySelectorAll('button.mega-menu-trigger') as NodeListOf<HTMLButtonElement>;

    btnA.click();
    await fixture.whenStable();
    // Not btnB.click(): CDK's outside-click dispatcher would close A first and mask the takeover path.
    b.open();
    await fixture.whenStable();

    const navs = document.querySelectorAll('.cdk-overlay-container nav.mega-menu');

    expect(navs.length).toBe(1);
    expect(a._isOpen()).toBe(false);
    expect(b._isOpen()).toBe(true);
    expect(btnB.getAttribute('aria-controls')).toBe(navs[0].id);
    expect(btnA.getAttribute('aria-controls')).toBeNull();

    navs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await fixture.whenStable();

    expect(b._isOpen()).toBe(false);
    expect(document.activeElement).toBe(btnB);
  });

  it('open() after the trigger is destroyed is a no-op', async () => {
    const { fixture, trigger } = await render();
    const directive = fixture.debugElement.query((d) => d.nativeElement === trigger).injector.get(MudMegaMenuTrigger);
    const opened: number[] = [];

    directive.opened.subscribe(() => opened.push(1));
    fixture.destroy();
    directive.open();

    expect(document.querySelector('.cdk-overlay-container nav.mega-menu')).toBeNull();
    expect(opened).toEqual([]);
  });
});
