import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { MudLink } from '../../../link/src/public-api';

const ROW = 'display:flex;gap:32px;align-items:center;flex-wrap:wrap;padding:24px';

const meta: Meta<MudLink> = {
  title: 'Components/Link',
  component: MudLink,
  decorators: [moduleMetadata({ imports: [MudLink] })],
  argTypes: {
    mudLink: { control: 'inline-radio', options: ['primary', 'strict'], description: 'Link style' },
    size: { control: 'inline-radio', options: ['large', 'medium', 'small', 'extra-small'] },
    underlined: { control: 'boolean' },
    touchTarget: {
      control: 'inline-radio',
      options: ['auto', 'pointer', 'touch', 'none'],
      description: 'auto = 40px target on touch devices, 32px otherwise; none = inline prose links',
    },
    disabled: { control: 'boolean' },
  },
  args: {
    mudLink: 'primary',
    size: 'medium',
    underlined: true,
    touchTarget: 'auto',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<MudLink>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <a
          href="#"
          [mudLink]="mudLink"
          [size]="size"
          [underlined]="underlined"
          [touchTarget]="touchTarget"
          [disabled]="disabled"
        >
          Services catalogue
        </a>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a href="#" mudLink size="large">Large</a>
        <a href="#" mudLink size="medium">Medium</a>
        <a href="#" mudLink size="small">Small</a>
        <a href="#" mudLink size="extra-small">Extra small</a>
      </div>
    `,
  }),
};

export const Variations: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a href="#" mudLink>Underlined</a>
        <a href="#" mudLink [underlined]="false">Non-underlined</a>
      </div>
    `,
  }),
};

export const Styles: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a href="#" mudLink>Primary</a>
        <a href="#" mudLink="strict">Strict</a>
      </div>
    `,
  }),
};

/**
 * `auto` picks the target from the device: 40px min-height on coarse-pointer
 * (touch) devices, 32px otherwise (WCAG 2.5.5 / 2.5.8). `none` opts out for
 * links inside running prose, where the extra padding would break text flow.
 */
export const TouchTargets: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a href="#" mudLink touchTarget="pointer" style="outline:1px dashed #ccc">32px pointer target</a>
        <a href="#" mudLink touchTarget="touch" style="outline:1px dashed #ccc">40px touch target</a>
      </div>
      <p style="max-width:48ch;padding:0 24px">
        Prose with an inline
        <a href="#" mudLink touchTarget="none">opted-out link</a>
        that keeps the surrounding line height intact.
      </p>
    `,
  }),
};

/** Disabled links stay in the DOM but expose `aria-disabled`, leave the tab order, and ignore clicks. */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a href="#" mudLink disabled>Disabled primary</a>
        <a href="#" mudLink="strict" disabled>Disabled strict</a>
      </div>
    `,
  }),
};
