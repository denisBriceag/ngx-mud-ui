# ngx-mud-ui

Angular components for **MUD**, the Moldova Unified Design system.

> **Unofficial.** `ngx-mud-ui` is an independent project, not made or endorsed by eGov Moldova,
> and not meant for production. It is inspired by the official
> [`@egov-moldova/mud`](https://www.npmjs.com/package/@egov-moldova/mud) package and the
> [MUD documentation](https://mud.dev.egov.md/).

- Standalone components built on signals and the Angular CDK.
- Every form control works with reactive, template-driven and signal forms.
- Light and dark themes, styled through `--mud-*` design tokens.
- Interface strings in Romanian, Russian and English.
- One entry point per component, so you only ship what you import.

## Requirements

Angular 22.2 or later, with `@angular/cdk` at the same version.

## Installation

```bash
ng add ngx-mud-ui
```

The schematic installs the peer dependencies, adds the stylesheets to `angular.json` and sets the
Onest font on `body`. Options:

- `--darkMode`: also add the dark theme stylesheet (otherwise it asks).
- `--project <name>`: the application to set up, in a multi-app workspace.

<details>
<summary>Manual setup</summary>

```bash
npm install ngx-mud-ui @angular/cdk
```

Add the stylesheets to the `build` target's `styles` in `angular.json`, before your own:

```json
"styles": [
  "@angular/cdk/overlay-prebuilt.css",
  "ngx-mud-ui/prebuilt/mud.css",
  "src/styles.scss"
]
```

Add `ngx-mud-ui/prebuilt/mud-dark.css` as well for the dark theme. Then set the font in your global
stylesheet:

```scss
body {
  font-family: var(--mud-font-family-base);
  font-size: 1rem;
}
```

</details>

## Usage

Import a component from its entry point and add it to `imports`:

```ts
import { Component, signal } from '@angular/core';
import { MudButton } from 'ngx-mud-ui/button';
import { MudLabel } from 'ngx-mud-ui/label';
import { MudTextInput } from 'ngx-mud-ui/text-input';

@Component({
  selector: 'app-contact',
  imports: [MudButton, MudLabel, MudTextInput],
  template: `
    <mud-text-input [(value)]="email" type="email" required>
      <mud-label>E-mail</mud-label>
    </mud-text-input>
    <button type="button" mudButton>Continue</button>
  `,
})
export class Contact {
  readonly email = signal('');
}
```

## Components

| Group       | Entry points                                                                                                                                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions     | `button`, `link`, `menu`                                                                                                                                                                                        |
| Forms       | `checkbox`, `date-picker`, `file-input`, `input-chip`, `label`, `numeric-input`, `phone-input`, `radio`, `search-input`, `segmented-control`, `select-input`, `switch`, `text-input`, `textarea`, `time-picker` |
| Feedback    | `badge`, `banner`, `info-box`, `inline-message`, `spinner`, `toast`, `tooltip`                                                                                                                                  |
| Overlays    | `dialog`, `drawer`                                                                                                                                                                                              |
| Navigation  | `breadcrumb`, `pagination`, `sidebar`, `stepper`, `tabs`, `tree`, `tree-item`                                                                                                                                   |
| Content     | `accordion`, `avatar`, `chip`, `icons`, `table`, `tag`                                                                                                                                                          |
| Foundations | `breakpoints`, `i18n`                                                                                                                                                                                           |

Each is imported as `ngx-mud-ui/<entry point>`, for example `ngx-mud-ui/date-picker`. Sizes use
the same scale everywhere: `xs`, `sm`, `md`, `lg`, `xl`.

## Icons

Only the icons you register reach your bundle:

```ts
import { provideMudIcons, alarm, arrowLeft } from 'ngx-mud-ui/icons';

export const appConfig: ApplicationConfig = {
  providers: [provideMudIcons([alarm, arrowLeft])],
};
```

Then render one with `<mud-icon name="alarm" />`, importing `MudIconComponent`.

## Theming

The `--mud-*` CSS custom properties are the only styling API: colors, spacing, radius, border
width, shadows, focus ring and type scale. Component class names and DOM structure are internal
and may change in any release.

**Dark mode:** include `mud-dark.css` (see Installation), then set `data-theme="dark"` on
`<html>`. Without that attribute the page stays light.

**Breakpoints:** Sass mixins and matching CDK media queries.

```scss
@use 'ngx-mud-ui/breakpoints' as bp;

.layout {
  @include bp.up(md) {
    display: grid;
  }
}
```

```ts
import { MudBreakpoints } from 'ngx-mud-ui/breakpoints';

inject(BreakpointObserver).observe(MudBreakpoints.Md);
```

## Localization

Components ship with English labels. Provide the Romanian or Russian pack, and the locale used for
dates and numbers:

```ts
import { MUD_LABELS_RO, provideMudFormatLocale, provideMudLabels } from 'ngx-mud-ui/i18n';

export const appConfig: ApplicationConfig = {
  providers: [provideMudLabels(MUD_LABELS_RO), provideMudFormatLocale('ro-MD')],
};
```

`provideMudLabels` also accepts partial overrides and functions that `inject()` your own
translation service.

## Documentation

The Storybook in the [repository](https://github.com/denisBriceag/ngx-mud-ui) has a page per
component with live examples, the full API and accessibility notes.

## License

MIT © Denis Briceag. Icon artwork, design token values, flags and the Romanian and Russian strings
come from the MUD design system by the e-Governance Agency of Moldova (MIT); see
[THIRD_PARTY_NOTICES.md](https://github.com/denisBriceag/ngx-mud-ui/blob/main/THIRD_PARTY_NOTICES.md).
