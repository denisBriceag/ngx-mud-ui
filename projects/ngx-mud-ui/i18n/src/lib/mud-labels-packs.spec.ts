import { describe, expect, it } from 'vitest';
import { MUD_LABELS_EN } from './mud-labels';
import { MUD_LABELS_RO } from './mud-labels-ro';
import { MUD_LABELS_RU } from './mud-labels-ru';

/** Collects `path:kind` for every leaf (string / function / array). */
function shape(value: unknown, prefix = ''): string[] {
  if (typeof value === 'function') return [`${prefix}:fn`];

  if (typeof value === 'string') return [`${prefix}:str`];

  if (Array.isArray(value)) return [`${prefix}:arr${value.length}`];

  return Object.entries(value as object).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
}

const names = (n: number) => Array.from({ length: n }, (_, i) => `f${i}.pdf`);

/** One sample argument list per function-valued key; every argument must appear in the output. */
const SAMPLE_ARGS: Record<string, unknown[]> = {
  'avatar.initials': ['ZZZ'],
  'chip.remove': ['ZZZ'],
  'datePicker.chooseMonth': ['ZZZ'],
  'datePicker.chooseYear': ['ZZZ'],
  'datePicker.formatHint': ['ZZZ'],
  'datePicker.monthChanged': ['ZZZ'],
  'datePicker.rangeStartSelected': ['ZZZ'],
  'datePicker.rangeSelected': ['AAA', 'BBB'],
  'fileInput.maxSize': ['ZZZ'],
  'fileInput.formats': [['pdf', 'png']],
  'fileInput.added': [['unique-name.pdf']],
  'fileInput.removed': ['ZZZ'],
  'fileInput.rejected': ['ZZZ'],
  'fileItem.remove': ['ZZZ'],
  'fileItem.cancel': ['ZZZ'],
  'inputChip.remove': ['ZZZ'],
  'inputChip.added': ['ZZZ'],
  'inputChip.removed': ['ZZZ'],
  'inputChip.rejectedPattern': ['ZZZ'],
  'inputChip.rejectedDuplicate': ['ZZZ'],
  'pagination.previousAria': [11],
  'pagination.nextAria': [11],
  'pagination.pageAria': [11, 12],
  'pagination.overflowAria': [11, 12],
  'phoneInput.country': ['ZZZ', 'YYY'],
  'timePicker.formatHint': ['ZZZ'],
};

describe('label packs', () => {
  for (const [name, pack] of [['RO', MUD_LABELS_RO], ['RU', MUD_LABELS_RU]] as const) {
    it(`${name} pack has every key EN has, with the same kind`, () => {
      expect(shape(pack).sort()).toEqual(shape(MUD_LABELS_EN).sort());
    });

    it(`${name} interpolates every argument of every function`, () => {
      const walk = (o: Record<string, unknown>, path: string) => {
        for (const [k, v] of Object.entries(o)) {
          const key = path ? `${path}.${k}` : k;

          if (typeof v === 'function') {
            const args = SAMPLE_ARGS[key];

            expect(args, `no sample args for ${key}`).toBeDefined();

            const out = (v as (...a: unknown[]) => string)(...args);

            for (const a of args.flat()) expect(out, key).toContain(String(a));
          } else if (v && typeof v === 'object' && !Array.isArray(v)) walk(v as Record<string, unknown>, key);
        }
      };

      walk(pack as unknown as Record<string, unknown>, '');
    });
  }

  it('RU file announcements use Russian plurals', () => {
    const a = MUD_LABELS_RU.fileInput.added;

    expect(a(names(1))).toContain('f0.pdf');
    for (const [n, noun] of [[2, 'файла'], [5, 'файлов'], [11, 'файлов'], [21, 'файл'], [111, 'файлов']] as const) {
      expect(a(names(n)).split(/[\s.]+/)).toContain(noun);
    }
  });

  it('RO plurals', () => {
    const a = MUD_LABELS_RO.fileInput.added;

    expect(a(names(1))).toContain('f0.pdf');
    expect(a(names(2))).toContain('fișiere');
    expect(a(names(2))).not.toContain('de fișiere');
    expect(a(names(20))).toContain('de fișiere');
  });

  it('keeps upstream wording', () => {
    expect(MUD_LABELS_RO.banner.close).toBe('Închide');
    expect(MUD_LABELS_RU.banner.close).toBe('Закрыть');
    expect(MUD_LABELS_RO.pagination.pageAria(3, 10)).toBe('Pagina 3 din 10');
    expect(MUD_LABELS_RU.spinner.loading).toBe('Загрузка');
    expect(MUD_LABELS_RO.selectInput.options).toBe('Opțiuni');
  });
});
