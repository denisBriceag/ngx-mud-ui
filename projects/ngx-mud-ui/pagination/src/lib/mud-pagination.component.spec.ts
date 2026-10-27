import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPagination } from './mud-pagination.component';
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';
import type { MudLabelsPartial } from 'ngx-mud-ui/i18n';
import type { MudPageEvent, MudPaginationSize } from './mud-pagination.types';

@Component({
  imports: [MudPagination],
  template: `
    <mud-pagination
      [length]="length()"
      [pageSize]="pageSize()"
      [(pageIndex)]="pageIndex"
      [disabled]="disabled()"
      [size]="size()"
      [aria-label]="label()"
      (page)="events.push($event)"
    />
  `,
})
class Host {
  readonly length = signal(200);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly disabled = signal(false);
  readonly size = signal<MudPaginationSize>('medium');
  readonly label = signal<string | undefined>(undefined);
  readonly events: MudPageEvent[] = [];
}

async function render(setup: (host: Host) => void = () => undefined) {
  const fixture = TestBed.createComponent(Host);

  setup(fixture.componentInstance);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();

  const root = fixture.nativeElement as HTMLElement;
  const paginator = fixture.debugElement.children[0].componentInstance as MudPagination;

  return {
    fixture,
    host: fixture.componentInstance,
    paginator,
    root,
    /** `1 … 4 5 6 … 20` as a person reads it. */
    shown: () =>
      Array.from(root.querySelectorAll<HTMLElement>('.mud-pagination__item > button'))
        .map((b) => (b.classList.contains('mud-pagination__overflow') ? '…' : b.textContent!.trim()))
        .join(' '),
    pageButton: (n: number) =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('.mud-pagination__page')).find((b) => b.textContent!.trim() === String(n)),
    prev: () => root.querySelector<HTMLButtonElement>('.mud-pagination__nav-button--previous'),
    next: () => root.querySelector<HTMLButtonElement>('.mud-pagination__nav-button--next'),
    settle: () => fixture.whenStable(),
  };
}

describe('MudPagination', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('renders the 7-slot window with the current page marked', async () => {
    const { shown, pageButton, root } = await render((h) => h.pageIndex.set(9));

    expect(shown()).toBe('1 … 9 10 11 … 20');
    expect(pageButton(10)!.getAttribute('aria-current')).toBe('page');
    expect(pageButton(10)!.classList.contains('mud-pagination__page--current')).toBe(true);
    expect(pageButton(9)!.hasAttribute('aria-current')).toBe(false);
    expect(root.querySelector('mud-pagination')!.classList.contains('mud-pagination')).toBe(true);
  });

  it.each([0, 5, 10])('renders nothing when length %i fits one page', async (length) => {
    const { root } = await render((h) => h.length.set(length));

    expect(root.querySelector('nav')).toBeNull();
  });

  it('hides Prev on the first page and Next on the last', async () => {
    const { prev, next, host, settle } = await render();

    expect(prev()).toBeNull();
    expect(next()).not.toBeNull();

    host.pageIndex.set(19);
    await settle();
    expect(prev()).not.toBeNull();
    expect(next()).toBeNull();
  });

  it('labels the landmark, pages and nav buttons from the labels provider', async () => {
    const { root, pageButton, prev, next } = await render((h) => h.pageIndex.set(4));

    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Pagination');
    expect(pageButton(5)!.getAttribute('aria-label')).toBe('Page 5 of 20');
    expect(prev()!.getAttribute('aria-label')).toBe('Previous page, go to page 4');
    expect(next()!.getAttribute('aria-label')).toBe('Next page, go to page 6');
    expect(prev()!.textContent).toContain('Previous');
    expect(root.querySelector('.mud-pagination__overflow')!.getAttribute('aria-label')).toBe('Show pages 2 to 3');
  });

  it('lets aria-label override the landmark name and keeps it off the host', async () => {
    const { root } = await render((h) => h.label.set('Rezultate'));

    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Rezultate');
    expect(root.querySelector('mud-pagination')!.hasAttribute('aria-label')).toBe(false);
  });

  it('page click updates pageIndex (two-way) and emits a page event', async () => {
    const { pageButton, host, settle } = await render();

    pageButton(3)!.click();
    await settle();

    expect(host.pageIndex()).toBe(2);
    expect(host.events).toEqual([{ pageIndex: 2, previousPageIndex: 0, pageSize: 10, length: 200 }]);
  });

  it('Prev / Next move by one and emit', async () => {
    const { prev, next, host, settle } = await render((h) => h.pageIndex.set(4));

    next()!.click();
    await settle();
    prev()!.click();
    await settle();
    prev()!.click();
    await settle();

    expect(host.pageIndex()).toBe(3);
    expect(host.events.map((e) => [e.previousPageIndex, e.pageIndex])).toEqual([
      [4, 5],
      [5, 4],
      [4, 3],
    ]);
  });

  // Regression: tracking slots by page number moved the button nodes sideways when the window
  // shifted, so the current-page background transition played on two moving buttons (flicker).
  // Slots are tracked by position: the centre button stays the centre button, only its number changes.
  it('keeps the current page on the same button when the window shifts', async () => {
    const { next, root, settle } = await render((h) => h.pageIndex.set(9));
    const before = root.querySelector('.mud-pagination__page--current');

    next()!.click();
    await settle();

    const after = root.querySelector('.mud-pagination__page--current');

    expect(after?.textContent?.trim()).toBe('11');
    expect(after).toBe(before);
  });

  it('moves focus to the page that was clicked once the window shifts under it', async () => {
    const { pageButton, root, settle } = await render((h) => h.pageIndex.set(9));

    pageButton(11)!.focus();
    pageButton(11)!.click(); // → 1 … 10 11 12 … 20: the focused slot now shows 12
    await settle();

    const current = root.querySelector('.mud-pagination__page--current');

    expect(current?.textContent?.trim()).toBe('11');
    expect(document.activeElement).toBe(current);
  });

  it('does not emit when the current page is clicked', async () => {
    const { pageButton, host, settle } = await render();

    pageButton(1)!.click();
    await settle();
    expect(host.events).toEqual([]);
  });

  it('does not emit on input changes', async () => {
    const { host, settle } = await render();

    host.pageIndex.set(7);
    host.length.set(500);
    host.pageSize.set(25);
    await settle();
    expect(host.events).toEqual([]);
  });

  it('clamps a past-the-end pageIndex for display without writing it back', async () => {
    const { host, shown, settle } = await render((h) => h.pageIndex.set(50));

    expect(shown()).toBe('1 … 16 17 18 19 20');
    await settle();
    expect(host.pageIndex()).toBe(50);
    expect(host.events).toEqual([]);
  });

  // Review Focus 1
  it('normalises garbage inputs', async () => {
    const { host, shown, paginator, settle } = await render((h) => {
      h.length.set(Number.NaN);
    });

    expect(shown()).toBe('');
    expect(paginator.getNumberOfPages()).toBe(0);
    paginator.nextPage();
    paginator.lastPage();
    expect(host.events).toEqual([]);

    host.length.set(-5);
    await settle();
    expect(paginator.getNumberOfPages()).toBe(0);

    host.length.set(30);
    host.pageSize.set(0);
    await settle();
    expect(paginator.getNumberOfPages()).toBe(30); // pageSize 0 is treated as 1

    host.pageSize.set(10);
    host.pageIndex.set(-3);
    await settle();
    expect(paginator._current()).toBe(0);

    host.pageIndex.set(1.7);
    await settle();
    expect(paginator._current()).toBe(1);

    host.pageIndex.set(Number.NaN);
    await settle();
    expect(paginator._current()).toBe(0);
    expect(shown()).toBe('1 2 3');
  });

  it('disabled disables every control and blocks clicks', async () => {
    const { root, host, settle } = await render((h) => {
      h.pageIndex.set(9);
      h.disabled.set(true);
    });
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('nav button'));

    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => b.disabled)).toBe(true);

    buttons[0].click();
    await settle();
    expect(host.events).toEqual([]);
  });

  it('renders a hidden measuring probe with both nav labels and no buttons', async () => {
    const { root } = await render((h) => h.pageIndex.set(9));
    const probe = root.querySelector('.mud-pagination__probe')!;

    expect(probe.getAttribute('aria-hidden')).toBe('true');
    expect(probe.querySelector('button')).toBeNull();
    expect(probe.querySelector('[data-probe="previous"]')!.textContent).toContain('Previous');
    expect(probe.querySelector('[data-probe="next"]')!.textContent).toContain('Next');
  });

  it('size small adds the modifier class', async () => {
    const { root } = await render((h) => h.size.set('small'));

    expect(root.querySelector('mud-pagination')!.classList.contains('mud-pagination--small')).toBe(true);
  });

  it('public methods navigate, emit, and no-op at the edges', async () => {
    const { paginator, host, settle } = await render();

    expect(paginator.hasPreviousPage()).toBe(false);
    expect(paginator.hasNextPage()).toBe(true);
    expect(paginator.getNumberOfPages()).toBe(20);

    paginator.previousPage();
    paginator.firstPage();
    expect(host.events).toEqual([]);

    paginator.lastPage();
    await settle();
    expect(host.pageIndex()).toBe(19);
    expect(paginator.hasNextPage()).toBe(false);

    paginator.nextPage();
    paginator.firstPage();
    paginator.nextPage();
    await settle();
    expect(host.events.map((e) => e.pageIndex)).toEqual([19, 0, 1]);
  });

  it('initialized emits once the component has initialised', async () => {
    const { paginator } = await render();
    let fired = false;

    paginator.initialized.subscribe(() => (fired = true));
    expect(fired).toBe(true);
  });

  it('follows a signal labels provider live', async () => {
    const lang = signal<MudLabelsPartial>({ pagination: { next: 'Următor' } });

    TestBed.configureTestingModule({ providers: [provideMudLabels(lang)] });
    const { next, settle } = await render();

    expect(next()!.textContent).toContain('Următor');
    lang.set({ pagination: { next: 'Weiter' } });
    await settle();
    expect(next()!.textContent).toContain('Weiter');
  });

  it('ships English defaults with no provider', async () => {
    const { root } = await render();

    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Pagination');
    expect(root.querySelector('.mud-pagination__nav-button--next')!.getAttribute('aria-label')).toBe('Next page, go to page 2');
    expect(root.querySelector('.mud-pagination__page')!.getAttribute('aria-label')).toBe('Page 1 of 20');
    expect(root.querySelector('.mud-pagination__overflow')!.getAttribute('aria-label')).toMatch(/^Show pages \d+ to \d+$/);
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { root } = await render();

    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe(MUD_LABELS_RO.pagination!.navigation);
    expect(root.querySelector('.mud-pagination__page')!.getAttribute('aria-label')).toBe(MUD_LABELS_RO.pagination!.pageAria!(1, 20));
  });

  it('an aria-label input wins over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { root } = await render((h) => h.label.set('Mine'));

    expect(root.querySelector('nav')!.getAttribute('aria-label')).toBe('Mine');
  });

  it('does not group thousands in page buttons or their names', async () => {
    const { pageButton } = await render((h) => {
      h.length.set(20000);
      h.pageIndex.set(999);
    });
    const button = pageButton(1000)!;

    expect(button).toBeTruthy();
    expect(button.getAttribute('aria-label')).toBe('Page 1000 of 2000');
    expect(button.getAttribute('aria-label')).toContain(button.textContent!.trim());
  });

  it('page buttons format in the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });
    const { root } = await render();

    expect(root.querySelector('.mud-pagination__page')!.textContent!.trim()).toBe('١');
  });
});
