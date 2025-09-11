import { createContext, useState, ReactNode } from "react";
import { ToastProps } from "../components/ui/Toast";
import ToastContainer from "../components/ui/ToastContainer";

interface ToastContextType {
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export { ToastContext };

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string, title?: string) => {
    addToast({ type: "success", message, title });
  };

  const error = (message: string, title?: string) => {
    addToast({ type: "error", message, title });
  };

  const warning = (message: string, title?: string) => {
    addToast({ type: "warning", message, title });
  };

  const info = (message: string, title?: string) => {
    addToast({ type: "info", message, title });
  };

  const value: ToastContextType = {
    addToast,
    success,
    error,
    warning,
    info,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}
