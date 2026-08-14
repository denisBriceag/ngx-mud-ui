import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import { Component, DestroyRef, DOCUMENT, inject } from '@angular/core';
import { EgovLink } from '../../../link/src/public-api';

const ROW = 'display:flex;gap:32px;align-items:center;flex-wrap:wrap;padding:24px';

const meta: Meta<EgovLink> = {
  title: 'Components/Link',
  component: EgovLink,
  decorators: [moduleMetadata({ imports: [EgovLink] })],
  argTypes: {
    egovLink: { control: 'inline-radio', options: ['primary', 'strict'], description: 'Link style' },
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
    egovLink: 'primary',
    size: 'medium',
    underlined: true,
    touchTarget: 'auto',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<EgovLink>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${ROW}">
        <a
          href="#"
          [egovLink]="egovLink"
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
        <a href="#" egovLink size="large">Large</a>
        <a href="#" egovLink size="medium">Medium</a>
        <a href="#" egovLink size="small">Small</a>
        <a href="#" egovLink size="extra-small">Extra small</a>
      </div>
    `,
  }),
};

export const Variations: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a href="#" egovLink>Underlined</a>
        <a href="#" egovLink [underlined]="false">Non-underlined</a>
      </div>
    `,
  }),
};

export const Styles: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${ROW}">
        <a href="#" egovLink>Primary</a>
        <a href="#" egovLink="strict">Strict</a>
      </div>
    `,
  }),
};

/**
 * The `--color-link-*` token chains resolve on the element that carries
 * `data-theme`, so the attribute must be on the ROOT element (`<html>`), the
 * same contract the Foundations color grid follows — a nested
 * `data-theme="dark"` wrapper does NOT re-theme the links. This demo toggles
 * the attribute on `document.documentElement` while the story is open.
 */
@Component({
  selector: 'egov-link-dark-theme-demo',
  imports: [EgovLink],
  template: `
    <div style="${ROW};background:var(--color-background-base-default,#121212)">
      <a href="#" egovLink>Primary (dark theme)</a>
      <a href="#" egovLink="strict">Strict (dark theme)</a>
    </div>
  `,
})
class LinkDarkThemeDemo {
  private readonly _document = inject(DOCUMENT);

  constructor() {
    this._document.documentElement.setAttribute('data-theme', 'dark');
    inject(DestroyRef).onDestroy(() => this._document.documentElement.removeAttribute('data-theme'));
  }
}

/**
 * Same markup as Styles with the dark theme active: primary becomes the
 * lighter `blue-sky-400` and strict becomes white — automatically, via the
 * theme tokens. No `white` style input is needed.
 */
export const StylesDarkTheme: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [LinkDarkThemeDemo] })],
  render: () => ({ template: `<egov-link-dark-theme-demo />` }),
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
        <a href="#" egovLink touchTarget="pointer" style="outline:1px dashed #ccc">32px pointer target</a>
        <a href="#" egovLink touchTarget="touch" style="outline:1px dashed #ccc">40px touch target</a>
      </div>
      <p style="max-width:48ch;padding:0 24px">
        Prose with an inline
        <a href="#" egovLink touchTarget="none">opted-out link</a>
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
        <a href="#" egovLink disabled>Disabled primary</a>
        <a href="#" egovLink="strict" disabled>Disabled strict</a>
      </div>
    `,
  }),
};
