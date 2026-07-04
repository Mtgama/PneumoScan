import { motion } from 'framer-motion';
import { Brain, Scan, Activity } from 'lucide-react';

// ===================================================
// انیمیشن بارگذاری و پردازش
// ===================================================

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({
  message = 'در حال پردازش...',
  subMessage = 'لطفاً صبر کنید',
  size = 'lg',
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { container: 'w-16 h-16', icon: 'w-6 h-6', ring: 'w-20 h-20' },
    md: { container: 'w-24 h-24', icon: 'w-10 h-10', ring: 'w-28 h-28' },
    lg: { container: 'w-32 h-32', icon: 'w-14 h-14', ring: 'w-36 h-36' },
  };

  const s = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      {/* دایره‌های متحرک */}
      <div className="relative flex items-center justify-center">
        {/* حلقه بیرونی */}
        <motion.div
          className={`absolute ${s.ring} rounded-full border-4 border-primary-200`}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-0 right-1/2 w-3 h-3 bg-primary-500 rounded-full -translate-y-1/2" />
        </motion.div>

        {/* حلقه میانی */}
        <motion.div
          className={`absolute ${s.container} rounded-full border-4 border-teal-200`}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute bottom-0 right-1/2 w-2 h-2 bg-teal-500 rounded-full translate-y-1/2" />
        </motion.div>

        {/* آیکون مرکزی */}
        <motion.div
          className="relative z-10 bg-gradient-to-br from-primary-500 to-teal-500 rounded-2xl p-4 shadow-xl shadow-primary-500/30"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain className={`${s.icon} text-white`} />
        </motion.div>
      </div>

      {/* متن وضعیت */}
      <div className="text-center space-y-2">
        <motion.p
          className="text-lg font-bold text-gray-700"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
        <p className="text-sm text-gray-500">{subMessage}</p>
      </div>

      {/* نوار پیشرفت */}
      <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-l from-primary-500 to-teal-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* مراحل پردازش */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <motion.div
          className="flex items-center gap-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        >
          <Scan className="w-4 h-4 text-primary-500" />
          <span>اسکن تصویر</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
        >
          <Brain className="w-4 h-4 text-teal-500" />
          <span>تحلیل هوشمند</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-1"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
        >
          <Activity className="w-4 h-4 text-primary-500" />
          <span>تولید نتایج</span>
        </motion.div>
      </div>
    </div>
  );
}
