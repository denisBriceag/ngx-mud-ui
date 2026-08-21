import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudInlineMessage } from './mud-inline-message.component';
import type { MudInlineMessageSize, MudInlineMessageVariant } from './mud-inline-message.component';

@Component({
  imports: [MudInlineMessage],
  template: `
    <mud-inline-message [variant]="variant()" [size]="size()" [hideIcon]="hideIcon()">
      Something to know
    </mud-inline-message>
  `,
})
class Host {
  readonly variant = signal<MudInlineMessageVariant>('info');
  readonly size = signal<MudInlineMessageSize>('medium');
  readonly hideIcon = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-inline-message') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudInlineMessage', () => {
  it('renders an info medium message with a default icon and projected text', async () => {
    const { el } = await render();

    expect(el.classList.contains('inline-message')).toBe(true);
    expect(el.classList.contains('inline-message--info')).toBe(true);
    expect(el.classList.contains('inline-message--small')).toBe(false);
    expect(el.querySelector('.inline-message__icon svg')).toBeTruthy();
    expect(el.querySelector('.inline-message__text')?.textContent).toContain('Something to know');
  });

  it('maps all four variants to their classes with a per-variant default glyph', async () => {
    const { fixture, host, el } = await render();

    const variants: MudInlineMessageVariant[] = ['info', 'warning', 'success', 'error'];
    const glyphs = new Set<string>();

    for (const variant of variants) {
      host.variant.set(variant);
      await fixture.whenStable();
      expect(el.classList.contains(`inline-message--${variant}`)).toBe(true);
      glyphs.add(el.querySelector('.inline-message__icon path')!.getAttribute('d')!);
    }

    expect(glyphs.size).toBe(4);
  });

  it('adds the small modifier for size small', async () => {
    const { fixture, host, el } = await render();

    host.size.set('small');
    await fixture.whenStable();
    expect(el.classList.contains('inline-message--small')).toBe(true);
  });

  it('suppresses the icon with hideIcon', async () => {
    const { fixture, host, el } = await render();

    host.hideIcon.set(true);
    await fixture.whenStable();
    expect(el.querySelector('.inline-message__icon')).toBeNull();
    expect(el.querySelector('.inline-message__text')?.textContent).toContain('Something to know');
  });

  it('keeps the icon decorative (aria-hidden) and stays a plain non-live element', async () => {
    const { el } = await render();

    expect(el.querySelector('.inline-message__icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('aria-live')).toBeNull();
  });

  it('replaces the default glyph with a projected custom icon', async () => {
    const fixture = TestBed.createComponent(CustomIconHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-inline-message') as HTMLElement;
    const icon = el.querySelector('.inline-message__icon')!;

    expect(icon.querySelector('svg.custom-glyph')).toBeTruthy();
    // The per-variant fallback must not render alongside the projected icon.
    expect(icon.querySelectorAll('svg')).toHaveLength(1);
  });
});

@Component({
  imports: [MudInlineMessage],
  template: `
    <mud-inline-message variant="warning">
      <svg class="custom-glyph" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
      Custom glyph message
    </mud-inline-message>
  `,
})
class CustomIconHost {}
