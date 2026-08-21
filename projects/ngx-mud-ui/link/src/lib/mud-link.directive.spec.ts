import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudLink } from './mud-link.directive';
import type { MudLinkSize, MudLinkStyle, MudLinkTouchTarget } from './mud-link.directive';

@Component({
  imports: [MudLink],
  template: `
    <a
      href="#"
      [mudLink]="style()"
      [size]="size()"
      [underlined]="underlined()"
      [touchTarget]="touchTarget()"
      [disabled]="disabled()"
      (click)="clicks = clicks + 1"
    >
      Services
    </a>
  `,
})
class Host {
  readonly style = signal<MudLinkStyle | ''>('');
  readonly size = signal<MudLinkSize>('medium');
  readonly underlined = signal(true);
  readonly touchTarget = signal<MudLinkTouchTarget>('auto');
  readonly disabled = signal(false);
  clicks = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudLink', () => {
  it('renders a primary medium underlined link by default', async () => {
    const { el } = await render();

    expect(el.classList.contains('link')).toBe(true);
    expect(el.classList.contains('link-primary')).toBe(true);
    expect(el.classList.contains('link-md')).toBe(true);
    expect(el.classList.contains('link-underline')).toBe(true);
  });

  it('maps the strict style', async () => {
    const { fixture, host, el } = await render();

    host.style.set('strict');
    await fixture.whenStable();
    expect(el.classList.contains('link-strict')).toBe(true);
    expect(el.classList.contains('link-primary')).toBe(false);
  });

  it('maps all four sizes to the design-system classes', async () => {
    const { fixture, host, el } = await render();

    const expected: [MudLinkSize, string][] = [
      ['large', 'link-lg'],
      ['medium', 'link-md'],
      ['small', 'link-sm'],
      ['extra-small', 'link-xs'],
    ];

    for (const [size, cls] of expected) {
      host.size.set(size);
      await fixture.whenStable();
      expect(el.classList.contains(cls)).toBe(true);
    }
  });

  it('switches to link-no-underline when underlined is false', async () => {
    const { fixture, host, el } = await render();

    host.underlined.set(false);
    await fixture.whenStable();
    expect(el.classList.contains('link-no-underline')).toBe(true);
    expect(el.classList.contains('link-underline')).toBe(false);
  });

  it('applies the 32px pointer target by default on fine-pointer devices', async () => {
    const { el } = await render();

    expect(el.classList.contains('link-target-pointer')).toBe(true);
    expect(el.classList.contains('link-target-touch')).toBe(false);
  });

  it('applies the 40px touch target automatically on coarse-pointer devices', async () => {
    // jsdom has no matchMedia; provide one reporting a coarse pointer.
    const matchMediaMock = vi.fn().mockReturnValue({ matches: true } as MediaQueryList);

    vi.stubGlobal('matchMedia', matchMediaMock);

    try {
      const { el } = await render();

      expect(matchMediaMock).toHaveBeenCalledWith('(pointer: coarse)');
      expect(el.classList.contains('link-target-touch')).toBe(true);
      expect(el.classList.contains('link-target-pointer')).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('honors explicit touchTarget overrides including opting out', async () => {
    const { fixture, host, el } = await render();

    host.touchTarget.set('touch');
    await fixture.whenStable();
    expect(el.classList.contains('link-target-touch')).toBe(true);

    host.touchTarget.set('pointer');
    await fixture.whenStable();
    expect(el.classList.contains('link-target-pointer')).toBe(true);

    host.touchTarget.set('none');
    await fixture.whenStable();
    expect(el.classList.contains('link-target-pointer')).toBe(false);
    expect(el.classList.contains('link-target-touch')).toBe(false);
  });

  it('disables via aria-disabled, leaves the tab order, and blocks clicks', async () => {
    const { fixture, host, el } = await render();

    host.disabled.set(true);
    await fixture.whenStable();
    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.getAttribute('tabindex')).toBe('-1');

    el.click();
    expect(host.clicks).toBe(0);

    host.disabled.set(false);
    await fixture.whenStable();
    expect(el.getAttribute('aria-disabled')).toBeNull();
    expect(el.getAttribute('tabindex')).toBeNull();

    el.click();
    expect(host.clicks).toBe(1);
  });
});
