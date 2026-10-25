import type { Meta, StoryObj } from '@storybook/angular-vite';
import { applicationConfig, moduleMetadata } from '@storybook/angular-vite';
import {
  MudAccordion,
  MudAccordionDescription,
  MudAccordionGroup,
  MudAccordionHeader,
  MudAccordionTitle,
} from 'ngx-mud-ui/accordion';
import {
  document as documentIcon,
  idCard,
  MudIconComponent,
  provideMudIcons,
  wallet,
} from 'ngx-mud-ui/icons';
import { MudLink } from 'ngx-mud-ui/link';
import { MudTag } from 'ngx-mud-ui/tag';

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

/**
 * The official trail-sites appearance: OPEN items tint with the
 * brand-secondary surface and on-secondary text colors.
 */
export const TrailSites: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <mud-accordion-group appearance="trail-sites">
        <mud-accordion [expanded]="true">
          <mud-accordion-header>
            <mud-accordion-title>Cum obțin o semnătură electronică?</mud-accordion-title>
          </mud-accordion-header>
          Semnătura electronică se obține prin serviciul MSign.
        </mud-accordion>
        <mud-accordion>
          <mud-accordion-header>
            <mud-accordion-title>Cum achit serviciile publice?</mud-accordion-title>
          </mud-accordion-header>
          Plățile se efectuează prin MPay.
        </mud-accordion>
      </mud-accordion-group>
    `,
  }),
};

/** The compact rung (22/30 heading, 24px padding at any viewport) with the trigger leading the row. */
export const SmallIconLeft: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <mud-accordion-group size="small" iconPosition="left">
        <mud-accordion>
          <mud-accordion-header>
            <mud-accordion-title>Compact item</mud-accordion-title>
          </mud-accordion-header>
          Dense-surface content.
        </mud-accordion>
        <mud-accordion>
          <mud-accordion-header>
            <mud-accordion-title>Another item</mud-accordion-title>
          </mud-accordion-header>
          More content.
        </mud-accordion>
      </mud-accordion-group>
    `,
  }),
};

/** A 20px icon before each heading, in the toggle's colour (brand while open). */
export const LeadingIcon: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    applicationConfig({ providers: [provideMudIcons([documentIcon, idCard, wallet])] }),
    moduleMetadata({ imports: [MudIconComponent] }),
  ],
  render: () => ({
    template: `
      <div style="${WRAP}">
        <mud-accordion-group multi>
          <mud-accordion [expanded]="true">
            <mud-accordion-header>
              <mud-icon icon-start name="document" [scale]="20" />
              <mud-accordion-title>Acte necesare</mud-accordion-title>
            </mud-accordion-header>
            Buletinul de identitate și certificatul de naștere.
          </mud-accordion>
          <mud-accordion>
            <mud-accordion-header>
              <mud-icon icon-start name="wallet" [scale]="20" />
              <mud-accordion-title>Plata</mud-accordion-title>
              <mud-accordion-description>Prin MPay, cu cardul sau în numerar.</mud-accordion-description>
            </mud-accordion-header>
            Taxa de stat se achită înainte de depunere.
          </mud-accordion>
          <mud-accordion [disabled]="true">
            <mud-accordion-header>
              <mud-icon icon-start name="id-card" [scale]="20" />
              <mud-accordion-title>Ridicarea actului</mud-accordion-title>
            </mud-accordion-header>
            Disponibil după aprobare.
          </mud-accordion>
        </mud-accordion-group>
      </div>
    `,
  }),
};

/**
 * The "check your answers" page at the end of a form: each section shows its
 * status and an edit link back to its step, beside the header button.
 */
export const Trailing: Story = {
  parameters: { controls: { disable: true } },
  decorators: [moduleMetadata({ imports: [MudLink, MudTag] })],
  render: () => ({
    template: `
      <div style="${WRAP};display:flex;flex-direction:column;gap:48px">
        <mud-accordion-group multi>
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Date personale</mud-accordion-title>
              <mud-tag trailing color="success">Completat</mud-tag>
              <a trailing mudLink href="#pas-1">Editează</a>
            </mud-accordion-header>
            Ion Popescu, născut la 12.03.1990, IDNP 2001234567890.
          </mud-accordion>
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Documente anexate</mud-accordion-title>
              <mud-accordion-description>Buletin, certificat de naștere</mud-accordion-description>
              <mud-tag trailing color="neutral">2 documente</mud-tag>
              <a trailing mudLink href="#pas-2">Editează</a>
            </mud-accordion-header>
            buletin.pdf, certificat-de-nastere.pdf
          </mud-accordion>
          <mud-accordion [disabled]="true">
            <mud-accordion-header>
              <mud-accordion-title>Plata</mud-accordion-title>
              <mud-tag trailing color="muted">Indisponibil</mud-tag>
              <a trailing mudLink href="#pas-3">Editează</a>
            </mud-accordion-header>
            Disponibilă după verificare.
          </mud-accordion>
        </mud-accordion-group>

        <mud-accordion-group size="small" iconPosition="left">
          <mud-accordion>
            <mud-accordion-header>
              <mud-accordion-title>Toggle on the left</mud-accordion-title>
              <a trailing mudLink href="#pas-1">Editează</a>
            </mud-accordion-header>
            The trailing area stays at the end of the row.
          </mud-accordion>
          <mud-accordion [hideToggle]="true">
            <mud-accordion-header>
              <mud-accordion-title>No toggle</mud-accordion-title>
              <a trailing mudLink href="#pas-2">Editează</a>
            </mud-accordion-header>
            Still opens on a click on the header.
          </mud-accordion>
        </mud-accordion-group>
      </div>
    `,
  }),
};

const CAPTION = 'margin:0 0 16px;font-family:var(--mud-font-family-base);font-size:14px;line-height:20px;font-weight:600;color:var(--mud-color-text-base-secondary)';

const LONG_CONTENT = `
  <mud-accordion-group multi>
    <mud-accordion>
      <mud-accordion-header>
        <mud-accordion-title>
          Cerere pentru eliberarea certificatului de atribuire a numărului de identificare de stat
          al persoanei fizice pentru cetățenii străini cu drept de ședere permanentă
        </mud-accordion-title>
      </mud-accordion-header>
      A long title wraps onto as many lines as it needs.
    </mud-accordion>
    <mud-accordion>
      <mud-accordion-header>
        <mud-accordion-title>Documente necesare</mud-accordion-title>
        <mud-accordion-description>
          Buletinul de identitate, certificatul de naștere, certificatul de căsătorie, adeverința de
          la locul de muncă și dovada achitării taxei de stat pentru serviciul solicitat
        </mud-accordion-description>
      </mud-accordion-header>
      A long description stays on one line and ends with an ellipsis.
    </mud-accordion>
    <mud-accordion>
      <mud-accordion-header>
        <mud-accordion-title>https://servicii.gov.md/cereri/certificat-de-atribuire-idnp-2001234567890</mud-accordion-title>
      </mud-accordion-header>
      A long unbroken word (a link, an IDNP) breaks anywhere rather than overflowing.
    </mud-accordion>
    <mud-accordion>
      <mud-accordion-header>
        <mud-icon icon-start name="document" [scale]="20" />
        <mud-accordion-title>
          Datele personale ale solicitantului și ale reprezentantului legal împuternicit
        </mud-accordion-title>
        <mud-accordion-description>
          Numele, prenumele, data nașterii, IDNP, adresa de domiciliu și datele de contact
        </mud-accordion-description>
        <mud-tag trailing color="success">Completat</mud-tag>
        <a trailing mudLink href="#pas-1">Editează</a>
      </mud-accordion-header>
      Icon, long title, long description and trailing content together.
    </mud-accordion>
    <mud-accordion>
      <mud-accordion-header>
        <mud-accordion-title>Plata</mud-accordion-title>
        <mud-tag trailing color="neutral">În așteptarea confirmării de la banca emitentă</mud-tag>
      </mud-accordion-header>
      Long trailing content.
    </mud-accordion>
  </mud-accordion-group>
`;

/**
 * Edge cases: a long title wraps; a long description stays on one line with an
 * ellipsis; a long unbroken word breaks anywhere; long trailing content wraps.
 * Shown twice, labelled: the desktop version, and a narrow version in a 320px column.
 */
export const LongContent: Story = {
  parameters: { controls: { disable: true } },
  decorators: [
    applicationConfig({ providers: [provideMudIcons([documentIcon])] }),
    moduleMetadata({ imports: [MudIconComponent, MudLink, MudTag] }),
  ],
  render: () => ({
    template: `
      <div style="${WRAP}">
        <p style="${CAPTION}">Desktop version</p>
        ${LONG_CONTENT}
      </div>
      <div style="width:320px;padding:24px 16px;box-sizing:border-box">
        <p style="${CAPTION}">Narrow version (320px, mobile)</p>
        ${LONG_CONTENT}
      </div>
    `,
  }),
};
