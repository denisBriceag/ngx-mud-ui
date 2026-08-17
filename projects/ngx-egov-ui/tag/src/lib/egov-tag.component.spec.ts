import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EgovTag } from './egov-tag.component';
import type { EgovTagColor, EgovTagSize, EgovTagType } from './egov-tag.component';

@Component({
  imports: [EgovTag],
  template: `
    <egov-tag [color]="color()" [type]="type()" [size]="size()">Label</egov-tag>
  `,
})
class Host {
  readonly color = signal<EgovTagColor>('neutral');
  readonly type = signal<EgovTagType>('subtle');
  readonly size = signal<EgovTagSize>('medium');
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('egov-tag') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('EgovTag', () => {
  it('renders a neutral subtle medium tag by default and projects content', async () => {
    const { el } = await render();

    expect(el.classList.contains('status-tag')).toBe(true);
    expect(el.classList.contains('status-tag--neutral')).toBe(true);
    expect(el.classList.contains('is-subtle')).toBe(true);
    expect(el.classList.contains('status-tag--small')).toBe(false);
    expect(el.textContent).toContain('Label');
  });

  it('maps all seven colors to the design-system classes', async () => {
    const { fixture, host, el } = await render();

    const colors: EgovTagColor[] = ['muted', 'neutral', 'accent', 'success', 'brand', 'danger', 'info'];

    for (const color of colors) {
      host.color.set(color);
      await fixture.whenStable();
      expect(el.classList.contains(`status-tag--${color}`)).toBe(true);
    }
  });

  it('maps the strong and outlined types', async () => {
    const { fixture, host, el } = await render();

    host.type.set('strong');
    await fixture.whenStable();
    expect(el.classList.contains('is-strong')).toBe(true);
    expect(el.classList.contains('is-subtle')).toBe(false);

    host.type.set('outlined');
    await fixture.whenStable();
    expect(el.classList.contains('is-outlined')).toBe(true);
  });

  it('adds the small modifier for size small', async () => {
    const { fixture, host, el } = await render();

    host.size.set('small');
    await fixture.whenStable();
    expect(el.classList.contains('status-tag--small')).toBe(true);
  });

  it('falls back to subtle when info is combined with outlined, with a dev warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const { fixture, host, el } = await render();

      host.color.set('info');
      host.type.set('outlined');
      await fixture.whenStable();

      expect(el.classList.contains('is-subtle')).toBe(true);
      expect(el.classList.contains('is-outlined')).toBe(false);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('info'));
    } finally {
      warn.mockRestore();
    }
  });

  it('allows info with strong without warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const { fixture, host, el } = await render();

      host.color.set('info');
      host.type.set('strong');
      await fixture.whenStable();

      expect(el.classList.contains('is-strong')).toBe(true);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});
