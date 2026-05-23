# Contributing

Thanks for contributing to this project! This guide covers the development workflow, commit conventions, testing requirements, and PR guidelines.

---

## Prerequisites

Follow [Getting Started](./getting-started.md) first to get a working local environment. Come back here once `pnpm dev` and `pnpm test` both run without errors.

---

## Local setup

1. Fork the repository on GitHub.
2. Clone your fork and add the upstream remote:
   ```bash
   git clone https://github.com/<your-username>/aws-local-ui.git
   cd aws-local-ui
   git remote add upstream https://github.com/sisques-labs/aws-local-ui.git
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Branch from `dev` — never from `main`:
   ```bash
   git checkout dev
   git pull upstream dev
   git checkout -b feat/my-feature
   ```

---

## Branching strategy

| Branch pattern | Purpose |
|---------------|---------|
| `feat/*` | New features |
| `fix/*` | Bug fixes |
| `chore/*` | Maintenance, dependency updates, docs |

All pull requests target `dev`. The `dev` branch merges into `main` on release. Never open a PR directly against `main`.

---

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

**Format**: `<type>(<scope>): <subject>`

**Examples**:
```
feat(s3): add bucket creation dialog
fix(logs): prevent duplicate polling on reconnect
chore(deps): update vitest to 3.x
docs(contributing): add responsive UI section
```

**Rules**:
- Use the imperative mood in the subject ("add", not "added" or "adds")
- Keep the subject under 72 characters
- Reference related issues in the body when relevant: `Closes #123`
- **`Co-Authored-By` and AI attribution lines are prohibited** — do not add them to any commit message

---

## Testing

This project uses **Vitest** in strict TDD mode.

```bash
pnpm test        # run all tests
pnpm test --ui   # open Vitest UI
```

Rules:
- All tests must pass before opening a PR (`pnpm test` exits 0)
- New features and bug fixes require corresponding tests
- Tests live next to the files they test (e.g. `lib/aws/config.test.ts` alongside `lib/aws/config.ts`)
- Do not add `it.skip` or `test.skip` without a linked issue explaining why

---

## Linting and formatting

```bash
pnpm lint      # ESLint
pnpm format    # Prettier
```

Both run automatically on staged files via husky + lint-staged on commit. Fix any errors before pushing.

---

## Responsive UI requirements

All new screens and components must work from narrow mobile (~375px) up to desktop:

- **Minimum viewport**: 375px — test at this width before opening a PR
- **Touch targets**: primary interactive elements must be at least **44×44px** (`min-h-11 min-w-11` before any `md:` override)
- **Layout pattern**: prefer `flex-col` with `sm:` or `md:` row layouts for toolbars
- **Table columns**: hide non-essential columns below `sm:` breakpoint
- **Theme tokens**: Tailwind v4 tokens are defined in `app/globals.css` (`@theme inline`) — do not add custom breakpoint config files

---

## Next.js conventions

Before writing any Next.js code, **read the relevant guide** in `node_modules/next/dist/docs/`. This version of Next.js has breaking changes — APIs and conventions may differ from your training data or prior experience. Heed deprecation notices.

---

## PR guidelines

- Keep PRs focused and small — aim for ~400 changed lines or fewer
- Use a descriptive title following the Conventional Commits format
- Link related issues in the PR description (`Closes #109`)
- Fill in the PR template if one is present
- Do not merge your own PRs — wait for at least one review

---

## AI agent collaboration

If you are an AI agent contributing to this project, [AGENTS.md](../AGENTS.md) is the authoritative source for conventions that apply to you — including tool use, file structure, state management, and testing rules. This guide summarizes conventions for human contributors; `AGENTS.md` covers agent-specific behavior in full detail.
