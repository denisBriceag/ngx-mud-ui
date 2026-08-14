import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EgovTabGroup } from './egov-tab-group.component';
import { EgovTab } from './egov-tab.component';
import { EgovTabLabel } from './egov-tab-label.directive';
import type { EgovTabChangeEvent } from './egov-tab-change-event';

@Component({
  imports: [EgovTabGroup, EgovTab, EgovTabLabel],
  template: `
    <egov-tab-group
      [(selectedIndex)]="selected"
      [stretchTabs]="stretch()"
      [size]="size()"
      [contentTabIndex]="0"
      (selectedTabChange)="lastChange = $event"
    >
      <egov-tab label="One">Content 1</egov-tab>
      <egov-tab label="Two" [disabled]="twoDisabled()">Content 2</egov-tab>
      <egov-tab [disabled]="thirdDisabled()">
        <ng-template egovTabLabel><span class="custom">Custom</span></ng-template>
        Content 3
      </egov-tab>
    </egov-tab-group>
  `,
})
class Host {
  selected = 0;
  readonly stretch = signal(false);
  readonly size = signal<'md' | 'sm'>('md');
  readonly twoDisabled = signal(false);
  readonly thirdDisabled = signal(false);
  lastChange?: EgovTabChangeEvent;
}

async function render() {
  const fixture = TestBed.createComponent(Host);

  await fixture.whenStable();
  const group = fixture.debugElement.query(By.directive(EgovTabGroup)).componentInstance as EgovTabGroup;
  const el: HTMLElement = fixture.nativeElement;

  return {
    fixture,
    group,
    host: fixture.componentInstance,
    tabs: () => Array.from(el.querySelectorAll<HTMLButtonElement>('[role="tab"]')),
    panels: () => Array.from(el.querySelectorAll<HTMLElement>('[role="tabpanel"]')),
  };
}

describe('EgovTabGroup', () => {
  it('renders a tablist with a tab and panel per egov-tab, first active by default', async () => {
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

  it('renders a custom egovTabLabel template into the tab button', async () => {
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

  it('Enter activates the focused tab; ArrowRight moves focus skipping disabled', async () => {
    const { fixture, host, tabs, panels } = await render();

    host.twoDisabled.set(true);
    await fixture.whenStable();

    // Focus tab 0, then ArrowRight should skip the disabled tab 1 and land on tab 2.
    tabs()[0].dispatchEvent(new FocusEvent('focus'));
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();

    expect(document.activeElement).toBe(tabs()[2]);

    tabs()[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(host.selected).toBe(2);
    expect(panels()[2].hasAttribute('hidden')).toBe(false);
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

  it('can disable a tab that uses a custom egovTabLabel', async () => {
    const { fixture, host, tabs } = await render();

    host.thirdDisabled.set(true);
    await fixture.whenStable();

    expect(tabs()[2].disabled).toBe(true);
    expect(tabs()[2].querySelector('.custom')?.textContent).toBe('Custom');

    tabs()[2].click();
    await fixture.whenStable();

    expect(host.selected).toBe(0);
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
