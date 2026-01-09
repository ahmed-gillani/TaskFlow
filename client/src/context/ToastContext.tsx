// client/src/context/ToastContext.tsx
import React, { createContext, useState,  } from "react";
import type { ReactNode } from "react";
import Toast from "../components/Toast.tsx";

interface ToastType {
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  showToast: (message: string, type: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastType | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </ToastContext.Provider>
  );
};