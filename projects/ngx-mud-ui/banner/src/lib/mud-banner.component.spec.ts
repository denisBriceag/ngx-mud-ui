import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudBanner } from './mud-banner.component';
import type { MudBannerType, MudBannerVariant } from './mud-banner.component';

@Component({
  imports: [MudBanner],
  template: `
    <mud-banner
      [variant]="variant()"
      [type]="type()"
      [closable]="closable()"
      [live]="live()"
      [closeLabel]="closeLabel()"
      [aria-label]="ariaLabel()"
      (closed)="closedCount = closedCount + 1"
    >
      Scheduled maintenance tonight
    </mud-banner>
  `,
})
class Host {
  readonly variant = signal<MudBannerVariant>('info');
  readonly type = signal<MudBannerType>('subtle');
  readonly closable = signal(false);
  readonly live = signal(false);
  readonly closeLabel = signal('Close');
  readonly ariaLabel = signal<string | undefined>(undefined);
  closedCount = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-banner') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    close: () => el.querySelector<HTMLButtonElement>('.banner__close'),
  };
}

describe('MudBanner', () => {
  it('renders an info subtle banner with a default glyph and projected message', async () => {
    const { el } = await render();

    expect(el.classList.contains('banner')).toBe(true);
    expect(el.classList.contains('banner--info')).toBe(true);
    expect(el.classList.contains('banner--subtle')).toBe(true);
    expect(el.querySelector('.banner__icon svg')).toBeTruthy();
    expect(el.querySelector('.banner__message')?.textContent).toContain('Scheduled maintenance tonight');
  });

  it('marks the icon decorative — the message text carries the meaning', async () => {
    const { el } = await render();

    expect(el.querySelector('.banner__icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('maps each variant to its class and a distinct default glyph', async () => {
    const { fixture, host, el } = await render();
    const glyphs = new Set<string>();

    for (const variant of ['info', 'warning', 'error'] as MudBannerVariant[]) {
      host.variant.set(variant);
      await fixture.whenStable();

      expect(el.classList.contains(`banner--${variant}`)).toBe(true);
      glyphs.add(el.querySelector('.banner__icon path')!.getAttribute('d')!);
    }

    expect(glyphs.size).toBe(3);
  });

  it('maps type to its class', async () => {
    const { fixture, host, el } = await render();

    host.type.set('strong');
    await fixture.whenStable();

    expect(el.classList.contains('banner--strong')).toBe(true);
    expect(el.classList.contains('banner--subtle')).toBe(false);
  });

  // The default case: a banner present at page load must NOT interrupt the
  // screen reader, so it carries no live-region attributes at all.
  it('is not a live region by default', async () => {
    const { el } = await render();

    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('aria-live')).toBeNull();
  });

  it('announces politely for info when live is set', async () => {
    const { fixture, host, el } = await render();

    host.live.set(true);
    await fixture.whenStable();

    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-live')).toBe('polite');
    expect(el.getAttribute('aria-label')).toBeNull();
  });

  it('announces assertively for warning and error when live is set', async () => {
    const { fixture, host, el } = await render();

    host.live.set(true);

    for (const variant of ['warning', 'error'] as MudBannerVariant[]) {
      host.variant.set(variant);
      await fixture.whenStable();

      expect(el.getAttribute('role')).toBe('alert');
      expect(el.getAttribute('aria-live')).toBe('assertive');
      expect(el.getAttribute('aria-label')).toBeNull();
    }
  });

  // An aria-label on a role-less element is ignored by AT. This is the row a
  // naive implementation gets wrong, shipping an input that does nothing.
  it('takes a region role when labelled but not live, so aria-label is never inert', async () => {
    const { fixture, host, el } = await render();

    host.ariaLabel.set('System status');
    await fixture.whenStable();

    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('System status');
    expect(el.getAttribute('aria-live')).toBeNull();
  });

  // Blank/whitespace must not disagree between the attribute and the role
  // decision — an aria-label on a role-less host is ARIA that AT ignores.
  it('treats a blank aria-label as no label, so no ARIA lands on a role-less host', async () => {
    const { fixture, host, el } = await render();

    host.ariaLabel.set('   ');
    await fixture.whenStable();

    expect(el.getAttribute('aria-label')).toBeNull();
    expect(el.getAttribute('role')).toBeNull();
  });

  it('keeps the live role when both live and a label are set', async () => {
    const { fixture, host, el } = await render();

    host.live.set(true);
    host.ariaLabel.set('System status');
    await fixture.whenStable();

    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-label')).toBe('System status');
  });

  it('hides the close button unless closable', async () => {
    const { close } = await render();

    expect(close()).toBeNull();
  });

  it('emits closed once on close and does not remove itself', async () => {
    const { fixture, host, el, close } = await render();

    host.closable.set(true);
    await fixture.whenStable();

    close()!.click();
    await fixture.whenStable();

    expect(host.closedCount).toBe(1);
    // The consumer owns removal; the banner must still be in the DOM.
    expect(fixture.nativeElement.querySelector('mud-banner')).toBe(el);
  });

  it('labels the close button from the closeLabel input', async () => {
    const { fixture, host, close } = await render();

    host.closable.set(true);
    host.closeLabel.set('Închide');
    await fixture.whenStable();

    expect(close()!.getAttribute('aria-label')).toBe('Închide');
  });

  // A blank closeLabel is not a value — using it as-is would render
  // aria-label="" on a button whose only child is an aria-hidden svg, leaving
  // it with no accessible name at all.
  it('falls back to the default when closeLabel is blank or whitespace-only', async () => {
    const { fixture, host, close } = await render();

    host.closable.set(true);
    host.closeLabel.set('   ');
    await fixture.whenStable();

    expect(close()!.getAttribute('aria-label')).toBe('Close');
  });
});

describe('MudBanner localization', () => {
  it('ships an English default when nothing is provided', async () => {
    const { fixture, host, close } = await render();

    host.closable.set(true);
    await fixture.whenStable();

    expect(close()!.getAttribute('aria-label')).toBe('Close');
  });
});

describe('MudBanner on the server', () => {
  // This component touches no browser API, so SSR is a cheap assertion rather
  // than the guarded-overlay problem it is elsewhere in this library. This
  // pins that the component renders correctly under a server PLATFORM_ID —
  // it does not detect DOM access, since jsdom's `document` is still present
  // here regardless of the platform id.
  it('renders under PLATFORM_ID server without touching the DOM', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-banner') as HTMLElement;

    expect(el.classList.contains('banner--info')).toBe(true);
    expect(el.querySelector('.banner__icon svg')).toBeTruthy();
    expect(el.querySelector('.banner__message')?.textContent).toContain('Scheduled maintenance tonight');
  });
});

describe('MudBanner projected icon', () => {
  it('replaces the default glyph with a projected one', async () => {
    @Component({
      imports: [MudBanner],
      template: `
        <mud-banner variant="error">
          <svg data-custom="1" viewBox="0 0 20 20"><path d="M0 0h20v20H0z" /></svg>
          Payments unavailable
        </mud-banner>
      `,
    })
    class ProjectedHost {}

    const fixture = TestBed.createComponent(ProjectedHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-banner') as HTMLElement;
    const svgs = el.querySelectorAll('.banner__icon svg');

    expect(svgs.length).toBe(1);
    expect(svgs[0].getAttribute('data-custom')).toBe('1');
  });
});

describe('MudBanner actions and links', () => {
  const css = () => [...document.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n');

  @Component({
    imports: [MudBanner],
    template: `
      <mud-banner variant="info" type="strong">
        Scheduled maintenance tonight.
        <a actions href="/status" class="probe-details">Details</a>
        <a actions href="/history" class="probe-history">History</a>
      </mud-banner>
    `,
  })
  class ActionsHost {}

  it('puts [actions] after the message, each a direct child of the actions row', async () => {
    const fixture = TestBed.createComponent(ActionsHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-banner') as HTMLElement;
    const message = el.querySelector('.banner__message')!;
    const actions = el.querySelector('.banner__actions')!;

    expect(message.textContent).toContain('Scheduled maintenance tonight.');
    expect(message.querySelector('a')).toBeNull();
    expect([...actions.children].map((c) => c.className)).toEqual(['probe-details', 'probe-history']);
    expect(message.compareDocumentPosition(actions)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders an empty actions row when nothing is projected there, which the CSS collapses', async () => {
    const { el } = await render();

    expect(el.querySelector('.banner__actions')!.children).toHaveLength(0);
    expect(css()).toMatch(/\.banner__actions:empty\s*\{[^}]*display:\s*none/);
  });

  // A link takes the brand blue, which IS the strong info surface (#0058D2 on #0058D2, 1:1) and sits at
  // ~1.5:1 on strong error. On strong banners links follow the banner's own text colour.
  it('re-points link colours to the banner text on strong banners', () => {
    TestBed.createComponent(ActionsHost).detectChanges();

    expect(css()).toMatch(
      /\.banner--strong\s*\{[^}]*--mud-color-link-primary-default:\s*var\(--_banner-text\)/,
    );
  });
});
