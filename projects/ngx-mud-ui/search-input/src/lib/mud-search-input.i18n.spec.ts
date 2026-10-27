import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudSearchInput } from './mud-search-input.component';

@Component({
  imports: [MudSearchInput],
  template: `<mud-search-input withButton clearable aria-label="Căutare" [value]="'x'" [submitLabel]="submit()" [clearLabel]="clear()" />`,
})
class Host {
  readonly submit = signal<string | undefined>(undefined);
  readonly clear = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    submit: () => el.querySelector('.input-field__submit')?.getAttribute('aria-label'),
    clear: () => el.querySelector('.input-field__search-clear')?.getAttribute('aria-label'),
  };
}

describe('MudSearchInput i18n', () => {
  it('uses the English defaults with no provider', async () => {
    const h = await render();

    expect(h.submit()).toBe('Search');
    expect(h.clear()).toBe('Clear');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    expect(h.submit()).toBe(MUD_LABELS_RO.searchInput!.submit);
    expect(h.clear()).toBe(MUD_LABELS_RO.searchInput!.clear);
  });

  it('an instance input wins over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const h = await render();

    h.host.submit.set('Go');
    h.host.clear.set('Wipe');
    await h.fixture.whenStable();
    expect(h.submit()).toBe('Go');
    expect(h.clear()).toBe('Wipe');
  });

  it('blank inputs fall back', async () => {
    const h = await render();

    h.host.submit.set(' ');
    h.host.clear.set('');
    await h.fixture.whenStable();
    expect(h.submit()).toBe('Search');
    expect(h.clear()).toBe('Clear');
  });
});
