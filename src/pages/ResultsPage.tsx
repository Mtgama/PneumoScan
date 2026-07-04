import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Image as ImageIcon,
  Flame,
  Target,
  Percent,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Upload,
  Grid3X3,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImageCard from '../components/ImageCard';

// ===================================================
// صفحه نتایج تشخیص
// ===================================================

export default function ResultsPage() {
  const { prediction } = useApp();
  const navigate = useNavigate();

  // اگر نتیجه‌ای وجود ندارد، به صفحه اصلی هدایت شود
  useEffect(() => {
    if (!prediction) {
      // نمایش حالت دمو با داده‌های نمونه
    }
  }, [prediction, navigate]);

  // داده‌های نمایشی - اگر prediction وجود نداشته باشد از دمو استفاده می‌شود
  const data = prediction || {
    originalImage: '/images/sample-xray.jpg',
    heatmapImage: '/images/sample-heatmap.jpg',
    bboxImage: '/images/sample-bbox.jpg',
    confidence: 94.7,
    label: 'PNEUMONIA' as const,
    labelFa: 'ذات‌الریه',
    confusionMatrixImage: '/images/sample-confusion-matrix.jpg',
    processingTime: 2340,
  };

  const isPneumonia = data.label === 'PNEUMONIA';

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* هدر صفحه */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-primary-500 transition-colors">خانه</Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-primary-600 font-medium">نتایج تشخیص</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-800">
            نتایج <span className="gradient-text">تشخیص هوشمند</span>
          </h1>
          <p className="text-gray-500 mt-2">نتایج تحلیل تصویر رادیوگرافی توسط مدل یادگیری عمیق</p>
        </motion.div>

        {/* کارت نتیجه اصلی */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-6 sm:p-8 mb-8 shadow-xl border ${
            isPneumonia
              ? 'bg-gradient-to-l from-red-50 to-orange-50 border-red-200'
              : 'bg-gradient-to-l from-emerald-50 to-teal-50 border-emerald-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* آیکون وضعیت */}
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                isPneumonia
                  ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-red-500/30'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30'
              }`}
            >
              {isPneumonia ? (
                <AlertTriangle className="w-10 h-10 text-white" />
              ) : (
                <CheckCircle className="w-10 h-10 text-white" />
              )}
            </div>

            {/* اطلاعات تشخیص */}
            <div className="flex-1 text-center sm:text-right">
              <h2 className={`text-2xl sm:text-3xl font-black ${
                isPneumonia ? 'text-red-700' : 'text-emerald-700'
              }`}>
                {isPneumonia ? 'تشخیص ذات‌الریه' : 'سالم - بدون ذات‌الریه'}
              </h2>
              <p className={`text-sm mt-1 ${isPneumonia ? 'text-red-500' : 'text-emerald-500'}`}>
                {isPneumonia
                  ? 'مدل هوش مصنوعی نشانه‌های ذات‌الریه را در تصویر شناسایی کرده است.'
                  : 'مدل هوش مصنوعی نشانه‌ای از ذات‌الریه در تصویر شناسایی نکرده است.'}
              </p>
            </div>

            {/* درصد اطمینان */}
            <div className="text-center">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={isPneumonia ? '#fee2e2' : '#d1fae5'}
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={isPneumonia ? '#ef4444' : '#10b981'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${data.confidence * 2.51} 251`}
                    initial={{ strokeDasharray: '0 251' }}
                    animate={{ strokeDasharray: `${data.confidence * 2.51} 251` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black ${isPneumonia ? 'text-red-600' : 'text-emerald-600'}`}>
                    {data.confidence.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">درصد</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">اطمینان مدل</p>
            </div>
          </div>

          {/* اطلاعات تکمیلی */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-200/50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Percent className="w-4 h-4 text-primary-500" />
              <span>اطمینان: <b>{data.confidence.toFixed(1)}٪</b></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-teal-500" />
              <span>زمان: <b>{(data.processingTime / 1000).toFixed(1)} ثانیه</b></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Target className="w-4 h-4 text-amber-500" />
              <span>برچسب: <b>{data.labelFa}</b></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4 text-violet-500" />
              <span>وضعیت: <b className="text-emerald-600">تکمیل شده</b></span>
            </div>
          </div>
        </motion.div>

        {/* تصاویر نتایج */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ImageCard
            src={data.originalImage}
            title="تصویر اصلی"
            description="تصویر رادیوگرافی آپلود شده توسط کاربر"
            icon={<ImageIcon className="w-4 h-4" />}
            badge="ورودی"
            badgeColor="bg-gray-100 text-gray-600"
          />
          <ImageCard
            src={data.heatmapImage}
            title="نقشه حرارتی (Grad-CAM)"
            description="نواحی مورد توجه مدل با رنگ‌های گرم نمایش داده شده‌اند"
            icon={<Flame className="w-4 h-4" />}
            badge="تحلیل"
            badgeColor="bg-orange-100 text-orange-700"
          />
          <ImageCard
            src={data.bboxImage}
            title="ناحیه تشخیص"
            description="کادر سبز ناحیه مشکوک به ذات‌الریه را نشان می‌دهد"
            icon={<Target className="w-4 h-4" />}
            badge="تشخیص"
            badgeColor="bg-emerald-100 text-emerald-700"
          />
        </div>

        {/* ماتریس درهم‌ریختگی */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="max-w-lg mx-auto">
            <ImageCard
              src={data.confusionMatrixImage}
              title="ماتریس درهم‌ریختگی"
              description="نمایش عملکرد مدل در تشخیص صحیح و اشتباه کلاس‌های مختلف"
              icon={<Grid3X3 className="w-4 h-4" />}
              badge="ارزیابی"
              badgeColor="bg-violet-100 text-violet-700"
            />
          </div>
        </motion.div>

        {/* هشدار پزشکی */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-800 mb-1">توجه مهم</h4>
              <p className="text-sm text-amber-700 leading-6">
                این سامانه صرفاً یک ابزار کمکی تشخیصی است و جایگزین نظر پزشک متخصص نمی‌باشد.
                نتایج حاصل از این سامانه باید توسط پزشک رادیولوژیست یا متخصص ریه بررسی و تأیید شوند.
                تصمیم‌گیری نهایی درمانی باید بر اساس ارزیابی بالینی کامل انجام گیرد.
              </p>
            </div>
          </div>
        </motion.div>

        {/* دکمه بازگشت */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-l from-primary-500 to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <Upload className="w-5 h-5" />
            تحلیل تصویر جدید
          </Link>
        </div>
      </div>
    </div>
  );
}
