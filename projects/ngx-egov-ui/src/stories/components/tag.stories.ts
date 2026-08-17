import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import { EgovTag } from '../../../tag/src/public-api';
import { EgovIconComponent, provideEgovIcons } from '../../../icons/src/public-api';
import { checkmarkSmall, circleInfo } from '../../../icons/src/lib/data';

const ROW = 'display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:24px';
const COLORS = ['muted', 'neutral', 'accent', 'success', 'brand', 'danger', 'info'] as const;

const meta: Meta<EgovTag> = {
  title: 'Components/Tag',
  component: EgovTag,
  decorators: [
    applicationConfig({ providers: [provideEgovIcons([checkmarkSmall, circleInfo])] }),
    moduleMetadata({ imports: [EgovTag, EgovIconComponent] }),
  ],
  argTypes: {
    color: { control: 'select', options: [...COLORS] },
    type: {
      control: 'inline-radio',
      options: ['subtle', 'strong', 'outlined'],
      description: 'info supports only subtle and strong; outlined falls back to subtle with a dev warning',
    },
    size: { control: 'inline-radio', options: ['medium', 'small'] },
  },
  args: {
    color: 'success',
    type: 'subtle',
    size: 'medium',
  },
};

export default meta;

type Story = StoryObj<EgovTag>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <egov-tag [color]="color" [type]="type" [size]="size">Label</egov-tag>
      </div>
    `,
  }),
};

export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { colors: COLORS },
    template: `
      @for (color of colors; track color) {
        <div style="${ROW};padding:8px 24px">
          <egov-tag [color]="color" type="subtle">Label</egov-tag>
          <egov-tag [color]="color" type="strong">Label</egov-tag>
          @if (color !== 'info') {
            <egov-tag [color]="color" type="outlined">Label</egov-tag>
          }
          <span style="width:8ch;color:var(--color-text-base-secondary)">{{ color }}</span>
        </div>
      }
    `,
  }),
};

/** Medium is 24px tall (14/20 text), small is 20px (12/16 text). */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <egov-tag color="brand" type="strong">Medium</egov-tag>
        <egov-tag color="brand" type="strong" size="small">Small</egov-tag>
      </div>
    `,
  }),
};

/**
 * A leading icon tightens the left padding (6px on medium, 4px on small) and
 * is forced to 16px (medium) / 14px (small). Pass `scale="16"` so the icon
 * geometry matches the rendered size.
 */
export const LeadingIcon: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <egov-tag color="success">
          <egov-icon name="checkmark-small" [scale]="16" /> Approved
        </egov-tag>
        <egov-tag color="info" type="strong">
          <egov-icon name="circle-info" [scale]="16" /> In review
        </egov-tag>
        <egov-tag color="danger" type="outlined" size="small">
          <egov-icon name="circle-info" [scale]="16" /> Rejected
        </egov-tag>
      </div>
    `,
  }),
};
