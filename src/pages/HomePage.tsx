import { motion } from 'framer-motion';
import {
  Brain,
  Shield,
  Zap,
  Heart,
  ChevronDown,
  Microscope,
  Activity,
  Users,
  Award,
} from 'lucide-react';
import UploadZone from '../components/UploadZone';

// ===================================================
// صفحه اصلی - صفحه فرود
// ===================================================

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'یادگیری عمیق',
    description: 'استفاده از شبکه‌های عصبی کانولوشنال پیشرفته برای تحلیل دقیق تصاویر رادیوگرافی',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'سرعت بالا',
    description: 'تشخیص در کمتر از ۳ ثانیه با پردازش موازی و بهینه‌سازی مدل',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'دقت بالای ۹۵٪',
    description: 'آموزش با بیش از ۵۰۰۰ تصویر رادیوگرافی تأیید شده توسط متخصصان',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'کمک به پزشکان',
    description: 'ابزار کمکی برای پزشکان جهت تشخیص سریع‌تر و دقیق‌تر ذات‌الریه',
    color: 'text-rose-500',
    bg: 'bg-rose-50',
  },
];

const stats = [
  { value: '۹۵٪+', label: 'دقت مدل', icon: <Award className="w-5 h-5" /> },
  { value: '۵۰۰۰+', label: 'تصویر آموزشی', icon: <Microscope className="w-5 h-5" /> },
  { value: '<۳ ثانیه', label: 'زمان تشخیص', icon: <Activity className="w-5 h-5" /> },
  { value: '۲۴/۷', label: 'دسترسی آنلاین', icon: <Users className="w-5 h-5" /> },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ===== بخش هیرو ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* پس‌زمینه */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-medical-dark via-primary-900 to-teal-900" />
          <img
            src="/images/hero-medical-bg.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          {/* دایره‌های تزئینی */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* نشان */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/90">سامانه آماده بهره‌برداری</span>
          </motion.div>

          {/* عنوان اصلی */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 leading-tight"
          >
            تشخیص هوشمند
            <br />
            <span className="bg-gradient-to-l from-teal-300 to-primary-300 bg-clip-text text-transparent">
              ذات‌الریه
            </span>
          </motion.h1>

          {/* توضیحات */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-8"
          >
            با استفاده از هوش مصنوعی و یادگیری عمیق، تصاویر رادیوگرافی قفسه سینه
            را در کمترین زمان تحلیل کنید و نتایج دقیق تشخیصی دریافت نمایید.
          </motion.p>

          {/* آمار */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="glass-dark rounded-xl p-4 text-center"
              >
                <div className="flex items-center justify-center text-teal-400 mb-2">
                  {stat.icon}
                </div>
                <div className="text-xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* دکمه اسکرول */}
          <motion.a
            href="#upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <span className="text-sm">شروع تشخیص</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.a>
        </div>
      </section>

      {/* ===== بخش آپلود ===== */}
      <section id="upload" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* عنوان بخش */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-4">
              آپلود تصویر <span className="gradient-text">رادیوگرافی</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              تصویر رادیوگرافی قفسه سینه را آپلود کنید تا سامانه هوشمند
              ما آن را تحلیل و نتیجه تشخیص را ارائه دهد.
            </p>
          </motion.div>

          {/* ناحیه آپلود */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <UploadZone />
          </motion.div>
        </div>
      </section>

      {/* ===== بخش ویژگی‌ها ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-4">
              چرا <span className="gradient-text">PneumoAI</span>؟
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              سامانه ما با بهره‌گیری از آخرین فناوری‌های هوش مصنوعی، ابزاری قدرتمند
              برای کمک به تشخیص پزشکی ارائه می‌دهد.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <span className={feature.color}>{feature.icon}</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-6">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== بخش نحوه کار ===== */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-4">
              نحوه <span className="gradient-text">کار سامانه</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '۱',
                title: 'آپلود تصویر',
                desc: 'تصویر رادیوگرافی قفسه سینه را آپلود کنید یا URL آن را وارد نمایید.',
                icon: '📤',
              },
              {
                step: '۲',
                title: 'تحلیل هوشمند',
                desc: 'مدل یادگیری عمیق تصویر را پردازش و نواحی مشکوک را شناسایی می‌کند.',
                icon: '🧠',
              },
              {
                step: '۳',
                title: 'نتایج تشخیص',
                desc: 'نتایج شامل نقشه حرارتی، ناحیه تشخیص و درصد اطمینان نمایش داده می‌شود.',
                icon: '📊',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative bg-white rounded-2xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 text-center"
              >
                {/* شماره مرحله */}
                <div className="absolute -top-4 right-1/2 translate-x-1/2 w-8 h-8 bg-gradient-to-br from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-6">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== بنر CTA ===== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-l from-primary-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-primary-500/20"
          >
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
              آماده تشخیص هوشمند هستید؟
            </h3>
            <p className="text-primary-100 mb-8 max-w-lg mx-auto">
              همین الان تصویر رادیوگرافی را آپلود کنید و در عرض چند ثانیه نتیجه تشخیص دریافت نمایید.
            </p>
            <a
              href="#upload"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3.5 rounded-xl font-bold hover:bg-primary-50 transition-colors shadow-lg"
            >
              شروع تشخیص
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
