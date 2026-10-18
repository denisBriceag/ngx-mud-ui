# NgxMudUi

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.0.


## Styles

Add `node_modules/ngx-mud-ui/prebuilt/mud.css` to the app's `angular.json` `styles` (build and
test) — tokens (`--mud-*`), the Onest font and shared keyframes. The dark theme is opt-in: add
`node_modules/ngx-mud-ui/prebuilt/mud-dark.css` as well and set `data-theme="dark"` on `<html>`.
Component CSS ships with each component; the library styles nothing else on the page and has no utility classes.
Public styling API: colors (`--mud-color-*`), the shared scales (spacing, radius, border width,
shadows, focus ring, font, type scale) and breakpoints (`ngx-mud-ui/breakpoints`: Sass mixins +
`MudBreakpoints`). Component tokens (`--mud-toast-*`, …) are overridable but not recommended.

Customization is through the tokens only. Component class names, DOM structure and internal styles
are private and may change in any release; overriding them is not supported. Component CSS is not in
a cascade layer (tokens are, in `mud.base`). Inside the library, a component restyling another
component's element must win by specificity, never by load order. Guard: `pnpm styles:check` after
`pnpm build` (component CSS unlayered + every token read exists; in CI). Overlay components also need
`@angular/cdk/overlay-prebuilt.css`.

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

Build from the repository root with **`pnpm build`** — not `ng build`. It runs ng-packagr and then
`tools/build-prebuilt.mjs`, which writes the base stylesheet (`prebuilt/mud.css`), the opt-in dark
theme (`prebuilt/mud-dark.css`) and the fonts into `dist/ngx-mud-ui` — and fails if any is missing.
`ng build` alone produces a package without them, and every app's `angular.json` `styles` entry
would then point at nothing.

`pnpm watch` rebuilds the TypeScript only and ng-packagr empties `dist/` first — run
`node tools/build-prebuilt.mjs` after it starts if a linked app needs the base stylesheet.

### Publishing the Library

```bash
pnpm build
cd dist/ngx-mud-ui && npm publish
```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
