import { EventEmitter } from "node:events";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock node:child_process before importing the route
vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
}));

import { spawn } from "node:child_process";
import { POST } from "./route";

type ChildStub = ReturnType<typeof spawn> & {
  stdout: EventEmitter;
  stderr: EventEmitter;
  kill: ReturnType<typeof vi.fn>;
};

function makeChildStub(): ChildStub {
  const child = new EventEmitter() as unknown as ChildStub;
  child.stdout = new EventEmitter() as unknown as ChildStub["stdout"];
  child.stderr = new EventEmitter() as unknown as ChildStub["stderr"];
  child.kill = vi.fn().mockReturnValue(true);
  return child;
}

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/terminal/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readSSEChunks(response: Response): Promise<string[]> {
  const chunks: string[] = [];
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(decoder.decode(value));
  }
  return chunks;
}

describe("POST /api/terminal/execute", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns 403 when NODE_ENV is production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const req = makeRequest({ command: ["awslocal", "s3", "ls"] });
    const res = await POST(req as never);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("disabled");
  });

  it("returns 403 when NODE_ENV is not development", async () => {
    vi.stubEnv("NODE_ENV", "test");
    const req = makeRequest({ command: ["awslocal", "s3", "ls"] });
    const res = await POST(req as never);
    expect(res.status).toBe(403);
  });

  it("returns 400 for disallowed command in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const req = makeRequest({ command: ["rm", "-rf", "/"] });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("command not allowed");
    expect(vi.mocked(spawn)).not.toHaveBeenCalled();
  });

  it("returns 400 for missing command body in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const req = makeRequest({});
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    expect(vi.mocked(spawn)).not.toHaveBeenCalled();
  });

  it("returns 200 text/event-stream for allowed command in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const child = makeChildStub();
    vi.mocked(spawn).mockReturnValue(child as never);

    const req = makeRequest({ command: ["awslocal", "s3", "ls"] });
    const res = await POST(req as never);

    // Close the child so stream ends (after we've gotten the response)
    child.emit("close", 0);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
  });

  it("SSE stream emits stdout event shape", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const child = makeChildStub();
    vi.mocked(spawn).mockReturnValue(child as never);

    const req = makeRequest({ command: ["aws", "s3", "ls"] });
    const res = await POST(req as never);

    // Now emit events — stream is already set up because ReadableStream.start() is synchronous
    child.stdout.emit("data", Buffer.from("bucket-name\n"));
    child.emit("close", 0);

    const chunks = await readSSEChunks(res);
    const combined = chunks.join("");
    expect(combined).toContain("event: stdout");
    expect(combined).toContain("bucket-name");
  });

  it("SSE stream emits stderr event shape", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const child = makeChildStub();
    vi.mocked(spawn).mockReturnValue(child as never);

    const req = makeRequest({ command: ["terraform", "plan"] });
    const res = await POST(req as never);

    child.stderr.emit("data", Buffer.from("some error\n"));
    child.emit("close", 1);

    const chunks = await readSSEChunks(res);
    const combined = chunks.join("");
    expect(combined).toContain("event: stderr");
    expect(combined).toContain("some error");
  });

  it("SSE stream emits exit event with code on close", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const child = makeChildStub();
    vi.mocked(spawn).mockReturnValue(child as never);

    const req = makeRequest({ command: ["awslocal", "s3", "ls"] });
    const res = await POST(req as never);

    child.emit("close", 42);

    const chunks = await readSSEChunks(res);
    const combined = chunks.join("");
    expect(combined).toContain("event: exit");
    expect(combined).toContain('"code":42');
  });

  it("kills process and emits exit after 30s timeout", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.useFakeTimers();

    const child = makeChildStub();
    vi.mocked(spawn).mockReturnValue(child as never);

    const req = makeRequest({ command: ["awslocal", "s3", "ls"] });
    const res = await POST(req as never);

    // Advance timer to trigger the 30s timeout (this calls child.kill and enqueues exit)
    vi.advanceTimersByTime(30_000);

    // The timeout handler has already closed the stream, no more events needed
    vi.useRealTimers();

    expect(child.kill).toHaveBeenCalled();
    const chunks = await readSSEChunks(res);
    const combined = chunks.join("");
    expect(combined).toContain("event: exit");
  });
});
