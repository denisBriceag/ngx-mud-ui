# NgxEgovUi

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

Tree-shakeable icon components and data live in the `ngx-egov-ui/icons`
secondary entry point. See
[`projects/ngx-egov-ui/icons/README.md`](projects/ngx-egov-ui/icons/README.md)
for registration and usage.

## Naming conventions

The library uses **three distinct namespaces** — they intentionally do *not* share a prefix:

| Layer | Prefix | Example |
|---|---|---|
| Angular component/directive selectors | `egov-` | `<egov-icon>` |
| Design-system CSS utility/component classes | `mud-` | `.mud-btn`, `.mud-card` |
| Design tokens (CSS custom properties) | *(none)* | `--color-background-brand-default`, `--gray-400` |

- **`egov-`** is this library's Angular API namespace (matches the package name).
- **`mud-`** is the upstream **Moldova Unified Design** system's own class namespace (see [mud.egov.md](https://mud.egov.md/)); it's kept as-is so class names match the design-system docs and upstream stays easy to sync. It's configurable via `$mud-prefix` in `styles/abstracts/_mud-prefix.scss` if you ever need to rebrand it.
- **Tokens** are plain, unprefixed CSS custom properties.

Angular element selectors and CSS classes live in different namespaces, so `egov-` and `mud-` can never collide — mixing them is by design, not an oversight.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
