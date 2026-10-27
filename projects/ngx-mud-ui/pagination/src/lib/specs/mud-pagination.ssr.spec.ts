import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudPagination } from '../mud-pagination.component';

@Component({
  imports: [MudPagination],
  template: `<mud-pagination [length]="200" [pageIndex]="9" />`,
})
class Host {}

let constructed: ReturnType<typeof vi.fn<() => void>>;

describe('MudPagination on the server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    constructed = vi.fn();

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor() {
          constructed();
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- stub only needs to satisfy the ResizeObserver shape
        observe(): void {}
        // eslint-disable-next-line @typescript-eslint/no-empty-function -- stub only needs to satisfy the ResizeObserver shape
        disconnect(): void {}
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializes the full 7-slot window with the current page marked', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const shown = Array.from(root.querySelectorAll('.mud-pagination__item > button')).map((b) =>
      b.classList.contains('mud-pagination__overflow') ? '…' : b.textContent!.trim(),
    );

    expect(shown.join(' ')).toBe('1 … 9 10 11 … 20');
    expect(root.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('10');
    expect(root.querySelector('.cdk-overlay-container')).toBeNull();
    expect(constructed).not.toHaveBeenCalled();
  });
});
