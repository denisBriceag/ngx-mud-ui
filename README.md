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

Everything the library puts into an app is namespaced with `mud`:

| Layer | Prefix | Example |
|---|---|---|
| Angular component/directive selectors | `mud-` / `mud…` | `<mud-icon>`, `[mudButton]` |
| Component CSS classes (internal, ship with each component) | BEM blocks, often `mud-` | `.mud-btn`, `.input-field__control` |
| Design tokens (CSS custom properties, from `prebuilt/mud.css`) | `--mud-` | `--mud-color-background-brand-default`, `--mud-spacing-16` |
| Component-private custom properties | `--_` | `--_btn-height` |

- **`mud-`** matches the package name (`ngx-mud-ui`) and the upstream **Moldova Unified Design**
  system ([mud.egov.md](https://mud.egov.md/)), so markup reads like the design-system docs.
- **Tokens** are the styling API: colors (`--mud-color-*`) and the shared scales (spacing, radius,
  border width, shadows, focus ring, font, type scale). There are no utility classes; component
  classes are internal and not a public API.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
