import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMudFormatLocale } from 'ngx-mud-ui/i18n';
import { MudTextarea } from './mud-textarea.component';

@Component({
  imports: [MudTextarea],
  template: `<mud-textarea aria-label="Mesaj" [maxLength]="200" [value]="'abc'" />`,
})
class Host {}

async function counter() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  return (fixture.nativeElement as HTMLElement).querySelector('.input-field__counter')!.textContent!.replace(/\s+/g, ' ').trim();
}

@Component({ imports: [MudTextarea], template: `<mud-textarea aria-label="Mesaj" [maxLength]="5000" />` })
class BigHost {}

describe('MudTextarea counter i18n', () => {
  it('does not group thousands under the default locale', async () => {
    const fixture = TestBed.createComponent(BigHost);

    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('.input-field__counter')!.textContent!.replace(/\s+/g, ' ').trim()).toBe('0 / 5000');
  });

  it('shows Latin digits by default', async () => {
    expect(await counter()).toBe('3 / 200');
  });

  it('the counter digits follow the format locale', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });

    const nf = new Intl.NumberFormat('ar-EG');

    expect(await counter()).toBe(`${nf.format(3)} / ${nf.format(200)}`);
    expect(await counter()).not.toBe('3 / 200');
  });
});
