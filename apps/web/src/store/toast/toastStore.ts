import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    /** Milliseconds before auto-dismiss. `0` disables auto-dismiss. */
    duration: number;
}

export interface ToastInput {
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
}

interface ToastActions {
    /** Add a toast and return its generated id. */
    addToast: (toast: ToastInput) => string;
    /** Remove a toast by id. */
    removeToast: (id: string) => void;
    /** Remove all toasts. */
    clearToasts: () => void;
}

const DEFAULT_DURATION_MS = 4000;

let counter = 0;
const nextId = (): string => {
    counter += 1;
    return `toast-${counter}`;
};

export const useToastStore = create<ToastState & ToastActions>((set) => ({
    toasts: [],

    addToast: ({ type, message, duration }) => {
        const id = nextId();
        const toast: Toast = {
            id,
            type,
            message,
            duration: duration ?? DEFAULT_DURATION_MS,
        };
        set((state) => ({ toasts: [...state.toasts, toast] }));
        return id;
    },

    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        })),

    clearToasts: () => set({ toasts: [] }),
}));
