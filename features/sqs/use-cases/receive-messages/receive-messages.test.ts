import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/features/sqs/lib/client", () => ({
  getSQSClient: vi.fn(),
}));

import { type SQSClient } from "@aws-sdk/client-sqs";
import { getSQSClient } from "@/features/sqs/lib/client";
import { receiveMessagesAction } from "./receive-messages";
import type { ActionState } from "@/features/shared/types/action-state";
function makeSqsClient(sendFn: (cmd: unknown) => Promise<unknown>): SQSClient {
  return { send: sendFn } as unknown as SQSClient;
}

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

const idle: ActionState = { status: "idle" };
const formData = buildFormData({ queueUrl: "https://localhost/000000000000/test-queue", locale: "en" });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("receiveMessagesAction — system attributes mapped (REQ-02)", () => {
  it("maps Attributes to attributes field on each message", async () => {
    const client = makeSqsClient(async () => ({
      Messages: [
        {
          MessageId: "msg-1",
          Body: "hello",
          ReceiptHandle: "rh-1",
          Attributes: {
            SentTimestamp: "1700000000000",
            ApproximateReceiveCount: "1",
          },
        },
      ],
    }));
    vi.mocked(getSQSClient).mockResolvedValue(client);

    const result = await receiveMessagesAction(idle, formData);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.messages[0].attributes).toEqual({
        SentTimestamp: "1700000000000",
        ApproximateReceiveCount: "1",
      });
    }
  });
});

describe("receiveMessagesAction — custom string attribute mapped (REQ-02)", () => {
  it("maps MessageAttributes with StringValue to messageAttributes", async () => {
    const client = makeSqsClient(async () => ({
      Messages: [
        {
          MessageId: "msg-2",
          Body: "world",
          ReceiptHandle: "rh-2",
          MessageAttributes: {
            color: { StringValue: "red", DataType: "String" },
          },
        },
      ],
    }));
    vi.mocked(getSQSClient).mockResolvedValue(client);

    const result = await receiveMessagesAction(idle, formData);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.messages[0].messageAttributes).toEqual({
        color: { dataType: "String", value: "red" },
      });
    }
  });
});

describe("receiveMessagesAction — binary attribute serialized as label (REQ-02)", () => {
  it('maps MessageAttributes with BinaryValue to "(binary)" string', async () => {
    const client = makeSqsClient(async () => ({
      Messages: [
        {
          MessageId: "msg-3",
          Body: "binary",
          ReceiptHandle: "rh-3",
          MessageAttributes: {
            raw: { BinaryValue: new Uint8Array([1, 2, 3]), DataType: "Binary" },
          },
        },
      ],
    }));
    vi.mocked(getSQSClient).mockResolvedValue(client);

    const result = await receiveMessagesAction(idle, formData);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.messages[0].messageAttributes?.raw.value).toBe("(binary)");
      const msgAttr = result.data.messages[0].messageAttributes?.raw;
      expect(msgAttr).not.toHaveProperty("BinaryValue");
    }
  });
});

describe("receiveMessagesAction — absent attributes omitted (REQ-02)", () => {
  it("leaves attributes and messageAttributes undefined when not present in SDK response", async () => {
    const client = makeSqsClient(async () => ({
      Messages: [
        {
          MessageId: "msg-4",
          Body: "plain",
          ReceiptHandle: "rh-4",
        },
      ],
    }));
    vi.mocked(getSQSClient).mockResolvedValue(client);

    const result = await receiveMessagesAction(idle, formData);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.messages[0].attributes).toBeUndefined();
      expect(result.data.messages[0].messageAttributes).toBeUndefined();
    }
  });
});

describe("receiveMessagesAction — empty attribute maps omitted (REQ-02)", () => {
  it("yields undefined attributes when Attributes is an empty map", async () => {
    const client = makeSqsClient(async () => ({
      Messages: [
        {
          MessageId: "msg-5",
          Body: "empty-attrs",
          ReceiptHandle: "rh-5",
          Attributes: {},
        },
      ],
    }));
    vi.mocked(getSQSClient).mockResolvedValue(client);

    const result = await receiveMessagesAction(idle, formData);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.messages[0].attributes).toBeUndefined();
    }
  });
});
