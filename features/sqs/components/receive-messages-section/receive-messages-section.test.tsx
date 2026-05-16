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
];

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    // Override useActionState: first call is receiveMessagesAction (always idle — we inject via useState),
    // subsequent calls are per-row requeueMessageAction
    useActionState: (..._args: unknown[]) => {
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
    expect(requeueButtons.length).toBeGreaterThanOrEqual(messages.length);
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
    expect(nonPendingButtons.length).toBeGreaterThanOrEqual(1);
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
