import { create } from "zustand";

export type UserInfo = {
  email: string;
  name: string;
  nickname: string;
  balance: number;
  points: number;
} | null;

type UserState = {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  updateUser: (partial: Partial<UserInfo>) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => set({ user }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),

  clearUser: () => set({ user: null }),
}));
