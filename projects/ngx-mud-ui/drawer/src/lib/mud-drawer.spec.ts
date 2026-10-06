import type { TemplateRef } from '@angular/core';
import { ApplicationRef, Component, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_DIALOG_CONFIG } from '@angular/cdk/dialog';
import { MudDrawer } from './mud-drawer.service';
import { MudDrawerRef } from './mud-drawer-ref';
import { MUD_DRAWER_DATA } from './mud-drawer-config';
import type { MudDrawerPosition } from './mud-drawer-config';
import { MudDrawerTitle, MudDrawerClose } from './mud-drawer-directives';

interface GreetingData {
  name: string;
  capture?: (ref: MudDrawerRef<string>) => void;
}

@Component({ template: `<p class="greeting">Hello {{ data.name }}</p>` })
class GreetingDrawer {
  readonly data = inject<GreetingData>(MUD_DRAWER_DATA);
  readonly ref = inject<MudDrawerRef<string>>(MudDrawerRef);

  constructor() {
    this.data.capture?.(this.ref);
  }
}

@Component({ template: `<ng-template #tpl><p class="tpl-content">Template body</p></ng-template>` })
class TplHost {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
}

@Component({
  imports: [MudDrawerTitle, MudDrawerClose],
  template: `
    <h2 mudDrawerTitle>Filtre</h2>
    <button class="x" aria-label="Închide" mudDrawerClose>×</button>
    <button class="apply" [mudDrawerClose]="'applied'">Aplică</button>
  `,
})
class FiltersDrawer {}

@Component({
  imports: [MudDrawerClose],
  template: `<ng-template #tpl let-data
    ><button class="tpl-close" [mudDrawerClose]="data.choice">Close</button></ng-template
  >`,
})
class TplWithCloseHost {
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
}

function overlayRoot(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

function container(): HTMLElement {
  return overlayRoot().querySelector('mud-drawer-container') as HTMLElement;
}

async function stable(): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
}

describe('MudDrawer', () => {
  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens a component in a right drawer by default', async () => {
    TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'Ana' } });
    await stable();

    expect(container().classList.contains('drawer')).toBe(true);
    expect(container().classList.contains('drawer--right')).toBe(true);
    expect(container().getAttribute('role')).toBe('dialog');
    expect(container().querySelector('.greeting')?.textContent).toContain('Hello Ana');
  });

  it('opens a TemplateRef', async () => {
    const fixture = TestBed.createComponent(TplHost);

    await fixture.whenStable();
    TestBed.inject(MudDrawer).open(fixture.componentInstance.tpl());
    await stable();

    expect(overlayRoot().querySelector('.tpl-content')?.textContent).toContain('Template body');
  });

  it('injects the exact MudDrawerRef instance that open() returned', async () => {
    let injectedRef: MudDrawerRef<string> | undefined;
    const ref = TestBed.inject(MudDrawer).open<string>(GreetingDrawer, {
      data: { name: 'Ana', capture: (r: MudDrawerRef<string>) => (injectedRef = r) },
    });

    await stable();

    expect(injectedRef).toBe(ref);
  });

  it('close(result) emits reason action and removes the drawer', async () => {
    const ref = TestBed.inject(MudDrawer).open<string>(GreetingDrawer, { data: { name: 'x' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    ref.close('saved');
    await stable();

    expect(outcomes).toEqual([{ result: 'saved', reason: 'action' }]);
    expect(container()).toBeNull();
  });

  // The global position strategy writes flex alignment onto the pane's wrapper;
  // these values are what pins the panel to its edge.
  const EDGES: [MudDrawerPosition, string, string][] = [
    ['right', 'flex-end', 'flex-start'],
    ['left', 'flex-start', 'flex-start'],
    ['top', 'flex-start', 'flex-start'],
    ['bottom', 'flex-start', 'flex-end'],
  ];

  for (const [position, justify, align] of EDGES) {
    it(`pins a ${position} drawer to its edge`, async () => {
      TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' }, position });
      await stable();

      const pane = overlayRoot().querySelector('.cdk-overlay-pane') as HTMLElement;
      const wrapper = pane.parentElement as HTMLElement;

      expect(container().classList.contains(`drawer--${position}`)).toBe(true);
      expect(pane.classList.contains('mud-drawer-panel')).toBe(true);
      expect(pane.classList.contains(`mud-drawer-panel--${position}`)).toBe(true);
      expect(wrapper.style.justifyContent).toBe(justify);
      expect(wrapper.style.alignItems).toBe(align);
    });
  }

  // The size lives on the CDK pane (as in MatDialog), so percentages resolve
  // against the viewport — on the drawer itself they would be cyclic and collapse.
  function panes(): HTMLElement[] {
    return Array.from(overlayRoot().querySelectorAll<HTMLElement>('.cdk-overlay-pane'));
  }

  it('sizes left/right panes 382px x 100% and top/bottom panes 100% x auto by default', async () => {
    const drawer = TestBed.inject(MudDrawer);

    drawer.open(GreetingDrawer, { data: { name: 'x' }, position: 'left' });
    drawer.open(GreetingDrawer, { data: { name: 'y' }, position: 'bottom' });
    await stable();

    const [left, bottom] = panes();

    expect([left.style.width, left.style.height]).toEqual(['382px', '100%']);
    expect([bottom.style.width, bottom.style.height]).toEqual(['100%', '']);
  });

  it('applies custom width and height to the pane', async () => {
    const drawer = TestBed.inject(MudDrawer);

    drawer.open(GreetingDrawer, { data: { name: 'x' }, position: 'right', width: '480px' });
    drawer.open(GreetingDrawer, { data: { name: 'y' }, position: 'top', height: '240px' });
    await stable();

    const [right, top] = panes();

    expect(right.style.width).toBe('480px');
    expect(top.style.height).toBe('240px');
  });

  it('passes percentage sizes through to the pane, where they resolve against the viewport', async () => {
    const drawer = TestBed.inject(MudDrawer);

    drawer.open(GreetingDrawer, { data: { name: 'x' }, width: '50%' });
    drawer.open(GreetingDrawer, { data: { name: 'y' }, position: 'bottom', height: '50%' });
    await stable();

    const [right, bottom] = panes();

    expect(right.style.width).toBe('50%');
    expect(bottom.style.height).toBe('50%');
  });

  it('blank width/height fall back to defaults', async () => {
    const drawer = TestBed.inject(MudDrawer);

    drawer.open(GreetingDrawer, { data: { name: 'x' }, width: '  ' });
    drawer.open(GreetingDrawer, { data: { name: 'y' }, position: 'bottom', height: '' });
    await stable();

    const [right, bottom] = panes();

    expect(right.style.width).toBe('382px');
    expect(bottom.style.height).toBe('');
  });

  it('ignores width for top/bottom and height for left/right', async () => {
    const drawer = TestBed.inject(MudDrawer);

    drawer.open(GreetingDrawer, { data: { name: 'x' }, position: 'right', height: '200px' });
    drawer.open(GreetingDrawer, { data: { name: 'y' }, position: 'bottom', width: '600px' });
    await stable();

    const [right, bottom] = panes();

    expect(right.style.height).toBe('100%');
    expect(bottom.style.width).toBe('100%');
  });

  it('ignores an app-wide DEFAULT_DIALOG_CONFIG that would unpin or unmask the drawer', async () => {
    // A dialog-oriented default (80vw cap, no backdrop, min sizes) must not leak in:
    // the cap alone turns off CDK's flush layout and narrows a bottom drawer.
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DEFAULT_DIALOG_CONFIG,
          useValue: { maxWidth: '80vw', maxHeight: '80vh', minWidth: '300px', minHeight: '200px', hasBackdrop: false },
        },
      ],
    });
    TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' }, position: 'bottom' });
    await stable();

    const pane = overlayRoot().querySelector('.cdk-overlay-pane') as HTMLElement;

    expect([pane.style.maxWidth, pane.style.maxHeight]).toEqual(['100%', '100%']);
    expect([pane.style.minWidth, pane.style.minHeight]).toEqual(['', '']);
    expect(document.querySelector('.cdk-overlay-backdrop.mud-dialog-backdrop')).toBeTruthy();
  });

  it('uses the dialog backdrop class', async () => {
    TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' } });
    await stable();

    expect(document.querySelector('.cdk-overlay-backdrop')?.classList.contains('mud-dialog-backdrop')).toBe(true);
  });

  it('merges panelClass after the drawer panel classes', async () => {
    TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' }, panelClass: ['a', 'b'] });
    await stable();

    const pane = overlayRoot().querySelector('.cdk-overlay-pane') as HTMLElement;

    expect(['mud-drawer-panel', 'a', 'b'].every((c) => pane.classList.contains(c))).toBe(true);
  });

  it('backdrop click closes with reason backdrop', async () => {
    const ref = TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await stable();
    (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
    await stable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'backdrop' }]);
  });

  it('Escape closes with reason escape', async () => {
    const ref = TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await stable();
    container().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await stable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'escape' }]);
  });

  it('Escape with a modifier key does not close', async () => {
    const ref = TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' } });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await stable();
    container().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', shiftKey: true, bubbles: true }));
    await stable();

    expect(outcomes).toEqual([]);
    expect(container()).toBeTruthy();
  });

  it('disableClose suppresses backdrop and Escape', async () => {
    const ref = TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' }, disableClose: true });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await stable();
    (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
    container().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await stable();

    expect(outcomes).toEqual([]);
    expect(container()).toBeTruthy();
  });

  it('config.ariaLabel sets aria-label on the container', async () => {
    TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' }, ariaLabel: 'Filtre' });
    await stable();

    expect(container().getAttribute('aria-label')).toBe('Filtre');
  });

  // CDK-owned focus behavior — one smoke assertion, not re-tested in depth.
  it('moves focus into the drawer on open and restores it on close', async () => {
    const button = document.createElement('button');

    document.body.appendChild(button);
    button.focus();
    const ref = TestBed.inject(MudDrawer).open(GreetingDrawer, { data: { name: 'x' } });

    await stable();
    expect(overlayRoot().contains(document.activeElement)).toBe(true);

    ref.close();
    await stable();
    expect(document.activeElement).toBe(button);
    button.remove();
  });

  it('wires the mudDrawerTitle id into the container aria-labelledby', async () => {
    TestBed.inject(MudDrawer).open(FiltersDrawer);
    await stable();

    const title = container().querySelector('h2') as HTMLElement;

    expect(title.id).toMatch(/^mud-drawer-title-/);
    expect(container().getAttribute('aria-labelledby')).toBe(title.id);
  });

  it('config.ariaLabel suppresses aria-labelledby even with a mudDrawerTitle', async () => {
    TestBed.inject(MudDrawer).open(FiltersDrawer, { ariaLabel: 'Filtre produse' });
    await stable();

    expect(container().getAttribute('aria-label')).toBe('Filtre produse');
    expect(container().hasAttribute('aria-labelledby')).toBe(false);
  });

  it('mudDrawerClose closes with its bound result and reason action', async () => {
    const ref = TestBed.inject(MudDrawer).open<string>(FiltersDrawer);
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await stable();
    (container().querySelector('.apply') as HTMLButtonElement).click();
    await stable();

    expect(outcomes).toEqual([{ result: 'applied', reason: 'action' }]);
  });

  it('a bare mudDrawerClose (the × button) closes with an undefined result', async () => {
    const ref = TestBed.inject(MudDrawer).open<string>(FiltersDrawer);
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await stable();
    (container().querySelector('.x') as HTMLButtonElement).click();
    await stable();

    expect(outcomes).toEqual([{ result: undefined, reason: 'action' }]);
  });

  it('mudDrawerClose defaults to type="button"', async () => {
    TestBed.inject(MudDrawer).open(FiltersDrawer);
    await stable();

    expect(container().querySelector('.apply')?.getAttribute('type')).toBe('button');
  });

  it('a [mudDrawerClose] inside an opened TemplateRef closes with its result', async () => {
    // Pins the embedded-view injector path: CDK builds a template's injector
    // differently from a component's.
    const fixture = TestBed.createComponent(TplWithCloseHost);

    await fixture.whenStable();
    const ref = TestBed.inject(MudDrawer).open<string>(fixture.componentInstance.tpl(), {
      data: { choice: 'accepted' },
    });
    const outcomes: unknown[] = [];

    ref.closed.subscribe((o) => outcomes.push(o));
    await stable();
    (overlayRoot().querySelector('.tpl-close') as HTMLButtonElement).click();
    await stable();

    expect(outcomes).toEqual([{ result: 'accepted', reason: 'action' }]);
  });
});
