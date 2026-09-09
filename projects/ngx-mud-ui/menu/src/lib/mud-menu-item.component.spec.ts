import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudMenuItem } from './mud-menu-item.component';
import type { MudMenuItemLeading } from './mud-menu.types';

@Component({
  imports: [MudMenuItem],
  template: `
    <mud-menu-item
      [value]="value()"
      [leading]="leading()"
      [selected]="selected()"
      [disabled]="disabled()"
      [heading]="heading()"
    >
      @if (leading() === 'icon') {
        <svg icon viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
      }
      {{ label() }}
    </mud-menu-item>
  `,
})
class Host {
  readonly value = signal<string | undefined>('edit');
  readonly leading = signal<MudMenuItemLeading>('none');
  readonly selected = signal(false);
  readonly disabled = signal(false);
  readonly heading = signal(false);
  readonly label = signal('Edit');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-menu-item') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudMenuItem (standalone, no parent panel)', () => {
  it('renders role=menuitem with roving tabindex parked at -1', async () => {
    const { el } = await render();

    expect(el.getAttribute('role')).toBe('menuitem');
    expect(el.getAttribute('tabindex')).toBe('-1');
    expect(el.classList.contains('menu__item')).toBe(true);
    // No leading, not selected, no submenu: label only.
    expect(el.querySelector('.menu__leading')).toBeNull();
    expect(el.querySelector('.menu__check')).toBeNull();
    expect(el.querySelector('.menu__chevron')).toBeNull();
    expect(el.querySelector('.menu__label')!.textContent).toContain('Edit');
  });

  it('maps leading checkbox/radio to their menuitem* roles with aria-checked', async () => {
    const { fixture, host, el } = await render();

    host.leading.set('checkbox');
    await fixture.whenStable();
    expect(el.getAttribute('role')).toBe('menuitemcheckbox');
    expect(el.getAttribute('aria-checked')).toBe('false');
    expect(el.querySelector('.menu__control--checkbox')).toBeTruthy();

    host.selected.set(true);
    await fixture.whenStable();
    expect(el.getAttribute('aria-checked')).toBe('true');
    expect(el.classList.contains('is-checked')).toBe(true);

    host.leading.set('radio');
    await fixture.whenStable();
    expect(el.getAttribute('role')).toBe('menuitemradio');
    expect(el.querySelector('.menu__control--radio')).toBeTruthy();
    // The visual is a pure-CSS inert glyph, never a nested form control.
    expect(el.querySelector('input')).toBeNull();
    expect(el.querySelector('.menu__control')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a projected [icon] only when leading=icon', async () => {
    const { fixture, host, el } = await render();

    host.leading.set('icon');
    await fixture.whenStable();
    const leadingSlot = el.querySelector('.menu__leading')!;

    expect(leadingSlot.getAttribute('aria-hidden')).toBe('true');
    expect(leadingSlot.querySelector('svg')).toBeTruthy();
  });

  it('disabled: aria-disabled, still focusable via roving contract, is-disabled class', async () => {
    const { fixture, host, el } = await render();

    host.disabled.set(true);
    await fixture.whenStable();
    expect(el.getAttribute('aria-disabled')).toBe('true');
    // Roving keeps disabled items reachable (house pattern); tabindex stays managed, not removed.
    expect(el.getAttribute('tabindex')).toBe('-1');
    expect(el.classList.contains('is-disabled')).toBe(true);
  });

  it('heading: presentation host wrapping a role=separator divider and a label region', async () => {
    const { fixture, host, el } = await render();

    host.heading.set(true);
    await fixture.whenStable();
    expect(el.getAttribute('role')).toBe('presentation');
    expect(el.getAttribute('tabindex')).toBeNull();
    expect(el.classList.contains('menu__heading-row')).toBe(true);
    expect(el.querySelector('.menu__separator')!.getAttribute('role')).toBe('separator');
    expect(el.querySelector('.menu__heading')!.textContent).toContain('Edit');
    expect(el.getAttribute('aria-disabled')).toBeNull();
  });

  it('without a panel, aria-selected is never set and no trailing check renders', async () => {
    const { fixture, host, el } = await render();

    host.selected.set(true);
    await fixture.whenStable();
    expect(el.getAttribute('aria-selected')).toBeNull();
    expect(el.querySelector('.menu__check')).toBeNull();
  });

  it('an empty heading leaves .menu__heading truly :empty (separator-only segmentation)', async () => {
    // The SCSS hides .menu__heading:empty; a single stray whitespace text node
    // defeats :empty silently, so proxy-test the DOM state jsdom CAN see
    // (the info-box lesson for load-bearing :empty selectors).
    const fixture = TestBed.createComponent(EmptyHeadingHost);

    await fixture.whenStable();
    const heading = document.querySelector('.menu__heading')!;

    expect(heading.childNodes.length).toBe(0);
    expect(heading.matches(':empty')).toBe(true);
  });
});

@Component({
  imports: [MudMenuItem],
  template: `<mud-menu-item heading></mud-menu-item>`,
})
class EmptyHeadingHost {}
