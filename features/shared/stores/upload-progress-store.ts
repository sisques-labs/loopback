import { create } from "zustand";

export type UploadStatus = "uploading" | "finalizing" | "done" | "error";

export type UploadItem = {
  id: string;
  bucket: string;
  filename: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  startedAt: number;
};

type UploadProgressState = {
  items: UploadItem[];
  isMinimized: boolean;
  addItem: (input: { bucket: string; filename: string }) => string;
  updateProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadStatus, error?: string) => void;
  dismiss: (id: string) => void;
  clearCompleted: () => void;
  setMinimized: (minimized: boolean) => void;
};

export const useUploadProgressStore = create<UploadProgressState>((set, get) => ({
  items: [],
  isMinimized: false,
  addItem: ({ bucket, filename }) => {
    const id = crypto.randomUUID();
    set((s) => ({
      items: [
        ...s.items,
        { id, bucket, filename, progress: 0, status: "uploading", startedAt: Date.now() },
      ],
    }));
    return id;
  },
  updateProgress: (id, progress) =>
    set((s) => ({
      items: s.items.map((it) => (it.id === id ? { ...it, progress } : it)),
    })),
  setStatus: (id, status, error) => {
    set((s) => ({
      items: s.items.map((it) =>
        it.id === id
          ? { ...it, status, error, progress: status === "done" ? 100 : it.progress }
          : it,
      ),
    }));
    // Auto-dismiss on "done" after 3s. Errors persist until user dismisses.
    if (status === "done") {
      setTimeout(() => {
        const still = get().items.find((it) => it.id === id);
        if (still && still.status === "done") get().dismiss(id);
      }, 3000);
    }
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
  clearCompleted: () =>
    set((s) => ({
      items: s.items.filter(
        (it) => it.status === "uploading" || it.status === "finalizing" || it.status === "error",
      ),
    })),
  setMinimized: (isMinimized) => set({ isMinimized }),
}));
