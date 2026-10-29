import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudTag } from '../mud-tag.component';
import type { MudTagColor, MudTagSize, MudTagType } from '../mud-tag.component';

@Component({
  imports: [MudTag],
  template: `
    <mud-tag [color]="color()" [type]="type()" [size]="size()" [disabled]="disabled()">Label</mud-tag>
  `,
})
class Host {
  readonly color = signal<MudTagColor>('neutral');
  readonly type = signal<MudTagType>('subtle');
  readonly size = signal<MudTagSize>('md');
  readonly disabled = signal(false);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('mud-tag') as HTMLElement;

  return { fixture, host: fixture.componentInstance, el };
}

describe('MudTag', () => {
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

    const colors: MudTagColor[] = ['muted', 'neutral', 'accent', 'success', 'brand', 'danger', 'info'];

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

  it('adds is-disabled for the disabled design, keeping the color and type classes', async () => {
    const { fixture, host, el } = await render();

    expect(el.classList.contains('is-disabled')).toBe(false);
    host.disabled.set(true);
    await fixture.whenStable();
    expect(el.classList.contains('is-disabled')).toBe(true);
    expect(el.classList.contains('status-tag--neutral')).toBe(true);
    expect(el.classList.contains('is-subtle')).toBe(true);
  });

  it('adds the small modifier for size small', async () => {
    const { fixture, host, el } = await render();

    host.size.set('sm');
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

  it('is a11y-silent by default (no role, no aria-live)', async () => {
    const { el } = await render();

    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('aria-live')).toBeNull();
    expect(el.getAttribute('aria-label')).toBeNull();
  });

  it('becomes a polite status live region only when aria-label is set', async () => {
    const fixture = TestBed.createComponent(LabelledHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-tag') as HTMLElement;

    expect(el.getAttribute('aria-label')).toBe('Payment status');
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });
});

@Component({
  imports: [MudTag],
  template: `<mud-tag aria-label="Payment status">Paid</mud-tag>`,
})
class LabelledHost {}

describe('MudTag icons', () => {
  it('puts icon-start before the label and icon-end after it, whatever the source order', async () => {
    @Component({
      imports: [MudTag],
      template: `<mud-tag><i icon-end>E</i>Label<i icon-start>S</i></mud-tag>`,
    })
    class IconsHost {}

    const fixture = TestBed.createComponent(IconsHost);

    await fixture.whenStable();
    const el = fixture.nativeElement.querySelector('mud-tag') as HTMLElement;

    expect(el.textContent).toBe('SLabelE');
    expect(el.firstElementChild?.hasAttribute('icon-start')).toBe(true);
    expect(el.lastElementChild?.hasAttribute('icon-end')).toBe(true);
  });
});

describe('MudTag styles', () => {
  // The component brings its own CSS — there is no global stylesheet in jsdom.
  it('ships its own CSS', () => {
    @Component({ imports: [MudTag], template: `<mud-tag>New</mud-tag>` })
    class StylesHost {}

    TestBed.createComponent(StylesHost).detectChanges();
    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.status-tag\s*\{/);
    // A long label ends in an ellipsis: only a non-flex box can show one.
    expect(css).toMatch(/\.status-tag:not\(:has\(> :is\(\[icon-start\], \[icon-end\]\)\)\)\s*\{[^}]*display:\s*inline-block/);
  });
});
