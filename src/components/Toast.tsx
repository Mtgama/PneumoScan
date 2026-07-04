import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

// ===================================================
// کامپوننت اعلان (Toast)
// ===================================================

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-primary-50 border-primary-200 text-primary-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

const iconColorMap = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-primary-500',
  warning: 'text-amber-500',
};

export default function Toast() {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="fixed top-20 left-4 z-[100] space-y-2 max-w-sm w-full" dir="rtl">
      <AnimatePresence>
        {notifications.map((notif) => {
          const Icon = iconMap[notif.type];
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${colorMap[notif.type]}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${iconColorMap[notif.type]}`} />
              <p className="text-sm font-medium flex-1">{notif.message}</p>
              <button
                onClick={() => removeNotification(notif.id)}
                className="p-1 rounded-lg hover:bg-black/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
