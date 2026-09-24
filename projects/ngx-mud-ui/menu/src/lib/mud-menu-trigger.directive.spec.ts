import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudMenu } from './mud-menu.component';
import { MudMenuItem } from './mud-menu-item.component';
import { MudMenuTrigger } from './mud-menu-trigger.directive';
import type { MudMenuPositionX, MudMenuPositionY } from './mud-menu.types';

@Component({
  imports: [MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button [mudMenuTriggerFor]="menu" (opened)="openedCount = openedCount + 1" (closed)="closedCount = closedCount + 1">
      Actions
    </button>
    <button class="elsewhere">Elsewhere</button>
    <mud-menu #menu [xPosition]="x()" [yPosition]="y()" [closeOnSelect]="closeOnSelect()" aria-label="Actions">
      <mud-menu-item value="one">One</mud-menu-item>
      <mud-menu-item value="two">Two</mud-menu-item>
    </mud-menu>
  `,
})
class Host {
  readonly x = signal<MudMenuPositionX>('after');
  readonly y = signal<MudMenuPositionY>('below');
  readonly closeOnSelect = signal(true);
  openedCount = 0;
  closedCount = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  return {
    fixture,
    host: fixture.componentInstance,
    trigger,
    panel: () => document.querySelector<HTMLElement>('.cdk-overlay-container .menu'),
    items: () => Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container mud-menu-item')),
  };
}

async function key(fixture: { whenStable(): Promise<unknown> }, target: HTMLElement, keyName: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }));
  await fixture.whenStable();
}

describe('MudMenuTrigger (root)', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('closed by default: collapsed aria, no panel, no inline rendering', async () => {
    const { fixture, trigger, panel } = await render();

    expect(panel()).toBeNull();
    expect(fixture.nativeElement.querySelector('.menu')).toBeNull(); // trigger-attached menus never render inline
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBeNull();
  });

  it('click opens in the overlay, focuses the first item, wires aria', async () => {
    const { fixture, host, trigger, panel, items } = await render();

    trigger.click();
    await fixture.whenStable();
    expect(panel()).toBeTruthy();
    expect(host.openedCount).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
    expect(document.activeElement).toBe(items()[0]);
  });

  it('clicking the trigger again toggles the menu closed and restores focus', async () => {
    const { fixture, host, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(host.closedCount).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
  });

  it('ArrowDown opens focusing first; ArrowUp opens focusing last', async () => {
    const { fixture, trigger, items } = await render();

    await key(fixture, trigger, 'ArrowDown');
    expect(document.activeElement).toBe(items()[0]);
    await key(fixture, document.activeElement as HTMLElement, 'Escape');
    await key(fixture, trigger, 'ArrowUp');
    expect(document.activeElement).toBe(items()[1]);
  });

  it('Escape closes and restores focus to the trigger', async () => {
    const { fixture, trigger, panel, items } = await render();

    trigger.click();
    await fixture.whenStable();
    await key(fixture, items()[0], 'Escape');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab closes and restores focus to the trigger synchronously (MatMenu behaviour, jsdom does not perform the default Tab move)', async () => {
    const { fixture, trigger, panel, items } = await render();

    trigger.click();
    await fixture.whenStable();
    await key(fixture, items()[0], 'Tab');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('activating an item closes (closeOnSelect default) and restores focus', async () => {
    const { fixture, trigger, panel, items } = await render();

    trigger.click();
    await fixture.whenStable();
    items()[0].click();
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closeOnSelect=false keeps the overlay open on activation', async () => {
    const { fixture, host, trigger, panel, items } = await render();

    host.closeOnSelect.set(false);
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();
    items()[0].click();
    await fixture.whenStable();
    expect(panel()).toBeTruthy();
  });

  it('outside pointer interaction closes without restoring focus', async () => {
    const { fixture, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    const elsewhere = fixture.nativeElement.querySelector('.elsewhere') as HTMLElement;

    elsewhere.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(document.activeElement).not.toBe(trigger);
  });

  it('destroying the host while open disposes the overlay without emitting closed or logging NG0953', async () => {
    const { fixture, host, trigger, panel } = await render();

    trigger.click();
    await fixture.whenStable();
    expect(panel()).toBeTruthy();

    const errorSpy = vi.spyOn(console, 'error');
    const warnSpy = vi.spyOn(console, 'warn');

    fixture.destroy();

    expect(document.querySelector('.cdk-overlay-container .menu')).toBeNull();
    expect(host.closedCount).toBe(0);
    const ng0953Logged = [...errorSpy.mock.calls, ...warnSpy.mock.calls].some((args) =>
      args.some((arg) => String(arg).includes('NG0953')),
    );

    expect(ng0953Logged).toBe(false);
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('selection menus advertise listbox on the trigger', async () => {
    const fixture = TestBed.createComponent(SelectionHost);

    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
  });
});

@Component({
  imports: [MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button [mudMenuTriggerFor]="menu">Sort</button>
    <mud-menu #menu type="selection" aria-label="Sort"><mud-menu-item value="a">A</mud-menu-item></mud-menu>
  `,
})
class SelectionHost {}

describe('MudMenuTrigger (SSR)', () => {
  it('renders collapsed trigger attributes on the server and open() is a no-op', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.click();
    await fixture.whenStable();
    expect(document.querySelector('.cdk-overlay-container .menu')).toBeNull();
  });

  it('a standalone open panel renders its markup on the server', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(InlineHost);

    await fixture.whenStable();
    const panel = fixture.nativeElement.querySelector('.menu') as HTMLElement;

    expect(panel).toBeTruthy();
    expect(panel.getAttribute('role')).toBe('menu');
    expect(fixture.nativeElement.querySelectorAll('mud-menu-item').length).toBe(1);
  });
});

@Component({
  imports: [MudMenu, MudMenuItem],
  template: `
    <mud-menu open aria-label="Static">
      <mud-menu-item value="only">Only</mud-menu-item>
    </mud-menu>
  `,
})
class InlineHost {}

@Component({
  imports: [MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button class="root-trigger" [mudMenuTriggerFor]="root">Options</button>
    <mud-menu #root aria-label="Options">
      <mud-menu-item value="plain">Plain</mud-menu-item>
      <mud-menu-item class="share-item" [mudMenuTriggerFor]="share">Share</mud-menu-item>
      <mud-menu-item class="export-item" [mudMenuTriggerFor]="exportMenu">Export</mud-menu-item>
    </mud-menu>
    <mud-menu #share aria-label="Share">
      <mud-menu-item value="email">Email</mud-menu-item>
      <mud-menu-item value="link-copy">Copy link</mud-menu-item>
    </mud-menu>
    <mud-menu #exportMenu aria-label="Export">
      <mud-menu-item value="pdf">PDF</mud-menu-item>
    </mud-menu>
  `,
})
class NestedHost {}

describe('MudMenuTrigger (nested)', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  async function renderNested() {
    const fixture = TestBed.createComponent(NestedHost);

    await fixture.whenStable();
    const rootTrigger = fixture.nativeElement.querySelector('.root-trigger') as HTMLButtonElement;

    rootTrigger.click();
    await fixture.whenStable();
    const overlay = () => document.querySelector('.cdk-overlay-container')!;
    const panels = () => Array.from(overlay().querySelectorAll<HTMLElement>('.menu'));
    const shareItem = () => overlay().querySelector<HTMLElement>('.share-item')!;
    const exportItem = () => overlay().querySelector<HTMLElement>('.export-item')!;

    return { fixture, rootTrigger, panels, shareItem, exportItem };
  }

  it('an item trigger renders the chevron and submenu aria', async () => {
    const { shareItem } = await renderNested();

    expect(shareItem().querySelector('.menu__chevron')).toBeTruthy();
    expect(shareItem().getAttribute('aria-haspopup')).toBe('menu');
    expect(shareItem().getAttribute('aria-expanded')).toBe('false');
  });

  it('ArrowRight opens the submenu and focuses its first item', async () => {
    const { fixture, panels, shareItem } = await renderNested();

    shareItem().focus();
    await key(fixture, shareItem(), 'ArrowRight');
    expect(panels().length).toBe(2);
    const first = panels()[1].querySelector<HTMLElement>('mud-menu-item')!;

    expect(document.activeElement).toBe(first);
    expect(shareItem().getAttribute('aria-expanded')).toBe('true');
  });

  it('ArrowLeft closes only the submenu and refocuses the parent item', async () => {
    const { fixture, panels, shareItem } = await renderNested();

    shareItem().focus();
    await key(fixture, shareItem(), 'ArrowRight');
    const first = panels()[1].querySelector<HTMLElement>('mud-menu-item')!;

    await key(fixture, first, 'ArrowLeft');
    expect(panels().length).toBe(1);
    expect(document.activeElement).toBe(shareItem());
  });

  it('Escape in a submenu closes one level only', async () => {
    const { fixture, panels, shareItem } = await renderNested();

    shareItem().focus();
    await key(fixture, shareItem(), 'ArrowRight');
    const first = panels()[1].querySelector<HTMLElement>('mud-menu-item')!;

    await key(fixture, first, 'Escape');
    expect(panels().length).toBe(1);
    expect(document.activeElement).toBe(shareItem());
  });

  it('activating a leaf item closes the whole chain and restores the root trigger', async () => {
    const { fixture, rootTrigger, panels, shareItem } = await renderNested();

    shareItem().focus();
    await key(fixture, shareItem(), 'ArrowRight');
    panels()[1].querySelector<HTMLElement>('mud-menu-item')!.click();
    await fixture.whenStable();
    expect(panels().length).toBe(0);
    expect(document.activeElement).toBe(rootTrigger);
  });

  it('clicking a submenu item trigger opens it without treating it as a decision', async () => {
    const { fixture, panels, shareItem } = await renderNested();

    shareItem().click();
    await fixture.whenStable();
    expect(panels().length).toBe(2); // root stayed open, submenu opened
  });

  it('hover opens after the delay and hovering a sibling item closes it', async () => {
    // Scoped to setTimeout/clearTimeout only (not the sinon default of every
    // detected timer): Angular's zoneless scheduler and CDK's overlay
    // positioning both coalesce via requestAnimationFrame, and faking that
    // too freezes fixture.whenStable() forever since nothing is left to
    // advance it — confirmed by instrumenting open(): under a blanket
    // vi.useFakeTimers() the root menu's own click-to-open never completed.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { fixture, panels, shareItem, exportItem } = await renderNested();

      shareItem().dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      vi.advanceTimersByTime(130);
      await fixture.whenStable();
      expect(panels().length).toBe(2);

      // Hovering the sibling closes Share (after the delay) and opens Export.
      exportItem().dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      vi.advanceTimersByTime(130);
      await fixture.whenStable();
      const labels = panels().map((p) => p.getAttribute('aria-label'));

      expect(labels).toContain('Export');
      expect(labels).not.toContain('Share');
    } finally {
      vi.useRealTimers();
    }
  });

  it('a hover timer pending when the chain closes does not open an orphan submenu (ghost focus steal)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { fixture, panels, shareItem } = await renderNested();

      shareItem().dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      await key(fixture, document.activeElement as HTMLElement, 'Escape');
      vi.advanceTimersByTime(130);
      await fixture.whenStable();
      expect(panels().length).toBe(0);
      expect(document.querySelector('.cdk-overlay-container .menu')).toBeNull();
      expect(document.activeElement?.closest('.cdk-overlay-container')).toBeFalsy();
    } finally {
      vi.useRealTimers();
    }
  });

  it('a pointer merely crossing a trigger item does not open its submenu (transit hover)', async () => {
    // Real-world repro: open the root menu, move the pointer down the list —
    // grazing "Share" for a moment used to schedule an open that fired 120ms
    // later regardless of where the pointer had gone, so the submenu appeared
    // "automatically". mouseleave must cancel a PENDING open (an already-open
    // submenu is left alone — sibling-hover close owns that, like MatMenu).
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { fixture, panels, shareItem } = await renderNested();

      shareItem().dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      vi.advanceTimersByTime(40); // pointer passes through well inside the delay
      shareItem().dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      vi.advanceTimersByTime(200);
      await fixture.whenStable();

      expect(panels().length).toBe(1); // root only — no ghost submenu
    } finally {
      vi.useRealTimers();
    }
  });

  it('mouseleave does not close an already-open submenu', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { fixture, panels, shareItem } = await renderNested();

      shareItem().dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      vi.advanceTimersByTime(130);
      await fixture.whenStable();
      expect(panels().length).toBe(2);

      // Leaving the item (e.g. moving INTO the submenu panel) keeps it open.
      shareItem().dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      vi.advanceTimersByTime(200);
      await fixture.whenStable();
      expect(panels().length).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a click inside a submenu overlay is not an outside interaction', async () => {
    const { fixture, panels, shareItem } = await renderNested();

    shareItem().focus();
    await key(fixture, shareItem(), 'ArrowRight');
    const submenuPanel = panels()[1];

    submenuPanel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await fixture.whenStable();
    expect(panels().length).toBe(2); // chain intact
  });
});

@Component({
  imports: [MudMenu, MudMenuItem, MudMenuTrigger],
  template: `
    <button class="root-trigger" [mudMenuTriggerFor]="root">Options</button>
    <mud-menu #root aria-label="Options">
      <mud-menu-item value="plain">Plain</mud-menu-item>
      <mud-menu-item class="share-item" disabled [mudMenuTriggerFor]="share">Share</mud-menu-item>
    </mud-menu>
    <mud-menu #share aria-label="Share">
      <mud-menu-item value="email">Email</mud-menu-item>
    </mud-menu>
  `,
})
class DisabledSubmenuHost {}

describe('MudMenuTrigger (disabled submenu item)', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  async function renderDisabled() {
    const fixture = TestBed.createComponent(DisabledSubmenuHost);

    await fixture.whenStable();
    const rootTrigger = fixture.nativeElement.querySelector('.root-trigger') as HTMLButtonElement;

    rootTrigger.click();
    await fixture.whenStable();
    const overlay = () => document.querySelector('.cdk-overlay-container')!;
    const panels = () => Array.from(overlay().querySelectorAll<HTMLElement>('.menu'));
    const shareItem = () => overlay().querySelector<HTMLElement>('.share-item')!;

    return { fixture, panels, shareItem };
  }

  it('click, ArrowRight, and hover never open a disabled submenu trigger', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const { fixture, panels, shareItem } = await renderDisabled();

      shareItem().click();
      await fixture.whenStable();
      expect(panels().length).toBe(1);
      expect(shareItem().getAttribute('aria-expanded')).toBe('false');

      shareItem().focus();
      await key(fixture, shareItem(), 'ArrowRight');
      expect(panels().length).toBe(1);
      expect(shareItem().getAttribute('aria-expanded')).toBe('false');

      shareItem().dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      vi.advanceTimersByTime(130);
      await fixture.whenStable();
      expect(panels().length).toBe(1);
      expect(shareItem().getAttribute('aria-expanded')).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });
});
