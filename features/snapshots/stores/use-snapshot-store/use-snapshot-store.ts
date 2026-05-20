import { create } from "zustand";
import type {
  RestoreReport,
  SnapshotDocument,
  SnapshotStatus,
  SnapshotStoreState,
} from "@/features/snapshots/lib/types/snapshot";

const INITIAL_STATE = {
  snapshot: null,
  status: "idle" as SnapshotStatus,
  restoreReport: null,
  errorMessage: null,
};

export const useSnapshotStore = create<SnapshotStoreState>((set) => ({
  ...INITIAL_STATE,

  setSnapshot(doc: SnapshotDocument) {
    set({ snapshot: doc });
  },

  clearSnapshot() {
    set({ snapshot: null });
  },

  setStatus(s: SnapshotStatus) {
    set({ status: s });
  },

  setRestoreReport(r: RestoreReport) {
    set({ restoreReport: r });
  },

  setError(msg: string) {
    set({ errorMessage: msg });
  },

  reset() {
    set(INITIAL_STATE);
  },
}));
