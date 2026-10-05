import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudSidebar } from './mud-sidebar.component';
import { MudSidebarContent, MudSidebarLayout } from './mud-sidebar-layout.component';

@Component({
  imports: [MudSidebar, MudSidebarLayout, MudSidebarContent],
  template: `
    <mud-sidebar-layout>
      <main mudSidebarContent>content</main>
      <mud-sidebar aria-label="Main" [collapsed]="collapsed()">nav</mud-sidebar>
    </mud-sidebar-layout>
  `,
})
class Host {
  readonly collapsed = signal(false);
}

describe('MudSidebarLayout', () => {
  it('puts the sidebar first whatever the source order', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    const layout = (fixture.nativeElement as HTMLElement).querySelector('mud-sidebar-layout') as HTMLElement;

    expect(layout.firstElementChild?.tagName).toBe('MUD-SIDEBAR');
    expect(layout.querySelector('main')?.classList).toContain('mud-sidebar-layout__content');
  });

  it('follows the sidebar’s compact state', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    const layout = (fixture.nativeElement as HTMLElement).querySelector('mud-sidebar-layout') as HTMLElement;

    expect(layout.classList).not.toContain('mud-sidebar-layout--compact');
    fixture.componentInstance.collapsed.set(true);
    await fixture.whenStable();
    expect(layout.classList).toContain('mud-sidebar-layout--compact');
  });

  it('lets content span the full grid without a sidebar', async () => {
    @Component({
      imports: [MudSidebarLayout, MudSidebarContent],
      template: `<mud-sidebar-layout><main mudSidebarContent>c</main></mud-sidebar-layout>`,
    })
    class NoSidebar {}

    const fixture = TestBed.createComponent(NoSidebar);

    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('mud-sidebar-layout')?.classList).toContain(
      'mud-sidebar-layout--no-sidebar',
    );
  });

  it('warns when given two sidebars', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    @Component({
      imports: [MudSidebar, MudSidebarLayout],
      template: `<mud-sidebar-layout><mud-sidebar aria-label="A" /><mud-sidebar aria-label="B" /></mud-sidebar-layout>`,
    })
    class Two {}

    const fixture = TestBed.createComponent(Two);

    await fixture.whenStable();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mud-sidebar-layout: only one mud-sidebar'));
    warn.mockRestore();
  });
});
