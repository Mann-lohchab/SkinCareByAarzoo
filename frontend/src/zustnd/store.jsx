import {create} from 'zustand';

export const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isAdmin: () => {
    return (state) => state.user?.role === 'admin';
  }
}));