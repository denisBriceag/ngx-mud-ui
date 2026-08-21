import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MudTooltip } from './mud-tooltip.directive';
import type { MudTooltipPlacement, MudTooltipSize } from './tooltip-positions';

@Component({
  imports: [MudTooltip],
  template: `
    <button
      [mudTooltip]="message()"
      [tooltipShowDelay]="showDelay()"
      [tooltipPlacement]="placement()"
      [tooltipSize]="size()"
      [tooltipCloseable]="closeable()"
      [tooltipDisabled]="disabled()"
      [tooltipMaxWidth]="maxWidth()"
      (tooltipDismissed)="dismissals = dismissals + 1"
    >
      Trigger
    </button>
  `,
})
class Host {
  readonly message = signal('Tooltip message');
  readonly showDelay = signal(0);
  readonly placement = signal<MudTooltipPlacement>('top-center');
  readonly size = signal<MudTooltipSize>('small');
  readonly closeable = signal(false);
  readonly disabled = signal(false);
  readonly maxWidth = signal('240px');
  dismissals = 0;
}

@Component({
  imports: [MudTooltip],
  template: `
    <input mudTooltip="Tip" [tooltipShowDelay]="0" aria-describedby="external-hint" />
    <span id="external-hint">Format: DD.MM.YYYY</span>
  `,
})
class DescribedHost {}

function tick(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;

  return {
    fixture,
    host: fixture.componentInstance,
    trigger,
    tooltip: () => document.querySelector<HTMLElement>('[role="tooltip"]'),
  };
}

async function renderWithDirective() {
  const rendered = await render();
  const directive = rendered.fixture.debugElement
    .query(By.directive(MudTooltip))
    .injector.get(MudTooltip);

  return { ...rendered, directive };
}

async function dispatch(fixture: ComponentFixture<unknown>, el: HTMLElement, ...events: Event[]) {
  for (const event of events) el.dispatchEvent(event);

  await tick();
  await fixture.whenStable();
}

const mouseenter = () => new MouseEvent('mouseenter');
const mouseleave = () => new MouseEvent('mouseleave');
const focus = () => new FocusEvent('focus');
const blur = () => new FocusEvent('blur');

describe('MudTooltip', () => {
  it('renders no tooltip until triggered', async () => {
    const { tooltip } = await render();

    expect(tooltip()).toBeNull();
  });

  it('shows the message in a role="tooltip" element on mouseenter', async () => {
    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, mouseenter());

    expect(tooltip()).not.toBeNull();
    expect(tooltip()!.textContent).toContain('Tooltip message');
  });

  it('links the trigger via aria-describedby to the message element only', async () => {
    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, mouseenter());

    const describedby = trigger.getAttribute('aria-describedby');

    expect(describedby).toBeTruthy();

    const described = document.getElementById(describedby!)!;

    expect(tooltip()!.contains(described)).toBe(true);
    expect(described.textContent).toContain('Tooltip message');
    // The description source must hold nothing but the message — a close
    // button inside it would leak its aria-label into the announced text.
    expect(described.querySelector('button')).toBeNull();

    await dispatch(fixture, trigger, mouseleave());

    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('keeps the close button out of the accessible description when closeable', async () => {
    const { fixture, host, trigger } = await render();

    host.closeable.set(true);
    await fixture.whenStable();

    await dispatch(fixture, trigger, mouseenter());

    const described = document.getElementById(trigger.getAttribute('aria-describedby')!)!;

    expect(described.querySelector('[aria-label]')).toBeNull();
    expect(described.textContent).toContain('Tooltip message');
  });

  it('hides the tooltip on mouseleave', async () => {
    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, mouseenter());
    await dispatch(fixture, trigger, mouseleave());

    expect(tooltip()).toBeNull();
  });

  it('waits for tooltipShowDelay before showing on hover', async () => {
    const { fixture, host, trigger, tooltip } = await render();

    host.showDelay.set(40);
    await fixture.whenStable();

    trigger.dispatchEvent(mouseenter());
    await fixture.whenStable();

    expect(tooltip()).toBeNull();

    await tick(50);
    await fixture.whenStable();

    expect(tooltip()).not.toBeNull();
  });

  it('shows immediately on focus, ignoring the show delay', async () => {
    const { fixture, host, trigger, tooltip } = await render();

    host.showDelay.set(5000);
    await fixture.whenStable();

    await dispatch(fixture, trigger, focus());

    expect(tooltip()).not.toBeNull();
  });

  it('hides the tooltip on blur', async () => {
    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, focus());
    await dispatch(fixture, trigger, blur());

    expect(tooltip()).toBeNull();
  });

  it('renders with the default placement and size classes', async () => {
    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, mouseenter());

    expect(tooltip()!.classList).toContain('tooltip');
    expect(tooltip()!.classList).toContain('tooltip--top-center');
    expect(tooltip()!.classList).toContain('tooltip--small');
  });

  it('applies the configured placement and size classes', async () => {
    const { fixture, host, trigger, tooltip } = await render();

    host.placement.set('bottom-right');
    host.size.set('large');
    await fixture.whenStable();

    await dispatch(fixture, trigger, mouseenter());

    expect(tooltip()!.classList).toContain('tooltip--bottom-right');
    expect(tooltip()!.classList).toContain('tooltip--large');
  });

  it('exposes tooltipMaxWidth as a CSS custom property on the bubble', async () => {
    const { fixture, host, trigger, tooltip } = await render();

    host.maxWidth.set('320px');
    await fixture.whenStable();

    await dispatch(fixture, trigger, mouseenter());

    expect(tooltip()!.style.getPropertyValue('--mud-tooltip-max-width')).toBe('320px');
  });

  it('does not show when tooltipDisabled is set', async () => {
    const { fixture, host, trigger, tooltip } = await render();

    host.disabled.set(true);
    await fixture.whenStable();

    await dispatch(fixture, trigger, mouseenter());
    await dispatch(fixture, trigger, focus());

    expect(tooltip()).toBeNull();
  });

  it('dismisses on Escape without hiding on other keys', async () => {
    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, focus());
    await dispatch(fixture, document.body, new KeyboardEvent('keydown', { key: 'a', bubbles: true }));

    expect(tooltip()).not.toBeNull();

    await dispatch(fixture, document.body, new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(tooltip()).toBeNull();
  });

  it('consumes Escape so listeners on enclosing surfaces do not also react', async () => {
    const outer = vi.fn();

    document.addEventListener('keydown', outer);

    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, focus());
    await dispatch(fixture, document.body, new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(tooltip()).toBeNull();
    expect(outer).not.toHaveBeenCalled();

    document.removeEventListener('keydown', outer);
  });

  describe('closeable / persistent', () => {
    it('renders a close button and stays open on mouseleave and blur', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      host.closeable.set(true);
      await fixture.whenStable();

      await dispatch(fixture, trigger, mouseenter());
      await dispatch(fixture, trigger, mouseleave(), blur());

      expect(tooltip()).not.toBeNull();
      expect(tooltip()!.querySelector('button[aria-label="Close"]')).not.toBeNull();
    });

    it('dismisses via the close button and emits tooltipDismissed', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      host.closeable.set(true);
      await fixture.whenStable();

      await dispatch(fixture, trigger, mouseenter());

      const close = tooltip()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!;

      await dispatch(fixture, close, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).toBeNull();
      expect(host.dismissals).toBe(1);
    });

    it('pins on trigger click so mouseleave no longer hides, and unpins on second click', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).not.toBeNull();

      await dispatch(fixture, trigger, mouseleave());

      expect(tooltip()).not.toBeNull();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).toBeNull();
      expect(host.dismissals).toBe(1);
    });

    it('dismisses a pinned tooltip when clicking outside trigger and bubble', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).not.toBeNull();

      await dispatch(fixture, document.body, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).toBeNull();
      expect(host.dismissals).toBe(1);
    });
  });

  it('appends to a pre-existing aria-describedby and restores it on hide', async () => {
    const fixture = TestBed.createComponent(DescribedHost);

    await fixture.whenStable();
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('input')!;

    await dispatch(fixture, trigger, focus());

    const tokens = trigger.getAttribute('aria-describedby')!.split(/\s+/);

    expect(tokens).toContain('external-hint');
    expect(tokens).toHaveLength(2);

    await dispatch(fixture, trigger, blur());

    expect(trigger.getAttribute('aria-describedby')).toBe('external-hint');
  });

  describe('input changes while open', () => {
    it('updates the visible message of an open tooltip', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      await dispatch(fixture, trigger, mouseenter());

      expect(tooltip()!.textContent).toContain('Tooltip message');

      host.message.set('Copied!');
      await fixture.whenStable();

      expect(tooltip()!.textContent).toContain('Copied!');
    });

    it('updates maxWidth and closeable of an open tooltip', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      await dispatch(fixture, trigger, mouseenter());

      host.maxWidth.set('320px');
      host.closeable.set(true);
      await fixture.whenStable();

      expect(tooltip()!.style.getPropertyValue('--mud-tooltip-max-width')).toBe('320px');
      expect(tooltip()!.querySelector('button[aria-label="Close"]')).not.toBeNull();
    });
  });

  describe('closed by scrolling (CDK close scroll strategy)', () => {
    async function scrollPage(fixture: ComponentFixture<Host>) {
      document.dispatchEvent(new Event('scroll'));
      await tick(30);
      await fixture.whenStable();
    }

    it('cleans up aria-describedby and the document keydown listener', async () => {
      const removed = vi.spyOn(document, 'removeEventListener');
      const { fixture, trigger, tooltip } = await render();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).not.toBeNull();

      await scrollPage(fixture);

      expect(tooltip()).toBeNull();
      expect(trigger.getAttribute('aria-describedby')).toBeNull();
      expect(removed.mock.calls.some(([type]) => type === 'keydown')).toBe(true);
    });

    it('can be pinned open again by click afterwards', async () => {
      const { fixture, trigger, tooltip } = await render();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));
      await scrollPage(fixture);

      expect(tooltip()).toBeNull();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).not.toBeNull();
    });
  });

  describe('programmatic API', () => {
    it('show() opens a persistent tooltip that survives mouseleave', async () => {
      const { fixture, trigger, tooltip, directive } = await renderWithDirective();

      directive.show();
      await tick();
      await fixture.whenStable();

      expect(tooltip()).not.toBeNull();

      await dispatch(fixture, trigger, mouseleave());

      expect(tooltip()).not.toBeNull();
    });

    it('hide() closes the tooltip without emitting tooltipDismissed', async () => {
      const { fixture, host, tooltip, directive } = await renderWithDirective();

      directive.show();
      await tick();
      await fixture.whenStable();

      directive.hide();
      await tick();
      await fixture.whenStable();

      expect(tooltip()).toBeNull();
      expect(host.dismissals).toBe(0);
    });
  });

  it('removes its document keydown listener on hide and on destroy', async () => {
    const added = vi.spyOn(document, 'addEventListener');
    const removed = vi.spyOn(document, 'removeEventListener');
    const { fixture, trigger, directive } = await renderWithDirective();

    const keydownHandler = () => {
      const call = added.mock.calls.find(([type]) => type === 'keydown');

      return call?.[1];
    };

    await dispatch(fixture, trigger, mouseenter());

    expect(keydownHandler()).toBeDefined();

    await dispatch(fixture, trigger, mouseleave());

    expect(removed.mock.calls.some(([type, fn]) => type === 'keydown' && fn === keydownHandler())).toBe(true);

    removed.mockClear();
    directive.show();
    await tick();
    fixture.destroy();

    expect(removed.mock.calls.some(([type, fn]) => type === 'keydown' && fn === keydownHandler())).toBe(true);
  });

  describe('server-side rendering', () => {
    it('show() is a no-op on non-browser platforms', async () => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });

      const { fixture, tooltip, directive } = await renderWithDirective();

      directive.show();
      await tick();
      await fixture.whenStable();

      expect(tooltip()).toBeNull();
    });
  });

  it('keeps the tooltip open while the pointer is over the bubble', async () => {
    const { fixture, trigger, tooltip } = await render();

    await dispatch(fixture, trigger, mouseenter());

    const bubble = tooltip()!;

    trigger.dispatchEvent(mouseleave());
    bubble.dispatchEvent(mouseenter());
    await tick();
    await fixture.whenStable();

    expect(tooltip()).not.toBeNull();

    await dispatch(fixture, bubble, mouseleave());

    expect(tooltip()).toBeNull();
  });
});
