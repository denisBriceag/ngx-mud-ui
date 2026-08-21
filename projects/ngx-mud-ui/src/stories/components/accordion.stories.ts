import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionGroup,
  MudAccordionHeader,
  MudAccordionTitle,
} from '../../../accordion/src/public-api';

const WRAP = 'max-width:720px;padding:24px';

const meta: Meta<MudAccordion> = {
  title: 'Components/Accordion',
  component: MudAccordion,
  decorators: [
    moduleMetadata({
      imports: [MudAccordionGroup, MudAccordion, MudAccordionHeader, MudAccordionTitle, MudAccordionDescription],
    }),
  ],
  argTypes: {
    expanded: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hideToggle: { control: 'boolean' },
  },
  args: {
    expanded: false,
    disabled: false,
    hideToggle: false,
  },
};

export default meta;

type Story = StoryObj<MudAccordion>;

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="${WRAP}">
        <mud-accordion
          [expanded]="expanded"
          [disabled]="disabled"
          [hideToggle]="hideToggle"
        >
          <mud-accordion-header>
            <mud-accordion-title>Accordion Heading</mud-accordion-title>
            <mud-accordion-description>Supporting Text</mud-accordion-description>
          </mud-accordion-header>
          Conținutul accordionului. Poate fi text, liste, componente etc.
        </mud-accordion>
      </div>
    `,
  }),
};

/**
 * The group draws the separators and coordinates panels. With the default
 * `multi=true` panels expand independently; set `multi=false` so opening one
 * closes the others. Up/Down/Home/End move focus between the headers.
 */
export const Group: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-accordion-group>
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Accordion Heading</mud-accordion-title>
              <mud-accordion-description>Supporting Text</mud-accordion-description>
            </mud-accordion-header>
            Conținutul accordionului. Poate fi text, liste, componente etc.
          </mud-accordion>
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Second section</mud-accordion-title>
              <mud-accordion-description>Supporting Text</mud-accordion-description>
            </mud-accordion-header>
            Conținutul accordionului. Poate fi text, liste, componente etc.
          </mud-accordion>
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Title only, no description</mud-accordion-title>
            </mud-accordion-header>
            Conținutul accordionului.
          </mud-accordion>
        </mud-accordion-group>
      </div>
    `,
  }),
};

/** With `multi=false`, expanding a panel collapses its siblings. */
export const SingleOpen: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-accordion-group [multi]="false">
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>First</mud-accordion-title>
            </mud-accordion-header>
            First panel content.
          </mud-accordion>
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Second</mud-accordion-title>
            </mud-accordion-header>
            Second panel content.
          </mud-accordion>
        </mud-accordion-group>
      </div>
    `,
  }),
};

/**
 * Disabled panels stay in the tab order with aria-disabled="true" so
 * screen-reader and keyboard users can still discover them; activation is
 * ignored and the text uses the disabled tokens.
 */
export const Disabled: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-accordion [disabled]="true">
          <mud-accordion-header>
            <mud-accordion-title>Disabled section</mud-accordion-title>
            <mud-accordion-description>Cannot be expanded</mud-accordion-description>
          </mud-accordion-header>
          Hidden content.
        </mud-accordion>
      </div>
    `,
  }),
};
