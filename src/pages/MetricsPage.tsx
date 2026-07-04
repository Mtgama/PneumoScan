import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Target,
  Crosshair,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ArrowRight,
  BarChart3,
  Grid3X3,
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ImageCard from '../components/ImageCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getModelMetrics } from '../services/api';
import type { ModelMetrics } from '../types';

// ===================================================
// صفحه معیارهای ارزیابی مدل
// ===================================================

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getModelMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner
          message="در حال دریافت معیارها..."
          subMessage="لطفاً صبر کنید"
          size="md"
        />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-gray-500">خطا در دریافت اطلاعات</p>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'دقت کلی (Accuracy)',
      value: metrics.accuracy,
      icon: <Target className="w-6 h-6" />,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      description: 'درصد پیش‌بینی‌های صحیح از کل پیش‌بینی‌ها',
    },
    {
      title: 'صحت (Precision)',
      value: metrics.precision,
      icon: <Crosshair className="w-6 h-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      description: 'درصد تشخیص‌های مثبت صحیح از کل تشخیص‌های مثبت',
    },
    {
      title: 'حساسیت (Recall)',
      value: metrics.recall,
      icon: <RotateCcw className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'درصد نمونه‌های مثبت واقعی که به درستی شناسایی شده‌اند',
    },
    {
      title: 'معیار F1 (F1-Score)',
      value: metrics.f1Score,
      icon: <Sparkles className="w-6 h-6" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      description: 'میانگین هارمونیک صحت و حساسیت',
    },
    {
      title: 'ROC-AUC',
      value: metrics.rocAuc,
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'سطح زیر منحنی مشخصه عملکرد دریافت‌کننده',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* هدر صفحه */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-primary-500 transition-colors">خانه</Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-primary-600 font-medium">عملکرد مدل</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl shadow-lg shadow-primary-500/20">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-800">
                معیارهای <span className="gradient-text">ارزیابی مدل</span>
              </h1>
              <p className="text-gray-500 mt-1">بررسی عملکرد مدل یادگیری عمیق در تشخیص ذات‌الریه</p>
            </div>
          </div>
        </motion.div>

        {/* کارت‌های معیارها */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-12">
          {metricCards.map((metric, i) => (
            <MetricCard
              key={i}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              color={metric.color}
              bgColor={metric.bgColor}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* توضیحات معیارها */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 mb-12"
        >
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            توضیح معیارها
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metricCards.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100"
              >
                <div className={`p-2 rounded-lg ${metric.bgColor} flex-shrink-0`}>
                  <span className={metric.color}>{metric.icon}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 text-sm">{metric.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-5">{metric.description}</p>
                  <p className={`text-lg font-black mt-1 ${metric.color}`}>
                    {metric.value.toFixed(1)}٪
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ماتریس درهم‌ریختگی */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary-500" />
            ماتریس درهم‌ریختگی (Confusion Matrix)
          </h3>
          <div className="max-w-lg mx-auto">
            <ImageCard
              src={metrics.confusionMatrixImage}
              title="ماتریس درهم‌ریختگی"
              description="نمایش تعداد پیش‌بینی‌های صحیح و اشتباه مدل برای هر کلاس (سالم و ذات‌الریه)"
              icon={<Grid3X3 className="w-4 h-4" />}
              badge="ارزیابی مدل"
              badgeColor="bg-primary-100 text-primary-700"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
