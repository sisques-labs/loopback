import { spawn } from "node:child_process";
import type { NextRequest } from "next/server";

const ALLOWED_COMMANDS = ["awslocal", "aws", "terraform"] as const;
const TIMEOUT_MS = 30_000;
const encoder = new TextEncoder();

/** Format a Server-Sent Event frame. */
function sseFrame(event: string, data: string): Uint8Array {
  return encoder.encode(`event: ${event}\ndata: ${data}\n\n`);
}

/**
 * Schedule a SIGKILL after TIMEOUT_MS.
 * On fire: kill the child, emit a null-code exit frame, then close the stream.
 */
function scheduleTimeout(
  child: ReturnType<typeof spawn>,
  enqueue: (chunk: Uint8Array) => void,
  closeStream: () => void,
): ReturnType<typeof setTimeout> {
  return setTimeout(() => {
    child.kill("SIGKILL");
    enqueue(sseFrame("exit", JSON.stringify({ code: null })));
    closeStream();
  }, TIMEOUT_MS);
}

export async function POST(req: NextRequest): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "disabled" }, { status: 403 });
  }

  let body: { command?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const argv = body.command;
  if (
    !Array.isArray(argv) ||
    argv.length === 0 ||
    typeof argv[0] !== "string" ||
    !(ALLOWED_COMMANDS as readonly string[]).includes(argv[0])
  ) {
    return Response.json({ error: "command not allowed" }, { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      function enqueue(chunk: Uint8Array) {
        try {
          controller.enqueue(chunk);
        } catch {
          // stream already closed — ignore
        }
      }

      function closeStream() {
        try {
          controller.close();
        } catch {
          // already closed — ignore
        }
      }

      const child = spawn(argv[0] as string, (argv as string[]).slice(1), {
        shell: false,
      });

      const timeoutHandle = scheduleTimeout(child, enqueue, closeStream);

      child.stdout?.on("data", (data: Buffer) => {
        enqueue(sseFrame("stdout", String(data)));
      });

      child.stderr?.on("data", (data: Buffer) => {
        enqueue(sseFrame("stderr", String(data)));
      });

      child.on("error", (err: Error) => {
        clearTimeout(timeoutHandle);
        enqueue(sseFrame("error", JSON.stringify({ message: err.message })));
        closeStream();
      });

      child.on("close", (code: number | null) => {
        clearTimeout(timeoutHandle);
        enqueue(sseFrame("exit", JSON.stringify({ code })));
        closeStream();
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
