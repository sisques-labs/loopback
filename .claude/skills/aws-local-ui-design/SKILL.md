---
name: aws-local-ui-design
description: Use this skill to generate well-branded interfaces and assets for AWS Local UI — a Next.js + shadcn dashboard that manages local LocalStack AWS services (S3, SNS, SQS, DynamoDB, Lambda). The system is achromatic-grayscale + one destructive red, Geist + Geist Mono, Lucide icons, with a restrained operator-tool voice. Use for production code, prototypes, mocks, and throwaway visual artifacts.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files:

- `README.md` — full context, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — all tokens (color, type, radii, spacing, shadows)
- `assets/` — favicon + default placeholder SVGs from the source repo
- `preview/` — small HTML specimens of every component
- `ui_kits/dashboard/` — full interactive recreation of the dashboard

If creating visual artifacts (slides, mocks, throwaway prototypes, marketing
pages, etc.), copy `colors_and_type.css` and any icons/components you need out
of `ui_kits/dashboard/`, then create static HTML files. Always import
`colors_and_type.css` and use its CSS variables — never hard-code hex/oklch.

If working on production code, you can copy assets and read the rules here to
become an expert in designing with this brand. The source codebase is at
[github.com/sisques-labs/aws-local-ui @ dev](https://github.com/sisques-labs/aws-local-ui/tree/dev) —
its components in `components/ui/` and `features/` are the canonical
implementations.

If the user invokes this skill without any other guidance, ask them what they
want to build or design, ask some focused questions about scope, fidelity, and
which page(s) or component(s) they want, then act as an expert designer who
outputs HTML artifacts *or* production code, depending on the need.

Hard rules to follow when designing in this system:

- **No color outside the token set.** Grayscale + destructive red only.
- **No emoji.** Anywhere.
- **No marketing voice.** Sentences end with periods. Pending states use `…`.
  Destructive copy names the consequence.
- **Lucide icons only**, outline, stroke=currentColor, size 16 by default.
- **Pill badges** (`--radius-4xl` ≈ 26px) are the visual signature; don't
  square them off.
- **Geist Sans + Geist Mono** — no other type families.
- **Cards** are `rounded-lg border bg-card shadow-sm`. Nothing more.
- **Mobile hit targets** are 44×44px (`min-h-11 min-w-11`) below the `md:`
  breakpoint.
