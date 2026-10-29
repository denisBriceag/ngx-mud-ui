# ngx-mud-ui

Angular components for **MUD**, the Moldova Unified Design system.

> **Unofficial.** `ngx-mud-ui` is an independent project, not made or endorsed by eGov Moldova,
> and not meant for production. It is inspired by the official
> [`@egov-moldova/mud`](https://www.npmjs.com/package/@egov-moldova/mud) package and the
> [MUD documentation](https://mud.dev.egov.md/).

## Quick start

Requires Angular 22.2 or later.

```bash
ng add ngx-mud-ui
```

```ts
import { Component } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';

@Component({
  selector: 'app-root',
  imports: [MudButton],
  template: `<button type="button" mudButton>Continue</button>`,
})
export class App {}
```

The [package README](projects/ngx-mud-ui/README.md) covers installation options, the component
list, icons, theming and localization. For live examples and the full API, run the Storybook
(see below).

## Development

### Setup

Use the Node version in [`.nvmrc`](.nvmrc) and pnpm 10.

```bash
pnpm install   # also generates documentation.json for the Storybook API tables
pnpm storybook # http://localhost:6006
```

### Scripts

| Command                                    | What it does                                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `pnpm storybook`                           | Runs the docs site with live reload.                                                                    |
| `pnpm build`                               | Builds the package into `dist/ngx-mud-ui`, with the prebuilt stylesheets, fonts and `ng add` schematic. |
| `pnpm test`                                | Library unit tests (Vitest).                                                                            |
| `pnpm test:stories`                        | Runs every story's interaction test in a real browser.                                                  |
| `pnpm test:schematics` / `pnpm test:tools` | Tests for the `ng add` schematic and the build tools.                                                   |
| `pnpm lint`                                | ESLint over the library, schematic, stories and Storybook config.                                       |
| `pnpm styles:check`                        | After `pnpm build`: checks that component CSS is unlayered and that every token it reads exists.        |
| `pnpm icons:generate`                      | Regenerates the icon data from `projects/ngx-mud-ui/icons-source`.                                      |
| `pnpm docs:json`                           | Regenerates `documentation.json` after changing a component's API.                                      |

Build with `pnpm build`, not `ng build`: `ng build` alone leaves out the stylesheets and
schematic, so `ng add` and every app's `styles` entry would point at nothing. `pnpm watch`
rebuilds only the TypeScript; run `node tools/build-prebuilt.mjs` once it starts if a linked app
needs the stylesheets.

CI runs on pushes to `main` and on pull requests: lint, the unit, tools and schematic tests, the
build, `styles:check` and a Storybook build. It doesn't run `test:stories`, so run that locally.

### Layout

```
projects/ngx-mud-ui/   the library, one folder per entry point (each with a specs/ folder)
  styles/              tokens, themes and the prebuilt stylesheets
schematics/            the ng add schematic
stories/               Storybook: Introduction, Foundations and a folder per component
  components/<name>/   <name>.mdx (docs page), <name>.stories.ts, examples/*.example.ts
tools/                 build, icon generation and style checks
```

Each docs example is a standalone component in `examples/`, and the page shows its source as
written. Add new examples the same way, using the `app-` selector prefix.

### Conventions

- **Naming:** selectors start with `mud-` or `mud` (`<mud-icon>`, `[mudButton]`), design tokens
  with `--mud-`, and component-private custom properties with `--_`.
- **Sizes:** every `size` input uses `xs`, `sm`, `md`, `lg`, `xl`.
- **Styling:** the `--mud-*` tokens are the public styling API. Component class names, DOM
  structure and internal styles are private. Component CSS is not in a cascade layer (tokens are,
  in `mud.base`), so when one component restyles another's element it must win by specificity,
  never by load order.
- **API docs:** every public input, output and model has a `/** @description … */` comment; the
  Storybook API tables are built from them.

### Publishing

```bash
pnpm build
cd dist/ngx-mud-ui && npm publish
```

## License

[MIT](LICENSE) © Denis Briceag. Includes material from the MUD design system and flag-icons; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
