import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMudFormatLocale } from 'ngx-mud-ui/i18n';
import { MudIndicatorStep, MudStepIndicator } from '../mud-step-indicator.component';

@Component({
  imports: [MudStepIndicator, MudIndicatorStep],
  template: `
    <mud-step-indicator>
      <mud-indicator-step heading="Create account">
        <p>Register with your ID</p>
        <button type="button">Start</button>
      </mud-indicator-step>
      <mud-indicator-step heading="Verify identity" />
      <mud-indicator-step heading="Submit" />
    </mud-step-indicator>
  `,
})
class IndicatorHost {}

describe('MudStepIndicator', () => {
  async function render() {
    const fixture = TestBed.createComponent(IndicatorHost);

    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  }

  it('renders list semantics', async () => {
    const root = await render();

    expect(root.querySelector('mud-step-indicator')?.getAttribute('role')).toBe('list');
    expect(root.querySelectorAll('[role="listitem"]').length).toBe(3);
    // Real aria-hidden connector element (not a pseudo-element) so axe
    // can compute text backgrounds for color-contrast.
    expect(
      root.querySelector('.indicator-step__connector')?.getAttribute('aria-hidden'),
    ).toBe('true');
  });

  it('numbers steps automatically (1-based) and hides the number from the a11y tree', async () => {
    const root = await render();
    const circles = Array.from(root.querySelectorAll<HTMLElement>('.indicator-step__circle'));

    expect(circles.map((c) => c.textContent?.trim())).toEqual(['1', '2', '3']);
    expect(circles[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('numbers steps in the format locale digits', async () => {
    TestBed.configureTestingModule({ providers: [provideMudFormatLocale('ar-EG')] });

    const root = await render();
    const circles = Array.from(root.querySelectorAll<HTMLElement>('.indicator-step__circle'));
    const arabic = new Intl.NumberFormat('ar-EG', { useGrouping: false });

    expect(circles.map((c) => c.textContent?.trim())).toEqual([1, 2, 3].map((n) => arabic.format(n)));
    expect(circles[0].textContent?.trim()).toMatch(/^[\u0660-\u0669]$/);
  });

  it('dev-mode warns for a wrapped step the content query cannot see, instead of numbering it 0', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await render();

    expect(warn).not.toHaveBeenCalled();

    @Component({
      imports: [MudStepIndicator, MudIndicatorStep],
      template: `
        <mud-step-indicator>
          <div>
            <mud-indicator-step heading="Wrapped" />
          </div>
        </mud-step-indicator>
      `,
    })
    class WrappedHost {}

    const fixture = TestBed.createComponent(WrappedHost);

    await fixture.whenStable();
    const circle = (fixture.nativeElement as HTMLElement).querySelector('.indicator-step__circle');

    expect(warn).toHaveBeenCalled();
    expect(circle?.textContent?.trim()).not.toBe('0');
    warn.mockRestore();
  });

  it('renders heading and projects supporting/action content', async () => {
    const root = await render();
    const first = root.querySelector<HTMLElement>('mud-indicator-step')!;

    expect(first.querySelector('.indicator-step__heading')?.textContent).toBe('Create account');
    expect(first.querySelector('.indicator-step__content p')?.textContent).toBe(
      'Register with your ID',
    );
    expect(first.querySelector('.indicator-step__content button')).not.toBeNull();
  });
});
