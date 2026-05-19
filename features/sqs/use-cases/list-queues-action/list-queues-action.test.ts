import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/sqs/services/list-queues/list-queues", () => ({
  listQueues: vi.fn(),
}));

import { listQueues } from "@/features/sqs/services/list-queues/list-queues";
import { listQueuesAction } from "./list-queues-action";
import type { QueueListItem } from "@/features/sqs/types/sqs";

const mockQueues: QueueListItem[] = [
  { queueUrl: "http://localhost:4566/000000000000/my-queue", name: "my-queue", isFifo: false },
  { queueUrl: "http://localhost:4566/000000000000/my-queue.fifo", name: "my-queue.fifo", isFifo: true },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listQueuesAction — success branch", () => {
  it("calls listQueues() and returns the queue array", async () => {
    vi.mocked(listQueues).mockResolvedValue(mockQueues);

    const result = await listQueuesAction();

    expect(listQueues).toHaveBeenCalledOnce();
    expect(result).toEqual(mockQueues);
  });

  it("returns an empty array when there are no queues", async () => {
    vi.mocked(listQueues).mockResolvedValue([]);

    const result = await listQueuesAction();

    expect(result).toEqual([]);
  });
});

describe("listQueuesAction — error branch", () => {
  it("re-throws errors from the underlying service", async () => {
    const error = Object.assign(new Error("Cannot connect to SQS"), { name: "EndpointError" });
    vi.mocked(listQueues).mockRejectedValue(error);

    await expect(listQueuesAction()).rejects.toThrow("Cannot connect to SQS");
  });
});
