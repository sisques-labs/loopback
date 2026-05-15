export type ActionState<T = void> =
  | { status: "idle" }
  | { status: "success"; data: T }
  | { status: "error"; message: string; code?: string };
