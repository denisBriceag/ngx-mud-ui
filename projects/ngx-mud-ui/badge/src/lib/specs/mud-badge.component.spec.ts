import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudBadge } from '../mud-badge.component';
import type { MudBadgeSize, MudBadgeType, MudBadgeVariant } from '../mud-badge.types';

@Component({
  imports: [MudBadge],
  template: `<mud-badge
    [count]="count()"
    [max]="max()"
    [type]="type()"
    [variant]="variant()"
    [size]="size()"
    [disabled]="disabled()"
    [notificationLabel]="notificationLabel()"
    [live]="live()"
    [aria-label]="ariaLabel()"
  />`,
})
class Host {
  readonly count = signal<number | undefined>(3);
  readonly max = signal(99);
  readonly type = signal<MudBadgeType>('numbered');
  readonly variant = signal<MudBadgeVariant>('danger');
  readonly size = signal<MudBadgeSize>('md');
  readonly disabled = signal(false);
  readonly notificationLabel = signal('Notificare');
  readonly live = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
}

function render() {
  const fixture = TestBed.createComponent(Host);

  fixture.detectChanges();

  const badge = () => fixture.nativeElement.querySelector('mud-badge') as HTMLElement;

  return { fixture, host: fixture.componentInstance, badge };
}

describe('MudBadge (<mud-badge>)', () => {
  it('renders the count in a pill with the default size and variant', () => {
    const { badge } = render();

    expect(badge().textContent?.trim()).toBe('3');
    expect(badge().classList).toContain('badge');
    expect(badge().classList).toContain('badge--md');
    expect(badge().classList).toContain('badge--solid-danger');
  });

  it('is a named image by default — not a live region', () => {
    const { badge } = render();

    expect(badge().getAttribute('role')).toBe('img');
    expect(badge().hasAttribute('aria-live')).toBe(false);
    expect(badge().getAttribute('aria-label')).toBe('3');
  });

  it('becomes a polite status when `live` is set, with the count as announced content', () => {
    const { fixture, host, badge } = render();

    host.live.set(true);
    fixture.detectChanges();
    expect(badge().getAttribute('role')).toBe('status');
    expect(badge().getAttribute('aria-live')).toBe('polite');
    // Live regions announce content changes, not aria-label changes.
    expect(badge().querySelector('.badge-count')?.hasAttribute('aria-hidden')).toBe(false);
    expect(badge().hasAttribute('aria-label')).toBe(false);
  });

  it('treats an explicit empty aria-label as decorative', () => {
    const { fixture, host, badge } = render();

    host.type.set('dot');
    host.ariaLabel.set('');
    fixture.detectChanges();
    expect(badge().hasAttribute('role')).toBe(false);
    expect(badge().hasAttribute('aria-label')).toBe(false);
  });

  it('drops the role when a decorative badge has no name', () => {
    const { fixture, host, badge } = render();

    host.type.set('dot');
    host.notificationLabel.set('');
    fixture.detectChanges();
    expect(badge().hasAttribute('role')).toBe(false);
    expect(badge().hasAttribute('aria-label')).toBe(false);
  });

  it('caps the count at max as "{max}+"', () => {
    const { fixture, host, badge } = render();

    host.count.set(120);
    fixture.detectChanges();
    expect(badge().textContent?.trim()).toBe('99+');

    host.max.set(9);
    host.count.set(12);
    fixture.detectChanges();
    expect(badge().textContent?.trim()).toBe('9+');
    expect(badge().getAttribute('aria-label')).toBe('9+');
  });

  it('renders a dot with no text, named by the notification label', () => {
    const { fixture, host, badge } = render();

    host.type.set('dot');
    fixture.detectChanges();

    expect(badge().classList).toContain('badge--dot');
    expect(badge().textContent?.trim()).toBe('');
    expect(badge().getAttribute('aria-label')).toBe('Notificare');
  });

  it('degrades a numbered xs badge to a dot (8px cannot hold digits)', () => {
    const { fixture, host, badge } = render();

    host.size.set('xs');
    fixture.detectChanges();

    expect(badge().classList).toContain('badge--dot');
    expect(badge().textContent?.trim()).toBe('');
  });

  it('maps size and variant to the badge classes', () => {
    const { fixture, host, badge } = render();

    host.size.set('xl');
    host.variant.set('neutral');
    fixture.detectChanges();

    expect(badge().classList).toContain('badge--xl');
    expect(badge().classList).toContain('badge--solid-neutral');
    expect(badge().classList).not.toContain('badge--solid-danger');
  });

  it('falls back to the notification label when there is no count, and honours an override', () => {
    const { fixture, host, badge } = render();

    host.count.set(undefined);
    host.notificationLabel.set('Notification');
    fixture.detectChanges();

    expect(badge().getAttribute('aria-label')).toBe('Notification');
  });

  it('renders the disabled design', () => {
    const { fixture, host, badge } = render();

    host.disabled.set(true);
    fixture.detectChanges();

    expect(badge().classList).toContain('badge--disabled');
  });

  it("keeps the consumer's own aria-label", () => {
    @Component({ imports: [MudBadge], template: `<mud-badge [count]="5" aria-label="5 unread messages" />` })
    class Labelled {}

    const fixture = TestBed.createComponent(Labelled);

    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mud-badge').getAttribute('aria-label')).toBe('5 unread messages');
  });

  it('brings the badge CSS with it', () => {
    render();

    const css = [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

    expect(css).toMatch(/\.badge\s*\{/);
    expect(css).toMatch(/\.badge--disabled\s*\{/);
  });
});
