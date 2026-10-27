import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_EN, MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import type { MudLabelsPartial } from 'ngx-mud-ui/i18n';
import { MudSelectInput } from '../mud-select-input.component';
import type { MudSelectOption } from '../mud-select-options';

const OPTIONS: MudSelectOption<string>[] = [{ value: 'a', label: 'Alpha' }];

@Component({
  imports: [MudSelectInput],
  template: `
    <mud-select-input
      searchable
      [options]="options()"
      [loading]="loading()"
      [(query)]="query"
      [(open)]="open"
      [emptyText]="empty()"
      [noResultsText]="noResults()"
      [loadingText]="loadingText()"
    />
  `,
})
class Host {
  readonly options = signal<MudSelectOption<string>[]>(OPTIONS);
  readonly loading = signal(false);
  readonly query = signal('');
  readonly open = signal(false);
  readonly empty = signal<string | undefined>(undefined);
  readonly noResults = signal<string | undefined>(undefined);
  readonly loadingText = signal<string | undefined>(undefined);
}

// Hosts the select in a subtree that carries its own labels override.
@Component({
  imports: [MudSelectInput],
  providers: [provideMudLabels({ selectInput: { noResults: 'Nimic' } })],
  template: `<mud-select-input searchable [options]="options" [(query)]="query" [(open)]="open" />`,
})
class SubtreeHost {
  readonly options = OPTIONS;
  readonly query = signal('zzz');
  readonly open = signal(true);
}

@Component({
  imports: [MudSelectInput],
  template: `<mud-select-input [options]="options" [(open)]="open" />`,
})
class NamelessHost {
  readonly options = OPTIONS;
  readonly open = signal(true);
}

const panelText = (selector: string) => document.querySelector(selector)?.textContent?.trim();
const status = (fixture: { nativeElement: HTMLElement }) =>
  fixture.nativeElement.querySelector('[aria-live="polite"]')!.textContent!.trim();

async function render(open = true) {
  const fixture = TestBed.createComponent(Host);

  fixture.componentInstance.open.set(open);
  await fixture.whenStable();

  return { fixture, host: fixture.componentInstance };
}

describe('MudSelectInput i18n', () => {
  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('uses the English defaults with no provider', async () => {
    const { host, fixture } = await render();

    host.options.set([]);
    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe('No options');

    host.options.set(OPTIONS);
    host.query.set('zzz');
    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe('No results');
    expect(status(fixture)).toBe('No results');

    host.loading.set(true);
    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe('Loading…');
    expect(status(fixture)).toBe('Loading…');
  });

  it('instance inputs win over the labels, and blank ones fall back', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { host, fixture } = await render();

    host.query.set('zzz');
    host.noResults.set('Mine');
    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe('Mine');

    host.noResults.set('  ');
    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe(MUD_LABELS_RO.selectInput!.noResults);
  });

  it("a subtree override reaches the select's own panel", async () => {
    const fixture = TestBed.createComponent(SubtreeHost);

    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe('Nimic');
  });

  it('names the listbox from the labels when there is no label and no aria-label', async () => {
    const fixture = TestBed.createComponent(NamelessHost);

    await fixture.whenStable();
    expect(document.querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe(MUD_LABELS_EN.selectInput.options);
  });

  it('names the listbox in Romanian with the RO pack', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const fixture = TestBed.createComponent(NamelessHost);

    await fixture.whenStable();
    expect(document.querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('Opțiuni');
  });

  it('noResults and loading switch live while the panel is open', async () => {
    const labels = signal<MudLabelsPartial>({});

    TestBed.configureTestingModule({ providers: [provideMudLabels(labels)] });
    const { host, fixture } = await render();

    host.query.set('zzz');
    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe('No results');
    expect(status(fixture)).toBe('No results');

    labels.set({ selectInput: { noResults: 'Niciun rezultat', loading: 'Se încarcă…' } });
    await fixture.whenStable();
    expect(panelText('.menu-panel__empty')).toBe('Niciun rezultat');
    expect(status(fixture)).toBe('Niciun rezultat');

    host.loading.set(true);
    await fixture.whenStable();
    expect(status(fixture)).toBe('Se încarcă…');
  });
});
