# Info Box — Design

**Date:** 2026-08-30
**Entry point:** `ngx-mud-ui/info-box`
**Upstream reference:** `~/projects/design_system_2/src/components/mud-info-box`

## Goal

An inline, in-content callout that highlights a key message inside the page
flow: an explanation, a prerequisite, a caution attached to a section rather
than to a form control. It fills its container, supports an optional heading, a
multi-line body, an optional action region and an optional close button.

It is the third of the three message components, whose names do not
disambiguate them:

| Component | What it is |
| --- | --- |
| `notification` | The toast — 350px filled corner surface, transient |
| `banner` | Full-width top-of-page system bar |
| **`info-box`** | **Inline callout inside the content column (this spec)** |

The a11y treatment is the tell: notification and banner can be live regions;
**info-box deliberately is not**, because static in-flow content would
re-announce on every render. Upstream states this explicitly and this repo made
the same call for `inline-message`.

## Decisions

| Question | Decision |
| --- | --- |
| Variants | **Five**: `neutral`, `moderate`, `prominent`, `warning`, `error` |
| `type` (subtle/strong) axis | **None** — each variant carries its own surface |
| Heading | `heading` string input, rendered as `<p>`, **not** an `<h*>` |
| Actions | Projected via an `[actions]` slot |
| Close | `closable` + `closed` output; the consumer removes the box |
| Close target | **32×32**, growing to **40×40** under `@media (pointer: coarse)` |
| Live region | Never |
| Legacy partial | `_messages.scss` owns `.info-box` — **replace it** |

## Public API

```ts
export type MudInfoBoxVariant = 'neutral' | 'moderate' | 'prominent' | 'warning' | 'error';

@Component({ selector: 'mud-info-box', changeDetection: ChangeDetectionStrategy.OnPush })
export class MudInfoBox {
  readonly variant = input<MudInfoBoxVariant>('neutral');
  readonly heading = input<string | undefined>(undefined);
  readonly closable = input(false, { transform: booleanAttribute });
  readonly closeLabel = input(DEFAULT_CLOSE_LABEL);   // 'Close'
  readonly hideIcon = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

  readonly closed = output<void>();
}
```

`closeLabel` is a plain input with an English default, **not** an injection
token — the house convention for one-off button labels, used by `tooltip`,
`input`, `chip`, `phone-input`, `file-input` and `spinner`. The library's only
labels token backs fifteen strings.

### Usage

```html
<mud-info-box variant="prominent" heading="Before you begin" closable (closed)="hide()">
  You will need your IDNP and a scanned copy of your passport.

  <div actions>
    <a mudLink href="/help">Read the guide</a>
    <button mudButton="text">Start now</button>
  </div>
</mud-info-box>
```

## No `type` axis

Upstream exposes `emphasis: subtle | strong` alongside its variants. We do not,
because the five variants each define their own surface and `prominent` **is**
the tinted treatment. A second axis would be redundant at best and would
contradict the variant at worst — there is no defined "strong warning" surface.

This is a deliberate divergence from both upstream and `banner`. Note it does
not violate the house rule that a `subtle | strong | outlined` axis is always
called `type`: info-box simply has no such axis.

## Structure and projection

```
host .info-box .info-box--{variant}
├── .info-box__icon        aria-hidden, hidden entirely when hideIcon
├── .info-box__body
│   ├── .info-box__heading  <p>, only when `heading` is set
│   ├── .info-box__message  default slot
│   └── .info-box__actions  [actions] slot, only when projected
└── .info-box__close        only when `closable`
```

- **Default slot** is the body.
- **`[actions]`** is the action region. Buttons, links, with or without icons —
  the consumer projects whatever they need and reuses `MudButton` / `MudLink`.
  Attribute selector per the house convention (`[icon]`, `[icon-start]`).
- **Icon** follows the `inline-message` pattern: an inlined default glyph per
  variant inside `<ng-content select="mud-icon,svg">`, so a projected `svg` or
  `mud-icon` replaces it. `hideIcon` suppresses the icon region entirely.

### The heading is not a heading element

`heading` renders as `<p class="info-box__heading">` — visually a heading,
semantically bold text. Upstream does the same (`<p class="title">`).

Two reasons. A callout title should not inject an entry into the document
outline, and only the consumer knows the correct level if it did. Rendering a
fixed `<h3>` would be wrong in half its usages.

If a real heading IS wanted, the consumer puts an `<h3>` in the body slot and
leaves `heading` unset. That needs no second API — the default slot already
accepts arbitrary content.

## Typography

User-specified, and a deliberate divergence from upstream, which has no
responsive typography for this component (fixed 16/24 heading, 14/20 body).

| | Desktop | ≤640px |
| --- | --- | --- |
| Heading | 18px / 26px / 600 | 16px / 22px / 600 |
| Body | 16px / 24px | 14px / 20px |

`font-weight: 600` as a literal is the house idiom — eleven partials do it, and
the `$font-weights` Sass map names 600 as `bold`. No `--line-height-26` or
`--line-height-22` token exists in this repo, so those values are literals;
`--font-size-{14,16,18}` are used with literal fallbacks.

The breakpoint is `@media (max-width: 640px)`, matching `banner`. Viewport is
the right trigger here because this is about available width, not input
modality.

## Close button and touch target

**32×32, growing to 40×40 under `@media (pointer: coarse)`**, with a 16px glyph
inside. The button itself is sized; there is no invisible `::before`.

This deliberately differs from `banner`, and the difference is principled:
upstream's banner close is 16×16 visible, below WCAG 2.2 SC 2.5.8's 24×24
minimum, so banner grows an invisible hit area to avoid changing the visible
design. Here the visible control is already 32px and clears the minimum on its
own, so there is nothing to hide. This also matches upstream's info-box exactly,
including its use of pointer capability rather than viewport:

> Target size per the Figma Target Sizes panel: 32px on pointer devices, 40px on
> touch. The × glyph stays 16px; only the hit area grows.

## Colours

Five variants, every value through a semantic `--color-*` token so the dark
theme applies with no extra rules. Each light value equals the hex specified.

| Variant | Background | Icon | Light hex |
| --- | --- | --- | --- |
| `neutral` | `--color-background-base-secondary` | `--color-icon-base-tertiary` | `#F5F5F5` / `#757575` |
| `moderate` | `--color-background-base-secondary` | `--color-icon-brand-default` | `#F5F5F5` / `#0058D2` |
| `prominent` | `--color-background-brand-secondary` | `--color-icon-brand-on-secondary` | `#E8F0FB` / `#0058D2` |
| `warning` | `--color-background-base-secondary` | `--color-icon-warning-default` | `#F5F5F5` / `#DC6803` |
| `error` | `--color-background-base-secondary` | `--color-icon-danger-default` | `#F5F5F5` / `#D92D20` |

`prominent` uses the `-on-secondary` icon token rather than `-default`: both are
`#0058D2` in light, but `-on-secondary` darkens in dark mode to stay legible on
the light-blue panel that `brand-secondary` keeps, whereas `-default` lightens
for use on dark surfaces.

### Text colour

One text colour per variant, used by **both** the heading and the body — the
visual hierarchy comes from size and weight (18/600 against 16/400), not colour.

| Variant | Text token | Light | Dark |
| --- | --- | --- | --- |
| `neutral`, `moderate`, `warning`, `error` | `--color-text-base-secondary` | 10.76:1 | 12.36:1 |
| `prominent` | `--color-text-base-default-on-color` | 16.31:1 | 13.69:1 |

`--color-text-base-secondary` is what the legacy partial used (`--gray-700`), and
it inverts correctly because `base-secondary` is a dark surface in dark mode.

`prominent` cannot use it: `brand-secondary` stays a **light** blue panel in dark
mode, where `--color-text-base-secondary` resolves to near-white. It takes
`--color-text-base-default-on-color` instead — `#121212` in both themes, the
same token `banner` uses for its one light-surface-in-dark-mode case. The
alternative, `--color-text-brand-on-secondary`, also passes (5.50:1 / 10.48:1)
but is materially worse for multi-line prose; the brand identity is already
carried by the surface and the icon.

### Icon contrast

Icons are non-text and need 3:1 (SC 1.4.11). Measured in light: neutral 4.23:1,
moderate 5.79:1, error 4.43:1, prominent 5.50:1 — and **warning 3.20:1, which
passes with almost no margin.** The implementation audit must confirm the dark
values too, warning especially; if any lands below 3:1 that is a finding to
report with the numbers, not a threshold to adjust.

Glyphs: `neutral`, `moderate` and `prominent` share the filled info circle;
`warning` and `error` each have their own, matching upstream and `banner`.

Radii and shadows carry literal fallbacks — `--border-radius-4/6/8/12` and
`--drop-shadow-300` are referenced across this repo but defined nowhere, so a
bare `var()` silently drops the property.

## Legacy partial

`components/_messages.scss` genuinely owns `.info-box`: it appears in the shared
base selector alongside `.message` and `.inline-message`, and has its own block
with `--neutral` / `--info` / `--warning` / `--error` icon colours and a
`__content` rule.

Unlike `banner` — where `.banner` was squatting in that file with no
corresponding component — this is the real predecessor. It gets **replaced**,
the same move already made for `chip`, `file-input` and `date-picker`.

**Verify the removal against compiled `styles/main.scss`, not Storybook.**
`.storybook/design-tokens.scss` is a per-partial allowlist that excludes
`messages`, which is exactly why an identical collision went undetected in
banner through a full task review, an axe run and a twelve-combination contrast
audit. Removal must leave `.message` and `.inline-message` working unchanged;
where a rule serves both, remove only `.info-box` from its selector.

## Files

```
projects/ngx-mud-ui/info-box/
  ng-package.json
  src/public-api.ts
  src/lib/mud-info-box.component.ts | .spec.ts
projects/ngx-mud-ui/src/lib/styles/components/_info-box.scss   (new)
projects/ngx-mud-ui/src/stories/components/info-box/info-box.stories.ts | .mdx
```

Modified: `components/_messages.scss` (legacy removal).

**Registration — four places, all required:**

1. `angular.json` → test `include` — omit and the specs never run while the
   suite still reports green
2. `projects/ngx-mud-ui/tsconfig.spec.json` → `include`
3. `components/_index.scss` → `@forward 'info-box'`
4. `.storybook/design-tokens.scss` → `@use`

Storybook's `main.ts` and `.storybook/tsconfig.json` use globs and need nothing.

## Testing

- Each of the five variants produces its host class and its own default glyph
  (assert the glyph paths differ, not merely that one exists).
- `heading` renders when set and the element is absent when unset.
- `closable` renders the close button; activating it emits `closed` exactly once
  and leaves the box in the DOM.
- A blank or whitespace `closeLabel` falls back to `'Close'` rather than leaving
  the button with no accessible name.
- Projected body renders; projected `[actions]` renders; a projected `svg`
  replaces the default glyph rather than appearing alongside it.
- `hideIcon` removes the icon region.
- **Never a live region**: no `role` and no `aria-live` under any input
  combination.
- `aria-label` gives the host `role="region"` — an `aria-label` on a role-less
  element is ignored by assistive technology.
- SSR: renders under `PLATFORM_ID: 'server'` without touching the DOM.
- axe clean in both themes.
- **Twenty contrast ratios computed** — five variants × two themes, for **both**
  body text (≥ 4.5:1) and the icon (≥ 3:1, SC 1.4.11). Compute them; do not
  eyeball. The light-theme values are given in the Colours section above and can
  be checked against; the dark values are the ones still unverified, and
  `warning`'s icon at 3.20:1 in light has the least margin of any of them.
  A sibling component shipped a 1.84:1 violation that survived nine review
  rounds because the repo's `a11y.test` is `'todo'` and does not gate.

## Out of scope

- A live-region mode. If a message must be announced, that is `banner` with
  `live`, or the consumer's own live region.
- `iconName` (upstream's string-based icon override) — projection covers it.
- Auto-dismiss timers.
- Animation on enter/leave.
