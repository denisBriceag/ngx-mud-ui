import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { EgovTab, EgovTabGroup, EgovTabLabel } from '../../../tabs/src/public-api';
import type { EgovTabChangeEvent } from '../../../tabs/src/public-api';
import { alarm, EgovIconComponent, lock, provideEgovIcons, search, settings } from '../../../icons/src/public-api';

const COUNTER_STYLE =
  'display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:9999px;background:var(--gray-100,#f1f1f1);color:var(--black,#121212);font-size:12px';

const meta: Meta<EgovTabGroup> = {
  title: 'Components/Tabs',
  component: EgovTabGroup,
  decorators: [
    moduleMetadata({ imports: [EgovTabGroup, EgovTab, EgovTabLabel, EgovIconComponent] }),
    applicationConfig({ providers: [provideEgovIcons([alarm, settings, search, lock])] }),
  ],
  argTypes: {
    stretchTabs: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
  args: {
    stretchTabs: false,
    size: 'md',
  },
};

export default meta;

type Story = StoryObj<EgovTabGroup>;

/** Plain labels, a custom `egovTabLabel` with a counter, and a disabled tab. */
export const Basic: Story = {
  render: (args) => ({
    props: args,
    template: `
      <egov-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Example tabs">
        <egov-tab label="Overview"><p style="padding:16px 0">Overview content.</p></egov-tab>
        <egov-tab label="Details"><p style="padding:16px 0">Details content.</p></egov-tab>
        <egov-tab>
          <ng-template egovTabLabel>Alerts <span style="${COUNTER_STYLE}">3</span></ng-template>
          <p style="padding:16px 0">Alerts content (custom label with a counter).</p>
        </egov-tab>
        <egov-tab label="Disabled" [disabled]="true"><p style="padding:16px 0">Unreachable.</p></egov-tab>
      </egov-tab-group>
    `,
  }),
};

/** Tabs stretched to fill the header width. */
export const Stretched: Story = {
  args: { stretchTabs: true },
  render: (args) => ({
    props: args,
    template: `
      <egov-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Stretched tabs">
        <egov-tab label="One"><p style="padding:16px 0">One.</p></egov-tab>
        <egov-tab label="Two"><p style="padding:16px 0">Two.</p></egov-tab>
        <egov-tab label="Three"><p style="padding:16px 0">Three.</p></egov-tab>
      </egov-tab-group>
    `,
  }),
};

/** Custom labels with a leading `egov-icon` and a trailing counter. */
export const WithIconsAndCounters: Story = {
  render: (args) => ({
    props: args,
    template: `
      <egov-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Tabs with icons">
        <egov-tab>
          <ng-template egovTabLabel><egov-icon name="alarm" [scale]="20" /> Alerts <span style="${COUNTER_STYLE}">3</span></ng-template>
          <p style="padding:16px 0">Alerts.</p>
        </egov-tab>
        <egov-tab>
          <ng-template egovTabLabel><egov-icon name="search" [scale]="20" /> Search</ng-template>
          <p style="padding:16px 0">Search.</p>
        </egov-tab>
        <egov-tab>
          <ng-template egovTabLabel><egov-icon name="settings" [scale]="20" /> Settings</ng-template>
          <p style="padding:16px 0">Settings.</p>
        </egov-tab>
        <egov-tab [disabled]="true">
          <ng-template egovTabLabel><egov-icon name="lock" [scale]="20" /> Locked</ng-template>
          <p style="padding:16px 0">Unreachable (disabled tab with a custom icon label).</p>
        </egov-tab>
      </egov-tab-group>
    `,
  }),
};

/** First tab disabled (selection snaps to the first enabled), plus a disabled tab in the middle (keyboard skips it). */
export const DisabledTabs: Story = {
  render: (args) => ({
    props: args,
    template: `
      <egov-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Disabled tabs">
        <egov-tab label="Locked" [disabled]="true"><p style="padding:16px 0">Locked.</p></egov-tab>
        <egov-tab label="Active"><p style="padding:16px 0">This one is selected on load.</p></egov-tab>
        <egov-tab label="Skipped" [disabled]="true"><p style="padding:16px 0">Skipped.</p></egov-tab>
        <egov-tab label="Last"><p style="padding:16px 0">Reached by pressing → (skips the disabled one).</p></egov-tab>
      </egov-tab-group>
    `,
  }),
};

/** Live demo: external controls + a read-out of `selectedIndex` and the last `selectedTabChange`. */
@Component({
  selector: 'egov-tabs-demo',
  imports: [EgovTabGroup, EgovTab],
  template: `
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;font-family:system-ui">
      <button type="button" (click)="tabs.focusTab(0)">focusTab(0)</button>
      <button type="button" (click)="selected.set(clamp(selected() - 1))">Prev</button>
      <button type="button" (click)="selected.set(clamp(selected() + 1))">Next</button>
      <code>selectedIndex = {{ selected() }}</code>
      <code>last selectedTabChange = {{ lastEvent() }}</code>
    </div>
    <egov-tab-group
      #tabs
      [selectedIndex]="selected()"
      (selectedIndexChange)="selected.set($event)"
      (selectedTabChange)="onChange($event)"
      aria-label="Interactive tabs"
    >
      <egov-tab label="First"><p style="padding:16px 0">First content.</p></egov-tab>
      <egov-tab label="Second"><p style="padding:16px 0">Second content.</p></egov-tab>
      <egov-tab label="Third"><p style="padding:16px 0">Third content.</p></egov-tab>
    </egov-tab-group>
  `,
})
class TabsInteractiveDemo {
  readonly selected = signal(0);
  readonly lastEvent = signal('—');

  onChange(event: EgovTabChangeEvent): void {
    this.lastEvent.set(`{ index: ${event.index} }`);
  }

  clamp(index: number): number {
    return Math.max(0, Math.min(2, index));
  }
}

export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [TabsInteractiveDemo] })],
  render: () => ({ template: `<egov-tabs-demo />` }),
};
