import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudSidebar, MudSidebarHeader } from './mud-sidebar.component';
import { MudSidebarGroup } from './mud-sidebar-group.component';
import { MudSidebarItem } from './mud-sidebar-item.component';
import { MudSidebarToggle } from './mud-sidebar-toggle.directive';
import { MudSidebarContent, MudSidebarLayout } from './mud-sidebar-layout.component';

@Component({
  imports: [MudSidebar, MudSidebarHeader, MudSidebarGroup, MudSidebarItem, MudSidebarToggle, MudSidebarLayout, MudSidebarContent],
  template: `
    <mud-sidebar-layout>
      <mud-sidebar id="nav" aria-label="Main" [collapsed]="true">
        <div mudSidebarHeader><button mudSidebarToggle aria-label="Expand">x</button></div>
        <mud-sidebar-group heading="Filtrare"><a mud-sidebar-item href="/a" selected>Toate</a></mud-sidebar-group>
        <mud-sidebar-group><a mud-sidebar-item href="/b">Jurnal</a></mud-sidebar-group>
      </mud-sidebar>
      <main mudSidebarContent>c</main>
    </mud-sidebar-layout>
  `,
})
class Host {}

describe('MudSidebar on the server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  });

  // Every state the first paint needs is a host binding, so server markup is final markup.
  it('serializes the compact rail, groups, rows and toggle without touching the DOM APIs', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const sidebar = root.querySelector('mud-sidebar') as HTMLElement;
    const [first, second] = Array.from(root.querySelectorAll('mud-sidebar-group'));
    const toggle = root.querySelector('button') as HTMLElement;

    expect(sidebar.getAttribute('role')).toBe('navigation');
    expect(sidebar.classList).toContain('mud-sidebar--compact');
    expect(root.querySelector('mud-sidebar-layout')?.classList).toContain('mud-sidebar-layout--compact');
    expect(first.querySelector('.mud-sidebar-group__divider')).toBeNull();
    expect(second.querySelector('.mud-sidebar-group__divider')).not.toBeNull();
    expect(first.getAttribute('aria-labelledby')).toBe(first.querySelector('.mud-sidebar-group__heading')?.id);
    expect(root.querySelector('a')?.getAttribute('aria-current')).toBe('page');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('nav');
    expect(document.querySelector('mud-tooltip-container')).toBeNull();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
