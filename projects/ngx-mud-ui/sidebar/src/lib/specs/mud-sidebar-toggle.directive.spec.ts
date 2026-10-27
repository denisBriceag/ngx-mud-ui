import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { MudSidebar, MudSidebarHeader } from '../mud-sidebar.component';
import { MudSidebarToggle } from '../mud-sidebar-toggle.directive';

const narrow$ = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });

@Component({
  imports: [MudSidebar, MudSidebarHeader, MudSidebarToggle],
  template: `
    <mud-sidebar id="nav" aria-label="Main" [(collapsed)]="collapsed">
      <div mudSidebarHeader><button type="button" mudSidebarToggle aria-label="Collapse">x</button></div>
    </mud-sidebar>
  `,
})
class Host {
  readonly collapsed = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;

  return { fixture, host: fixture.componentInstance, button };
}

describe('MudSidebarToggle', () => {
  beforeEach(() => {
    narrow$.next({ matches: false, breakpoints: {} });
    TestBed.configureTestingModule({
      providers: [{ provide: BreakpointObserver, useValue: { observe: () => narrow$ } }],
    });
  });

  it('points at the sidebar and reports it expanded', async () => {
    const { button } = await render();

    expect(button.getAttribute('aria-controls')).toBe('nav');
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('marks its host so the rail can draw it as a 40px circle', async () => {
    const { button } = await render();

    expect(button.classList).toContain('mud-sidebar-toggle');
  });

  it('collapses and expands on click, keeping focus on itself', async () => {
    const { fixture, host, button } = await render();

    button.focus();
    button.click();
    await fixture.whenStable();
    expect(host.collapsed()).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);

    button.click();
    await fixture.whenStable();
    expect(host.collapsed()).toBe(false);
  });

  it('hides itself on a narrow viewport', async () => {
    const { fixture, button } = await render();

    narrow$.next({ matches: true, breakpoints: {} });
    await fixture.whenStable();
    expect(button.style.display).toBe('none');
  });

  it('throws when used outside a sidebar', () => {
    @Component({ imports: [MudSidebarToggle], template: `<button mudSidebarToggle>x</button>` })
    class Orphan {}

    expect(() => {
      const fixture = TestBed.createComponent(Orphan);

      fixture.detectChanges();
    }).toThrow(/MudSidebar/);
  });
});
