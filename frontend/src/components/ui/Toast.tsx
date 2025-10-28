import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../utils/cn";
import { motion } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: "text-green-600",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: "text-red-600",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: "text-yellow-600",
  },
  info: {
    container: "bg-primary-50 border-primary-100 text-primary-700",
    icon: "text-primary-600",
  },
};

export default function Toast({
  id,
  type,
  title,
  message,
  duration = 4000,
  onClose,
}: ToastProps) {
  const Icon = iconMap[type];
  const styles = styleMap[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 200, scale: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 200, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-xl border shadow-lg",
        "overflow-hidden backdrop-blur-sm transition-all",
        styles.container
      )}
    >
      <div className="p-4 flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0", styles.icon)} />
        <div className="flex-1">
          {title && <p className="text-sm font-semibold">{title}</p>}
          <p className={cn("text-sm leading-snug", title && "mt-0.5")}>
            {message}
          </p>
        </div>
        <button
          type="button"
          className={cn(
            "rounded-md p-1.5 hover:bg-black/10 transition-colors focus:outline-none hover:cursor-pointer",
            styles.icon
          )}
          onClick={() => onClose(id)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
