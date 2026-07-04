import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, X, Download } from 'lucide-react';

// ===================================================
// کارت نمایش تصویر با قابلیت زوم
// ===================================================

interface ImageCardProps {
  src: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export default function ImageCard({
  src,
  title,
  description,
  icon,
  badge,
  badgeColor = 'bg-primary-100 text-primary-700',
}: ImageCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group"
      >
        {/* هدر کارت */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary-500">{icon}</span>}
            <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
          </div>
          {badge && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>

        {/* تصویر */}
        <div className="relative aspect-square bg-gray-900/5 overflow-hidden">
          <img
            src={src}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* دکمه‌های عملیات */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
            <button
              onClick={() => setIsZoomed(true)}
              className="bg-white/90 hover:bg-white text-gray-700 p-2.5 rounded-xl shadow-lg transition-all hover:scale-105"
              title="بزرگنمایی"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <a
              href={src}
              download
              className="bg-white/90 hover:bg-white text-gray-700 p-2.5 rounded-xl shadow-lg transition-all hover:scale-105"
              title="دانلود"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* توضیحات */}
        {description && (
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-5">{description}</p>
          </div>
        )}
      </motion.div>

      {/* مودال بزرگنمایی */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="image-zoom-overlay"
            onClick={() => setIsZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              src={src}
              alt={title}
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
