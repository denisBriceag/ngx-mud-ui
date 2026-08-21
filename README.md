# NgxMudUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Icons

Tree-shakeable icon components and data live in the `ngx-mud-ui/icons`
secondary entry point. See
[`projects/ngx-mud-ui/icons/README.md`](projects/ngx-mud-ui/icons/README.md)
for registration and usage.

## Naming conventions

The library uses **two namespaces that deliberately share a prefix**, plus a third that stays unprefixed:

| Layer | Prefix | Example |
|---|---|---|
| Angular component/directive selectors | `mud-` | `<mud-icon>`, `[mudButton]` |
| Design-system CSS utility/component classes | `mud-` | `.mud-btn`, `.mud-card` |
| Design tokens (CSS custom properties) | *(none)* | `--color-background-brand-default`, `--gray-400` |

- **`mud-`** is both this library's Angular API namespace (matches the package name, `ngx-mud-ui`) and the upstream **Moldova Unified Design** system's own CSS class namespace (see [mud.egov.md](https://mud.egov.md/)). Sharing the prefix is intentional, not a collision risk: Angular selectors and CSS classes are resolved in different contexts (the component compiler vs. the stylesheet), and having `<mud-avatar>`/`[mudButton]` line up with `.mud-btn`/`.mud-card` means markup matches the design-system docs with nothing to translate. The CSS-utility side stays configurable via `$mud-prefix` in `styles/abstracts/_mud-prefix.scss` if a consumer ever needs to rebrand it.
- **Tokens** are plain, unprefixed CSS custom properties — they're consumed as CSS variables rather than classes or selectors, so they sit outside both namespaces above.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
