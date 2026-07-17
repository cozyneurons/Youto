import { create } from 'zustand';

interface UIState {
  isLoading: boolean;
  error: string | null;
  currentPage: string;

  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  setCurrentPage: (page: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  error: null,
  currentPage: '',

  setLoading: (v) => set({ isLoading: v }),
  setError: (msg) => set({ error: msg }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
