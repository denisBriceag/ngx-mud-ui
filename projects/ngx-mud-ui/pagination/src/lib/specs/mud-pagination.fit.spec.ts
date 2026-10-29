import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPagination } from '../mud-pagination.component';
import type { MudPaginationSize } from '../mud-pagination.types';

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  disconnected = false;

  constructor(readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- FakeResizeObserver only needs to satisfy the ResizeObserver shape
  observe(): void {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- FakeResizeObserver only needs to satisfy the ResizeObserver shape
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true;
  }

  fire(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

@Component({
  imports: [MudPagination],
  template: `<mud-pagination [length]="200" [pageIndex]="pageIndex()" [size]="size()" />`,
})
class Host {
  readonly size = signal<MudPaginationSize>('md');
  // Default 9 keeps every pre-existing test unchanged (both nav buttons rendered).
  readonly pageIndex = signal(9);
}

// Medium fallbacks: item 40, gap 24, inner gap 16; each probe nav-button stubbed to 100px.
// Required = 100 + 100 + 7·40 + 6·16 + 2·24 = 624.
const NAV_WIDTH = 100;
const REQUIRED_MEDIUM = 624;

let hostWidth = 0;
let prevWidth = NAV_WIDTH;
let nextWidth = NAV_WIDTH;
let restoreOffsetWidth: PropertyDescriptor | undefined;
let restoreClientWidth: PropertyDescriptor | undefined;

async function render() {
  const fixture = TestBed.createComponent(Host);

  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();

  const pagination = fixture.nativeElement.querySelector('mud-pagination') as HTMLElement;

  return {
    fixture,
    slots: () => pagination.querySelectorAll('.mud-pagination__item').length,
    resize: async (width: number) => {
      hostWidth = width;
      FakeResizeObserver.instances.at(-1)!.fire();
      await fixture.whenStable();
    },
  };
}

describe('MudPagination fitting', () => {
  beforeEach(() => {
    FakeResizeObserver.instances = [];
    hostWidth = 1000;
    prevWidth = NAV_WIDTH;
    nextWidth = NAV_WIDTH;
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    restoreOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    restoreClientWidth = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');
    // jsdom lays nothing out: stub the probe widths the fit calculation reads.
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get(this: HTMLElement) {
        if (this.dataset['probe'] === 'previous') return prevWidth;

        if (this.dataset['probe'] === 'next') return nextWidth;

        return 0;
      },
    });
    Object.defineProperty(Element.prototype, 'clientWidth', {
      configurable: true,
      get(this: Element) {
        return this.classList.contains('mud-pagination') ? hostWidth : 0;
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();

    if (restoreOffsetWidth) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', restoreOffsetWidth);

    if (restoreClientWidth) Object.defineProperty(Element.prototype, 'clientWidth', restoreClientWidth);

    document.body.replaceChildren();
  });

  it('shows 7 slots when they fit and 5 when they do not', async () => {
    const { slots, resize } = await render();

    await resize(1000);
    expect(slots()).toBe(7);

    await resize(600);
    expect(slots()).toBe(5);

    await resize(1000);
    expect(slots()).toBe(7);
  });

  it('switches exactly at the required width without oscillating', async () => {
    const { slots, resize } = await render();

    await resize(REQUIRED_MEDIUM);
    expect(slots()).toBe(7);

    await resize(REQUIRED_MEDIUM - 1);
    expect(slots()).toBe(5);

    // A second observation at the same width must not flip it back.
    await resize(REQUIRED_MEDIUM - 1);
    expect(slots()).toBe(5);
  });

  it('uses the small rung metrics', async () => {
    const { fixture, slots, resize } = await render();

    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();

    // Small: item 32, gap 4, inner gap 8 → 2·100 + 224 + 48 + 8 = 480.
    await resize(480);
    expect(slots()).toBe(7);
    await resize(479);
    expect(slots()).toBe(5);
  });

  // Review Focus 3
  it('ignores a zero-width host', async () => {
    const { slots, resize } = await render();

    await resize(1000);
    await resize(0);
    expect(slots()).toBe(7);

    await resize(500);
    await resize(0);
    expect(slots()).toBe(5);
  });

  // F1 fix: the nav term is the SUM of the probe's real previous+next widths, not
  // 2·max(rendered nav-button widths) — a worst-case estimate that under-measured page 1
  // (only Next rendered, and Next is narrower than Previous) and never re-measured on
  // navigation, so the row could overflow after one Next click.
  it('measures the real previous+next widths on every page, not worst-case max', async () => {
    const { fixture, slots, resize } = await render();

    // sum 200 (matches REQUIRED_MEDIUM); 2·max(130, 70) = 260 would wrongly require 684.
    prevWidth = 130;
    nextWidth = 70;
    fixture.componentInstance.pageIndex.set(0); // first page: Prev hidden, only Next rendered
    await fixture.whenStable();

    await resize(REQUIRED_MEDIUM);
    expect(slots()).toBe(7);

    await resize(REQUIRED_MEDIUM - 1);
    expect(slots()).toBe(5);

    await resize(REQUIRED_MEDIUM);
    fixture.componentInstance.pageIndex.set(1); // Prev now also rendered; probe widths unchanged
    await fixture.whenStable();
    expect(slots()).toBe(7);
  });

  it('disconnects the observer on destroy', async () => {
    const { fixture } = await render();
    const observer = FakeResizeObserver.instances.at(-1)!;

    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  it('never creates an observer on the server', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    expect(FakeResizeObserver.instances.length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.mud-pagination__item').length).toBe(7);
  });
});
