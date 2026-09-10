import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useStore } from '../../stores/useStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-accent" />,
  };

  const backgrounds = {
    success: 'border-success/30 bg-success/10',
    error: 'border-error/30 bg-error/10',
    warning: 'border-warning/30 bg-warning/10',
    info: 'border-accent/30 bg-accent/10',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${backgrounds[toast.type]} min-w-[300px] max-w-[400px]`}
          >
            {icons[toast.type]}
            <span className="flex-1 text-sm text-text-primary">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-dim hover:text-text-muted transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
