import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudMenu } from './mud-menu.component';
import { MudMenuItem } from './mud-menu-item.component';
import type { MudMenuType } from './mud-menu.types';

@Component({
  imports: [MudMenu, MudMenuItem],
  template: `
    <mud-menu
      [type]="type()"
      [(value)]="value"
      [open]="open()"
      [closeOnSelect]="closeOnSelect()"
      aria-label="Actions"
      (selected)="selections.push($event)"
      (closed)="closeCount = closeCount + 1"
    >
      <mud-menu-item value="one">One</mud-menu-item>
      <mud-menu-item value="two" [disabled]="secondDisabled()">Two</mud-menu-item>
      <mud-menu-item heading>Section</mud-menu-item>
      <mud-menu-item value="three">Three</mud-menu-item>
    </mud-menu>
  `,
})
class Host {
  readonly type = signal<MudMenuType>('contextual');
  readonly value = signal<string | undefined>(undefined);
  readonly open = signal(true);
  readonly closeOnSelect = signal(true);
  readonly secondDisabled = signal(false);
  readonly selections: string[] = [];
  closeCount = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const panel = () => document.querySelector<HTMLElement>('.menu');
  const items = () => Array.from(document.querySelectorAll<HTMLElement>('mud-menu-item'));

  return { fixture, host: fixture.componentInstance, panel, items };
}

async function key(fixture: { whenStable(): Promise<unknown> }, target: HTMLElement, keyName: string) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: keyName, bubbles: true, cancelable: true }));
  await fixture.whenStable();
}

describe('MudMenu inline panel', () => {
  it('renders inline when open with role=menu and the aria-label', async () => {
    const { panel } = await render();

    expect(panel()).toBeTruthy();
    expect(panel()!.getAttribute('role')).toBe('menu');
    expect(panel()!.getAttribute('aria-label')).toBe('Actions');
    expect(panel()!.id).toMatch(/^mud-menu-panel-/);
  });

  it('renders nothing while open=false', async () => {
    const { fixture, host, panel } = await render();

    host.open.set(false);
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });

  it('selection type: role=listbox, options, derived check on the value match', async () => {
    const { fixture, host, panel, items } = await render();

    host.type.set('selection');
    host.value.set('two');
    await fixture.whenStable();
    expect(panel()!.getAttribute('role')).toBe('listbox');
    expect(panel()!.classList.contains('menu--selection')).toBe(true);
    const [one, two] = items();

    expect(one.getAttribute('role')).toBe('option');
    expect(one.getAttribute('aria-selected')).toBe('false');
    expect(two.getAttribute('aria-selected')).toBe('true');
    // Exactly one trailing check across the panel, on the matching item.
    expect(document.querySelectorAll('.menu__check').length).toBe(1);
    expect(two.querySelector('.menu__check')).toBeTruthy();

    // Re-pointing the value from outside moves the check without item writes.
    host.value.set('three');
    await fixture.whenStable();
    expect(two.querySelector('.menu__check')).toBeNull();
    expect(items()[3].querySelector('.menu__check')).toBeTruthy();
  });

  it('parks the single tab stop on the first focusable item (headings never)', async () => {
    const { items } = await render();
    const tabbables = items().map((el) => el.getAttribute('tabindex'));

    expect(tabbables).toEqual(['0', '-1', null, '-1']);
  });

  it('ArrowDown/ArrowUp wrap, include disabled items, and skip headings', async () => {
    const { fixture, host, items } = await render();

    host.secondDisabled.set(true);
    await fixture.whenStable();
    const [one, two, , three] = items();

    one.focus();
    await key(fixture, one, 'ArrowDown');
    expect(document.activeElement).toBe(two); // disabled but focusable
    await key(fixture, two, 'ArrowDown');
    expect(document.activeElement).toBe(three); // heading skipped
    await key(fixture, three, 'ArrowDown');
    expect(document.activeElement).toBe(one); // wrap
    await key(fixture, one, 'ArrowUp');
    expect(document.activeElement).toBe(three); // wrap backwards
  });

  it('Home/End land on first/last focusable item', async () => {
    const { fixture, items } = await render();
    const [one, , , three] = items();

    one.focus();
    await key(fixture, one, 'End');
    expect(document.activeElement).toBe(three);
    await key(fixture, three, 'Home');
    expect(document.activeElement).toBe(one);
  });

  it('activation emits selected and (closeOnSelect) a close request', async () => {
    const { fixture, host, items } = await render();

    items()[0].click();
    await fixture.whenStable();
    expect(host.selections).toEqual(['one']);
    expect(host.closeCount).toBe(1);
  });

  it('closeOnSelect=false keeps the panel silent about closing', async () => {
    const { fixture, host, items } = await render();

    host.closeOnSelect.set(false);
    await fixture.whenStable();
    items()[0].click();
    await fixture.whenStable();
    expect(host.selections).toEqual(['one']);
    expect(host.closeCount).toBe(0);
  });

  it('selection type: activation sets the value once and never toggles it off', async () => {
    const { fixture, host, items } = await render();

    host.type.set('selection');
    host.closeOnSelect.set(false);
    await fixture.whenStable();
    items()[0].click();
    await fixture.whenStable();
    expect(host.value()).toBe('one');
    items()[0].click();
    await fixture.whenStable();
    expect(host.value()).toBe('one');
  });

  it('disabled items do not activate via click or Enter', async () => {
    const { fixture, host, items } = await render();

    host.secondDisabled.set(true);
    await fixture.whenStable();
    const two = items()[1];

    two.click();
    await key(fixture, two, 'Enter');
    expect(host.selections).toEqual([]);
  });

  it('Escape emits a close request', async () => {
    const { fixture, host, items } = await render();

    items()[0].focus();
    await key(fixture, items()[0], 'Escape');
    expect(host.closeCount).toBe(1);
  });

  it('contextual checkbox items keep aria-checked and never render the trailing check', async () => {
    // The trailing check is a selection-menu affordance; contextual checked
    // state lives in the leading control + aria-checked.
    const fixture = TestBed.createComponent(CheckboxHost);

    await fixture.whenStable();
    const item = document.querySelector<HTMLElement>('mud-menu-item')!;

    expect(item.getAttribute('role')).toBe('menuitemcheckbox');
    expect(item.getAttribute('aria-checked')).toBe('true');
    expect(item.querySelector('.menu__check')).toBeNull();
    expect(item.querySelector('.menu__control--checkbox')).toBeTruthy();
  });
});

@Component({
  imports: [MudMenu, MudMenuItem],
  template: `
    <mud-menu open aria-label="View">
      <mud-menu-item value="grid" leading="checkbox" selected>Grid</mud-menu-item>
    </mud-menu>
  `,
})
class CheckboxHost {}

@Component({
  imports: [MudMenu, MudMenuItem],
  template: `
    <mud-menu [open]="open()" aria-label="Actions">
      <mud-menu-item value="one">One</mud-menu-item>
      <mud-menu-item value="two">Two</mud-menu-item>
      <mud-menu-item heading>Section</mud-menu-item>
      <mud-menu-item value="three">Three</mud-menu-item>
    </mud-menu>
  `,
})
class DeferredOpenHost {
  readonly open = signal(false);
}

describe('MudMenu inline open transition (regression)', () => {
  it('re-sorts roving tab stops in document order once open flips from false to true', async () => {
    const fixture = TestBed.createComponent(DeferredOpenHost);

    await fixture.whenStable();
    fixture.componentInstance.open.set(true);
    await fixture.whenStable();
    const items = Array.from(document.querySelectorAll<HTMLElement>('mud-menu-item'));

    expect(items.map((el) => el.getAttribute('tabindex'))).toEqual(['0', '-1', null, '-1']);
    items[0].focus();
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await fixture.whenStable();
    expect(document.activeElement).toBe(items[1]);
  });
});
