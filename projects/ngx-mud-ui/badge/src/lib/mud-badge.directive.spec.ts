import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudBadge } from './mud-badge.directive';
import type { MudBadgeColor, MudBadgePosition, MudBadgeSize, MudBadgeVariant } from './mud-badge.directive';

@Component({
  imports: [MudBadge],
  template: `
    <button
      aria-describedby="existing-hint"
      [mudBadge]="content()"
      [badgeSize]="size()"
      [badgeColor]="color()"
      [badgePosition]="position()"
      [badgeMax]="max()"
      [badgeVariant]="variant()"
      [badgeDescription]="description()"
    >
      Inbox
    </button>
    <span id="existing-hint">Opens the inbox</span>
  `,
})
class Host {
  readonly content = signal<string | number | null>(5);
  readonly size = signal<MudBadgeSize>('medium');
  readonly color = signal<MudBadgeColor>('neutral');
  readonly position = signal<MudBadgePosition>('above after');
  readonly max = signal<number | string | null>(null);
  readonly variant = signal<MudBadgeVariant>('count');
  readonly description = signal<string | null>(null);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const el = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    badge: () => el.querySelector('.badge') as HTMLElement | null,
  };
}

describe('MudBadge', () => {
  it('renders a fixed medium neutral badge above-after by default', async () => {
    const { el, badge } = await render();
    const span = badge();

    expect(span).not.toBeNull();
    expect(span!.textContent).toBe('5');
    expect(span!.classList.contains('badge--md')).toBe(true);
    expect(span!.classList.contains('badge--solid-neutral')).toBe(true);
    expect(span!.classList.contains('badge--fixed')).toBe(true);
    expect(span!.classList.contains('badge--above')).toBe(true);
    expect(span!.classList.contains('badge--after')).toBe(true);
    expect(el.classList.contains('mud-badge-host')).toBe(true);
  });

  it('maps all five sizes to the design-system classes', async () => {
    const { fixture, host, badge } = await render();

    const expected: [MudBadgeSize, string][] = [
      ['extra-small', 'badge--xs'],
      ['small', 'badge--sm'],
      ['medium', 'badge--md'],
      ['large', 'badge--lg'],
      ['extra-large', 'badge--xl'],
    ];

    for (const [size, cls] of expected) {
      host.size.set(size);
      await fixture.whenStable();
      expect(badge()!.classList.contains(cls)).toBe(true);
    }
  });

  it('maps all five colors to the solid design-system classes', async () => {
    const { fixture, host, badge } = await render();

    for (const color of ['dark', 'light', 'neutral', 'accent', 'danger'] as const) {
      host.color.set(color);
      await fixture.whenStable();
      expect(badge()!.classList.contains(`badge--solid-${color}`)).toBe(true);
    }
  });

  it('resolves compound and single positions, defaulting the missing axis', async () => {
    const { fixture, host, badge } = await render();

    const expected: [MudBadgePosition, string, string][] = [
      ['above before', 'badge--above', 'badge--before'],
      ['below before', 'badge--below', 'badge--before'],
      ['below after', 'badge--below', 'badge--after'],
      ['above', 'badge--above', 'badge--after'],
      ['below', 'badge--below', 'badge--after'],
      ['before', 'badge--above', 'badge--before'],
      ['after', 'badge--above', 'badge--after'],
    ];

    for (const [position, vertical, horizontal] of expected) {
      host.position.set(position);
      await fixture.whenStable();
      expect(badge()!.classList.contains(vertical)).toBe(true);
      expect(badge()!.classList.contains(horizontal)).toBe(true);
    }
  });

  it('truncates numeric content above badgeMax', async () => {
    const { fixture, host, badge } = await render();

    host.content.set(1204);
    host.max.set(999);
    await fixture.whenStable();
    expect(badge()!.textContent).toBe('999+');

    host.content.set('1204');
    await fixture.whenStable();
    expect(badge()!.textContent).toBe('999+');
  });

  it('leaves in-range numbers and non-numeric content untouched by badgeMax', async () => {
    const { fixture, host, badge } = await render();

    host.max.set(99);
    host.content.set(42);
    await fixture.whenStable();
    expect(badge()!.textContent).toBe('42');

    host.content.set('New');
    await fixture.whenStable();
    expect(badge()!.textContent).toBe('New');
  });

  it('warns in dev mode and ignores a non-numeric badgeMax', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const { fixture, host, badge } = await render();

      host.content.set(1204);
      host.max.set('ten');
      await fixture.whenStable();

      expect(badge()!.textContent).toBe('1204');
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('badgeMax'));
    } finally {
      warn.mockRestore();
    }
  });

  it('removes the badge when content is null or empty and restores it after', async () => {
    const { fixture, host, badge } = await render();

    host.content.set(null);
    await fixture.whenStable();
    expect(badge()).toBeNull();

    host.content.set('');
    await fixture.whenStable();
    expect(badge()).toBeNull();

    host.content.set(3);
    await fixture.whenStable();
    expect(badge()!.textContent).toBe('3');
  });

  it('renders a contentless dot regardless of content', async () => {
    const { fixture, host, badge } = await render();

    host.variant.set('dot');
    host.content.set(42);
    await fixture.whenStable();
    expect(badge()!.classList.contains('badge--dot')).toBe(true);
    expect(badge()!.textContent).toBe('');

    host.content.set(null);
    await fixture.whenStable();
    expect(badge()).not.toBeNull();
    expect(badge()!.classList.contains('badge--dot')).toBe(true);
  });

  it('degrades extra-small count badges to a dot (xs is dot-only per Figma)', async () => {
    const { fixture, host, badge } = await render();

    host.size.set('extra-small');
    host.content.set(5);
    await fixture.whenStable();

    expect(badge()!.classList.contains('badge--dot')).toBe(true);
    expect(badge()!.classList.contains('badge--xs')).toBe(true);
    expect(badge()!.textContent).toBe('');
  });

  it('warns in dev mode when an extra-small count badge is degraded', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const { fixture, host } = await render();

      host.size.set('extra-small');
      await fixture.whenStable();

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('extra-small'));
    } finally {
      warn.mockRestore();
    }
  });

  it('renders a dot from static attributes without a content value', async () => {
    @Component({
      imports: [MudBadge],
      template: `<span mudBadge badgeVariant="dot" badgeColor="danger"></span>`,
    })
    class StaticHost {}

    const fixture = TestBed.createComponent(StaticHost);

    await fixture.whenStable();
    const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement | null;

    expect(badge).not.toBeNull();
    expect(badge!.classList.contains('badge--dot')).toBe(true);
    expect(badge!.classList.contains('badge--solid-danger')).toBe(true);
  });

  it('updates content reactively', async () => {
    const { fixture, host, badge } = await render();

    host.content.set(6);
    await fixture.whenStable();
    expect(badge()!.textContent).toBe('6');
  });

  it('wires aria-describedby and hides badge text when a description is set', async () => {
    const { fixture, host, el, badge } = await render();

    host.description.set('5 unread notifications');
    await fixture.whenStable();

    expect(badge()!.getAttribute('aria-hidden')).toBe('true');

    const describedby = (el.getAttribute('aria-describedby') ?? '').split(/\s+/);
    const descriptionId = describedby.find((id) => id !== 'existing-hint');

    expect(describedby).toContain('existing-hint');
    expect(descriptionId).toBeDefined();
    expect(document.getElementById(descriptionId!)?.textContent).toBe('5 unread notifications');
  });

  it('restores host and badge semantics when the description is cleared', async () => {
    const { fixture, host, el, badge } = await render();

    host.description.set('5 unread notifications');
    await fixture.whenStable();
    host.description.set(null);
    await fixture.whenStable();

    expect(badge()!.getAttribute('aria-hidden')).toBeNull();
    expect(el.getAttribute('aria-describedby')).toBe('existing-hint');
  });

  it('drops the description wiring while the badge is hidden', async () => {
    const { fixture, host, el } = await render();

    host.description.set('5 unread notifications');
    host.content.set(null);
    await fixture.whenStable();

    expect(el.getAttribute('aria-describedby')).toBe('existing-hint');
  });

  it('does not create the badge span on non-browser platforms', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const { badge } = await render();

    expect(badge()).toBeNull();
  });
});
