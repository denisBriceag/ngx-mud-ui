import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudInfoBox } from './mud-info-box.component';
import type { MudInfoBoxEmphasis, MudInfoBoxVariant } from './mud-info-box.component';

@Component({
  imports: [MudInfoBox],
  template: `
    <mud-info-box
      [variant]="variant()"
      [emphasis]="emphasis()"
      [closable]="closable()"
      [hideIcon]="hideIcon()"
      [closeLabel]="closeLabel()"
      [aria-label]="ariaLabel()"
      (closed)="closedCount = closedCount + 1"
    >
      You will need your IDNP.
    </mud-info-box>
  `,
})
class Host {
  readonly variant = signal<MudInfoBoxVariant>('neutral');
  readonly emphasis = signal<MudInfoBoxEmphasis>('subtle');
  readonly closable = signal(false);
  readonly hideIcon = signal(false);
  readonly closeLabel = signal('Close');
  readonly ariaLabel = signal<string | undefined>(undefined);
  closedCount = 0;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();

  const el = fixture.nativeElement.querySelector('mud-info-box') as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    el,
    close: () => el.querySelector<HTMLButtonElement>('.info-box__close'),
    heading: () => el.querySelector('.info-box__heading'),
  };
}

describe('MudInfoBox', () => {
  it('renders a neutral, subtle box with a default glyph and projected body', async () => {
    const { el } = await render();

    expect(el.classList.contains('info-box')).toBe(true);
    expect(el.classList.contains('info-box--neutral')).toBe(true);
    expect(el.classList.contains('info-box--subtle')).toBe(true);
    expect(el.querySelector('.info-box__icon svg')).toBeTruthy();
    expect(el.querySelector('.info-box__message')?.textContent).toContain('You will need your IDNP.');
  });

  it('marks the icon decorative — the message text carries the meaning', async () => {
    const { el } = await render();

    expect(el.querySelector('.info-box__icon')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('maps every variant × emphasis pair to its two classes', async () => {
    const { fixture, host, el } = await render();

    for (const variant of ['neutral', 'moderate', 'warning', 'error'] as MudInfoBoxVariant[]) {
      for (const emphasis of ['subtle', 'strong'] as MudInfoBoxEmphasis[]) {
        host.variant.set(variant);
        host.emphasis.set(emphasis);
        await fixture.whenStable();

        expect(el.classList.contains(`info-box--${variant}`)).toBe(true);
        expect(el.classList.contains(`info-box--${emphasis}`)).toBe(true);
        expect(el.classList.contains(`info-box--${emphasis === 'subtle' ? 'strong' : 'subtle'}`)).toBe(false);
      }
    }
  });

  // neutral and moderate share the info glyph; warning and error have their own. Emphasis only
  // changes colours, never the glyph.
  it('uses three distinct default glyphs across the variants, whatever the emphasis', async () => {
    const { fixture, host, el } = await render();
    const glyphs = new Set<string>();

    for (const variant of ['neutral', 'moderate', 'warning', 'error'] as MudInfoBoxVariant[]) {
      for (const emphasis of ['subtle', 'strong'] as MudInfoBoxEmphasis[]) {
        host.variant.set(variant);
        host.emphasis.set(emphasis);
        await fixture.whenStable();
        glyphs.add(el.querySelector('.info-box__icon path')!.getAttribute('d')!);
      }
    }

    expect(glyphs.size).toBe(3);
  });

  it('hides the icon region entirely when hideIcon is set', async () => {
    const { fixture, host, el } = await render();

    expect(el.querySelector('.info-box__icon')).toBeTruthy();

    host.hideIcon.set(true);
    await fixture.whenStable();

    expect(el.querySelector('.info-box__icon')).toBeNull();
  });

  it('hides the close button unless closable', async () => {
    const { close } = await render();

    expect(close()).toBeNull();
  });

  it('emits closed once and does not remove itself', async () => {
    const { fixture, host, el, close } = await render();

    host.closable.set(true);
    await fixture.whenStable();

    close()!.click();
    await fixture.whenStable();

    expect(host.closedCount).toBe(1);
    // The consumer owns removal; the box must still be in the DOM.
    expect(fixture.nativeElement.querySelector('mud-info-box')).toBe(el);
  });

  it('labels the close button, defaulting to English', async () => {
    const { fixture, host, close } = await render();

    host.closable.set(true);
    await fixture.whenStable();
    expect(close()!.getAttribute('aria-label')).toBe('Close');

    host.closeLabel.set('Închide');
    await fixture.whenStable();
    expect(close()!.getAttribute('aria-label')).toBe('Închide');
  });

  // An unresolved translation renders empty; an empty aria-label on a button
  // whose only child is an aria-hidden svg leaves it with NO accessible name.
  it('falls back to the default when closeLabel is blank', async () => {
    const { fixture, host, close } = await render();

    host.closable.set(true);
    host.closeLabel.set('   ');
    await fixture.whenStable();

    expect(close()!.getAttribute('aria-label')).toBe('Close');
  });

  // Static in-flow content: a live region here would re-announce on render.
  it('is never a live region, under any input combination', async () => {
    const { fixture, host, el } = await render();

    host.variant.set('error');
    host.closable.set(true);
    await fixture.whenStable();

    expect(el.getAttribute('role')).toBeNull();
    expect(el.getAttribute('aria-live')).toBeNull();
  });

  it('takes a region role when labelled, so aria-label is never inert', async () => {
    const { fixture, host, el } = await render();

    host.ariaLabel.set('Application requirements');
    await fixture.whenStable();

    expect(el.getAttribute('role')).toBe('region');
    expect(el.getAttribute('aria-label')).toBe('Application requirements');
  });

  it('treats a blank aria-label as no label, so no ARIA lands on a role-less host', async () => {
    const { fixture, host, el } = await render();

    host.ariaLabel.set('   ');
    await fixture.whenStable();

    expect(el.getAttribute('aria-label')).toBeNull();
    expect(el.getAttribute('role')).toBeNull();
  });

  // The close button is absolutely positioned, so the box's own padding no
  // longer reserves room for it — `info-box--closable` does, and only then.
  it('flags the box as closable so the reserved inline padding follows the button', async () => {
    const { fixture, host, el } = await render();

    expect(el.classList.contains('info-box--closable')).toBe(false);

    host.closable.set(true);
    await fixture.whenStable();

    expect(el.classList.contains('info-box--closable')).toBe(true);
  });

  it('leaves the actions wrapper genuinely empty when nothing is projected, so :empty collapses it', async () => {
    const { el } = await render();
    const actions = el.querySelector('.info-box__actions')!;

    // Task 2 hides this with `:empty`; that rule only matches with zero child
    // nodes, so an Angular-inserted node here would silently break the layout.
    expect(actions.childNodes.length).toBe(0);
  });

  it('leaves the heading wrapper genuinely empty when nothing is projected, so :empty collapses it', async () => {
    const { el } = await render();
    const heading = el.querySelector('.info-box__heading')!;

    // `:empty` also drives the 6px heading-to-message margin, so a stray node
    // here would add that gap to a box that has no heading at all.
    expect(heading.childNodes.length).toBe(0);
  });

  it('leaves the message wrapper genuinely empty when no default content is projected, so :empty collapses it', async () => {
    @Component({
      imports: [MudInfoBox],
      template: `<mud-info-box><p heading>Before you begin</p><a actions href="/help">Read the guide</a></mud-info-box>`,
    })
    class NoBodyHost {}

    const fixture = TestBed.createComponent(NoBodyHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-info-box') as HTMLElement;
    const message = el.querySelector('.info-box__message')!;

    // Fix round 1 hides this with `:empty`; that rule only matches with zero
    // child nodes, so an Angular-inserted node here would silently break the
    // heading-to-actions gap.
    expect(message.childNodes.length).toBe(0);
  });
});

describe('MudInfoBox projection', () => {
  // A slot, not an input, so the consumer owns the element and can clamp or
  // truncate the title itself.
  it('routes [heading] content into the heading slot, keeping it out of the message', async () => {
    @Component({
      imports: [MudInfoBox],
      template: `
        <mud-info-box>
          <h3 heading>Before you begin</h3>
          You will need your IDNP.
        </mud-info-box>
      `,
    })
    class HeadingHost {}

    const fixture = TestBed.createComponent(HeadingHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-info-box') as HTMLElement;

    expect(el.querySelector('.info-box__heading h3')?.textContent).toContain('Before you begin');
    expect(el.querySelector('.info-box__message')?.textContent).toContain('You will need your IDNP.');
    expect(el.querySelector('.info-box__message')?.textContent).not.toContain('Before you begin');
  });

  // A conditional heading is the common case now that it is a slot. `@if`
  // wraps its content in an embedded view, but Angular still projects a block
  // by its single root node — so no `ngProjectAs` is needed here.
  it('routes a conditionally-rendered heading into the heading slot', async () => {
    @Component({
      imports: [MudInfoBox],
      template: `
        <mud-info-box>
          @if (show) {
            <p heading>Before you begin</p>
          }
          You will need your IDNP.
        </mud-info-box>
      `,
    })
    class ConditionalHeadingHost {
      readonly show = true;
    }

    const fixture = TestBed.createComponent(ConditionalHeadingHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-info-box') as HTMLElement;

    expect(el.querySelector('.info-box__heading p')?.textContent).toContain('Before you begin');
  });

  it('renders projected actions and replaces the default glyph with a projected one', async () => {
    @Component({
      imports: [MudInfoBox],
      template: `
        <mud-info-box variant="moderate" emphasis="strong">
          <svg data-custom="1" viewBox="0 0 20 20"><path d="M0 0h20v20H0z" /></svg>
          Body text
          <a actions href="/help" data-action="1">Read the guide</a>
        </mud-info-box>
      `,
    })
    class ProjectedHost {}

    const fixture = TestBed.createComponent(ProjectedHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-info-box') as HTMLElement;
    const svgs = el.querySelectorAll('.info-box__icon svg');

    expect(svgs.length).toBe(1);
    expect(svgs[0].getAttribute('data-custom')).toBe('1');
    expect(el.querySelector('.info-box__actions [data-action="1"]')).toBeTruthy();
  });

  // `actions` goes on EACH control. The slot is the flex row that spaces them,
  // so a single wrapper would be the only flex item and its children would butt
  // together — this asserts they land as siblings, where the 12px gap applies.
  it('makes every [actions] control a direct child of the row, not a wrapper', async () => {
    @Component({
      imports: [MudInfoBox],
      template: `
        <mud-info-box>
          Body text
          <button actions type="button">Stay signed in</button>
          <a actions href="/help">What does this mean?</a>
        </mud-info-box>
      `,
    })
    class ActionsHost {}

    const fixture = TestBed.createComponent(ActionsHost);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-info-box') as HTMLElement;
    const children = [...el.querySelector('.info-box__actions')!.children];

    expect(children.map((c) => c.tagName)).toEqual(['BUTTON', 'A']);
  });
});

describe('MudInfoBox on the server', () => {
  it('renders under PLATFORM_ID server', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    const fixture = TestBed.createComponent(Host);

    await fixture.whenStable();

    const el = fixture.nativeElement.querySelector('mud-info-box') as HTMLElement;

    expect(el.classList.contains('info-box--neutral')).toBe(true);
    expect(el.querySelector('.info-box__message')?.textContent).toContain('You will need your IDNP.');
  });

  // Hydration compares the server DOM to the first client render, so the markup
  // has to depend on NOTHING but the inputs. The component takes no platform
  // branch (contrast `MudLink`, which adds `link-target-pointer` only in a
  // browser on a coarse pointer) and the coarse-pointer close target is a CSS
  // media query, not `matchMedia` — so both renders must be identical.
  it('renders byte-identical markup on the server and in the browser, so hydration cannot mismatch', async () => {
    async function renderUnder(platform: string) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });

      const fixture = TestBed.createComponent(Host);

      fixture.componentInstance.closable.set(true);
      fixture.componentInstance.variant.set('error');
      fixture.componentInstance.emphasis.set('strong');
      await fixture.whenStable();

      return (fixture.nativeElement.querySelector('mud-info-box') as HTMLElement).outerHTML;
    }

    expect(await renderUnder('server')).toBe(await renderUnder('browser'));
  });
});
