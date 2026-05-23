# Getting Started

This guide takes you from a clean clone to a running local development environment.

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 24** (hard requirement — earlier versions are not supported)
- **pnpm** — the only package manager used in this project (`npm` and `yarn` are not supported)
- **Docker** — required to run a local AWS emulator (LocalStack or Floci)
- A running local AWS emulator on port `4566` — see [LocalStack / Floci Setup](./localstack-setup.md)

> **Tip**: Use [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage Node versions. Run `node -v` to confirm you are on Node 24.

---

## 1. Clone the repository

```bash
git clone https://github.com/sisques-labs/aws-local-ui.git
cd aws-local-ui
```

---

## 2. Install dependencies

```bash
pnpm install
```

> Do not use `npm install` or `yarn install`. The lockfile is `pnpm-lock.yaml` and mixing package managers will cause dependency inconsistencies.

---

## 3. Configure environment variables

> **WARNING**: Set `AWS_ENDPOINT_URL` BEFORE running the dev server. Without it, the app cannot reach your local AWS emulator and all service panels will show connection errors.

Create a `.env.local` file at the project root (or export the variables in your shell):

```bash
# Required — point the server-side AWS SDK at your local emulator
AWS_ENDPOINT_URL=http://localhost:4566

# Required for browser-side error hints
NEXT_PUBLIC_AWS_ENDPOINT_URL=http://localhost:4566

# Standard LocalStack / Floci dummy credentials
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

See [LocalStack / Floci Setup](./localstack-setup.md) for instructions on starting the emulator and understanding the full endpoint precedence rules.

---

## 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app uses i18n routing — the default entry point is `http://localhost:3000/en` (or whichever locale is configured as the fallback).

You should see the dashboard with at least one AWS service panel (S3, SQS, DynamoDB, Lambda, SNS, or CloudWatch Logs) without connection errors.

---

## 5. Run the tests

```bash
pnpm test
```

This project follows **strict TDD with Vitest**. All tests must pass before opening a pull request. See [AGENTS.md](../AGENTS.md) for the full testing conventions.

---

## Next steps

- **Set up your local AWS emulator** → [LocalStack / Floci Setup](./localstack-setup.md)
- **Understand the codebase layout** → [Architecture](./architecture.md)
- **Make a contribution** → [Contributing](./contributing.md)
