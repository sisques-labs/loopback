# LocalStack / Floci Setup

This guide covers how to run a local AWS emulator so the dashboard can operate without a real AWS account.

Two emulators are supported: **Floci** (recommended) and **LocalStack** (alternative). Both expose the same endpoint (`http://localhost:4566`) so the rest of the configuration is identical.

---

## Option 1 — Floci (recommended)

[Floci](https://github.com/floci-io/floci) is a free, MIT-licensed AWS emulator with no authentication token required. It supports 52+ AWS services and uses real Docker backends for Lambda, RDS, ECS, and EKS.

> Floci was created because LocalStack froze free-tier security updates in March 2026. Floci is the recommended emulator for this project.

### Docker Compose

Create a `docker-compose.yml` in a local working directory (do **not** commit it to this repo — it is intentionally absent):

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
```

Start it:

```bash
docker compose up -d
```

### CLI (alternative)

If you have the Floci CLI installed:

```bash
floci start
eval $(floci env)   # exports AWS_* env vars automatically
```

See [Floci's official documentation](https://github.com/floci-io/floci) for CLI install instructions and the full list of supported services.

### Environment variables

```bash
AWS_ENDPOINT_URL=http://localhost:4566
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

---

## Option 2 — LocalStack

[LocalStack](https://www.localstack.cloud/) is the original local AWS emulator. Latest features require an auth token.

### Docker Compose

```yaml
services:
  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3,sqs,dynamodb,lambda,sns,logs
```

Start it:

```bash
docker compose up -d
```

> Do **not** pin a specific image version — use `latest stable`. See [LocalStack's official Docker Hub page](https://hub.docker.com/r/localstack/localstack) for current release notes.

### Environment variables

Same as Floci:

```bash
AWS_ENDPOINT_URL=http://localhost:4566
AWS_DEFAULT_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

---

## Environment configuration

There are two ways to configure the endpoint:

### A) Environment variables (recommended for local dev)

Set `AWS_ENDPOINT_URL` in your `.env.local` file or shell before running `pnpm dev`. See [Getting Started](./getting-started.md) for the full variable list.

### B) In-app Settings UI

The dashboard has a **Settings** page that lets you configure the endpoint at runtime. The value is stored in an **httpOnly cookie**, which means it is sent with every server-side request but is not accessible to client-side JavaScript.

---

## Endpoint precedence

The app resolves the active endpoint in this order (first match wins):

1. **Active profile** — profile selected in the Settings UI
2. **Region-override cookie** — set via the Settings UI region picker
3. **Endpoint-override cookie** — set via the Settings UI endpoint field
4. **`AWS_ENDPOINT_URL` environment variable** — fallback for local dev

---

## Verifying connectivity

Once your emulator is running, confirm it is reachable:

```bash
curl -s http://localhost:4566/_localstack/health | head -5
# or for Floci:
curl -s http://localhost:4566/
```

You should receive a JSON response. If you get a connection-refused error, the emulator is not running — see Troubleshooting below.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `Connection refused` on port 4566 | Emulator not running | Run `docker compose up -d` and check `docker ps` |
| Dashboard shows "endpoint not configured" | `AWS_ENDPOINT_URL` not set | Add it to `.env.local` and restart `pnpm dev` |
| Services return 404 | Wrong port or emulator | Confirm `docker ps` shows port `4566` mapped |
| CORS errors in browser console | Browser making direct AWS calls | All AWS SDK calls must be server-side only — see [Architecture](./architecture.md) |
| Missing `AWS_ENDPOINT_URL` | Env var not exported | Confirm with `echo $AWS_ENDPOINT_URL` before running `pnpm dev` |
