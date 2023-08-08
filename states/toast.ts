import { create } from 'zustand';

interface ToastState {
  toasts: ToastData[];
  pushToast: (toast: ToastData) => void;
  popToast: () => ToastData | null;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  pushToast: (toast: ToastData) => {
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  popToast: () => {
    if (get().toasts.length === 0) return null;
    const toast = get().toasts[0];
    set((state) => ({ toasts: [...state.toasts.slice(1)] }));
    return toast;
  },
}));
