const SQS_QUEUE_NAME_PART = /^[A-Za-z0-9_-]+$/;

export const QUEUE_NAME_ERROR_CODES = [
  "required",
  "standardCannotEndFifo",
  "nameTooLong",
  "fifoMustEndFifo",
  "fifoInvalidPrefix",
  "standardInvalidPattern",
] as const;

export type QueueNameErrorCode = (typeof QUEUE_NAME_ERROR_CODES)[number];

export function finalQueueName(trimmed: string, isFifo: boolean): string {
  if (!isFifo) return trimmed;
  return trimmed.endsWith(".fifo") ? trimmed : `${trimmed}.fifo`;
}

/** Returns an error code or null when the name is valid for the given FIFO flag. */
export function validateQueueNameInput(raw: string, isFifo: boolean): QueueNameErrorCode | null {
  if (!raw || raw.trim().length === 0) return "required";
  const trimmed = raw.trim();

  if (!isFifo && trimmed.endsWith(".fifo")) {
    return "standardCannotEndFifo";
  }

  const name = finalQueueName(trimmed, isFifo);

  if (name.length > 80) {
    return "nameTooLong";
  }

  if (isFifo) {
    if (!name.endsWith(".fifo")) {
      return "fifoMustEndFifo";
    }
    const prefix = name.slice(0, -".fifo".length);
    if (prefix.length === 0 || !SQS_QUEUE_NAME_PART.test(prefix)) {
      return "fifoInvalidPrefix";
    }
  } else if (!/^[A-Za-z0-9_-]{1,80}$/.test(name)) {
    return "standardInvalidPattern";
  }

  return null;
}
