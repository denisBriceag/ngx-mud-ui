import { Component, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudMegaMenuOrigin } from './mud-mega-menu-origin.directive';
import { MudMegaMenu } from './mud-mega-menu.component';
import { MudMegaMenuColumn } from './mud-mega-menu-column.component';
import { MudMegaMenuLink } from './mud-mega-menu-link.directive';
import { MudMegaMenuTrigger } from './mud-mega-menu-trigger.component';

@Component({
  imports: [MudMegaMenuOrigin],
  template: `<header mudMegaMenuOrigin class="bar"><span>nav</span></header>`,
})
class Host {
  readonly origin = viewChild.required(MudMegaMenuOrigin);
}

@Component({
  imports: [MudMegaMenuOrigin, MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <header mudMegaMenuOrigin class="bar">
      <button class="t1" [mudMegaMenuTriggerFor]="m1">One</button>
      <button class="t2" [mudMegaMenuTriggerFor]="m2">Two</button>
    </header>
    <mud-mega-menu #m1>
      <mud-mega-menu-column heading="A"><a mudMegaMenuLink href="#a">A</a></mud-mega-menu-column>
    </mud-mega-menu>
    <mud-mega-menu #m2>
      <mud-mega-menu-column heading="B"><a mudMegaMenuLink href="#b">B</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class TwoTriggers {
  readonly origin = viewChild.required(MudMegaMenuOrigin);
  readonly triggers = viewChildren(MudMegaMenuTrigger);
}

@Component({
  imports: [MudMegaMenu, MudMegaMenuColumn, MudMegaMenuLink, MudMegaMenuTrigger],
  template: `
    <button [mudMegaMenuTriggerFor]="m">Alone</button>
    <mud-mega-menu #m>
      <mud-mega-menu-column heading="A"><a mudMegaMenuLink href="#a">A</a></mud-mega-menu-column>
    </mud-mega-menu>
  `,
})
class NoOrigin {}

// Drives the no-origin scroll follow: the stubbed host rect is mutable.
async function openNoOrigin() {
  const fixture = TestBed.createComponent(NoOrigin);

  await fixture.whenStable();
  const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  const rect = { x: 10, y: 0, top: 0, left: 10, right: 90, bottom: 72, width: 80, height: 72, toJSON: () => ({}) };

  vi.spyOn(trigger, 'getBoundingClientRect').mockImplementation(() => rect as DOMRect);
  trigger.click();
  await fixture.whenStable();

  return { fixture, trigger, rect, instance: fixture.debugElement.query((d) => d.nativeElement === trigger).injector.get(MudMegaMenuTrigger) };
}

const pane = () => document.querySelector<HTMLElement>('.cdk-overlay-container .cdk-overlay-pane');
const panels = () => document.querySelectorAll('.cdk-overlay-container nav.mega-menu');

// The runner's iframe has no layout: give the origin a width and drive ResizeObserver by hand.
function stubLayout(origin: HTMLElement, width: number) {
  const rect = { x: 0, y: 0, top: 0, left: 0, right: width, bottom: 72, width, height: 72, toJSON: () => ({}) } as DOMRect;

  vi.spyOn(origin, 'getBoundingClientRect').mockImplementation(() => ({ ...rect, width, right: width }));

  return (next: number) => {
    width = next;
  };
}

describe('MudMegaMenuOrigin', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('exposes its host element and starts with no open trigger', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    const origin = fixture.componentInstance.origin();

    expect(origin._element.nativeElement).toBe(fixture.nativeElement.querySelector('header.bar'));
    expect(origin._openTrigger).toBeNull();
  });

  it('sizes the overlay pane to the origin width and tracks the open trigger', async () => {
    const fixture = TestBed.createComponent(TwoTriggers);

    await fixture.whenStable();
    const originEl = fixture.nativeElement.querySelector('header.bar') as HTMLElement;

    stubLayout(originEl, 1280);
    (fixture.nativeElement.querySelector('.t1') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(pane()!.style.width).toBe('1280px');
    expect(fixture.componentInstance.origin()._openTrigger).toBe(fixture.componentInstance.triggers()[0]);
  });

  it('caps the panel to the space under the origin so a tall panel scrolls instead of leaving the viewport', async () => {
    const fixture = TestBed.createComponent(TwoTriggers);

    await fixture.whenStable();
    stubLayout(fixture.nativeElement.querySelector('header.bar') as HTMLElement, 1280);
    // The runner iframe has a 0x0 viewport, which would collapse CDK's bounding box; give it a real one.
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1280);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
    (fixture.nativeElement.querySelector('.t1') as HTMLButtonElement).click();
    await fixture.whenStable();

    // Flexible dimensions: CDK sizes its bounding box to the room below the origin (bottom 72).
    const box = document.querySelector<HTMLElement>('.cdk-overlay-connected-position-bounding-box')!;

    expect(box.style.height).toBe('696px');
    expect(pane()!.style.width).toBe('1280px');
  });

  it('re-measures the pane width when the origin resizes', async () => {
    const RealResizeObserver = globalThis.ResizeObserver;
    let fire: (() => void) | undefined;

    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        fire = () => callback([], this as unknown as ResizeObserver);
      }

      observe(): void {
        // the test fires the callback through `fire`
      }

      unobserve(): void {
        // see observe
      }

      disconnect(): void {
        fire = undefined;
      }
    };

    try {
      const fixture = TestBed.createComponent(TwoTriggers);

      await fixture.whenStable();
      const originEl = fixture.nativeElement.querySelector('header.bar') as HTMLElement;
      const setWidth = stubLayout(originEl, 1280);

      (fixture.nativeElement.querySelector('.t1') as HTMLButtonElement).click();
      await fixture.whenStable();
      expect(pane()!.style.width).toBe('1280px');

      setWidth(960);
      fire!();
      expect(pane()!.style.width).toBe('960px');

      fixture.componentInstance.triggers()[0].close(false);
      expect(fire).toBeUndefined(); // observer disconnected on close
    } finally {
      globalThis.ResizeObserver = RealResizeObserver;
    }
  });

  it('opening a sibling trigger closes the current panel first (one panel per origin)', async () => {
    const fixture = TestBed.createComponent(TwoTriggers);

    await fixture.whenStable();
    const [t1, t2] = fixture.componentInstance.triggers();
    const closedFromT1: number[] = [];

    t1.closed.subscribe(() => closedFromT1.push(1));
    (fixture.nativeElement.querySelector('.t1') as HTMLButtonElement).click();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('.t2') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(panels().length).toBe(1);
    expect(panels()[0].getAttribute('aria-labelledby')).toBe(fixture.nativeElement.querySelector('.t2').id);
    expect(t1._isOpen()).toBe(false);
    expect(t2._isOpen()).toBe(true);
    expect(closedFromT1).toEqual([1]);
    expect(fixture.componentInstance.origin()._openTrigger).toBe(t2);
  });

  it('without an origin the pane spans the viewport below the trigger', async () => {
    const fixture = TestBed.createComponent(NoOrigin);

    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 10, y: 0, top: 0, left: 10, right: 90, bottom: 72, width: 80, height: 72, toJSON: () => ({}),
    } as DOMRect);
    trigger.click();
    await fixture.whenStable();

    expect(pane()!.style.width).toBe('100vw');
    expect(pane()!.style.marginLeft).toBe('0px');
    expect(pane()!.style.marginTop).toBe('72px');
    expect(pane()!.style.maxHeight).toBe(`${window.innerHeight - 72}px`);
  });

  it('without an origin the pane follows page scroll (scroll re-measures the button)', async () => {
    const { rect } = await openNoOrigin();

    rect.bottom = 40;
    window.dispatchEvent(new Event('scroll'));

    expect(pane()!.style.marginTop).toBe('40px');
    expect(pane()!.style.maxHeight).toBe(`${window.innerHeight - 40}px`);
  });

  it('registers scroll and resize listeners on open and removes both on close', async () => {
    const add = vi.spyOn(window, 'addEventListener');
    const remove = vi.spyOn(window, 'removeEventListener');
    const { instance } = await openNoOrigin();
    // CDK's viewport ruler also listens on window; ours is the named `_refit` arrow.
    const refit = (type: string, spy: typeof add) => spy.mock.calls.find(([t, fn]) => t === type && (fn as { name: string }).name === '_refit')?.[1];

    expect(refit('scroll', add)).toBeTypeOf('function');
    expect(refit('resize', add)).toBe(refit('scroll', add));

    instance.close(false);

    expect(refit('scroll', remove)).toBe(refit('scroll', add));
    expect(refit('resize', remove)).toBe(refit('resize', add));
  });

  it('a scroll after close touches nothing and throws nothing', async () => {
    const { instance, trigger, rect } = await openNoOrigin();

    instance.close(false);
    rect.bottom = 10;
    const measure = trigger.getBoundingClientRect as unknown as ReturnType<typeof vi.fn>;

    measure.mockClear();

    expect(() => window.dispatchEvent(new Event('scroll'))).not.toThrow();
    expect(measure).not.toHaveBeenCalled();
  });
});
