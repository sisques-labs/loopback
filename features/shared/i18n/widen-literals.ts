/** Widen `as const` leaf string literals so translated files can use different copy. */
export type WidenStringLiterals<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
      ? WidenStringLiterals<T[K]>
      : T[K];
};
