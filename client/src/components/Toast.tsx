// client/src/components/Toast.tsx
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const bgColor = type === "success" ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50";

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-8 right-8 z-50 glass inner-glow p-6 rounded-3xl border ${bgColor} flex items-center gap-4 animate-slide-in`}>
      <p className="text-xl font-medium">{message}</p>
      <button onClick={onClose} className="p-2 rounded-xl glass-hover">
        <X size={24} />
      </button>
    </div>
  );
}