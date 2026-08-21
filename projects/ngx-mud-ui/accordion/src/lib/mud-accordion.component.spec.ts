import { Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MudAccordionGroup } from './mud-accordion-group.component';
import { MudAccordion } from './mud-accordion.component';
import { MudAccordionHeader } from './mud-accordion-header.component';
import { MudAccordionDescription, MudAccordionTitle } from './mud-accordion-content.component';

@Component({
  imports: [MudAccordion, MudAccordionHeader, MudAccordionTitle, MudAccordionDescription],
  template: `
    <mud-accordion
      [expanded]="expanded()"
      [disabled]="disabled()"
      [hideToggle]="hideToggle()"
      (opened)="events.push('opened')"
      (closed)="events.push('closed')"
      (afterExpand)="events.push('afterExpand')"
      (afterCollapse)="events.push('afterCollapse')"
      (destroyed)="events.push('destroyed')"
    >
      <mud-accordion-header [headingLevel]="headingLevel()">
        <mud-accordion-title>Heading</mud-accordion-title>
        <mud-accordion-description>Supporting</mud-accordion-description>
      </mud-accordion-header>
      <p>Panel body</p>
    </mud-accordion>
  `,
})
class Host {
  readonly item = viewChild.required(MudAccordion);
  readonly expanded = signal(false);
  readonly disabled = signal(false);
  readonly hideToggle = signal(false);
  readonly headingLevel = signal(3);
  readonly events: string[] = [];
}

@Component({
  imports: [MudAccordionGroup, MudAccordion, MudAccordionHeader, MudAccordionTitle],
  template: `
    <mud-accordion-group [multi]="multi()">
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>First</mud-accordion-title>
        </mud-accordion-header>
        one
      </mud-accordion>
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>Second</mud-accordion-title>
        </mud-accordion-header>
        two
      </mud-accordion>
      <mud-accordion [disabled]="true">
        <mud-accordion-header>
          <mud-accordion-title>Third</mud-accordion-title>
        </mud-accordion-header>
        three
      </mud-accordion>
    </mud-accordion-group>
  `,
})
class GroupHost {
  readonly multi = signal(true);
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    trigger: root.querySelector('button.accordion__trigger') as HTMLButtonElement,
    header: root.querySelector('mud-accordion-header') as HTMLElement,
    item: root.querySelector('mud-accordion') as HTMLElement,
  };
}

async function renderGroup() {
  const fixture = TestBed.createComponent(GroupHost);

  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;

  return {
    fixture,
    host: fixture.componentInstance,
    group: root.querySelector('mud-accordion-group') as HTMLElement,
    triggers: Array.from(root.querySelectorAll('button.accordion__trigger')) as HTMLButtonElement[],
  };
}

describe('MudAccordion', () => {
  it('renders the upstream CSS contract and projects content', async () => {
    const { item, trigger, header } = await render();

    expect(item.classList.contains('accordion__item')).toBe(true);
    expect(header.classList.contains('accordion__header')).toBe(true);
    expect(trigger).toBeTruthy();
    expect(trigger.type).toBe('button');
    expect(trigger.querySelector('.accordion__heading')?.textContent).toContain('Heading');
    expect(trigger.querySelector('.accordion__supporting')?.textContent).toContain('Supporting');
    expect(item.textContent).toContain('Panel body');
  });

  it('wires the APG accordion ARIA contract between trigger and region', async () => {
    const { item, trigger } = await render();

    const region = item.querySelector('[role="region"]') as HTMLElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.id).toBeTruthy();
    expect(region).toBeTruthy();
    expect(trigger.getAttribute('aria-controls')).toBe(region.id);
    expect(region.getAttribute('aria-labelledby')).toBe(trigger.id);
  });

  it('exposes a heading role with a configurable level, default 3', async () => {
    const { fixture, host, header } = await render();

    expect(header.getAttribute('role')).toBe('heading');
    expect(header.getAttribute('aria-level')).toBe('3');

    host.headingLevel.set(2);
    await fixture.whenStable();
    expect(header.getAttribute('aria-level')).toBe('2');
  });

  it('expands on click, emitting opened and afterExpand', async () => {
    const { fixture, host, trigger, item } = await render();

    trigger.click();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(item.querySelector('.accordion__body--expanded')).toBeTruthy();
    expect(host.events).toContain('opened');
    expect(host.events).toContain('afterExpand');
  });

  it('collapses on second click, emitting closed and afterCollapse', async () => {
    const { fixture, host, trigger } = await render();

    trigger.click();
    await fixture.whenStable();
    trigger.click();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.events).toContain('closed');
    expect(host.events).toContain('afterCollapse');
  });

  describe('after-events when a declared transition never runs', () => {
    /** jsdom reports no transitions; pretend the stylesheet declares the real 225ms one. */
    function declareTransition() {
      const original = window.getComputedStyle.bind(window);

      vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element, pseudo?: string | null) => {
        const style = original(el, pseudo);

        if ((el as HTMLElement).classList?.contains('accordion__body')) {
          Object.defineProperty(style, 'transitionDuration', { value: '0.225s', configurable: true });
          Object.defineProperty(style, 'transitionDelay', { value: '0s', configurable: true });
        }

        return style;
      });
    }

    it('emits afterExpand via the fallback timer when transitionend never fires', async () => {
      declareTransition();
      const { fixture, host, trigger } = await render();

      trigger.click();
      await fixture.whenStable();

      // No transition runs in jsdom (as inside display:none subtrees) — the
      // event must still arrive once the declared duration has elapsed.
      expect(host.events).not.toContain('afterExpand');

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(host.events).toContain('afterExpand');
    });

    it('does not double-emit when transitionend fires before the fallback timer', async () => {
      declareTransition();
      const { fixture, host, trigger, item } = await render();

      trigger.click();
      await fixture.whenStable();

      const body = item.querySelector('.accordion__body') as HTMLElement;
      const event = new Event('transitionend') as TransitionEvent;

      Object.defineProperty(event, 'propertyName', { value: 'grid-template-rows' });
      body.dispatchEvent(event);
      await fixture.whenStable();

      expect(host.events.filter((e) => e === 'afterExpand')).toHaveLength(1);

      await new Promise((resolve) => setTimeout(resolve, 350));

      expect(host.events.filter((e) => e === 'afterExpand')).toHaveLength(1);
    });
  });

  it('honors the expanded input', async () => {
    const { fixture, host, trigger } = await render();

    host.expanded.set(true);
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('supports open/close/toggle methods', async () => {
    const { fixture, host, trigger } = await render();

    host.item().open();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    host.item().close();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    host.item().toggle();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('stays focusable when disabled, with aria-disabled and no activation', async () => {
    const { fixture, host, trigger } = await render();

    host.disabled.set(true);
    await fixture.whenStable();

    expect(trigger.disabled).toBe(false);
    expect(trigger.getAttribute('aria-disabled')).toBe('true');

    trigger.click();
    await fixture.whenStable();

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(host.events).not.toContain('opened');
  });

  it('shows the 45deg-rotating toggle icon unless hideToggle is set', async () => {
    const { fixture, host, trigger } = await render();

    const icon = trigger.querySelector('.accordion__icon') as HTMLElement;

    expect(icon).toBeTruthy();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('svg')).toBeTruthy();

    host.hideToggle.set(true);
    await fixture.whenStable();
    expect(trigger.querySelector('.accordion__icon')).toBeNull();
  });

  it('marks the collapsed body inert and lifts it when expanded', async () => {
    const { fixture, host, item } = await render();

    const body = item.querySelector('.accordion__body') as HTMLElement;

    expect(body.hasAttribute('inert')).toBe(true);

    host.expanded.set(true);
    await fixture.whenStable();
    expect(body.hasAttribute('inert')).toBe(false);
  });

  it('emits destroyed when the item is destroyed', async () => {
    const { fixture, host } = await render();

    fixture.destroy();

    expect(host.events).toContain('destroyed');
  });
});

describe('MudAccordionGroup', () => {
  it('renders the group class and leaves panels independent when multi is true', async () => {
    const { fixture, group, triggers } = await renderGroup();

    expect(group.classList.contains('accordion')).toBe(true);

    triggers[0].click();
    await fixture.whenStable();
    triggers[1].click();
    await fixture.whenStable();

    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the other panels when multi is false', async () => {
    const { fixture, host, triggers } = await renderGroup();

    host.multi.set(false);
    await fixture.whenStable();

    triggers[0].click();
    await fixture.whenStable();
    triggers[1].click();
    await fixture.whenStable();

    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('true');
  });

  it('moves focus with arrow keys, wrapping around and skipping disabled headers', async () => {
    const { triggers } = await renderGroup();

    triggers[0].focus();
    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);

    // Third header is disabled: ArrowDown skips it and wraps to the first.
    triggers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(triggers[0]);

    // ArrowUp wraps backwards, also skipping the disabled header.
    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);
  });

  it('keeps arrow-key navigation working when items are wrapped in intermediate elements', async () => {
    @Component({
      imports: [MudAccordionGroup, MudAccordion, MudAccordionHeader, MudAccordionTitle],
      template: `
        <mud-accordion-group>
          <div class="card">
            <mud-accordion>
              <mud-accordion-header>
                <mud-accordion-title>First</mud-accordion-title>
              </mud-accordion-header>
              one
            </mud-accordion>
          </div>
          <div class="card">
            <mud-accordion>
              <mud-accordion-header>
                <mud-accordion-title>Second</mud-accordion-title>
              </mud-accordion-header>
              two
            </mud-accordion>
          </div>
        </mud-accordion-group>
      `,
    })
    class WrappedHost {}

    const fixture = TestBed.createComponent(WrappedHost);

    await fixture.whenStable();

    const triggers = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.accordion__trigger'),
    );

    triggers[0].focus();
    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(document.activeElement).toBe(triggers[1]);
  });

  it('scopes arrow-key navigation to its own headers, skipping nested accordions', async () => {
    @Component({
      imports: [MudAccordionGroup, MudAccordion, MudAccordionHeader, MudAccordionTitle],
      template: `
        <mud-accordion-group>
          <mud-accordion [expanded]="true">
            <mud-accordion-header>
              <mud-accordion-title>Outer first</mud-accordion-title>
            </mud-accordion-header>
            <mud-accordion>
              <mud-accordion-header>
                <mud-accordion-title>Nested</mud-accordion-title>
              </mud-accordion-header>
              nested content
            </mud-accordion>
          </mud-accordion>
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Outer second</mud-accordion-title>
            </mud-accordion-header>
            two
          </mud-accordion>
        </mud-accordion-group>
      `,
    })
    class NestedHost {}

    const fixture = TestBed.createComponent(NestedHost);

    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const outerFirst = root.querySelector(
      'mud-accordion-group > mud-accordion > mud-accordion-header .accordion__trigger',
    ) as HTMLButtonElement;
    const outerSecond = root.querySelector(
      'mud-accordion-group > mud-accordion:last-of-type > mud-accordion-header .accordion__trigger',
    ) as HTMLButtonElement;

    outerFirst.focus();
    outerFirst.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    expect(document.activeElement).toBe(outerSecond);
  });

  it('supports Home and End, landing on the first and last enabled header', async () => {
    const { triggers } = await renderGroup();

    triggers[0].focus();
    // The last header is disabled, so End lands on the last enabled one.
    triggers[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement).toBe(triggers[1]);

    triggers[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(triggers[0]);
  });
});

describe('MudAccordionGroup appearance / size / iconPosition', () => {
  it('propagates the group axes to item modifier classes', async () => {
    const fixture = TestBed.createComponent(StyledGroupHost);

    await fixture.whenStable();
    const item = fixture.nativeElement.querySelector('mud-accordion') as HTMLElement;

    expect(item.classList.contains('accordion__item--trail-sites')).toBe(true);
    expect(item.classList.contains('accordion__item--sm')).toBe(true);
    expect(item.classList.contains('accordion__item--icon-left')).toBe(true);
  });

  it('marks open items with the open modifier and morphs the icon', async () => {
    const fixture = TestBed.createComponent(StyledGroupHost);

    await fixture.whenStable();
    const item = fixture.nativeElement.querySelector('mud-accordion') as HTMLElement;
    const trigger = item.querySelector('.accordion__trigger') as HTMLButtonElement;

    expect(item.classList.contains('accordion__item--open')).toBe(false);
    expect(trigger.querySelector('.accordion__icon-vertical')).toBeTruthy();

    trigger.click();
    await fixture.whenStable();
    expect(item.classList.contains('accordion__item--open')).toBe(true);
  });

  it('defaults the axes when an item is used without a group', async () => {
    const fixture = TestBed.createComponent(SoloItemHost);

    await fixture.whenStable();
    const item = fixture.nativeElement.querySelector('mud-accordion') as HTMLElement;

    expect(item.classList.contains('accordion__item--trail-sites')).toBe(false);
    expect(item.classList.contains('accordion__item--sm')).toBe(false);
    expect(item.classList.contains('accordion__item--icon-left')).toBe(false);
  });
});

@Component({
  imports: [MudAccordionGroup, MudAccordion, MudAccordionHeader, MudAccordionTitle],
  template: `
    <mud-accordion-group appearance="trail-sites" size="small" iconPosition="left">
      <mud-accordion>
        <mud-accordion-header>
          <mud-accordion-title>First</mud-accordion-title>
        </mud-accordion-header>
        one
      </mud-accordion>
    </mud-accordion-group>
  `,
})
class StyledGroupHost {}

@Component({
  imports: [MudAccordion, MudAccordionHeader, MudAccordionTitle],
  template: `
    <mud-accordion>
      <mud-accordion-header>
        <mud-accordion-title>Solo</mud-accordion-title>
      </mud-accordion-header>
      body
    </mud-accordion>
  `,
})
class SoloItemHost {}
