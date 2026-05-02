import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  confirm: (params: {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
  }) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  onConfirm: () => {},
  confirmLabel: 'Hapus',
  cancelLabel: 'Batal',
  variant: 'destructive',
  confirm: ({ title, message, onConfirm, confirmLabel, cancelLabel, variant }) =>
    set({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmLabel: confirmLabel || 'Hapus',
      cancelLabel: cancelLabel || 'Batal',
      variant: variant || 'destructive',
    }),
  close: () => set({ isOpen: false }),
}));
