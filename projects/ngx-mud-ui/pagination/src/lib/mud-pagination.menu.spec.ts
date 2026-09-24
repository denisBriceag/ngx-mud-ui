import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPagination } from './mud-pagination.component';
import type { MudPageEvent } from './mud-pagination.types';

@Component({
  imports: [MudPagination],
  template: `
    <mud-pagination class="top" [length]="length()" [(pageIndex)]="top" [disabled]="disabled()" (page)="events.push($event)" />
    <mud-pagination class="bottom" [length]="length()" [(pageIndex)]="bottom" />
  `,
})
class Host {
  readonly length = signal(200);
  readonly top = signal(0);
  readonly bottom = signal(0);
  readonly disabled = signal(false);
  readonly events: MudPageEvent[] = [];
}

async function render(setup: (host: Host) => void = () => undefined) {
  const fixture = TestBed.createComponent(Host);

  setup(fixture.componentInstance);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();

  const top = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>('mud-pagination.top')!;

  return {
    fixture,
    host: fixture.componentInstance,
    top,
    overflow: (key: 'first' | 'last') => {
      const all = top.querySelectorAll<HTMLButtonElement>('.mud-pagination__overflow');

      return key === 'first' ? all[0] : all[all.length - 1];
    },
    panel: () => document.querySelector<HTMLElement>('.cdk-overlay-container .menu'),
    menuItem: (n: number) =>
      Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-container mud-menu-item')).find((i) => i.textContent!.trim() === String(n)),
    settle: () => fixture.whenStable(),
  };
}

describe('MudPagination overflow menus', () => {
  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
    document.body.replaceChildren();
  });

  it('opens a menu listing the collapsed pages with the pagination panel class', async () => {
    const { overflow, panel, settle } = await render();

    overflow('last').click();
    await settle();

    const items = Array.from(document.querySelectorAll('.cdk-overlay-container mud-menu-item')).map((i) => i.textContent!.trim());

    expect(panel()!.classList.contains('mud-pagination__menu')).toBe(true);
    expect(panel()!.getAttribute('aria-label')).toBe('Show pages 6 to 19');
    expect(items).toEqual(['6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19']);
    expect(overflow('last').getAttribute('aria-expanded')).toBe('true');
  });

  it('jumping from the menu changes the page, emits, and closes the menu', async () => {
    const { overflow, menuItem, panel, host, settle } = await render();

    overflow('last').click();
    await settle();
    menuItem(12)!.click();
    await settle();

    expect(host.top()).toBe(11);
    expect(host.events).toEqual([{ pageIndex: 11, previousPageIndex: 0, pageSize: 10, length: 200 }]);
    expect(panel()).toBeNull();
  });

  it('keeps focus on the trigger when the overflow survives the jump', async () => {
    const { overflow, menuItem, settle } = await render();

    overflow('last').click();
    await settle();
    menuItem(12)!.click(); // → 1 … 11 12 13 … 20: a trailing overflow still exists
    await settle();

    expect(document.activeElement).toBe(overflow('last'));
  });

  it('moves focus to the current page when the jump removes the trigger', async () => {
    const { overflow, menuItem, top, settle } = await render();

    overflow('last').click();
    await settle();
    menuItem(19)!.click(); // → 1 … 16 17 18 19 20: no trailing overflow any more
    await settle();

    const current = top.querySelector('.mud-pagination__page--current');

    expect(current?.textContent?.trim()).toBe('19');
    expect(document.activeElement).toBe(current);
  });

  it('moves focus to the current page when Prev disappears', async () => {
    const { top, host, settle } = await render((h) => h.top.set(1));
    const prev = top.querySelector<HTMLButtonElement>('.mud-pagination__nav-button--previous')!;

    prev.focus();
    prev.click();
    await settle();

    expect(host.top()).toBe(0);
    expect(document.activeElement).toBe(top.querySelector('.mud-pagination__page--current'));
  });

  it('does not move focus for programmatic page changes', async () => {
    const { fixture, settle } = await render();
    const paginator = fixture.debugElement.children[0].componentInstance as MudPagination;
    const outside = document.createElement('button');

    document.body.appendChild(outside);
    outside.focus();
    paginator.lastPage();
    await settle();

    expect(document.activeElement).toBe(outside);
  });

  // Review Focus 2
  it('closes an open menu when its overflow disappears', async () => {
    const { overflow, panel, host, settle } = await render();

    overflow('last').click();
    await settle();
    expect(panel()).not.toBeNull();

    host.length.set(50); // 5 pages: every page fits, no overflow at all
    await settle();

    expect(panel()).toBeNull();
    expect(document.querySelectorAll('.cdk-overlay-container .menu').length).toBe(0);
  });

  // M1 fix: disabled flipping on after the menu opened must not let a stale selection through.
  it('ignores a menu item click once disabled flips on while the menu is open', async () => {
    const { overflow, menuItem, host, settle } = await render();

    overflow('last').click();
    await settle();
    host.disabled.set(true);
    await settle();
    menuItem(12)!.click();
    await settle();

    expect(host.top()).toBe(0);
    expect(host.events).toEqual([]);
  });

  // Review Focus 5
  it('keeps two instances independent', async () => {
    const { overflow, menuItem, host, fixture, settle } = await render();

    overflow('last').click();
    await settle();
    menuItem(8)!.click();
    await settle();

    expect(host.top()).toBe(7);
    expect(host.bottom()).toBe(0);

    // Open the top and the bottom trailing menus in turn; their panels must not share an id.
    const root = fixture.nativeElement as HTMLElement;
    const bottomTrigger = root.querySelector<HTMLButtonElement>('mud-pagination.bottom .mud-pagination__overflow')!;

    overflow('last').click();
    await settle();
    const topPanelId = overflow('last').getAttribute('aria-controls');

    document.querySelector<HTMLElement>('.cdk-overlay-container .menu')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();

    bottomTrigger.click();
    await settle();
    const bottomPanelId = bottomTrigger.getAttribute('aria-controls');

    expect(topPanelId).toBeTruthy();
    expect(bottomPanelId).toBeTruthy();
    expect(topPanelId).not.toBe(bottomPanelId);
  });
});
