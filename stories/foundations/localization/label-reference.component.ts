import { Component, computed, signal } from '@angular/core';
import { MUD_LABELS_EN, MUD_LABELS_RO, MUD_LABELS_RU } from 'ngx-mud-ui/i18n';
import type { MudLabels } from 'ngx-mud-ui/i18n';
import { MudSearchInput } from 'ngx-mud-ui/search-input';

type Fn = (...args: never[]) => string;

/** Keys of a namespace whose value is a function. */
type FnKeys<N> = { [P in keyof N]-?: NonNullable<N[P]> extends Fn ? P : never }[keyof N];

interface Sample {
  params: readonly string[];
  args: readonly unknown[];
}

// Every function key needs a sample: the type fails to compile when a new one is added to MudLabels.
type Samples = { [K in keyof MudLabels]: Record<FnKeys<MudLabels[K]>, Sample> };

const SAMPLES: Samples = {
  avatar: { initials: { params: ['initials'], args: ['AR'] } },
  badge: {},
  banner: {},
  breadcrumb: {},
  chip: { remove: { params: ['label'], args: ['Ana Rusu'] } },
  datePicker: {
    chooseMonth: { params: ['month'], args: ['March'] },
    chooseYear: { params: ['year'], args: ['2026'] },
    formatHint: { params: ['pattern'], args: ['DD.MM.YYYY'] },
    monthChanged: { params: ['monthYear'], args: ['March 2026'] },
    rangeStartSelected: { params: ['start'], args: ['15.03.2026'] },
    rangeSelected: { params: ['start', 'end'], args: ['15.03.2026', '22.03.2026'] },
  },
  dialog: {},
  fileInput: {
    formats: { params: ['formats'], args: [['PDF', 'JPG']] },
    maxSize: { params: ['size'], args: ['10 MB'] },
    added: { params: ['names'], args: [['a.pdf', 'b.pdf', 'c.pdf']] },
    removed: { params: ['name'], args: ['cerere.pdf'] },
    rejected: { params: ['name'], args: ['cerere.exe'] },
  },
  fileItem: {
    remove: { params: ['filename'], args: ['cerere.pdf'] },
    cancel: { params: ['filename'], args: ['cerere.pdf'] },
  },
  fileSize: {},
  infoBox: {},
  inputChip: {
    remove: { params: ['chip'], args: ['IDNP'] },
    added: { params: ['chip'], args: ['IDNP'] },
    removed: { params: ['chip'], args: ['IDNP'] },
    rejectedPattern: { params: ['value'], args: ['abc'] },
    rejectedDuplicate: { params: ['value'], args: ['IDNP'] },
  },
  numericInput: {},
  pagination: {
    previousAria: { params: ['page'], args: [4] },
    nextAria: { params: ['page'], args: [6] },
    pageAria: { params: ['page', 'total'], args: [5, 20] },
    overflowAria: { params: ['from', 'to'], args: [6, 9] },
  },
  phoneInput: { country: { params: ['name', 'dialCode'], args: ['Moldova', '+373'] } },
  searchInput: {},
  selectInput: {},
  spinner: {},
  stepper: {},
  table: {},
  textInput: {},
  timePicker: { formatHint: { params: ['pattern'], args: ['HH:mm'] } },
  toast: {},
  tooltip: {},
};

interface Row {
  ns: string;
  key: string;
  params: readonly string[] | null;
  en: string;
  ro: string;
  ru: string;
}

function render(value: unknown, sample: Sample | undefined): string {
  if (value === undefined) return '';

  if (typeof value === 'function')
    return sample ? (value as (...args: unknown[]) => string)(...sample.args) : '';

  if (Array.isArray(value)) return value.join(', ');

  return String(value);
}

const nsOf = (pack: MudLabels, ns: string): Record<string, unknown> =>
  (pack as unknown as Record<string, Record<string, unknown>>)[ns] ?? {};

// Keys from all three packs: the month-name lists are optional and only some packs set them.
const ROWS: readonly Row[] = Object.keys(MUD_LABELS_EN).flatMap((ns) => {
  const samples = (SAMPLES as unknown as Record<string, Record<string, Sample>>)[ns];
  const keys = [
    ...new Set(
      [MUD_LABELS_EN, MUD_LABELS_RO, MUD_LABELS_RU].flatMap((pack) => Object.keys(nsOf(pack, ns))),
    ),
  ];

  return keys.map((key) => {
    const sample = samples[key];

    return {
      ns,
      key,
      params: sample?.params ?? null,
      en: render(nsOf(MUD_LABELS_EN, ns)[key], sample),
      ro: render(nsOf(MUD_LABELS_RO, ns)[key], sample),
      ru: render(nsOf(MUD_LABELS_RU, ns)[key], sample),
    };
  });
});

/** Every key of `MudLabels` with its English, Romanian and Russian text, generated from the packs. */
@Component({
  selector: 'mud-label-reference',
  imports: [MudSearchInput],
  template: `
    <div class="toolbar">
      <mud-search-input
        class="toolbar__search"
        aria-label="Filter labels"
        placeholder="Filter by component, key or text"
        [(value)]="query"
      />
      <span class="toolbar__count">{{ rows().length }} of {{ total }} texts</span>
    </div>

    <div class="scroll">
      <table class="ref">
        <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">English</th>
            <th scope="col">Română</th>
            <th scope="col">Русский</th>
          </tr>
        </thead>
        @for (group of groups(); track group.ns) {
          <tbody>
            <tr class="ref__group">
              <th scope="rowgroup" colspan="4">
                <code>{{ group.ns }}</code>
              </th>
            </tr>
            @for (row of group.rows; track row.key) {
              <tr>
                <td class="ref__key">
                  <code>{{ row.key }}</code>
                  @if (row.params) {
                    <span class="ref__params">({{ row.params.join(', ') }})</span>
                  }
                </td>
                <td>{{ row.en || '—' }}</td>
                <td>{{ row.ro || '—' }}</td>
                <td>{{ row.ru || '—' }}</td>
              </tr>
            }
          </tbody>
        }
      </table>
      @if (rows().length === 0) {
        <p class="empty">No text matches “{{ query() }}”.</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: 24px;
      font-family: var(--mud-font-family-base);
      color: var(--mud-color-text-base-default);
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 24px;
      margin-bottom: 16px;
    }
    .toolbar__search {
      flex: 1 1 280px;
      max-width: 420px;
    }
    .toolbar__count {
      font-size: 14px;
      color: var(--mud-color-text-base-secondary);
    }
    .scroll {
      max-height: 560px;
      overflow: auto;
      border: 1px solid var(--mud-color-border-base-subtle);
      border-radius: var(--mud-border-radius-8);
    }
    .ref {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    .ref thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 10px 12px;
      border-bottom: 2px solid var(--mud-color-border-base-default);
      background: var(--mud-color-background-base-default);
      font-weight: var(--mud-font-weight-semibold);
      text-align: left;
      color: var(--mud-color-text-base-secondary);
    }
    .ref td {
      padding: 8px 12px;
      border-bottom: 1px solid var(--mud-color-border-base-subtle);
      vertical-align: top;
    }
    .ref__group th {
      padding: 14px 12px 6px;
      background: var(--mud-color-background-base-secondary);
      text-align: left;
    }
    .ref__group code {
      font-size: 13px;
      font-weight: var(--mud-font-weight-bold);
      color: var(--mud-color-text-brand-default);
    }
    .ref__key {
      white-space: nowrap;
    }
    .ref__key code {
      font-size: 13px;
    }
    .ref__params {
      margin-left: 2px;
      font-size: 12px;
      color: var(--mud-color-text-base-tertiary);
    }
    .empty {
      margin: 0;
      padding: 24px;
      color: var(--mud-color-text-base-secondary);
    }
  `,
})
export class LabelReference {
  protected readonly total = ROWS.length;
  readonly query = signal('');

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();

    return q
      ? ROWS.filter((row) =>
          [row.ns, row.key, row.en, row.ro, row.ru].some((text) => text.toLowerCase().includes(q)),
        )
      : ROWS;
  });

  protected readonly groups = computed(() => {
    const groups = new Map<string, Row[]>();

    for (const row of this.rows()) groups.set(row.ns, [...(groups.get(row.ns) ?? []), row]);

    return [...groups].map(([ns, rows]) => ({ ns, rows }));
  });
}
