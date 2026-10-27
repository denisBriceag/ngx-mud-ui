import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MudTooltip } from '../mud-tooltip.directive';
import type { MudTooltipPlacement, MudTooltipSize } from '../tooltip-positions';

@Component({
  imports: [MudTooltip],
  template: `
    <button
      [mudTooltip]="message()"
      [tooltipShowDelay]="showDelay()"
      [tooltipHideDelay]="0"
      [tooltipTrigger]="trigger()"
      [tooltipInteractive]="interactive()"
      [tooltipPlacement]="placement()"
      [tooltipSize]="size()"
      [tooltipClosable]="closable()"
      [tooltipDisabled]="disabled()"
      [tooltipMaxWidth]="maxWidth()"
      (tooltipClosed)="dismissals = dismissals + 1"
    >
      Trigger
    </button>
  `,
})
class Host {
  readonly message = signal('Tooltip message');
  readonly showDelay = signal(0);
  readonly trigger = signal<'hover' | 'click' | 'focus' | 'manual'>('hover');
  readonly interactive = signal(true);
  readonly placement = signal<MudTooltipPlacement>('top-center');
  readonly size = signal<MudTooltipSize>('small');
  readonly closable = signal(false);
  readonly disabled = signal(false);
  readonly maxWidth = signal('240px');
  dismissals = 0;
}

@Component({
  imports: [MudTooltip],
  template: `
    <input mudTooltip="Tip" [tooltipShowDelay]="0" [tooltipHideDelay]="0" aria-describedby="external-hint" />
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
// focusin/focusout, not focus/blur: the directive listens for the BUBBLING pair
// so a wrapper host (breadcrumb's <li> around the consumer's <a>) still hears a
// descendant being focused. `bubbles: true` is what jsdom needs to propagate.
const focus = () => new FocusEvent('focusin', { bubbles: true });
const blur = () => new FocusEvent('focusout', { bubbles: true });

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

  it('keeps the close button out of the accessible description when closable', async () => {
    const { fixture, host, trigger } = await render();

    host.closable.set(true);
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

  // A tooltip that repeats the trigger's own accessible name (the sidebar's
  // compact rail) would be announced twice if it were also the description.
  it('leaves aria-describedby alone when tooltipDescribesTrigger is false', async () => {
    @Component({
      imports: [MudTooltip],
      template: `<button mudTooltip="Tip" tooltipTrigger="manual" [tooltipDescribesTrigger]="false">x</button>`,
    })
    class NoDescribe {}

    const fixture = TestBed.createComponent(NoDescribe);

    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    const tooltip = fixture.debugElement.children[0].injector.get(MudTooltip);

    tooltip.show();
    await fixture.whenStable();
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
    expect(button.hasAttribute('aria-describedby')).toBe(false);
    tooltip.hide();
  });

  // The opt-out must not touch a describedby the consumer owns, on show or on hide.
  it('keeps a pre-existing aria-describedby exactly as is when tooltipDescribesTrigger is false', async () => {
    @Component({
      imports: [MudTooltip],
      template: `<button mudTooltip="Tip" tooltipTrigger="manual" [tooltipDescribesTrigger]="false" aria-describedby="hint">x</button>`,
    })
    class NoDescribeHint {}

    const fixture = TestBed.createComponent(NoDescribeHint);

    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    const tooltip = fixture.debugElement.children[0].injector.get(MudTooltip);

    tooltip.show();
    await fixture.whenStable();
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
    expect(button.getAttribute('aria-describedby')).toBe('hint');

    tooltip.hide();
    await fixture.whenStable();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(button.getAttribute('aria-describedby')).toBe('hint');
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

  describe('closable / persistent', () => {
    it('renders a close button and stays open on mouseleave and blur', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      host.closable.set(true);
      await fixture.whenStable();

      await dispatch(fixture, trigger, mouseenter());
      await dispatch(fixture, trigger, mouseleave(), blur());

      expect(tooltip()).not.toBeNull();
      expect(tooltip()!.querySelector('button[aria-label="Close"]')).not.toBeNull();
    });

    it('closes via the close button and emits tooltipClosed', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      host.closable.set(true);
      await fixture.whenStable();

      await dispatch(fixture, trigger, mouseenter());

      const close = tooltip()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!;

      await dispatch(fixture, close, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).toBeNull();
      expect(host.dismissals).toBe(1);
    });

    it('click trigger mode: opens on click, ignores mouseleave, closes on second click', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      host.trigger.set('click');
      await fixture.whenStable();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).not.toBeNull();

      await dispatch(fixture, trigger, mouseleave());

      expect(tooltip()).not.toBeNull();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).toBeNull();
      expect(host.dismissals).toBe(1);
    });

    it('dismisses a click-opened tooltip when clicking outside trigger and bubble', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      host.trigger.set('click');
      await fixture.whenStable();

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

    it('updates maxWidth and closable of an open tooltip', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      await dispatch(fixture, trigger, mouseenter());

      host.maxWidth.set('320px');
      host.closable.set(true);
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
      const { fixture, host, trigger, tooltip } = await render();

      host.trigger.set('click');
      await fixture.whenStable();

      await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));

      expect(tooltip()).not.toBeNull();

      await scrollPage(fixture);

      expect(tooltip()).toBeNull();
      expect(trigger.getAttribute('aria-describedby')).toBeNull();
      expect(removed.mock.calls.some(([type]) => type === 'keydown')).toBe(true);
    });

    it('can be opened again by click afterwards (click trigger mode)', async () => {
      const { fixture, host, trigger, tooltip } = await render();

      host.trigger.set('click');
      await fixture.whenStable();

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

    it('hide() closes the tooltip without emitting tooltipClosed', async () => {
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

describe('MudTooltip official features', () => {
  it('non-interactive tooltips ignore bubble hover (official default)', async () => {
    const { fixture, host, trigger, tooltip } = await render();

    host.interactive.set(false);
    await fixture.whenStable();

    await dispatch(fixture, trigger, mouseenter());
    const bubble = tooltip()!;

    await dispatch(fixture, bubble, mouseenter());
    await dispatch(fixture, trigger, mouseleave());

    expect(tooltip()).toBeNull();
  });

  it('emits the close reason on tooltipClosed', async () => {
    const fixture = TestBed.createComponent(ReasonHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    await dispatch(fixture, trigger, mouseenter());
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await tick();
    await fixture.whenStable();

    expect(host.reasons).toEqual(['escape']);

    await dispatch(fixture, trigger, mouseenter());
    await dispatch(fixture, trigger, mouseleave());

    expect(host.reasons).toEqual(['escape', 'blur']);
  });

  it('coach variant: persists across mouseleave, shows title/hint/close, closes on Escape', async () => {
    const fixture = TestBed.createComponent(CoachHost);

    await fixture.whenStable();
    const host = fixture.componentInstance;
    const trigger = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    // Coach ignores hover: mouseenter must not open it.
    await dispatch(fixture, trigger, mouseenter());
    expect(document.querySelector('[role="tooltip"]')).toBeNull();

    // Opens on click (coach behaves click-triggered).
    await dispatch(fixture, trigger, new MouseEvent('click', { bubbles: true }));
    const bubble = document.querySelector<HTMLElement>('[role="tooltip"]')!;

    expect(bubble.classList.contains('tooltip--coach')).toBe(true);
    expect(bubble.querySelector('.tooltip-title')?.textContent).toContain('New!');
    expect(bubble.querySelector('.tooltip-hint')?.textContent).toContain('Press Esc to close');
    expect(bubble.querySelector('.tooltip-close')).not.toBeNull();

    // Ignores mouseleave.
    await dispatch(fixture, trigger, mouseleave());
    expect(document.querySelector('[role="tooltip"]')).not.toBeNull();

    // Esc dismisses with its reason.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await tick();
    await fixture.whenStable();
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
    expect(host.reasons).toEqual(['escape']);
  });
});

@Component({
  imports: [MudTooltip],
  template: `
    <button
      mudTooltip="Reason message"
      [tooltipShowDelay]="0"
      [tooltipHideDelay]="0"
      (tooltipClosed)="reasons.push($event)"
    >
      Trigger
    </button>
  `,
})
class ReasonHost {
  readonly reasons: string[] = [];
}

@Component({
  imports: [MudTooltip],
  template: `
    <button
      mudTooltip="Try the new filters."
      tooltipVariant="coach"
      tooltipTitle="New!"
      [tooltipShowDelay]="0"
      [tooltipHideDelay]="0"
      (tooltipClosed)="reasons.push($event)"
    >
      Filters
    </button>
  `,
})
class CoachHost {
  readonly reasons: string[] = [];
}

describe('MudTooltip programmatic content', () => {
  it('never opens while it has no content', async () => {
    @Component({
      imports: [MudTooltip],
      template: `<button mudTooltip [tooltipShowDelay]="0">Filters</button>`,
    })
    class Empty {}

    const fixture = TestBed.createComponent(Empty);

    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await tick();
    await fixture.whenStable();

    expect(document.querySelector('.tooltip')).toBeNull();
  });

  it('never sets aria-describedby while it has no content', async () => {
    @Component({
      imports: [MudTooltip],
      template: `<button mudTooltip [tooltipShowDelay]="0">Filters</button>`,
    })
    class Empty {}

    const fixture = TestBed.createComponent(Empty);

    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await tick();
    await fixture.whenStable();

    // A content-less tooltip must never wire up the trigger's accessible
    // description — every ordinary (untruncated) breadcrumb crumb carries
    // one of these, so a dangling aria-describedby here would ship on
    // every short-labelled crumb in production.
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('opens with content pushed by a host directive', async () => {
    @Component({
      imports: [MudTooltip],
      template: `<button mudTooltip [tooltipShowDelay]="0">Filters</button>`,
    })
    class Pushed {}

    const fixture = TestBed.createComponent(Pushed);

    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    fixture.debugElement
      .query((node) => node.nativeElement === trigger)
      .injector.get(MudTooltip)
      .setContent('The full untruncated title');

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    // The directive opens after tooltipShowDelay; advance the same way the
    // existing specs in this file do.
    await tick();
    await fixture.whenStable();

    expect(document.body.textContent).toContain('The full untruncated title');
  });

  it('lets an explicit binding win over pushed content', async () => {
    @Component({
      imports: [MudTooltip],
      template: `<button mudTooltip="Explicit" [tooltipShowDelay]="0">Filters</button>`,
    })
    class Explicit {}

    const fixture = TestBed.createComponent(Explicit);

    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('button') as HTMLElement;

    fixture.debugElement
      .query((node) => node.nativeElement === trigger)
      .injector.get(MudTooltip)
      .setContent('Pushed');

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    await tick();
    await fixture.whenStable();

    expect(document.body.textContent).toContain('Explicit');
    expect(document.body.textContent).not.toContain('Pushed');
  });
});

// A wrapper host is the shape hostDirectives produces when the directive that
// composes MudTooltip attaches to a container rather than to the control — the
// breadcrumb <li> around the consumer's <a>. Two things have to hold for that
// to work at all: the focus listeners must BUBBLE, and aria-describedby must
// land on the control a screen reader actually focuses.
describe('MudTooltip on a wrapper host', () => {
  @Component({
    imports: [MudTooltip],
    template: `
      <div mudTooltip="Wrapped" [tooltipShowDelay]="0" [tooltipHideDelay]="0">
        <a href="/x">Inner</a>
      </div>
    `,
  })
  class WrapperHost {}

  async function renderWrapper() {
    const fixture = TestBed.createComponent(WrapperHost);

    await fixture.whenStable();

    const wrapper = fixture.nativeElement.querySelector('div') as HTMLElement;
    const inner = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const directive = fixture.debugElement
      .query((node) => node.nativeElement === wrapper)
      .injector.get(MudTooltip);

    return { fixture, wrapper, inner, directive };
  }

  it('opens when a DESCENDANT is focused, because focusin bubbles', async () => {
    const { fixture, inner } = await renderWrapper();

    inner.focus();
    await tick();
    await fixture.whenStable();

    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('Wrapped');
  });

  it('describes the anchor element it was pointed at, and cleans it up again', async () => {
    const { fixture, wrapper, inner, directive } = await renderWrapper();

    directive.setAnchor(inner);
    inner.focus();
    await tick();
    await fixture.whenStable();

    const id = document.querySelector('.tooltip-inner')?.id;

    expect(inner.getAttribute('aria-describedby')).toBe(id);
    expect(wrapper.getAttribute('aria-describedby')).toBeNull();

    inner.blur();
    await tick();
    await fixture.whenStable();

    expect(inner.getAttribute('aria-describedby')).toBeNull();
  });

  it('falls back to the host when no anchor was pushed', async () => {
    const { fixture, wrapper, inner } = await renderWrapper();

    inner.focus();
    await tick();
    await fixture.whenStable();

    expect(wrapper.getAttribute('aria-describedby')).toBe(
      document.querySelector('.tooltip-inner')?.id,
    );
  });
});
