import type { StateStorage } from "zustand/middleware";

/** Fallback when `localStorage` is unavailable (SSR, tests without --localstorage-file). */
export const NOOP_STORAGE: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export function getPersistStorage(): StateStorage {
  return typeof localStorage !== "undefined" && localStorage !== null
    ? localStorage
    : NOOP_STORAGE;
}
