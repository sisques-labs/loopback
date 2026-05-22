import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock buffer before importing middleware
vi.mock("./inspector-buffer", () => ({
  pushEntry: vi.fn(),
}));

// Mock truncate to pass through for simplicity in middleware tests
vi.mock("./inspector-truncate", () => ({
  truncate: vi.fn((v: unknown) => v),
}));

import { withInspectorMiddleware } from "./inspector-middleware";
import { pushEntry } from "./inspector-buffer";

const mockPushEntry = vi.mocked(pushEntry);

function makeClient() {
  const addedMiddlewares: { mw: unknown; opts: unknown }[] = [];
  return {
    middlewareStack: {
      add: vi.fn((mw: unknown, opts: unknown) => {
        addedMiddlewares.push({ mw, opts });
      }),
      // Expose for assertions
      _added: addedMiddlewares,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("withInspectorMiddleware — registration", () => {
  it("adds middleware to the client's middlewareStack", () => {
    const client = makeClient();
    withInspectorMiddleware(client, "SQS");
    expect(client.middlewareStack.add).toHaveBeenCalledTimes(1);
  });

  it("registers at the 'deserialize' step with INSPECTOR tag", () => {
    const client = makeClient();
    withInspectorMiddleware(client, "SQS");
    const [, opts] = client.middlewareStack.add.mock.calls[0] as [
      unknown,
      { step: string; tags: string[]; name: string },
    ];
    expect(opts.step).toBe("deserialize");
    expect(opts.tags).toContain("INSPECTOR");
    expect(opts.name).toBe("InspectorMiddleware");
  });

  it("returns the client unchanged (same reference)", () => {
    const client = makeClient();
    const result = withInspectorMiddleware(client, "SQS");
    expect(result).toBe(client);
  });
});

describe("withInspectorMiddleware — success path", () => {
  it("calls pushEntry exactly once on success", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "DynamoDB");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (
        next: unknown,
        ctx: unknown,
      ) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const mockOutput = { MessageId: "x", $metadata: { attempts: 1, httpStatusCode: 200 } };
    const next = vi.fn().mockResolvedValue({ output: mockOutput });
    const ctx = { commandName: "SendMessageCommand" };
    const args = { input: { QueueUrl: "q" }, request: {} };

    await middleware(next, ctx)(args);

    expect(mockPushEntry).toHaveBeenCalledTimes(1);
  });

  it("records correct service and operation on success", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "DynamoDB");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const next = vi.fn().mockResolvedValue({
      output: { $metadata: { attempts: 2, httpStatusCode: 200 } },
    });
    const ctx = { commandName: "PutItemCommand" };
    const args = { input: { TableName: "t" }, request: {} };

    await middleware(next, ctx)(args);

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.service).toBe("DynamoDB");
    expect(recorded.operation).toBe("PutItemCommand");
    expect(recorded.status).toBe("success");
  });

  it("reads attempts from $metadata on success", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "S3");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const next = vi.fn().mockResolvedValue({
      output: { $metadata: { attempts: 3, httpStatusCode: 200 } },
    });
    const ctx = { commandName: "GetObjectCommand" };
    const args = { input: {}, request: {} };

    await middleware(next, ctx)(args);

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.attempts).toBe(3);
  });

  it("falls back to attempts: 1 when $metadata.attempts is missing", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "S3");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const next = vi.fn().mockResolvedValue({
      output: { $metadata: {} },
    });
    const ctx = { commandName: "ListBucketsCommand" };
    const args = { input: {}, request: {} };

    await middleware(next, ctx)(args);

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.attempts).toBe(1);
  });

  it("uses 'UnknownCommand' fallback when commandName is absent in context", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "SNS");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const next = vi.fn().mockResolvedValue({
      output: { $metadata: { attempts: 1 } },
    });
    const ctx = {}; // no commandName
    const args = { input: {}, request: {} };

    await middleware(next, ctx)(args);

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.operation).toBe("UnknownCommand");
  });

  it("durationMs is >= 0 on success", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "SQS");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const next = vi.fn().mockResolvedValue({
      output: { $metadata: { attempts: 1 } },
    });
    const ctx = { commandName: "SendMessageCommand" };
    const args = { input: {}, request: {} };

    await middleware(next, ctx)(args);

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("id is a UUID (v4 format) on success", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "SQS");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const next = vi.fn().mockResolvedValue({
      output: { $metadata: { attempts: 1 } },
    });
    const ctx = { commandName: "SendMessageCommand" };
    const args = { input: {}, request: {} };

    await middleware(next, ctx)(args);

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("timestamp is an epoch ms number on success", async () => {
    const before = Date.now();
    const client = makeClient();
    withInspectorMiddleware(client, "SQS");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const next = vi.fn().mockResolvedValue({
      output: { $metadata: { attempts: 1 } },
    });
    const ctx = { commandName: "SendMessageCommand" };
    const args = { input: {}, request: {} };

    await middleware(next, ctx)(args);
    const after = Date.now();

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.timestamp).toBeGreaterThanOrEqual(before);
    expect(recorded.timestamp).toBeLessThanOrEqual(after);
  });

  it("returns the result from next (transparent)", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "SQS");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const mockResult = { output: { MessageId: "msg-1", $metadata: { attempts: 1 } } };
    const next = vi.fn().mockResolvedValue(mockResult);
    const ctx = { commandName: "ReceiveMessageCommand" };
    const args = { input: {}, request: {} };

    const result = await middleware(next, ctx)(args);

    expect(result).toBe(mockResult);
  });
});

describe("withInspectorMiddleware — error path", () => {
  it("calls pushEntry exactly once on error", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "Lambda");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const error = Object.assign(new Error("Function not found"), {
      name: "ResourceNotFoundException",
      $metadata: { attempts: 1, httpStatusCode: 404 },
    });
    const next = vi.fn().mockRejectedValue(error);
    const ctx = { commandName: "InvokeCommand" };
    const args = { input: { FunctionName: "my-fn" }, request: {} };

    await expect(middleware(next, ctx)(args)).rejects.toThrow("Function not found");
    expect(mockPushEntry).toHaveBeenCalledTimes(1);
  });

  it("records status: 'error' and re-throws original error", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "Lambda");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const originalError = Object.assign(new Error("Kaboom"), {
      name: "SomeSDKError",
      $metadata: { attempts: 2, httpStatusCode: 500 },
    });
    const next = vi.fn().mockRejectedValue(originalError);
    const ctx = { commandName: "InvokeCommand" };
    const args = { input: {}, request: {} };

    const thrown = await middleware(next, ctx)(args).catch((e: unknown) => e);
    expect(thrown).toBe(originalError);

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.status).toBe("error");
    expect(recorded.error?.name).toBe("SomeSDKError");
    expect(recorded.error?.message).toBe("Kaboom");
    expect(recorded.error?.statusCode).toBe(500);
  });

  it("reads attempts from error $metadata", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "Lambda");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const error = Object.assign(new Error("err"), {
      name: "ThrottlingException",
      $metadata: { attempts: 4, httpStatusCode: 429 },
    });
    const next = vi.fn().mockRejectedValue(error);
    const ctx = { commandName: "InvokeCommand" };
    const args = { input: {}, request: {} };

    await expect(middleware(next, ctx)(args)).rejects.toThrow();

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.attempts).toBe(4);
  });

  it("sets output to undefined on error", async () => {
    const client = makeClient();
    withInspectorMiddleware(client, "SQS");

    const [middleware] = client.middlewareStack.add.mock.calls[0] as [
      (next: unknown, ctx: unknown) => (args: unknown) => Promise<unknown>,
      unknown,
    ];

    const error = Object.assign(new Error("oops"), { $metadata: {} });
    const next = vi.fn().mockRejectedValue(error);
    const ctx = { commandName: "SendMessageCommand" };
    const args = { input: {}, request: {} };

    await expect(middleware(next, ctx)(args)).rejects.toThrow();

    const recorded = mockPushEntry.mock.calls[0][0];
    expect(recorded.output).toBeUndefined();
  });
});
