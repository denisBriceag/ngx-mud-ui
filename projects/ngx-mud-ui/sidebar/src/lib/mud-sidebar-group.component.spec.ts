import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudSidebar } from './mud-sidebar.component';
import { MudSidebarGroup } from './mud-sidebar-group.component';

@Component({
  imports: [MudSidebar, MudSidebarGroup],
  template: `
    <mud-sidebar aria-label="Main">
      @if (showFirst()) {
        <mud-sidebar-group heading="  Filtrare  " [divider]="first()" data-testid="a">a</mud-sidebar-group>
      }
      <mud-sidebar-group data-testid="b">b</mud-sidebar-group>
      <mud-sidebar-group [divider]="third()" data-testid="c">c</mud-sidebar-group>
    </mud-sidebar>
  `,
})
class Host {
  readonly showFirst = signal(true);
  readonly first = signal<boolean | undefined>(undefined);
  readonly third = signal<boolean | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const group = (id: string) => root.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
  const divided = (id: string) => !!group(id)?.querySelector('.mud-sidebar-group__divider');

  return { fixture, host: fixture.componentInstance, group, divided };
}

describe('MudSidebarGroup', () => {
  it('draws a divider above every group except the first', async () => {
    const { divided } = await render();

    expect(divided('a')).toBe(false);
    expect(divided('b')).toBe(true);
    expect(divided('c')).toBe(true);
  });

  // DOM-order CSS (:first-child) broke breadcrumb three times; the rule must
  // follow the live query order when an @if removes the first group.
  it('re-evaluates the first group when groups come and go', async () => {
    const { fixture, host, divided } = await render();

    host.showFirst.set(false);
    await fixture.whenStable();
    expect(divided('b')).toBe(false);
  });

  it('lets divider override the automatic rule both ways', async () => {
    const { fixture, host, divided } = await render();

    host.third.set(false);
    host.first.set(true);
    await fixture.whenStable();
    expect(divided('c')).toBe(false);
    expect(divided('a')).toBe(true);
  });

  it('is a group named by its trimmed heading', async () => {
    const { group } = await render();
    const a = group('a') as HTMLElement;
    const heading = a.querySelector('.mud-sidebar-group__heading') as HTMLElement;

    expect(a.getAttribute('role')).toBe('group');
    expect(heading.textContent).toBe('Filtrare');
    expect(a.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('renders no heading and no aria-labelledby without a heading', async () => {
    const { group } = await render();
    const b = group('b') as HTMLElement;

    expect(b.querySelector('.mud-sidebar-group__heading')).toBeNull();
    expect(b.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('works outside a sidebar as a plain undivided section', async () => {
    @Component({ imports: [MudSidebarGroup], template: `<mud-sidebar-group heading="X">x</mud-sidebar-group>` })
    class Bare {}

    const fixture = TestBed.createComponent(Bare);

    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.mud-sidebar-group__divider')).toBeNull();
  });
});
