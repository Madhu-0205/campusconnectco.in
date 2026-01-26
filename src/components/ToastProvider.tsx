"use client";

import {
    createContext,
    useContext,
    useState,
    useRef,
    ReactNode,
} from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration: number;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timers = useRef<Map<string, NodeJS.Timeout>>(new Map());

    const MAX_TOASTS = 5;

    const addToast = (
        message: string,
        type: ToastType = "info",
        duration = 4000
    ) => {
        // Prevent duplicate spam
        if (toasts.some((t) => t.message === message)) return;

        const id = crypto.randomUUID();

        setToasts((prev) => {
            const next = [...prev, { id, message, type, duration }];
            return next.slice(-MAX_TOASTS);
        });

        const timer = setTimeout(() => {
            removeToast(id);
        }, duration);

        timers.current.set(id, timer);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timer = timers.current.get(id);
        if (timer) clearTimeout(timer);
        timers.current.delete(id);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            <div
                className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
                role="status"
                aria-live="polite"
            >
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onClose={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

/* --------------------------------- */

function ToastItem({
    toast,
    onClose,
}: {
    toast: Toast;
    onClose: () => void;
}) {
    const colors =
        toast.type === "success"
            ? "text-green-500 border-green-500/30"
            : toast.type === "error"
                ? "text-red-500 border-red-500/30"
                : "text-electric border-electric/30";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`pointer-events-auto min-w-[300px] max-w-[380px]
        glass-card bg-slate-900/90 border ${colors}
        p-4 rounded-xl shadow-xl flex items-start gap-3 backdrop-blur-md
        relative overflow-hidden`}
            whileHover={{ scale: 1.02 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, info) => {
                if (info.offset.x > 120) onClose();
            }}
        >
            {/* Progress Bar */}
            <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: toast.duration / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 h-[2px] w-full bg-current origin-left opacity-50"
            />

            <div className="mt-0.5">
                {toast.type === "success" && <CheckCircle size={18} />}
                {toast.type === "error" && <AlertCircle size={18} />}
                {toast.type === "info" && <Info size={18} />}
            </div>

            <div className="flex-1">
                <p className="text-white text-sm font-medium leading-snug">
                    {toast.message}
                </p>
            </div>

            <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close notification"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}
