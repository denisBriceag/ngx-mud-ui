import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MUD_LABELS_RO, provideMudLabels } from 'ngx-mud-ui/i18n';
import { MudSpinner } from './mud-spinner.component';

@Component({
  imports: [MudSpinner],
  template: `<mud-spinner /><mud-spinner aria-label="Mine" />`,
})
class Host {}

async function texts(): Promise<string[]> {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  return [...(fixture.nativeElement as HTMLElement).querySelectorAll('.mud-spinner-label')].map((e) => e.textContent!);
}

describe('MudSpinner i18n', () => {
  it('uses the English default with no provider', async () => {
    expect((await texts())[0]).toBe('Loading');
  });

  it('uses the Romanian pack when provided', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    expect((await texts())[0]).toBe(MUD_LABELS_RO.spinner!.loading);
  });

  it('an instance aria-label wins', async () => {
    TestBed.configureTestingModule({ providers: [provideMudLabels(MUD_LABELS_RO)] });
    expect((await texts())[1]).toBe('Mine');
  });
});
