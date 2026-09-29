import { parameters as angularParameters } from '@storybook/angular-vite/client/config';

import docJson from '../documentation.json';

/**
 * Repairs the argTypes Storybook derives from compodoc.
 *
 * Storybook's Angular `extractType` only understands three shapes: the bare
 * primitives, and a union it can `JSON.parse` member-by-member.
 */
interface CompodocTypeAlias {
  name?: string;
  rawtype?: string;
}

interface CompodocVariable {
  name?: string;
  defaultValue?: string;
}

interface CompodocInterface {
  name?: string;
  properties?: { type?: string }[];
}

interface CompodocJson {
  interfaces?: CompodocInterface[];
  miscellaneous?: {
    typealiases?: CompodocTypeAlias[];
    variables?: CompodocVariable[];
  };
}

const misc = (docJson as CompodocJson).miscellaneous ?? {};

const NULLISH = new Set(['undefined', 'null']);

const INTERFACES = new Map<string, Required<CompodocInterface>>(
  ((docJson as CompodocJson).interfaces ?? [])
    .filter((entry): entry is Required<CompodocInterface> => !!entry.name && !!entry.properties)
    .map((entry) => [entry.name, entry]),
);

/**
 * Compodoc drops the index from an indexed-access alias, so
 * `type MudDateValue<M> = MudDateValueMap[M]` is recorded as the bare map
 * name and would render `valueChange` as `MudDateValueMap<M>`. The union of
 * the map's member types is what the alias can resolve to.
 */
const indexedAliasUnion = (rawtype: string): string | null => {
  const members = INTERFACES.get(rawtype)?.properties.flatMap((property) =>
    (property.type ?? '').split('|').map((member) => member.trim()),
  );

  if (!members?.length) return null;

  const unique = [...new Set(members.filter(Boolean))];
  const nullish = unique.filter((member) => NULLISH.has(member));

  return [...unique.filter((member) => !NULLISH.has(member)), ...nullish].join(' | ');
};

const TYPE_ALIASES = new Map<string, string>(
  (misc.typealiases ?? [])
    // Compodoc records a function-typed alias as the bare word `function`, which
    // would replace `MudTimeFilter` with something less informative than the name.
    .filter(
      (alias): alias is Required<CompodocTypeAlias> =>
        !!alias.name && !!alias.rawtype && alias.rawtype !== 'function',
    )
    .map((alias) => [alias.name, indexedAliasUnion(alias.rawtype) ?? alias.rawtype.replace(/"/g, "'")]),
);

const CONST_UNIONS = new Map<string, string>(
  (misc.variables ?? [])
    .filter(
      (variable): variable is Required<CompodocVariable> =>
        !!variable.name && !!variable.defaultValue,
    )
    .map((variable) => {
      const members = [...variable.defaultValue.matchAll(/'([^']*)'/g)].map(
        (match) => `'${match[1]}'`,
      );

      return [variable.name, members.join(' | ')] as const;
    })
    .filter(([, union]) => union.length > 0),
);

const TYPEOF_INDEX = /^typeof\s+(\w+)\['number'\]$/;

/** Follows alias -> alias -> `typeof CONST[number]` chains down to a concrete type. */
const resolveType = (type: string): string => {
  let current = type.trim();

  // Bounded: a self-referential alias would otherwise spin forever.
  for (let step = 0; step < 10; step += 1) {
    const alias = TYPE_ALIASES.get(current);

    if (alias) {
      current = alias;
      continue;
    }

    const constName = TYPEOF_INDEX.exec(current)?.[1];
    const union = constName ? CONST_UNIONS.get(constName) : undefined;

    if (!union) break;

    current = union;
  }

  return current;
};

const PRIMITIVES = new Set(['string', 'number', 'boolean']);
const STRING_LITERAL = /^'(.*)'$/;

interface Repair {
  type: { name: string; value?: readonly string[] };
  control: { type: string };
  options?: readonly string[];
}

const FUNCTION_TYPE = /=>/;

/**
 * Maps a fully resolved type to a usable control, or null to leave Storybook's
 * object control in place — correct for arrays, RegExp and generics, which
 * genuinely have no simpler editor. Function types never reach here.
 */
const repairFor = (resolved: string): Repair | null => {
  if (FUNCTION_TYPE.test(resolved) || /\[\]|[<>{}]/.test(resolved)) return null;

  const members = resolved
    .split('|')
    .map((member) => member.trim())
    .filter((member) => member && !NULLISH.has(member));

  if (members.length === 0) return null;

  const literals = members
    .map((member) => STRING_LITERAL.exec(member)?.[1])
    .filter((literal): literal is string => literal !== undefined);

  if (literals.length === members.length) {
    return {
      type: { name: 'enum', value: literals },
      // Matches the convention already used across the stories: a radio row
      // while the options stay scannable, a dropdown once they don't.
      control: { type: literals.length > 3 ? 'select' : 'inline-radio' },
      options: literals,
    };
  }

  if (!members.every((member) => PRIMITIVES.has(member))) return null;

  // `string | number` (badge content) still edits fine as text; a number-only
  // control would reject the string half.
  const kind = members.includes('string') ? 'string' : members.length === 1 ? members[0] : null;

  if (!kind) return null;

  return {
    type: { name: kind },
    control: { type: kind === 'string' ? 'text' : kind === 'number' ? 'number' : 'boolean' },
  };
};

/** True only for the broken fallback — never for a control the story set itself. */
const wantsRepair = (argType: { control?: unknown }): boolean => {
  const control = argType.control;

  if (control === false) return false;

  const controlType =
    typeof control === 'string' ? control : (control as { type?: string } | undefined)?.type;

  return controlType === undefined || controlType === 'object';
};

/**
 * The template API is inputs and outputs. Compodoc also reports public methods
 * and properties, which for these components means the `ControlValueAccessor`
 * plumbing every field must expose (`writeValue`, `registerOnChange`,
 * `setDisabledState`, ...) and underscore-prefixed internals that are public
 * only because a template binds them. Neither is something a consumer calls,
 * and both crowd out the real API — `mud-numeric-input` listed 44 rows.
 */
const isPublicApi = (name: string, category: unknown): boolean =>
  (category === 'inputs' || category === 'outputs') && !name.startsWith('_');

type ArgTypes = Record<string, ArgType>;
interface ArgType {
  name?: string;
  type?: unknown;
  control?: unknown;
  options?: unknown;
  table?: { category?: string; type?: { summary?: string; detail?: string } };
}

const baseExtractArgTypes = (
  angularParameters as { docs?: { extractArgTypes?: (component: unknown) => ArgTypes | undefined } }
).docs?.extractArgTypes;

/**
 * Wraps the framework's extractor rather than running as an `argTypesEnhancer`:
 * enhancers only see story contexts, so a `<ArgTypes of={MudRadio} />` block
 * that names a secondary component directly would bypass them and render raw,
 * unrepaired rows. Hooking extraction covers both paths, and runs before a
 * story's own `argTypes` are merged in, so those still win.
 */
export const extractArgTypes = (component: unknown): ArgTypes | undefined => {
  const extracted = baseExtractArgTypes?.(component);

  if (!extracted) return extracted;

  const argTypes: ArgTypes = Object.fromEntries(
    Object.entries(extracted).filter(([name, argType]) =>
      isPublicApi(name, argType?.table?.category),
    ),
  );

  for (const argType of Object.values(argTypes)) {
    const summary = argType?.table?.type?.summary;

    if (typeof summary !== 'string') continue;

    const referenced = [...TYPE_ALIASES.keys()].filter((name) =>
      new RegExp(`\\b${name}\\b`).test(summary),
    );

    // Show the members inline and keep `type MudButtonColor = ...` one click
    // away, so the reader learns both the values and the name.
    if (referenced.length > 0) {
      const expanded = referenced.reduce((acc, name) => {
        const resolved = resolveType(name);
        // A multi-member union spliced into a larger type needs parentheses to
        // keep its precedence readable. Function replacement: a literal `$` in
        // a member would otherwise act as a replacement pattern.
        const inlined = acc === name || !resolved.includes('|') ? resolved : `(${resolved})`;

        return acc.replace(new RegExp(`\\b${name}\\b(<[^<>]*>)?`, 'g'), () => inlined);
      }, summary);

      argType.table = {
        ...argType.table,
        type: {
          ...argType.table?.type,
          summary: expanded,
          detail: referenced.map((name) => `type ${name} = ${resolveType(name)}`).join('\n'),
        },
      };
    }

    // An output is an event the component emits, so there is nothing to set.
    // Storybook types outputs as `other`/`void`, which falls through to the
    // generic JSON editor — an "Edit JSON string..." box that does nothing
    // useful and, if typed into, assigns over the OutputEmitterRef.
    if (argType.table?.category === 'outputs') {
      argType.control = false as typeof argType.control;

      // Compodoc reports a plain `output<T>()` as just `T` (or `void`), while
      // Storybook renders a model's change output as `(e: T) => void`. Show
      // every output as the handler signature so the payload type reads the
      // same way in both rows.
      const emitted = argType.table.type?.summary;

      if (typeof emitted === 'string' && !emitted.includes('=>')) {
        argType.table = {
          ...argType.table,
          type: {
            ...argType.table.type,
            summary: emitted === 'void' ? '() => void' : `(e: ${emitted}) => void`,
          },
        };
      }

      continue;
    }

    // A function input has the same problem as an output: the JSON editor
    // cannot express a callback, and whatever is typed in replaces the
    // function the component later invokes. The type column still carries the
    // signature, which is the part a reader needs.
    if (FUNCTION_TYPE.test(resolveType(argType.table?.type?.summary ?? summary))) {
      argType.control = false as typeof argType.control;
      continue;
    }

    if (argType.table?.category !== 'inputs' || !wantsRepair(argType)) continue;

    const repair = repairFor(resolveType(argType.table.type?.summary ?? summary));

    if (!repair) continue;

    argType.type = repair.type as typeof argType.type;
    argType.control = repair.control as typeof argType.control;

    if (repair.options) argType.options = repair.options as typeof argType.options;
  }

  return argTypes;
};
