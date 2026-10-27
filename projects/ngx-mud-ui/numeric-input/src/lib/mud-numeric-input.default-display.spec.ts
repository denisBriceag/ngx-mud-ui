import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudNumericInput } from './mud-numeric-input.component';

@Component({
  imports: [MudNumericInput],
  template: `<mud-numeric-input aria-label="Suma" [value]="1234.5" />`,
})
class Host {}

describe('MudNumericInput default display', () => {
  it('shows 1234.5 as plain digits with a dot and no grouping (no locale, default LOCALE_ID)', async () => {
    // Recorded on the code BEFORE the format-locale change; must stay byte-identical.
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('1234.5');
  });
});
