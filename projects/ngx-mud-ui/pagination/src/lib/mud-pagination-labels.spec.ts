import { isSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_PAGINATION_LABELS, provideMudPaginationLabels } from './mud-pagination-labels';
import type { MudPaginationLabels } from './mud-pagination-labels';

function currentLabels(): MudPaginationLabels {
  const value = TestBed.inject(MUD_PAGINATION_LABELS);

  return isSignal(value) ? value() : value;
}

describe('mud-pagination-labels', () => {
  it('ships English defaults with no provider', () => {
    const labels = currentLabels();

    expect(labels.navigation).toBe('Pagination');
    expect(labels.previous).toBe('Previous');
    expect(labels.next).toBe('Next');
    expect(labels.previousAria(4)).toBe('Previous page, go to page 4');
    expect(labels.nextAria(6)).toBe('Next page, go to page 6');
    expect(labels.pageAria(5, 20)).toBe('Page 5 of 20');
    expect(labels.overflowAria(2, 3)).toBe('Show pages 2 to 3');
  });

  it('merges a partial override over the defaults', () => {
    TestBed.configureTestingModule({ providers: [provideMudPaginationLabels({ next: 'Următor' })] });

    expect(currentLabels().next).toBe('Următor');
    expect(currentLabels().previous).toBe('Previous');
  });

  it('tracks a signal override live', () => {
    const lang = signal<Partial<MudPaginationLabels>>({ navigation: 'Navigare pagini' });

    TestBed.configureTestingModule({ providers: [provideMudPaginationLabels(lang)] });
    expect(currentLabels().navigation).toBe('Navigare pagini');

    lang.set({ navigation: 'Seitennavigation' });
    expect(currentLabels().navigation).toBe('Seitennavigation');
    expect(currentLabels().next).toBe('Next');
  });

  it('accepts a factory', () => {
    TestBed.configureTestingModule({
      providers: [provideMudPaginationLabels(() => ({ pageAria: (page, total) => `Pagina ${page} din ${total}` }))],
    });

    expect(currentLabels().pageAria(3, 9)).toBe('Pagina 3 din 9');
  });
});
