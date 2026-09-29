import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTimePicker } from './mud-time-picker.component';
import { MudTimeInput } from './mud-time-input.component';

@Component({
  imports: [MudTimePicker],
  template: `<mud-time-picker value="09:30" min="08:00" />`,
})
class Host {}

describe('MudTimePicker on the server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
  });

  it('renders both columns without touching browser-only APIs', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('[role="option"]')).toHaveLength(84);
    expect(el.querySelector('[data-column="hours"] [data-value="9"]')!.getAttribute('aria-selected')).toBe('true');
  });

  it('focus() is a no-op on the server', async () => {
    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const picker = fixture.debugElement.children[0].componentInstance as MudTimePicker;

    expect(() => picker.focus()).not.toThrow();
    expect(document.activeElement).toBe(document.body);
  });

  it('the field attaches no overlay on the server even when open is true', async () => {
    @Component({
      imports: [MudTimeInput],
      template: `<mud-time-input [open]="true" value="09:30" aria-label="Time" />`,
    })
    class OpenHost {}

    const fixture = TestBed.createComponent(OpenHost);

    await fixture.whenStable();

    expect(document.querySelector('.cdk-overlay-container')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('input')!.getAttribute('value')).toBe('09:30');
  });
});
