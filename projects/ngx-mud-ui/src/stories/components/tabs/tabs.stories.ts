import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { Component, signal } from '@angular/core';
import { MudTab, MudTabGroup, MudTabLabel } from 'ngx-mud-ui/tabs';
import type { MudTabChangeEvent } from 'ngx-mud-ui/tabs';
import { alarm, MudIconComponent, lock, provideMudIcons, search, settings } from 'ngx-mud-ui/icons';

const meta: Meta<MudTabGroup> = {
  title: 'Components/Tabs',
  component: MudTabGroup,
  decorators: [
    moduleMetadata({ imports: [MudTabGroup, MudTab, MudTabLabel, MudIconComponent] }),
    applicationConfig({ providers: [provideMudIcons([alarm, settings, search, lock])] }),
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

type Story = StoryObj<MudTabGroup>;

/** Plain labels, a custom `mudTabLabel` with a counter, and a disabled tab. */
export const Basic: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Example tabs">
        <mud-tab label="Overview"><p style="padding:16px 0">Overview content.</p></mud-tab>
        <mud-tab label="Details"><p style="padding:16px 0">Details content.</p></mud-tab>
        <mud-tab label="Alerts" [badgeCount]="3">
          <p style="padding:16px 0">Alerts content (label with the official count pill).</p>
        </mud-tab>
        <mud-tab label="Disabled" [disabled]="true"><p style="padding:16px 0">Unreachable.</p></mud-tab>
      </mud-tab-group>
    `,
  }),
};

/** Tabs stretched to fill the header width. */
export const Stretched: Story = {
  args: { stretchTabs: true },
  render: (args) => ({
    props: args,
    template: `
      <mud-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Stretched tabs">
        <mud-tab label="One"><p style="padding:16px 0">One.</p></mud-tab>
        <mud-tab label="Two"><p style="padding:16px 0">Two.</p></mud-tab>
        <mud-tab label="Three"><p style="padding:16px 0">Three.</p></mud-tab>
      </mud-tab-group>
    `,
  }),
};

export const Overflowing: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="max-width:520px;border:1px dashed #d0d0d0;border-radius:8px;padding:12px">
        <mud-tab-group aria-label="Many tabs">
          <mud-tab label="Overview"><p style="padding:16px 0">Overview.</p></mud-tab>
          <mud-tab label="Details"><p style="padding:16px 0">Details.</p></mud-tab>
          <mud-tab label="Documents"><p style="padding:16px 0">Documents.</p></mud-tab>
          <mud-tab label="History"><p style="padding:16px 0">History.</p></mud-tab>
          <mud-tab label="Payments"><p style="padding:16px 0">Payments.</p></mud-tab>
          <mud-tab label="Notifications"><p style="padding:16px 0">Notifications.</p></mud-tab>
          <mud-tab label="Permissions"><p style="padding:16px 0">Permissions.</p></mud-tab>
          <mud-tab label="Settings"><p style="padding:16px 0">Settings.</p></mud-tab>
          <mud-tab label="Advanced"><p style="padding:16px 0">Advanced.</p></mud-tab>
        </mud-tab-group>
      </div>
    `,
  }),
};

/** Custom labels with a leading `mud-icon` and a trailing counter. */
export const WithIconsAndCounters: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Tabs with icons">
        <mud-tab [badgeCount]="3">
          <ng-template mudTabLabel><mud-icon name="alarm" [scale]="20" /> Alerts</ng-template>
          <p style="padding:16px 0">Alerts.</p>
        </mud-tab>
        <mud-tab>
          <ng-template mudTabLabel><mud-icon name="search" [scale]="20" /> Search</ng-template>
          <p style="padding:16px 0">Search.</p>
        </mud-tab>
        <mud-tab>
          <ng-template mudTabLabel><mud-icon name="settings" [scale]="20" /> Settings</ng-template>
          <p style="padding:16px 0">Settings.</p>
        </mud-tab>
        <mud-tab [disabled]="true">
          <ng-template mudTabLabel><mud-icon name="lock" [scale]="20" /> Locked</ng-template>
          <p style="padding:16px 0">Unreachable (disabled tab with a custom icon label).</p>
        </mud-tab>
      </mud-tab-group>
    `,
  }),
};

/** First tab disabled (selection snaps to the first enabled), plus a disabled tab in the middle (keyboard skips it). */
export const DisabledTabs: Story = {
  render: (args) => ({
    props: args,
    template: `
      <mud-tab-group [stretchTabs]="stretchTabs" [size]="size" aria-label="Disabled tabs">
        <mud-tab label="Locked" [disabled]="true"><p style="padding:16px 0">Locked.</p></mud-tab>
        <mud-tab label="Active"><p style="padding:16px 0">This one is selected on load.</p></mud-tab>
        <mud-tab label="Skipped" [disabled]="true"><p style="padding:16px 0">Skipped.</p></mud-tab>
        <mud-tab label="Last"><p style="padding:16px 0">Reached by pressing → (skips the disabled one).</p></mud-tab>
      </mud-tab-group>
    `,
  }),
};

/** Live demo: external controls + a read-out of `selectedIndex` and the last `selectedTabChange`. */
@Component({
  selector: 'mud-tabs-demo',
  imports: [MudTabGroup, MudTab],
  template: `
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;font-family:system-ui">
      <button type="button" (click)="tabs.focusTab(0)">focusTab(0)</button>
      <button type="button" (click)="selected.set(clamp(selected() - 1))">Prev</button>
      <button type="button" (click)="selected.set(clamp(selected() + 1))">Next</button>
      <code>selectedIndex = {{ selected() }}</code>
      <code>last selectedTabChange = {{ lastEvent() }}</code>
    </div>
    <mud-tab-group
      #tabs
      [selectedIndex]="selected()"
      (selectedIndexChange)="selected.set($event)"
      (selectedTabChange)="onChange($event)"
      aria-label="Interactive tabs"
    >
      <mud-tab label="First"><p style="padding:16px 0">First content.</p></mud-tab>
      <mud-tab label="Second"><p style="padding:16px 0">Second content.</p></mud-tab>
      <mud-tab label="Third"><p style="padding:16px 0">Third content.</p></mud-tab>
    </mud-tab-group>
  `,
})
class TabsInteractiveDemo {
  readonly selected = signal(0);
  readonly lastEvent = signal('—');

  onChange(event: MudTabChangeEvent): void {
    this.lastEvent.set(`{ index: ${event.index} }`);
  }

  clamp(index: number): number {
    return Math.max(0, Math.min(2, index));
  }
}

/**
 * Shown as this story's code sample: the story itself renders a demo
 * component, whose selector alone would tell a reader nothing.
 */
const INTERACTIVE_SOURCE = `
@Component({
  imports: [MudTabGroup, MudTab],
  template: \`
    <mud-tab-group
      #tabs
      [selectedIndex]="selected()"
      (selectedIndexChange)="selected.set($event)"
      (selectedTabChange)="onChange($event)"
      aria-label="Application sections"
    >
      <mud-tab label="First">First content.</mud-tab>
      <mud-tab label="Second">Second content.</mud-tab>
      <mud-tab label="Third">Third content.</mud-tab>
    </mud-tab-group>

    <button type="button" (click)="tabs.focusTab(0)">Focus first tab</button>
  \`,
})
export class TabbedPanel {
  // selectedIndex is two-way bindable, so tabs can be driven from a route.
  readonly selected = signal(0);

  onChange(event: MudTabChangeEvent): void {
    // event.index and event.tab identify the newly selected tab
  }
}
`;

export const Interactive: Story = {
  parameters: {
    controls: { disable: true },
    docs: { source: { code: INTERACTIVE_SOURCE, language: 'ts' } },
  },
  decorators: [moduleMetadata({ imports: [TabsInteractiveDemo] })],
  render: () => ({ template: `<mud-tabs-demo />` }),
};

/** `badgeCount` renders the official count pill after the label. */
export const WithBadges: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <mud-tab-group aria-label="Mailbox">
        <mud-tab label="Inbox" [badgeCount]="12">Inbox content</mud-tab>
        <mud-tab label="Sent">Sent content</mud-tab>
        <mud-tab label="Spam" [badgeCount]="3" [disabled]="true">Spam content</mud-tab>
      </mud-tab-group>
    `,
  }),
};
