/** One selectable option. */
export interface MudSelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** Decides whether two values are the same selection. */
export type MudSelectCompare<T = unknown> = (a: T, b: T) => boolean;

/** A labeled run of options; the heading is not selectable. */
export interface MudSelectOptionGroup<T = unknown> {
  label: string;
  options: readonly MudSelectOption<T>[];
}

/** One entry of `options`: a plain option or a group of them. */
export type MudSelectItem<T = unknown> = MudSelectOption<T> | MudSelectOptionGroup<T>;

/** Narrows a select item to a group. */
export function isMudSelectGroup<T>(item: MudSelectItem<T>): item is MudSelectOptionGroup<T> {
  return Array.isArray((item as MudSelectOptionGroup<T>).options);
}

/** @docs-private A rendered option with its flat visible index. */
export interface MudSelectRowOption<T> {
  kind: 'option';
  option: MudSelectOption<T>;
  index: number;
}

/** @docs-private A rendered group whose options carry flat visible indexes. */
export interface MudSelectRowGroup<T> {
  kind: 'group';
  label: string;
  options: MudSelectRowOption<T>[];
}

/** @docs-private A rendered row: loose option or group. */
export type MudSelectRow<T> = MudSelectRowOption<T> | MudSelectRowGroup<T>;

/** @docs-private Filters items with `keep`, drops empty groups, numbers options in render order. */
export function toSelectRows<T>(
  items: readonly MudSelectItem<T>[],
  keep: (option: MudSelectOption<T>) => boolean,
): { rows: MudSelectRow<T>[]; flat: MudSelectOption<T>[] } {
  const rows: MudSelectRow<T>[] = [];
  const flat: MudSelectOption<T>[] = [];
  const take = (option: MudSelectOption<T>): MudSelectRowOption<T> => {
    flat.push(option);

    return { kind: 'option', option, index: flat.length - 1 };
  };

  for (const item of items) {
    if (isMudSelectGroup(item)) {
      const kept = item.options.filter(keep);

      if (kept.length > 0) rows.push({ kind: 'group', label: item.label, options: kept.map(take) });
    } else if (keep(item)) {
      rows.push(take(item));
    }
  }

  return { rows, flat };
}

/** @docs-private Lower-cases and strips diacritics so "Bălți" matches "balti". */
export function foldForSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Decides whether an option stays visible for a search query. */
export type MudSelectFilter<T = unknown> = (option: MudSelectOption<T>, query: string) => boolean;

/** Keeps an option whose label contains the trimmed query, ignoring case and diacritics. */
export const mudSelectDefaultFilter: MudSelectFilter = (option, query) => {
  const folded = foldForSearch(query.trim());

  return folded === '' || foldForSearch(option.label).includes(folded);
};
