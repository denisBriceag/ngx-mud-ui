import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudTextInput } from './mud-text-input.component';

@Component({
  imports: [MudTextInput],
  template: `<mud-text-input clearable aria-label="Nume" [value]="'x'" [clearLabel]="label()" />`,
})
class Host {
  readonly label = signal<string | undefined>(undefined);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  return {
    fixture,
    clear: () => (fixture.nativeElement as HTMLElement).querySelector('.input-field__clear')!.getAttribute('aria-label'),
  };
}

describe('MudTextInput i18n', () => {
  it('uses the English default with no provider', async () => {
    expect((await render()).clear()).toBe('Clear field');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });

    expect((await render()).clear()).toBe(MUD_LABELS_RO.textInput!.clear);
  });

  it('an instance input wins over the labels', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    const { fixture, clear } = await render();

    fixture.componentInstance.label.set('Mine');
    await fixture.whenStable();
    expect(clear()).toBe('Mine');
  });

  it('blank clearLabel falls back', async () => {
    const { fixture, clear } = await render();

    fixture.componentInstance.label.set('  ');
    await fixture.whenStable();
    expect(clear()).toBe('Clear field');
  });
});
