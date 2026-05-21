import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, act, cleanup } from "@testing-library/react";

vi.mock("server-only", () => ({}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("@/features/lambda/use-cases/list-functions-action/list-functions-action", () => ({
  listFunctionsAction: vi.fn(),
}));
vi.mock(
  "@/features/lambda/components/function-row-actions/function-row-actions",
  () => ({ FunctionRowActions: () => null }),
);

import React from "react";
import { listFunctionsAction } from "@/features/lambda/use-cases/list-functions-action/list-functions-action";
import { LambdaListShell } from "./lambda-list-shell";
import type { LambdaFunction } from "@/features/lambda/types/lambda";

// ── Test data ────────────────────────────────────────────────────────────────

const initialFunctions: LambdaFunction[] = [
  {
    functionName: "alpha-fn",
    functionArn: "arn:aws:lambda:us-east-1:000000000000:function:alpha-fn",
    runtime: "nodejs20.x",
    handler: "index.handler",
    description: "",
    timeout: 30,
    memorySize: 128,
    lastModified: "2024-01-01T00:00:00.000Z",
    state: "Active",
  },
  {
    functionName: "beta-fn",
    functionArn: "arn:aws:lambda:us-east-1:000000000000:function:beta-fn",
    runtime: "python3.12",
    handler: "handler.main",
    description: "",
    timeout: 60,
    memorySize: 256,
    lastModified: "2024-02-01T00:00:00.000Z",
    state: "Active",
  },
];

const updatedFunctions: LambdaFunction[] = [
  ...initialFunctions,
  {
    functionName: "gamma-fn",
    functionArn: "arn:aws:lambda:us-east-1:000000000000:function:gamma-fn",
    runtime: "nodejs20.x",
    handler: "index.handler",
    description: "",
    timeout: 30,
    memorySize: 128,
    lastModified: "2024-03-01T00:00:00.000Z",
    state: "Active",
  },
];

const dict = {
  table: {
    functionName: "Function Name",
    runtime: "Runtime",
    handler: "Handler",
    description: "Description",
    timeout: "Timeout (ms)",
    memorySize: "Memory (MB)",
    state: "State",
    stateActive: "Active",
    statePending: "Pending",
    stateFailed: "Failed",
    stateInactive: "Inactive",
    stateUnknown: "Unknown",
  },
  rowActions: {
    actions: "Function actions",
    viewDetail: "View detail",
    invoke: "Invoke",
    updateCode: "Update code",
  },
  invokeDialog: {
    title: "Invoke {functionName}",
    payloadLabel: "Payload (JSON)",
    payloadPlaceholder: "Leave empty or enter a valid JSON object…",
    cancel: "Cancel",
    submit: "Invoke",
    invoking: "Invoking…",
    responseTitle: "Response",
    statusCodeLabel: "Status code",
    bodyLabel: "Body",
    functionErrorTitle: "Function error",
    functionErrorDetail: "The function returned an error: {functionError}",
    invalidPayload: "Payload must be valid JSON.",
  },
  updateCodeDialog: {
    title: "Update function code",
    fileLabel: "Deployment package",
    fileHint: "Upload a .zip file (up to 50 MB).",
    selectFile: "Select a .zip file.",
    fileTooLarge: "File exceeds the 50 MB limit.",
    uploading: "Uploading… {percent}%",
    finalizing: "Processing on server…",
    cancel: "Cancel",
    submit: "Upload",
    successToast: "Function code updated successfully.",
  },
  copyButton: {
    copy: "Copy",
    copied: "Copied",
    copyArn: "Copy ARN",
    copyArnCopied: "ARN copied",
    copyUrl: "Copy URL",
    copyUrlCopied: "URL copied",
    copyJson: "Copy JSON",
    copyJsonCopied: "JSON copied",
  },
  page: {
    title: "Lambda Functions",
    empty: "No functions deployed in this account.",
    createCta: "Create function",
  },
  dialog: { close: "Close" },
};

const localePrefix = "/en";
const locale = "en" as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function advancePoll() {
  await act(async () => {
    vi.advanceTimersByTime(5000);
    await Promise.resolve();
    await Promise.resolve();
  });
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe("LambdaListShell — SSR-first render", () => {
  it("renders initialItems immediately before the first poll fires", () => {
    vi.mocked(listFunctionsAction).mockResolvedValue([]);

    render(
      <LambdaListShell
        initialItems={initialFunctions}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.getByText("alpha-fn")).toBeInTheDocument();
    expect(screen.getByText("beta-fn")).toBeInTheDocument();
    expect(listFunctionsAction).not.toHaveBeenCalled();
  });
});

describe("LambdaListShell — polling updates the table", () => {
  it("updates the displayed list after a poll interval fires", async () => {
    vi.mocked(listFunctionsAction).mockResolvedValue(updatedFunctions);

    render(
      <LambdaListShell
        initialItems={initialFunctions}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    await advancePoll();

    expect(screen.getByText("gamma-fn")).toBeInTheDocument();
  });
});

describe("LambdaListShell — no filter input", () => {
  it("does not render a filter input", () => {
    vi.mocked(listFunctionsAction).mockResolvedValue([]);

    render(
      <LambdaListShell
        initialItems={initialFunctions}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("LambdaListShell — empty initial state still polls", () => {
  it("mounts with empty initialItems and polls when interval fires", async () => {
    vi.mocked(listFunctionsAction).mockResolvedValue(initialFunctions);

    render(
      <LambdaListShell
        initialItems={[]}
        dict={dict}
        localePrefix={localePrefix}
        locale={locale}
      />,
    );

    expect(screen.queryByText("alpha-fn")).not.toBeInTheDocument();

    await advancePoll();

    expect(screen.getByText("alpha-fn")).toBeInTheDocument();
  });
});
