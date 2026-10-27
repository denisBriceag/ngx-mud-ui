import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MudTabGroup } from '../mud-tab-group.component';
import { MudTab } from '../mud-tab.component';
import { MudTabLabel } from '../mud-tab-label.directive';
import type { MudTabChangeEvent } from '../mud-tab-change-event';

@Component({
  imports: [MudTabGroup, MudTab, MudTabLabel],
  template: `
    <mud-tab-group
      [(selectedIndex)]="selected"
      [stretchTabs]="stretch()"
      [size]="size()"
      [contentTabIndex]="0"
      (selectedTabChange)="lastChange = $event"
    >
      <mud-tab label="One">Content 1</mud-tab>
      <mud-tab label="Two" [disabled]="twoDisabled()">Content 2</mud-tab>
      <mud-tab [disabled]="thirdDisabled()">
        <ng-template mudTabLabel><span class="custom">Custom</span></ng-template>
        Content 3
      </mud-tab>
    </mud-tab-group>
  `,
})
class Host {
  selected = 0;
  readonly stretch = signal(false);
  readonly size = signal<'md' | 'sm'>('md');
  readonly twoDisabled = signal(false);
  readonly thirdDisabled = signal(false);
  lastChange?: MudTabChangeEvent;
}

@Component({
  imports: [MudTabGroup, MudTab],
  template: `
    <mud-tab-group [(selectedIndex)]="selected" (selectedTabChange)="lastChange = $event">
      <mud-tab label="One">Content 1</mud-tab>
      <mud-tab label="Two" [disabled]="twoDisabled()">Content 2</mud-tab>
      @if (showThird()) {
        <mud-tab label="Three">Content 3</mud-tab>
      }
    </mud-tab-group>
  `,
})
class DynamicHost {
  selected = 0;
  readonly showThird = signal(true);
  readonly twoDisabled = signal(false);
  lastChange?: MudTabChangeEvent;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const group = fixture.debugElement.query(By.directive(MudTabGroup)).componentInstance as MudTabGroup;
  const el: HTMLElement = fixture.nativeElement;

  return {
    fixture,
    group,
    host: fixture.componentInstance,
    tabs: () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]')),
    panels: () => Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]')),
  };
}

describe('MudTabGroup', () => {
  it('renders a tablist with a tab and panel per mud-tab, first active by default', async () => {
    const { tabs, panels } = await render();

    expect(tabs()).toHaveLength(3);
    expect(panels()).toHaveLength(3);
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs()[1].getAttribute('aria-selected')).toBe('false');
    expect(panels()[0].hasAttribute('hidden')).toBe(false);
    expect(panels()[1].hasAttribute('hidden')).toBe(true);
  });

  it('wires aria-controls / aria-labelledby / ids between tab and panel', async () => {
    const { tabs, panels } = await render();

    expect(tabs()[0].getAttribute('aria-controls')).toBe(panels()[0].id);
    expect(panels()[0].getAttribute('aria-labelledby')).toBe(tabs()[0].id);
  });

  it('exposes a horizontal tablist with roving tabindex (active 0, others -1)', async () => {
    const { fixture, tabs } = await render();
    const tablist = fixture.nativeElement.querySelector('[role="tablist"]') as HTMLElement;

    expect(tablist.getAttribute('aria-orientation')).toBe('horizontal');
    expect(tabs()[0].getAttribute('tabindex')).toBe('0');
    expect(tabs()[1].getAttribute('tabindex')).toBe('-1');
    expect(tabs()[2].getAttribute('tabindex')).toBe('-1');
  });

  it('selecting a tab updates aria-selected, panel visibility, and two-way selectedIndex', async () => {
    const { fixture, host, tabs, panels } = await render();

    tabs()[2].click();
    await fixture.whenStable();

    expect(host.selected).toBe(2);
    expect(tabs()[2].getAttribute('aria-selected')).toBe('true');
    expect(panels()[2].hasAttribute('hidden')).toBe(false);
    expect(panels()[0].hasAttribute('hidden')).toBe(true);
  });

  it('renders a custom mudTabLabel template into the tab button', async () => {
    const { tabs } = await render();

    expect(tabs()[2].querySelector('.custom')?.textContent).toBe('Custom');
  });

  it('emits selectedTabChange on change (not on init) with { index, tab }', async () => {
    const { fixture, host, group, tabs } = await render();

    expect(host.lastChange).toBeUndefined();

    tabs()[2].click();
    await fixture.whenStable();

    expect(host.lastChange).toEqual({ index: 2, tab: group.tabs()[2] });
  });

  it('does not select a disabled tab', async () => {
    const { fixture, host, tabs } = await render();

    host.twoDisabled.set(true);
    await fixture.whenStable();

    expect(tabs()[1].disabled).toBe(true);

    tabs()[1].click();
    await fixture.whenStable();

    expect(host.selected).toBe(0);
  });

  it('sets tabindex on the active panel from contentTabIndex, and none on inactive', async () => {
    const { panels } = await render();

    expect(panels()[0].getAttribute('tabindex')).toBe('0');
    expect(panels()[1].hasAttribute('tabindex')).toBe(false);
  });

  it('sets each tab.isActive / position', async () => {
    const { fixture, group, tabs } = await render();

    tabs()[2].click();
    await fixture.whenStable();

    expect(group.tabs()[2].isActive()).toBe(true);
    expect(group.tabs()[0].isActive()).toBe(false);
    expect(group.tabs()[2].position()).toBe(2);
  });

  it('focusTab moves DOM focus to the tab button', async () => {
    const { group, tabs } = await render();

    group.focusTab(1);

    expect(document.activeElement).toBe(tabs()[1]);
  });

  it('ArrowRight moves focus AND selection (automatic activation), skipping disabled', async () => {
    const { fixture, host, tabs, panels } = await render();

    host.twoDisabled.set(true);
    await fixture.whenStable();

    // Focus tab 0, then ArrowRight should skip the disabled tab 1, land on
    // tab 2, and select it immediately (official automatic activation).
    tabs()[0].dispatchEvent(new FocusEvent('focus'));
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(tabs()[2]);
    expect(host.selected).toBe(2);
    expect(panels()[2].hasAttribute('hidden')).toBe(false);
  });

  it('ArrowDown behaves like ArrowRight in the horizontal tablist', async () => {
    const { fixture, host, tabs } = await render();

    tabs()[0].dispatchEvent(new FocusEvent('focus'));
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(tabs()[1]);
    expect(host.selected).toBe(1);
  });

  it('ArrowLeft moves focus backwards, wrapping and skipping disabled tabs', async () => {
    const { fixture, host, tabs } = await render();

    host.twoDisabled.set(true);
    await fixture.whenStable();

    tabs()[0].dispatchEvent(new FocusEvent('focus'));
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(tabs()[2]);

    tabs()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('Home and End move focus to the first / last enabled tab', async () => {
    const { fixture, tabs } = await render();

    tabs()[1].dispatchEvent(new FocusEvent('focus'));
    tabs()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(tabs()[2]);

    tabs()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('Space activates the focused tab', async () => {
    const { fixture, host, tabs, panels } = await render();

    tabs()[0].dispatchEvent(new FocusEvent('focus'));
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();

    tabs()[1].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    await fixture.whenStable();

    expect(host.selected).toBe(1);
    expect(panels()[1].hasAttribute('hidden')).toBe(false);
  });

  it('applies the stretch modifier class', async () => {
    const { fixture, host } = await render();

    host.stretch.set(true);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.tabs')?.classList.contains('tabs--stretch')).toBe(true);
  });

  it('applies the compact size modifier class', async () => {
    const { fixture, host } = await render();

    host.size.set('sm');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.tabs')?.classList.contains('tabs--sm')).toBe(true);
  });

  it('shows no scroll chevrons when the strip fits the viewport', async () => {
    const { fixture } = await render();

    expect(fixture.nativeElement.querySelector('.tab-scroll')).toBeNull();
  });

  it('toggles scroll chevrons based on the viewport overflow position', async () => {
    const { fixture } = await render();
    const viewport = fixture.nativeElement.querySelector('.tab-viewport') as HTMLElement;
    const setMetrics = (scrollLeft: number) => {
      Object.defineProperty(viewport, 'scrollWidth', { value: 600, configurable: true });
      Object.defineProperty(viewport, 'clientWidth', { value: 300, configurable: true });
      Object.defineProperty(viewport, 'scrollLeft', { value: scrollLeft, configurable: true });
      viewport.dispatchEvent(new Event('scroll'));
    };

    // At the start: only the "next" chevron.
    setMetrics(0);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tab-scroll--prev')).toBeNull();
    expect(fixture.nativeElement.querySelector('.tab-scroll--next')).not.toBeNull();

    // In the middle: both chevrons.
    setMetrics(150);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tab-scroll--prev')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.tab-scroll--next')).not.toBeNull();

    // At the end: only the "prev" chevron.
    setMetrics(300);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tab-scroll--prev')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.tab-scroll--next')).toBeNull();
  });

  it('keeps the tablist inside a scroll viewport', async () => {
    const { fixture } = await render();
    const viewport = fixture.nativeElement.querySelector('.tab-viewport');

    expect(viewport?.querySelector('[role="tablist"]')).not.toBeNull();
  });

  it('can disable a tab that uses a custom mudTabLabel', async () => {
    const { fixture, host, tabs } = await render();

    host.thirdDisabled.set(true);
    await fixture.whenStable();

    expect(tabs()[2].disabled).toBe(true);
    expect(tabs()[2].querySelector('.custom')?.textContent).toBe('Custom');

    tabs()[2].click();
    await fixture.whenStable();

    expect(host.selected).toBe(0);
  });

  describe('disabled tabs and selection', () => {
    it('does not activate a disabled tab on programmatic selectedIndex writes', async () => {
      const { fixture, host, group, tabs } = await render();

      host.twoDisabled.set(true);
      await fixture.whenStable();

      group.selectedIndex.set(1);
      await fixture.whenStable();

      expect(group.selectedIndex()).toBe(0);
      expect(tabs()[1].getAttribute('aria-selected')).toBe('false');
      expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    });

    it('moves selection to the nearest enabled tab when the selected tab becomes disabled', async () => {
      const { fixture, host, tabs, panels } = await render();

      tabs()[1].click();
      await fixture.whenStable();

      host.twoDisabled.set(true);
      await fixture.whenStable();

      expect(tabs()[1].getAttribute('aria-selected')).toBe('false');
      expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
      expect(panels()[0].hasAttribute('hidden')).toBe(false);
    });

    it('does not emit selectedTabChange when correcting an initially disabled selection', async () => {
      const fixture = TestBed.createComponent(Host);

      fixture.componentInstance.twoDisabled.set(true);
      fixture.componentInstance.selected = 1;
      await fixture.whenStable();

      const el: HTMLElement = fixture.nativeElement;
      const tabs = Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]'));

      expect(fixture.componentInstance.lastChange).toBeUndefined();
      expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('removing the selected tab', () => {
    async function renderDynamic() {
      const fixture = TestBed.createComponent(DynamicHost);

      await fixture.whenStable();
      const el: HTMLElement = fixture.nativeElement;

      return {
        fixture,
        host: fixture.componentInstance,
        tabs: () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]')),
        panels: () => Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]')),
      };
    }

    it('falls back to the nearest remaining tab so a panel stays active and focusable', async () => {
      const { fixture, host, tabs, panels } = await renderDynamic();

      tabs()[2].click();
      await fixture.whenStable();

      expect(host.selected).toBe(2);

      host.showThird.set(false);
      await fixture.whenStable();

      expect(host.selected).toBe(1);
      expect(tabs()[1].getAttribute('aria-selected')).toBe('true');
      expect(tabs()[1].getAttribute('tabindex')).toBe('0');
      expect(panels()[1].hasAttribute('hidden')).toBe(false);
    });

    it('skips a disabled tab when falling back', async () => {
      const { fixture, host, tabs } = await renderDynamic();

      host.twoDisabled.set(true);
      await fixture.whenStable();

      tabs()[2].click();
      await fixture.whenStable();

      host.showThird.set(false);
      await fixture.whenStable();

      expect(host.selected).toBe(0);
      expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
    });
  });

  it('focusTab() does not touch the DOM on non-browser platforms', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const { group, tabs } = await render();

    group.focusTab(1);

    expect(document.activeElement).not.toBe(tabs()[1]);
  });
});

describe('MudTab badgeCount', () => {
  it('renders the count pill after the label and hides it when null', async () => {
    const fixture = TestBed.createComponent(BadgeHost);

    await fixture.whenStable();
    const buttons = fixture.nativeElement.querySelectorAll('.tab-button');

    expect(buttons[0].querySelector('.tab-badge')?.textContent?.trim()).toBe('12');
    expect(buttons[0].textContent).toContain('Inbox');
    expect(buttons[1].querySelector('.tab-badge')).toBeNull();

    fixture.componentInstance.count.set(null);
    await fixture.whenStable();
    expect(buttons[0].querySelector('.tab-badge')).toBeNull();
  });
});

@Component({
  imports: [MudTabGroup, MudTab],
  template: `
    <mud-tab-group>
      <mud-tab label="Inbox" [badgeCount]="count()">one</mud-tab>
      <mud-tab label="Archive">two</mud-tab>
    </mud-tab-group>
  `,
})
class BadgeHost {
  readonly count = signal<number | null>(12);
}
