# Design system

Living guide for the AWS Local UI dashboard. Reflects what's currently shipping
in the codebase — not aspirational. When code and this doc disagree, **code wins**;
update this doc.

## Stack

| Layer       | Source of truth                                          |
| ----------- | -------------------------------------------------------- |
| Tokens      | `app/globals.css` (`@theme inline` + `:root` / `.dark`)  |
| Primitives  | `components/ui/*` (shadcn `base-nova` style)             |
| Icons       | `lucide-react` (declared in `components.json`)           |
| Toasts      | `components/ui/sonner.tsx` (Sonner)                      |
| Type        | `next/font/google` → `Geist`, `Geist_Mono` (`app/[lang]/layout.tsx`) |
| Theme       | `next-themes`, mounted in `app/[lang]/layout.tsx`        |
| Mobile nav  | `features/shared/components/mobile-nav/*` + Zustand store|
| Tests       | Vitest + `@testing-library/react` (jsdom for `*.test.tsx`)   |

## Content fundamentals

Voice is **operator-grade**: short, plain, declarative. No marketing copy, no
exclamation marks, no emoji. This is a tool that lives next to your terminal.

### Casing & punctuation

- **Sentence case** for buttons and titles: `New bucket`, `Create topic`, `Upload`.
- **AWS service names** are uppercase abbreviations: `S3`, `SNS`, `SQS`, `DynamoDB`, `Lambda`.
- Pending states use the **single character `…`**, not three dots: `Creating…`, `Uploading…`, `Confirming…`.
- Sentences end with periods — even short ones (`No buckets found in this account.`).
- Em-dashes are not used; en-dashes appear as the empty-cell placeholder `—`.

### Voice & pronouns

- **Imperative** in actions (`Upload`, `Delete`, `Create`).
- **Second-person `you`** in confirmations and errors (`Are you sure you want to delete {bucket}?`, `Check your connection.`).
- **No first-person `we`**.
- Be direct about **destructive consequences**: `This action cannot be undone.`

### Examples (verbatim from `features/*/i18n/en.ts`)

| Where                  | Copy                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| Page title             | `S3 Buckets`                                                                                  |
| Empty state            | `No buckets found in this account.`                                                           |
| Primary CTA            | `New bucket`                                                                                  |
| Pending button         | `Creating…`                                                                                   |
| Toast on success       | `Bucket created successfully.`                                                                |
| Destructive confirm    | `Are you sure you want to delete {bucket}? This action cannot be undone.`                     |
| Error                  | `Failed to connect to S3` · `Could not reach {endpoint}. Make sure LocalStack is running…`    |
| Sidebar section header | `SERVICES` (uppercased + tracked) · `CONFIGURATION`                                           |

### i18n

Every string lives in `features/<area>/i18n/{en,es}.ts`. Never hard-code English.
Spanish uses the same register — `Crear bucket`, `Cargando…`.

Shared chrome copy (dialog close, confirm labels, sidebar section headers) lives in
`features/shared/i18n/{en,es}.ts`. Pass `closeLabel={dict.shared.dialog.close}`
into every `DialogContent` — the primitive requires it for the icon-only close
control (`components/ui/dialog.tsx`).

### Don't

- ❌ No emoji anywhere.
- ❌ No exclamation marks.
- ❌ No "Oops!" / cute error language.
- ❌ No marketing adjectives ("powerful", "seamless", "blazing-fast").

## Visual foundations

### The big idea

**Achromatic + one red.** The entire UI is built on a grayscale OKLCH ramp from
`oklch(0.145 0 0)` (near-black) to `oklch(1 0 0)` (pure white). The only
chromatic color is `--destructive` (red ~`oklch(0.577 0.245 27.3)`), used for
delete actions and invalid states. Charts are monochrome.

Dark mode has one exception: `--sidebar-primary` is a blue
(`oklch(0.488 0.243 264.4)`) reserved for the active sidebar pill.

### Tokens

All tokens live in `app/globals.css`. Use them via Tailwind utilities
(`bg-card`, `text-muted-foreground`, `border-input`, etc.) — never hard-code
OKLCH/hex.

| Token                          | Where it shows up                          |
| ------------------------------ | ------------------------------------------ |
| `--background` / `--foreground`| page bg, primary text                      |
| `--card` / `--popover`         | cards, dialogs, dropdowns                  |
| `--primary`                    | default button fill                        |
| `--secondary` / `--muted` / `--accent` | hover fills, muted backgrounds     |
| `--muted-foreground`           | secondary text                             |
| `--border` / `--input`         | every divider, input outline               |
| `--ring`                       | focus ring (3px, 50% alpha)                |
| `--destructive`                | delete, errors, aria-invalid               |
| `--sidebar*`                   | the sidebar's separate palette             |

### Typography

| Family       | Variable             | Source                          |
| ------------ | -------------------- | ------------------------------- |
| Geist Sans   | `--font-sans`        | `next/font/google → Geist`      |
| Geist Mono   | `--font-mono`        | `next/font/google → Geist_Mono` |
| Headings     | `--font-heading` aliases `--font-sans` (no separate display) |

**Wiring:** `app/[lang]/layout.tsx` applies `geistSans.variable` / `geistMono.variable`
on `<html>` (`--font-geist-sans`, `--font-geist-mono`). `app/globals.css` maps them in
`@theme inline` (`--font-sans: var(--font-geist-sans)`, etc.). Do not leave
`--font-sans` self-referential.

Scale in use across the codebase:

| Role            | Class                                              |
| --------------- | -------------------------------------------------- |
| Page title (h1) | `text-xl font-semibold`                            |
| Section (h2)    | `text-lg font-semibold`                            |
| Settings title  | `text-2xl font-semibold tracking-tight`            |
| Body            | `text-sm`                                          |
| Muted body      | `text-sm text-muted-foreground`                    |
| Labels          | `text-sm font-medium leading-none`                 |
| Eyebrow         | `text-xs font-semibold uppercase tracking-widest`  |
| Inline code     | `text-xs font-mono`                                |

### Radii — the visual signature

Base is `0.625rem` (10px). Buttons + inputs are `rounded-lg`, dialogs are
`rounded-xl`, **badges are `rounded-4xl` (≈26px)** — full pill. That pill on
badges is the brand.

```
sm 6 ・ md 8 ・ lg 10 ・ xl 14 ・ 2xl 18 ・ 3xl 22 ・ 4xl 26
```

### Spacing

Tailwind v4 defaults (4px base). Recurring values:

- Main content padding: `p-4 md:p-6`
- Card padding: `p-4 md:p-6`
- Stack gap: `gap-4`
- Toolbar gap: `gap-2` / `gap-3`
- Table row height: `h-10` head, `p-2` cells
- Touch targets on mobile: **`min-h-11 min-w-11` (44×44px)** — non-negotiable
  for dialog triggers and icon buttons; drops back to `min-h-9 min-w-9` at `md:`
  (see AGENTS.md). Dialog close (X) uses the same pattern on `DialogContent`.

### Navigation — active route

Desktop sidebar and mobile drawer links (`features/shared/components/mobile-nav/nav-links.tsx`)
use `usePathname()` to mark the current route:

- Classes: `bg-sidebar-primary text-sidebar-primary-foreground`
- Attribute: `aria-current="page"` on the active link only
- Dark mode: `--sidebar-primary` is the documented blue accent (see tokens above)

### UI primitives (`components/ui/`)

shadcn **base-nova** set. Prefer these over ad-hoc markup:

| Primitive   | Notes |
| ----------- | ----- |
| `Button`    | No `transition-all` — theme-safe property list only |
| `Badge`     | Pill `rounded-4xl`; same transition rules as `Button` |
| `Input`     | Default text fields |
| `Textarea`  | Multi-line JSON / message bodies in service dialogs (SQS, SNS, DynamoDB, Lambda) |
| `Card`      | `rounded-lg border bg-card shadow-sm` |
| `Dialog`    | `closeLabel` required; localized via `dict.shared.dialog.close` |

Service forms must not ship raw `<textarea>` elements or chromatic utility colors
(e.g. `text-amber-*`) for warnings — use `Textarea` and `text-muted-foreground`.

### Borders & elevation

- **Borders** are 1px hairlines in `--border`. Every card, input, table row,
  sidebar, and section is delineated by them.
- **Cards** are `rounded-lg border bg-card shadow-sm`. No double borders, no
  gradients, no glass.
- **Dialogs** use `rounded-xl bg-popover p-4 ring-1 ring-foreground/10` (no
  shadow — the backdrop blur is the elevation cue).
- **Dropdowns** use `shadow-md` + `ring-1 ring-foreground/10`.

### Focus, hover, press

- **Focus visible**: 3px ring in `ring/50` + 1px border swap to `ring`
  (`focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50`).
- **Hover** on rows + ghost buttons: fill switches to `muted/50`. No text color shift.
- **Hover** on primary button: `primary/80` — darker, never a different hue.
- **Press**: `active:translate-y-px` on buttons. No scale, no shrink.
- **Disabled**: `opacity-50` + `pointer-events-none`. Nothing else.

### Animation

- **Fast and small.** `duration-100` for entries, `duration-150`–`200` for the
  drawer. Easing: Tailwind defaults. No bouncy springs.
- Provided by `tw-animate-css` — see the `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95` patterns in `components/ui/dialog.tsx` and `components/ui/dropdown-menu.tsx`.
- Loading: `Loader2Icon` with `animate-spin` (see `components/ui/sonner.tsx`).

> **CSS transitions on theme-token-derived colors are dangerous.** Browsers can
> stick to the old computed value when the variable swaps under a `color`
> transition. `Button` and `Badge` use an explicit list
> (`background-color`, `border-color`, `box-shadow`, `transform`, `opacity`) —
> never `transition-all`. Theme switches should be instant on text/icon colors.

### Transparency & blur

- **Backdrop blur** only behind dialogs (`supports-backdrop-filter:backdrop-blur-xs`) and the mobile nav backdrop.
- **Alpha-on-color**: ghost destructive buttons (`bg-destructive/10`), focus rings (`ring/50`), disabled (`opacity-50`).

### aria-invalid

Form fields swap border to `--destructive` and ring to `--destructive/20`. This
is baked into the base `Input` and `Button` variants — just set
`aria-invalid={state.status === "error" ? true : undefined}`.

## Iconography

The app uses **[Lucide React](https://lucide.dev)** exclusively. Declared in
`components.json` as `"iconLibrary": "lucide"`. Every icon in the codebase is a
`LucideIcon`.

### Rules

- **Sized by parent context.** Default `size-4` (16px) — applied via Tailwind in
  the button/badge variants. In row-action dropdowns: `size-3.5`. Sidebar: explicit `size-4 shrink-0`.
- **Always alongside text** (or with `aria-label` if icon-only).
- **`stroke="currentColor"`** — icons inherit text color.
- **No filled icons.** Lucide's outline style is the brand voice.

### In use today

| Icon                 | Used for                          |
| -------------------- | --------------------------------- |
| `PlusIcon`           | `New bucket`, `New topic`         |
| `UploadIcon`         | `Upload` button                   |
| `DownloadIcon`       | Object actions menu               |
| `Trash2Icon`         | Delete (destructive menu item)    |
| `MoreHorizontalIcon` | Row actions trigger               |
| `XIcon`              | Dialog close, drawer close        |
| `MenuIcon`           | Mobile nav trigger                |
| `ChevronRightIcon`   | Submenu indicator                 |
| `CheckIcon`          | Checkbox / radio indicators       |
| `Settings`           | Sidebar settings link             |
| `Server` / `Rss` / `MessageSquare` / `Database` / `FunctionSquare` | Service nav (S3 / SNS / SQS / DynamoDB / Lambda) |
| `CircleCheckIcon` / `InfoIcon` / `TriangleAlertIcon` / `OctagonXIcon` / `Loader2Icon` | Sonner toasts (see `components/ui/sonner.tsx`) |

### Don't

- ❌ No emoji anywhere.
- ❌ No unicode symbols as icons (no `→`, `✓`, `★`).
- ❌ No raster/PNG icons.
- ❌ No custom icon font.
- ❌ No SVG sprite sheet — Lucide is tree-shaken per-import.
