import { create } from 'zustand';

type SearchState = {
  keyword: string;     // リアルタイムの入力文字
  setKeyword: (k: string) => void;
  isTyping: boolean;
  setIsTyping: (bool: boolean) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  keyword: '',
  setKeyword: (k) => set({ keyword: k }),
  isTyping: false,
  setIsTyping: (bool) => set({ isTyping: bool })
}));