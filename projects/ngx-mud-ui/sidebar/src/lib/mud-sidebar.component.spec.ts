import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject } from 'rxjs';
import { MudSidebar, MudSidebarHeader } from './mud-sidebar.component';
import { MudSidebarItem } from './mud-sidebar-item.component';

const narrow$ = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });

@Component({
  imports: [MudSidebar, MudSidebarHeader],
  template: `
    <mud-sidebar #sb="mudSidebar" aria-label="Main" [(collapsed)]="collapsed">
      <div mudSidebarHeader>Header</div>
      Body
    </mud-sidebar>
  `,
})
class Host {
  readonly collapsed = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = (fixture.nativeElement as HTMLElement).querySelector('mud-sidebar') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudSidebar', () => {
  beforeEach(() => {
    narrow$.next({ matches: false, breakpoints: {} });
    TestBed.configureTestingModule({
      providers: [{ provide: BreakpointObserver, useValue: { observe: () => narrow$ } }],
    });
  });

  it('is a named navigation landmark with a generated id', async () => {
    const { el } = await render();

    expect(el.getAttribute('role')).toBe('navigation');
    expect(el.getAttribute('aria-label')).toBe('Main');
    expect(el.id).toMatch(/^mud-sidebar-\d+$/);
    expect(el.classList).toContain('mud-sidebar');
  });

  // aria-controls on the toggle must never point at "undefined" or "".
  it('trims id and falls back to the generated id when it is blank or unset', async () => {
    @Component({
      imports: [MudSidebar],
      template: `
        <mud-sidebar aria-label="A" id="  nav  " />
        <mud-sidebar aria-label="B" id="   " />
        <mud-sidebar aria-label="C" [id]="unset" />
      `,
    })
    class Ids {
      readonly unset = undefined;
    }

    const fixture = TestBed.createComponent(Ids);

    await fixture.whenStable();
    const [a, b, c] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('mud-sidebar'));

    expect(a.id).toBe('nav');
    expect(b.id).toMatch(/^mud-sidebar-\d+$/);
    expect(c.id).toMatch(/^mud-sidebar-\d+$/);
  });

  it('projects the header before the body', async () => {
    const { el } = await render();

    expect(el.firstElementChild?.classList).toContain('mud-sidebar-header');
  });

  it('reflects collapsed and compact as classes', async () => {
    const { fixture, host, el } = await render();

    host.collapsed.set(true);
    await fixture.whenStable();
    expect(el.classList).toContain('mud-sidebar--collapsed');
    expect(el.classList).toContain('mud-sidebar--compact');
  });

  // Below 768px the layout stacks and a 68px rail makes no sense, but the
  // user's choice must survive a rotate/resize back to desktop.
  it('is never compact on a narrow viewport and keeps the model untouched', async () => {
    const { fixture, host, el } = await render();

    host.collapsed.set(true);
    narrow$.next({ matches: true, breakpoints: {} });
    await fixture.whenStable();
    expect(el.classList).not.toContain('mud-sidebar--compact');
    expect(host.collapsed()).toBe(true);

    narrow$.next({ matches: false, breakpoints: {} });
    await fixture.whenStable();
    expect(el.classList).toContain('mud-sidebar--compact');
  });

  it('toggle() flips the two-way collapsed model', async () => {
    const { fixture, host } = await render();
    const sidebar = fixture.debugElement.children[0].injector.get(MudSidebar);

    sidebar.toggle();
    await fixture.whenStable();
    expect(host.collapsed()).toBe(true);
  });

  it('warns in dev mode when the landmark has no name', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    @Component({ imports: [MudSidebar], template: `<mud-sidebar>x</mud-sidebar>` })
    class Unnamed {}

    const fixture = TestBed.createComponent(Unnamed);

    await fixture.whenStable();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('mud-sidebar: add an aria-label'));
    warn.mockRestore();
  });
});

// The compact rail hides every row label, so one shared tooltip (manual
// trigger, anchored per row) names whichever row has the pointer or focus.
// The last row is a bare tree parent: in a 68px rail it cannot show its
// children, so activating it must expand the sidebar.
@Component({
  imports: [MudSidebar, MudSidebarItem],
  template: `
    <mud-sidebar aria-label="Main" [(collapsed)]="collapsed">
      <a mud-sidebar-item href="#a"><svg icon></svg>Toate</a>
      <a mud-sidebar-item href="#b"><svg icon></svg>Schițe</a>
      <a mud-sidebar-item href="#c">Fără pictogramă</a>
      <button type="button" class="mud-tree-item mud-tree-node" aria-expanded="false" aria-level="1">Părinte</button>
      <button type="button" class="mud-tree-item mud-tree-node" aria-expanded="false" aria-level="1" aria-disabled="true">Blocat</button>
    </mud-sidebar>
  `,
})
class CompactHost {
  readonly collapsed = signal(true);
}

describe('MudSidebar compact rail', () => {
  beforeEach(() => {
    narrow$.next({ matches: false, breakpoints: {} });
    TestBed.configureTestingModule({
      providers: [{ provide: BreakpointObserver, useValue: { observe: () => narrow$ } }],
    });
  });

  async function renderCompact() {
    const fixture = TestBed.createComponent(CompactHost);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.mud-tree-item'));
    const bubble = () => document.querySelector('mud-tooltip-container');

    return { fixture, host: fixture.componentInstance, rows, bubble };
  }

  it('labels a hovered row with its own text', async () => {
    const { fixture, rows, bubble } = await renderCompact();

    rows[0].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await fixture.whenStable();
    expect(bubble()?.textContent).toContain('Toate');
  });

  it('re-anchors when the pointer moves straight to the next row', async () => {
    const { fixture, rows, bubble } = await renderCompact();

    rows[0].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    rows[1].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await fixture.whenStable();
    expect(bubble()?.textContent).toContain('Schițe');
    expect(document.querySelectorAll('mud-tooltip-container').length).toBe(1);
  });

  it('labels a focused row, including one without an icon', async () => {
    const { fixture, rows, bubble } = await renderCompact();

    rows[2].focus();
    await fixture.whenStable();
    expect(bubble()?.textContent).toContain('Fără pictogramă');
  });

  it('never duplicates the accessible name into aria-describedby', async () => {
    const { fixture, rows, bubble } = await renderCompact();

    rows[0].focus();
    await fixture.whenStable();
    expect(bubble()).not.toBeNull();
    expect(rows[0].hasAttribute('aria-describedby')).toBe(false);
  });

  it('hides on pointer leave, on blur, and when the sidebar expands', async () => {
    const { fixture, host, rows, bubble } = await renderCompact();
    const sidebar = rows[0].closest('mud-sidebar') as HTMLElement;

    rows[0].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await fixture.whenStable();
    expect(bubble()).not.toBeNull();
    sidebar.dispatchEvent(new PointerEvent('pointerleave'));
    await fixture.whenStable();
    expect(bubble()).toBeNull();

    rows[1].focus();
    await fixture.whenStable();
    expect(bubble()).not.toBeNull();
    rows[1].blur();
    await fixture.whenStable();
    expect(bubble()).toBeNull();

    rows[1].focus();
    await fixture.whenStable();
    expect(bubble()).not.toBeNull();
    host.collapsed.set(false);
    await fixture.whenStable();
    expect(bubble()).toBeNull();
  });

  it('shows nothing while expanded', async () => {
    const { fixture, host, rows, bubble } = await renderCompact();

    host.collapsed.set(false);
    await fixture.whenStable();
    rows[0].focus();
    await fixture.whenStable();
    expect(bubble()).toBeNull();
  });

  it('expands itself when an expandable tree parent is activated in compact', async () => {
    const { fixture, host, rows } = await renderCompact();

    rows[3].click();
    await fixture.whenStable();
    expect(host.collapsed()).toBe(false);
  });

  // aria-disabled keeps the parent focusable but inert; activating it must not
  // have the side effect of expanding the whole sidebar.
  it('stays compact when a disabled tree parent is clicked', async () => {
    const { fixture, host, rows } = await renderCompact();

    rows[4].click();
    await fixture.whenStable();
    expect(host.collapsed()).toBe(true);
  });

  // The tooltip can close itself (Escape, outside pointer, scroll-close) without
  // the sidebar hearing about it; the same row must still re-open it afterwards.
  it('re-opens on the same row after the tooltip dismissed itself', async () => {
    const { fixture, rows, bubble } = await renderCompact();

    rows[0].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await fixture.whenStable();
    expect(bubble()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(bubble()).toBeNull();

    rows[0].dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
    await fixture.whenStable();
    expect(bubble()?.textContent).toContain('Toate');
  });
});

// A compact rail hides every row below level 1 with display:none, but the
// CDK TreeKeyManager still walks them: ArrowDown under an expanded parent, or
// ArrowRight/* expanding one, would land focus on an invisible row (WCAG 2.4.7).
// The sidebar therefore expands first, in the CAPTURE phase, so the class is
// gone before the tree's own (bubbling) keydown handler moves focus.
@Component({
  imports: [MudSidebar],
  template: `
    <mud-sidebar aria-label="Main" [(collapsed)]="collapsed">
      <div class="mud-tree" data-testid="flat">
        <button type="button" class="mud-tree-item mud-tree-node" aria-level="1" aria-expanded="false">Părinte</button>
        <button type="button" class="mud-tree-item mud-tree-node" aria-level="1" aria-expanded="false" aria-disabled="true">Blocat</button>
        <button type="button" class="mud-tree-item mud-tree-node" aria-level="1">Frunză</button>
      </div>
      <div class="mud-tree" data-testid="open">
        <button type="button" class="mud-tree-item mud-tree-node" aria-level="1" aria-expanded="true">Deschis</button>
        <button type="button" class="mud-tree-item mud-tree-node" aria-level="2">Copil</button>
      </div>
    </mud-sidebar>
  `,
})
class KeyboardHost {
  readonly collapsed = signal(true);
}

describe('MudSidebar compact keyboard', () => {
  beforeEach(() => {
    narrow$.next({ matches: false, breakpoints: {} });
    TestBed.configureTestingModule({
      providers: [{ provide: BreakpointObserver, useValue: { observe: () => narrow$ } }],
    });
  });

  async function renderKeyboard() {
    const fixture = TestBed.createComponent(KeyboardHost);

    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const row = (text: string) =>
      Array.from(root.querySelectorAll<HTMLElement>('.mud-tree-node')).find((el) => el.textContent?.trim() === text)!;
    const press = async (target: HTMLElement, key: string, init: KeyboardEventInit = {}) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }));
      await fixture.whenStable();
    };

    return { fixture, host: fixture.componentInstance, root, row, press };
  }

  it('expands on ArrowRight or * on an expandable parent', async () => {
    for (const key of ['ArrowRight', '*']) {
      const { host, row, press } = await renderKeyboard();

      await press(row('Părinte'), key);
      expect(host.collapsed()).toBe(false);
    }
  });

  it('stays compact on ArrowRight on a disabled parent or a leaf', async () => {
    const { host, row, press } = await renderKeyboard();

    await press(row('Blocat'), 'ArrowRight');
    await press(row('Frunză'), 'ArrowRight');
    expect(host.collapsed()).toBe(true);
  });

  it('expands on navigation or typeahead inside a tree that has an expanded node', async () => {
    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'c']) {
      const { host, row, press } = await renderKeyboard();

      await press(row('Deschis'), key);
      expect(host.collapsed()).toBe(false);
    }
  });

  it('stays compact on navigation or typeahead in a tree with nothing expanded', async () => {
    const { host, row, press } = await renderKeyboard();

    for (const key of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'f']) await press(row('Părinte'), key);
    expect(host.collapsed()).toBe(true);
  });

  it('ignores modified keys and Space', async () => {
    const { host, row, press } = await renderKeyboard();

    await press(row('Deschis'), 'c', { ctrlKey: true });
    await press(row('Deschis'), 'c', { metaKey: true });
    await press(row('Deschis'), ' ');
    expect(host.collapsed()).toBe(true);
  });

  // The tree's own keydown handler (bubble phase, on the tree element) must
  // already see an extended rail, or its focus() lands on a display:none row.
  it('drops the compact class before the tree handles the key', async () => {
    const { root, row } = await renderKeyboard();
    const sidebar = root.querySelector('mud-sidebar') as HTMLElement;
    let compactWhenTreeSawIt: boolean | undefined;

    root.querySelector('[data-testid="open"]')!.addEventListener('keydown', () => {
      compactWhenTreeSawIt = sidebar.classList.contains('mud-sidebar--compact');
    });
    row('Deschis').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(compactWhenTreeSawIt).toBe(false);
  });
});
