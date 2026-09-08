import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudDateInput } from './mud-date-input.component';
import { MudDatePicker } from './mud-date-picker.component';

@Component({
  imports: [MudDatePicker, MudDateInput],
  template: `
    <mud-date-picker startAt="2026-08-15" locale="en-GB" />
    <mud-date-input label="Date" [(open)]="open" locale="en-GB" />
  `,
})
class Host {
  readonly open = signal(true);
}

describe('date components on the server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  });

  it('renders the calendar without touching browser-only APIs', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('[role="gridcell"]').length).toBe(42);
  });

  it('does not attach the overlay even when open is true', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-container')).toBeNull();
  });

  it('does not throw when focus() is called on the server', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const input = fixture.debugElement.children[1].componentInstance as MudDateInput;

    expect(() => input.focus()).not.toThrow();
  });
});
