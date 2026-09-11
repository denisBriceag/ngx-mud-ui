import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudLabel } from './mud-label.component';

@Component({
  imports: [MudLabel],
  template: `<mud-label>IDNP <b>bold</b></mud-label>`,
})
class Host {}

describe('MudLabel', () => {
  it('renders projected content verbatim with no wrapper markup', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-label') as HTMLElement;

    // The element is a pure projection point: content lands directly in it.
    expect(el.textContent).toContain('IDNP');
    expect(el.querySelector('b')?.textContent).toBe('bold');
    expect(el.children.length).toBe(1); // only the consumer's <b>
  });
});
