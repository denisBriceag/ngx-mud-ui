# ngx-mud-ui/icons

Tree-shakeable Angular icon set: a standalone `<mud-icon>` component plus 156
individually-exported icon consts. Each icon is a plain data object (`viewBox`
+ inner SVG markup per variant/scale) — **nothing is bundled unless you import
and register it.**

## Quick start

**1. Register the icons you use** (once, at bootstrap):

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideMudIcons, alarm, arrowLeft, deleteIcon } from 'ngx-mud-ui/icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideMudIcons([alarm, arrowLeft, deleteIcon]),
  ],
};
```

**2. Use `<mud-icon>` anywhere** (import the component, reference by `name`):

```ts
import { Component } from '@angular/core';
import { MudIconComponent } from 'ngx-mud-ui/icons';

@Component({
  selector: 'app-toolbar',
  imports: [MudIconComponent],
  template: `
    <mud-icon name="alarm" />                              <!-- defaults: outlined, scale 24 -->
    <mud-icon name="business" variant="filled" scale="20" />
    <mud-icon name="delete" aria-label="Delete item" />   <!-- semantic (role="img") -->
  `,
})
export class Toolbar {}
```

That's the whole model: **import consts → `provideMudIcons([...])` once →
`<mud-icon name="…">` anywhere.**

> Everything is imported from the `ngx-mud-ui/icons` secondary entry point —
> not the root `ngx-mud-ui` package.

## Two identifiers per icon: const vs. `name`

This is the one thing that trips people up:

| In `provideMudIcons([...])` you pass… | In the template you write… |
| --- | --- |
| the **import identifier** — camelCase (`arrowLeft`, `deleteIcon`) | the **`name`** — kebab-case (`"arrow-left"`, `"delete"`) |

They're the same icon; the const's `.name` field *is* the string you use in the
template. For most icons they match (`alarm` ↔ `name="alarm"`). They differ only
for JS reserved words: `delete` can't be a variable name, so the export is
`deleteIcon`, but its `.name` stays `'delete'`:

```ts
import { deleteIcon } from 'ngx-mud-ui/icons';
deleteIcon.name; // 'delete'
```
```html
<mud-icon name="delete" />
```

`name` is typed as `MudIconName` (a union of all 156 names), so you get
autocomplete and a **compile error on typos**.

## Finding icon names

- **Autocomplete:** type `name="` on `<mud-icon>` (or `import { } from
  'ngx-mud-ui/icons'`) and your editor lists every valid name / const.
- **The type:** the full list is the `MudIconName` union
  (`icons/src/lib/icon-name.ts`).
- **The source:** one file per icon under `icons/src/lib/data/` — the filename
  is the kebab `name`, the export inside is the camelCase const.

## Where to register

`provideMudIcons(...)` returns `EnvironmentProviders`. Register at any
environment-level injector; multiple calls merge into one registry (a later
registration for the same `name` overwrites the earlier one).

| Scope | Where |
| --- | --- |
| Whole app | `app.config.ts` `providers` (or `bootstrapApplication`) |
| A lazy feature only | that **route's** `providers: [...]` — registers when the feature loads |
| NgModule app | the module's `providers` |
| ❌ Not supported | a component/directive `providers` array — it accepts `Provider`, not `EnvironmentProviders` |

## Component API

```
<mud-icon [name] [variant] [scale] [aria-label] />
```

- `name` (**required**) — an `MudIconName` (kebab-case id, e.g. `"arrow-left"`).
- `variant` — `'outlined' | 'filled'`. Default: `'outlined'`.
- `scale` — `12 | 16 | 20 | 24`. Default: `24`.
- `aria-label` — when set, the host renders `role="img"` + the label; when
  omitted, the host is `aria-hidden="true"` (decorative).

> `scale` is a **number** union, not a string. The bare `scale="20"` works
> because this workspace doesn't enable `strictTemplates`; under strict
> templates, bind it: `[scale]="20"`.

### Fallback & safety

Not every icon exists in every variant/scale. If the exact match is missing the
component degrades gracefully and **never throws**:

- missing scale → nearest larger scale, else nearest smaller;
- missing variant → `outlined`, else whatever variant exists;
- unregistered `name` → renders nothing.

Each fallback (and an unregistered name) logs a `console.warn` **in dev mode
only** — production is silent.

## Recoloring & dark mode

Icon fills are `currentColor`, so an icon is exactly as adaptive as the CSS
`color` it inherits. That's the whole theming story:

- **Inside components** (buttons, tabs, links…) do nothing — the icon picks up
  the component's text color, including its dark-theme value.
- **Standalone icons**: color them with the semantic `--color-icon-*` tokens,
  which remap automatically under `[data-theme='dark']`:

  ```css
  .toolbar-icon { color: var(--mud-color-icon-base-default); }   /* black ⇄ white */
  .danger-icon  { color: var(--mud-color-icon-danger-default); } /* red-600 ⇄ red-500 */
  ```

- **Never hardcode a hex** (`color: #121212`) on an icon or its wrapper — that
  pins the icon to one theme forever. If an icon "ignores dark mode", the cause
  is almost always a fixed `color` somewhere up its ancestor chain.

### Known exceptions

Six icons contain baked-in `#fff` accents inside their SVG paths and
`upload-icon` uses a gradient fill — those parts don't follow `currentColor`
in either theme: `circle-download`, `qr-code`, `group`, `education`,
`upload-icon`, `id-card`. Fixing them requires regenerating the source SVGs
with `currentColor` accents (`pnpm icons:generate`).

## Types

`MudIcon`, `MudIconName`, `MudIconVariant`, `MudIconScale`, and
`MudIconGeometry` are exported for typing your own wrappers (an icon-picker,
a `Record<string, MudIcon>` lookup, etc.).

## Tree-shaking

Each icon is exported individually with no module side effects
(`sideEffects: false`), so importing one icon never pulls another icon's path
data into a production bundle — you ship only the icons you register. A string
`name` alone can't be tree-shaken (the bundler would keep all 156); registering
the consts you use is what lets the bundler drop the rest.
