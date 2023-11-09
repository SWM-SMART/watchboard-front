import { ReactNode } from 'react';
import { create } from 'zustand';

interface OverlayState {
  overlay: ReactNode | null;
  setOverlay: (overlay: ReactNode | null) => void;
}

export const useOverlay = create<OverlayState>()((set) => ({
  overlay: null,
  setOverlay: (overlay) => set({ overlay: overlay }),
}));
