import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

// ===================================================
// کارت نمایش معیار ارزیابی
// ===================================================

interface MetricCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  bgColor: string;
  delay?: number;
  suffix?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  color,
  bgColor,
  delay = 0,
  suffix = '%',
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <span className={color}>{icon}</span>
        </div>
        <div className="text-left">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
            className={`text-3xl font-black ${color}`}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className={`text-sm font-medium ${color} mr-0.5`}>{suffix}</span>
        </div>
      </div>

      <h3 className="font-bold text-gray-700 text-sm mb-2">{title}</h3>

      {/* نوار پیشرفت */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, delay: delay + 0.2, ease: 'easeOut' }}
          className={`h-full rounded-full bg-gradient-to-l ${
            color.includes('primary')
              ? 'from-primary-400 to-primary-600'
              : color.includes('teal')
              ? 'from-teal-400 to-teal-600'
              : color.includes('emerald')
              ? 'from-emerald-400 to-emerald-600'
              : color.includes('violet')
              ? 'from-violet-400 to-violet-600'
              : 'from-amber-400 to-amber-600'
          }`}
        />
      </div>
    </motion.div>
  );
}
