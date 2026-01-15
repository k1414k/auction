// stores/userStore.ts
import { create } from "zustand";

export type User = {
  email: string;
  name: string;
  nickname: string;
  balance: number;
  points: number;
  introduction: string;
  avatarUrl?: string;
};

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
