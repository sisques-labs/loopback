This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker

Pre-built multi-arch images (`linux/amd64` + `linux/arm64`) are published on every release to
**Docker Hub** and **GitHub Container Registry**. They are functionally identical — pull whichever
mirror is closer to your runtime.

### Pull

```bash
# Docker Hub
docker pull sisqueslabs/loopback:latest

# GitHub Container Registry (GHCR)
docker pull ghcr.io/sisques-labs/loopback:latest
```

### Run

The container exposes the dashboard on port `3000`. Map it to any host port you like and open
[http://localhost:3000](http://localhost:3000):

```bash
docker run --rm -p 3000:3000 sisqueslabs/loopback:latest
```

Or, against the GHCR mirror:

```bash
docker run --rm -p 3000:3000 ghcr.io/sisques-labs/loopback:latest
```

### Connect to LocalStack

Loopback is a thin operator dashboard for AWS services running on your machine — usually
[LocalStack](https://www.localstack.cloud/). Point it at your LocalStack endpoint with two env
vars (`NEXT_PUBLIC_AWS_ENDPOINT_URL` mirrors `AWS_ENDPOINT_URL` for browser-side error hints):

```bash
docker run --rm -p 3000:3000 \
  -e AWS_ENDPOINT_URL=http://host.docker.internal:4566 \
  -e NEXT_PUBLIC_AWS_ENDPOINT_URL=http://localhost:4566 \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  sisqueslabs/loopback:latest
```

On Linux hosts where `host.docker.internal` is not resolved by default, add
`--add-host=host.docker.internal:host-gateway` or use the LocalStack container's network alias.

### Supported tags

| Tag                  | Meaning                                                     | Promoted to `:latest`? |
| -------------------- | ----------------------------------------------------------- | ---------------------- |
| `:latest`            | Most recent **stable** release                              | —                      |
| `:X.Y.Z`             | Immutable stable release (e.g. `:0.1.1`, `:1.2.0`)          | Yes, on release        |
| `:alpha`             | Rolling **alpha** channel — latest `X.Y.Z-alpha.N`          | No                     |
| `:beta`              | Rolling **beta** channel — latest `X.Y.Z-beta.N`            | No                     |
| `:rc`                | Rolling **release-candidate** channel                       | No                     |
| `:X.Y.Z-<channel>.N` | Immutable pre-release (e.g. `:0.2.0-beta.1`)                | No                     |

Pre-release channel tags (`:alpha`, `:beta`, `:rc`) never overwrite `:latest`. Stable releases
never overwrite the rolling pre-release tags.

### Runtime environment variables

| Variable                       | Default       | Purpose                                                            |
| ------------------------------ | ------------- | ------------------------------------------------------------------ |
| `PORT`                         | `3000`        | Port the Next.js server listens on inside the container.           |
| `HOSTNAME`                     | `0.0.0.0`     | Bind address inside the container — leave as-is for `-p` mapping.  |
| `NEXT_TELEMETRY_DISABLED`      | `1`           | Next.js anonymous telemetry is disabled in the image by default.   |
| `AWS_ENDPOINT_URL`             | _(unset)_     | Server-side AWS endpoint. Set to your LocalStack URL.              |
| `NEXT_PUBLIC_AWS_ENDPOINT_URL` | _(unset)_     | Same URL, exposed to the browser for error-panel hints.            |
| `AWS_REGION`                   | `us-east-1`   | Region used by the embedded AWS SDK clients.                       |
| `AWS_ACCESS_KEY_ID`            | `test`        | LocalStack accepts any value; override only for real AWS.          |
| `AWS_SECRET_ACCESS_KEY`        | `test`        | Same as above.                                                     |

### Releasing a new image

Releases are cut from the `Release` workflow (Actions → **Release** → _Run workflow_). Pick a
SemVer bump (`patch | minor | major`) and a channel (`stable | alpha | beta | rc`); the workflow
bumps `package.json`, tags the commit, builds multi-arch, and publishes to both registries.

## Documentation

- [Getting Started](./docs/getting-started.md) — prerequisites, install, run, and test locally
- [LocalStack / Floci Setup](./docs/localstack-setup.md) — local AWS emulation with Docker
- [Architecture](./docs/architecture.md) — feature-sliced layout, RSC, i18n routing
- [Contributing](./docs/contributing.md) — workflow, commit conventions, PR guidelines

