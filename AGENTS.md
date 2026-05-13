<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Client UI state

Use **Zustand** stores under `features/shared/stores/` for shared client UI state (e.g. mobile nav open/close). Prefer stores over React Context for that kind of global UI state.

## Responsive UI

New screens and components should work from **narrow mobile** (~375px) up to desktop: prefer `flex-col` + `sm:`/`md:` row layouts for toolbars, hide non-essential table columns below `sm`, and keep primary actions reachable with **≥44×44px** touch targets on small viewports (`min-h-11 min-w-11` before `md:` where appropriate). Tailwind v4 theme tokens live in `app/globals.css` (`@theme inline`); avoid ad-hoc breakpoint config files.
