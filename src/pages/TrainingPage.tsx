import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTrainingData } from '../services/api';
import type { TrainingData } from '../types';

// ===================================================
// صفحه گزارش آموزش مدل
// ===================================================

// تولتیپ فارسی سفارشی
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 text-sm" dir="rtl">
      <p className="font-bold text-gray-700 mb-2">اپاک {label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-bold text-gray-800">{entry.value?.toFixed(3)}</span>
        </div>
      ))}
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  children: React.ReactNode;
  delay?: number;
  info?: string;
}

function ChartCard({ title, subtitle, icon, iconBg, children, delay = 0, info }: ChartCardProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
    >
      {/* هدر */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{title}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {info && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
            {showInfo && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-gray-800 text-white text-xs rounded-xl p-3 shadow-xl z-10 leading-5">
                {info}
              </div>
            )}
          </div>
        )}
      </div>

      {/* نمودار */}
      <div className="p-4 sm:p-6">
        <div className="h-72 sm:h-80">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export default function TrainingPage() {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getTrainingData();
        setTrainingData(data);
      } catch (err) {
        console.error('Error fetching training data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner
          message="در حال دریافت داده‌های آموزش..."
          subMessage="لطفاً صبر کنید"
          size="md"
        />
      </div>
    );
  }

  // آخرین مقادیر
  const lastEpoch = trainingData[trainingData.length - 1];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* هدر */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-primary-500 transition-colors">خانه</Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-primary-600 font-medium">گزارش آموزش</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl shadow-lg shadow-primary-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-800">
                گزارش <span className="gradient-text">آموزش مدل</span>
              </h1>
              <p className="text-gray-500 mt-1">روند آموزش و اعتبارسنجی مدل یادگیری عمیق</p>
            </div>
          </div>
        </motion.div>

        {/* خلاصه آموزش */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: 'تعداد اپاک',
              value: trainingData.length.toString(),
              color: 'text-primary-600',
              bg: 'bg-primary-50',
            },
            {
              label: 'دقت آموزش نهایی',
              value: `${lastEpoch?.trainAccuracy?.toFixed(1)}٪`,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'دقت اعتبارسنجی نهایی',
              value: `${lastEpoch?.valAccuracy?.toFixed(1)}٪`,
              color: 'text-teal-600',
              bg: 'bg-teal-50',
            },
            {
              label: 'هزینه نهایی',
              value: lastEpoch?.valLoss?.toFixed(4),
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={`${stat.bg} rounded-2xl p-5 border border-gray-100 text-center`}
            >
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* نمودارها */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* نمودار دقت آموزش */}
          <ChartCard
            title="دقت آموزش (Training Accuracy)"
            subtitle="روند افزایش دقت مدل در مجموعه آموزش"
            icon={<TrendingUp className="w-5 h-5 text-primary-500" />}
            iconBg="bg-primary-50"
            delay={0.2}
            info="این نمودار نشان‌دهنده درصد پیش‌بینی‌های صحیح مدل روی داده‌های آموزشی در هر اپاک است."
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="epoch"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="trainAccuracy"
                  name="دقت آموزش"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* نمودار دقت اعتبارسنجی */}
          <ChartCard
            title="دقت اعتبارسنجی (Validation Accuracy)"
            subtitle="روند دقت مدل در مجموعه اعتبارسنجی"
            icon={<TrendingUp className="w-5 h-5 text-teal-500" />}
            iconBg="bg-teal-50"
            delay={0.3}
            info="دقت اعتبارسنجی نشان‌دهنده عملکرد مدل روی داده‌هایی است که در آموزش ندیده است."
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="epoch"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="valAccuracy"
                  name="دقت اعتبارسنجی"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#14b8a6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* نمودار هزینه آموزش */}
          <ChartCard
            title="هزینه آموزش (Training Loss)"
            subtitle="روند کاهش خطای مدل در مجموعه آموزش"
            icon={<TrendingDown className="w-5 h-5 text-rose-500" />}
            iconBg="bg-rose-50"
            delay={0.4}
            info="هزینه (Loss) نشان‌دهنده میزان خطای مدل است. هرچه کمتر باشد، مدل بهتر آموزش دیده است."
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="epoch"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="trainLoss"
                  name="هزینه آموزش"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f43f5e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* نمودار هزینه اعتبارسنجی */}
          <ChartCard
            title="هزینه اعتبارسنجی (Validation Loss)"
            subtitle="روند خطای مدل در مجموعه اعتبارسنجی"
            icon={<TrendingDown className="w-5 h-5 text-amber-500" />}
            iconBg="bg-amber-50"
            delay={0.5}
            info="اگر هزینه اعتبارسنجی افزایش یابد در حالی که هزینه آموزش کاهش می‌یابد، نشانه بیش‌برازش (Overfitting) است."
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="epoch"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="valLoss"
                  name="هزینه اعتبارسنجی"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* نمودار مقایسه‌ای */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <ChartCard
            title="مقایسه آموزش و اعتبارسنجی"
            subtitle="نمودار ترکیبی دقت و هزینه در فرآیند آموزش"
            icon={<Layers className="w-5 h-5 text-violet-500" />}
            iconBg="bg-violet-50"
            info="این نمودار دقت آموزش و اعتبارسنجی را به صورت همزمان نمایش می‌دهد تا بتوانید همگرایی مدل را بررسی کنید."
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="epoch"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="trainAccuracy"
                  name="دقت آموزش"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="valAccuracy"
                  name="دقت اعتبارسنجی"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </div>
    </div>
  );
}
