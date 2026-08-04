import { create } from "zustand";

interface LoginPromptState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Global "로그인이 필요해요" dialog, opened from anywhere in the app (e.g. a
 * like/comment button) via `useRequireAuth`, rendered once in `MainLayout`.
 */
export const useLoginPromptStore = create<LoginPromptState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
