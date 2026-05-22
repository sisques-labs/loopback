/**
 * AWS SDK v3 Smithy middleware for the request inspector.
 *
 * Injects at the `deserialize` step — this is the canonical layer for
 * capturing timing + final response metadata ($metadata.attempts) because:
 *   - It runs ONCE per logical command (after all SDK retries are exhausted).
 *   - `output.$metadata.attempts` is populated by the time deserialize runs.
 *   - `build` / `serialize` steps would fire once per retry attempt.
 *
 * Never swallows errors — always re-throws the original so SDK call-sites
 * remain unaffected.
 */
import { pushEntry } from "./inspector-buffer";
import { truncate } from "./inspector-truncate";

const MAX_FIELD_BYTES = 4 * 1024; // 4 KB per payload field

type AnyClient = {
  middlewareStack: {
    add: (mw: unknown, opts: unknown) => void;
  };
};

/**
 * Wraps an AWS SDK v3 client with the inspector middleware.
 * The middleware is added at the `deserialize` step and tagged INSPECTOR.
 *
 * @param client      - Any AWS SDK v3 client (duck-typed on middlewareStack.add)
 * @param serviceName - Human-readable service label stored in RequestEntry.service
 * @returns           - The same client (fluent API)
 */
export function withInspectorMiddleware<TClient extends AnyClient>(
  client: TClient,
  serviceName: string,
): TClient {
  // The middleware function matches the Smithy DeserializeMiddleware shape:
  // (next, context) => (args) => Promise<output>
  const middleware = (
    next: (args: unknown) => Promise<{ output: Record<string, unknown> }>,
    ctx: Record<string, unknown>,
  ) =>
    async (args: { input: unknown; request: unknown }) => {
      const startedAt = Date.now();
      const operation = (ctx.commandName as string | undefined) ?? "UnknownCommand";

      try {
        const result = await next(args);
        const meta = (result.output as Record<string, unknown>)?.$metadata as
          | Record<string, unknown>
          | undefined;

        pushEntry({
          id: crypto.randomUUID(),
          timestamp: startedAt,
          service: serviceName,
          operation,
          input: truncate(args.input, MAX_FIELD_BYTES),
          output: truncate(result.output, MAX_FIELD_BYTES),
          durationMs: Date.now() - startedAt,
          status: "success",
          attempts: (meta?.attempts as number | undefined) ?? 1,
        });

        return result;
      } catch (err) {
        const e = err as {
          name?: string;
          message?: string;
          $metadata?: { attempts?: number; httpStatusCode?: number };
        };

        pushEntry({
          id: crypto.randomUUID(),
          timestamp: startedAt,
          service: serviceName,
          operation,
          input: truncate(args.input, MAX_FIELD_BYTES),
          output: undefined,
          durationMs: Date.now() - startedAt,
          status: "error",
          error: {
            name: e.name ?? "Error",
            message: e.message ?? "Unknown error",
            statusCode: e.$metadata?.httpStatusCode,
          },
          attempts: e.$metadata?.attempts ?? 1,
        });

        // Never swallow — middleware must be fully transparent.
        throw err;
      }
    };

  client.middlewareStack.add(middleware, {
    step: "deserialize",
    name: "InspectorMiddleware",
    tags: ["INSPECTOR"],
    override: true,
  });

  return client;
}
