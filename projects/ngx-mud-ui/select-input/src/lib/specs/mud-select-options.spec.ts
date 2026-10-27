import {
  foldForSearch,
  isMudSelectGroup,
  mudSelectDefaultFilter,
  toSelectRows,
} from '../mud-select-options';
import type { MudSelectItem, MudSelectRowGroup } from '../mud-select-options';

const opt = (label: string) => ({ value: label, label });
const all = () => true;

describe('toSelectRows', () => {
  it('numbers options across groups in render order', () => {
    const items: MudSelectItem<string>[] = [
      opt('A'),
      { label: 'G', options: [opt('B'), opt('C')] },
      opt('D'),
    ];
    const { rows, flat } = toSelectRows(items, all);

    expect(flat.map((o) => o.label)).toEqual(['A', 'B', 'C', 'D']);
    expect((rows[1] as MudSelectRowGroup<string>).options.map((o) => o.index)).toEqual([1, 2]);
    expect(rows[2]).toEqual({ kind: 'option', option: opt('D'), index: 3 });
  });

  it('drops groups left empty by keep, and groups empty from the start', () => {
    const { rows, flat } = toSelectRows<string>(
      [{ label: 'E', options: [] }, opt('A'), { label: 'F', options: [opt('X')] }],
      (o) => o.label !== 'X',
    );

    expect(rows).toEqual([{ kind: 'option', option: opt('A'), index: 0 }]);
    expect(flat).toEqual([opt('A')]);
  });
});

describe('isMudSelectGroup', () => {
  it('tells groups from options', () => {
    expect(isMudSelectGroup({ label: 'G', options: [] })).toBe(true);
    expect(isMudSelectGroup({ label: 'G', value: 1 })).toBe(false);
  });
});

describe('foldForSearch', () => {
  it('strips diacritics and lower-cases', () => {
    expect(foldForSearch('Ștefan Vodă')).toBe('stefan voda');
    expect(foldForSearch('BĂLȚI')).toBe('balti');
  });
});

describe('mudSelectDefaultFilter', () => {
  it('matches the folded, trimmed query anywhere in the label', () => {
    expect(mudSelectDefaultFilter({ value: 1, label: 'Bălți' }, ' balti ')).toBe(true);
    expect(mudSelectDefaultFilter({ value: 1, label: 'Chișinău' }, 'sinau')).toBe(true);
    expect(mudSelectDefaultFilter({ value: 1, label: 'Orhei' }, 'x')).toBe(false);
  });

  it('keeps every option for an empty or blank query', () => {
    expect(mudSelectDefaultFilter({ value: 1, label: 'Orhei' }, '')).toBe(true);
    expect(mudSelectDefaultFilter({ value: 1, label: 'Orhei' }, '   ')).toBe(true);
  });
});
