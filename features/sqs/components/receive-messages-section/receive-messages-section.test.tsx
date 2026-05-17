import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: { success: vi.fn() },
}));

vi.mock(
  "@/features/sqs/use-cases/requeue-message/requeue-message",
  () => ({
    requeueMessageAction: vi.fn(),
  }),
);

vi.mock(
  "@/features/sqs/use-cases/receive-messages/receive-messages",
  () => ({
    receiveMessagesAction: vi.fn(),
  }),
);

// Mutable stubs controlled per-test
type UseActionStateTuple = [
  { status: string; data?: unknown; message?: string },
  ReturnType<typeof vi.fn>,
  boolean,
];

let requeueStubs: UseActionStateTuple[] = [];
let requeueCallCount = 0;

// lastBatch to inject via useState mock
let lastBatchStub: typeof messages = [];

const messages = [
  { messageId: "msg-1", body: "Hello", receiptHandle: "handle-aaa" },
  { messageId: "msg-2", body: "World", receiptHandle: "handle-bbb" },
] as Array<{
  messageId: string;
  body: string;
  receiptHandle: string;
  attributes?: Record<string, string>;
  messageAttributes?: Record<string, { dataType: string; value: string }>;
}>;

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    // Override useActionState: first call is receiveMessagesAction (always idle — we inject via useState),
    // subsequent calls are per-row requeueMessageAction
    useActionState: () => {
      const idx = requeueCallCount;
      requeueCallCount++;
      if (idx === 0) {
        // receiveMessagesAction — always idle; we control lastBatch via useState mock
        return [{ status: "idle" }, vi.fn(), false] as const;
      }
      // MessageRow requeueMessageAction
      return requeueStubs[idx - 1] ?? [{ status: "idle" }, vi.fn(), false];
    },
    // Override useState: when initialState is [] (the lastBatch state), return lastBatchStub
    useState: (initialState: unknown) => {
      if (Array.isArray(initialState) && initialState.length === 0) {
        // This is the lastBatch useState call — inject our stub
        return [lastBatchStub, vi.fn()] as const;
      }
      // All other useState calls — use real React
      return react.useState(initialState);
    },
  };
});

const receiveDict = {
  trigger: "Receive messages",
  title: "Receive messages",
  description: "Fetches messages.",
  empty: "No messages.",
  messageIdLabel: "Message ID",
  submitting: "Receiving…",
  requeue: {
    requeue: "Requeue",
    requeueing: "Requeueing…",
    requeueSuccess: "Message requeued.",
  },
  attributesDialog: {
    trigger: "View attributes",
    title: "Message attributes",
    systemSection: "System attributes",
    customSection: "Message attributes",
    noSystem: "No system attributes.",
    noCustom: "No custom attributes.",
    close: "Close",
  },
};

const queueUrl = "https://localhost/000000000000/test-queue";

beforeEach(() => {
  requeueCallCount = 0;
  requeueStubs = [];
  lastBatchStub = [];
});

afterEach(() => {
  cleanup();
  requeueCallCount = 0;
});

async function renderSection() {
  requeueCallCount = 0;
  const { ReceiveMessagesSection } = await import("./receive-messages-section");
  await act(async () => {
    render(<ReceiveMessagesSection queueUrl={queueUrl} dict={receiveDict} locale="en" />);
  });
}

describe("ReceiveMessagesSection — MessageRow requeue button (T-07)", () => {
  it("renders a requeue submit button for each message in the batch", async () => {
    lastBatchStub = messages;
    requeueStubs = [
      [{ status: "idle" }, vi.fn(), false],
      [{ status: "idle" }, vi.fn(), false],
    ];
    await renderSection();

    // Each row should have a requeue submit button (RotateCcwIcon with aria-label "Requeue")
    const requeueButtons = screen.getAllByRole("button", { name: /requeue/i });
    expect(requeueButtons.length).toBe(messages.length);
  });

  it("renders hidden receiptHandle input for each message row", async () => {
    lastBatchStub = messages;
    requeueStubs = [
      [{ status: "idle" }, vi.fn(), false],
      [{ status: "idle" }, vi.fn(), false],
    ];
    await renderSection();

    const receiptInputs = document.querySelectorAll('input[name="receiptHandle"]');
    expect(receiptInputs.length).toBe(messages.length);
    expect((receiptInputs[0] as HTMLInputElement).value).toBe(messages[0].receiptHandle);
    expect((receiptInputs[1] as HTMLInputElement).value).toBe(messages[1].receiptHandle);
  });
});

describe("ReceiveMessagesSection — MessageRow pending state (T-08)", () => {
  it("shows requeueing copy only on the pending row", async () => {
    lastBatchStub = messages;
    requeueStubs = [
      // row 0 — pending
      [{ status: "idle" }, vi.fn(), true],
      // row 1 — idle, not pending
      [{ status: "idle" }, vi.fn(), false],
    ];
    await renderSection();

    // Row 0's pending text should be visible (may appear in sr-only span and visible span)
    const pendingTexts = screen.getAllByText(receiveDict.requeue.requeueing);
    expect(pendingTexts.length).toBeGreaterThanOrEqual(1);

    // Row 1's button should not be disabled
    const buttons = screen.getAllByRole("button", { name: /requeue/i });
    const nonPendingButtons = buttons.filter(
      (btn) => !(btn as HTMLButtonElement).disabled,
    );
    expect(nonPendingButtons.length).toBe(messages.length - 1);
  });
});

describe("ReceiveMessagesSection — MessageRow success state (T-09)", () => {
  it("shows requeueSuccess copy when action returns success", async () => {
    lastBatchStub = [messages[0]];
    requeueStubs = [
      // row 0 — requeue success
      [{ status: "success", data: undefined }, vi.fn(), false],
    ];
    await renderSection();

    expect(screen.getByText(receiveDict.requeue.requeueSuccess)).toBeTruthy();
  });
});

describe("ReceiveMessagesSection — MessageRow error state (T-10)", () => {
  it("shows inline error message when action returns error", async () => {
    const errorMessage = "Visibility window expired";
    lastBatchStub = [messages[0]];
    requeueStubs = [
      // row 0 — requeue error
      [{ status: "error", message: errorMessage }, vi.fn(), false],
    ];
    await renderSection();

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });
});

describe("ReceiveMessagesSection — info button visibility (REQ-04)", () => {
  it("renders info button when message has system attributes", async () => {
    lastBatchStub = [
      {
        messageId: "msg-attrs",
        body: "with-sys",
        receiptHandle: "rh-s",
        attributes: { SentTimestamp: "1700000000000" },
      },
    ];
    requeueStubs = [[{ status: "idle" }, vi.fn(), false]];
    await renderSection();

    expect(screen.getByRole("button", { name: receiveDict.attributesDialog.trigger })).toBeTruthy();
  });

  it("renders info button when message has only custom messageAttributes", async () => {
    lastBatchStub = [
      {
        messageId: "msg-custom",
        body: "with-custom",
        receiptHandle: "rh-c",
        messageAttributes: { color: { dataType: "String", value: "red" } },
      },
    ];
    requeueStubs = [[{ status: "idle" }, vi.fn(), false]];
    await renderSection();

    expect(screen.getByRole("button", { name: receiveDict.attributesDialog.trigger })).toBeTruthy();
  });

  it("does not render info button when both attributes and messageAttributes are undefined", async () => {
    lastBatchStub = [{ messageId: "msg-plain", body: "plain", receiptHandle: "rh-p" }];
    requeueStubs = [[{ status: "idle" }, vi.fn(), false]];
    await renderSection();

    expect(
      screen.queryByRole("button", { name: receiveDict.attributesDialog.trigger }),
    ).toBeNull();
  });

  it("clicking info button makes the attributes dialog title appear", async () => {
    lastBatchStub = [
      {
        messageId: "msg-click",
        body: "clickable",
        receiptHandle: "rh-cl",
        attributes: { SentTimestamp: "1700000000000" },
      },
    ];
    requeueStubs = [[{ status: "idle" }, vi.fn(), false]];
    await renderSection();

    const btn = screen.getByRole("button", { name: receiveDict.attributesDialog.trigger });
    await act(async () => {
      btn.click();
    });

    expect(screen.getAllByText(receiveDict.attributesDialog.title).length).toBeGreaterThanOrEqual(1);
  });
});
