// ===================================================
// سرویس ارتباط با بکند جنگو
// ===================================================
// 
// این فایل شامل توابع ارتباط با API بکند جنگو است.
// در حالت دمو از داده‌های نمونه استفاده می‌شود.
// برای اتصال به بکند واقعی، آدرس API_BASE_URL را تنظیم کنید.
//
// نمونه اتصال جنگو:
// API_BASE_URL = 'http://localhost:8000/api'
// ===================================================

import type { PredictionResult, ModelMetrics, TrainingData } from '../types';

// آدرس پایه API - برای اتصال به جنگو تغییر دهید
const API_BASE_URL = '/api';

// حالت دمو - برای غیرفعال کردن حالت دمو false قرار دهید
const DEMO_MODE = false;

// ===================================================
// داده‌های نمونه برای حالت دمو
// ===================================================

const DEMO_PREDICTION: PredictionResult = {
  originalImage: '/images/sample-xray.jpg',
  heatmapImage: '/images/sample-heatmap.jpg',
  bboxImage: '/images/sample-bbox.jpg',
  confidence: 94.7,
  label: 'PNEUMONIA',
  labelFa: 'ذات‌الریه',
  confusionMatrixImage: '/images/sample-confusion-matrix.jpg',
  processingTime: 2340,
};

const DEMO_METRICS: ModelMetrics = {
  accuracy: 95.2,
  precision: 94.8,
  recall: 96.1,
  f1Score: 95.4,
  rocAuc: 98.3,
  confusionMatrixImage: '/images/sample-confusion-matrix.jpg',
};

const DEMO_TRAINING_DATA: TrainingData[] = Array.from({ length: 30 }, (_, i) => ({
  epoch: i + 1,
  trainAccuracy: Math.min(50 + i * 2.5 + Math.random() * 3 - 1, 99.5),
  valAccuracy: Math.min(48 + i * 2.2 + Math.random() * 4 - 2, 97.8),
  trainLoss: Math.max(1.8 - i * 0.06 + Math.random() * 0.05, 0.03),
  valLoss: Math.max(1.9 - i * 0.055 + Math.random() * 0.08, 0.06),
}));

// ===================================================
// توابع API
// ===================================================

/**
 * ارسال تصویر برای تشخیص
 * 
 * در جنگو، این تابع به endpoint زیر درخواست POST ارسال می‌کند:
 * POST /api/predict/
 * Content-Type: multipart/form-data
 * Body: { image: File }
 * 
 * پاسخ جنگو باید شامل فیلدهای PredictionResult باشد.
 */
export async function uploadAndPredict(file: File): Promise<PredictionResult> {
  if (DEMO_MODE) {
    // شبیه‌سازی تأخیر پردازش
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ساخت URL تصویر آپلود شده برای نمایش
    const imageUrl = URL.createObjectURL(file);
    
    return {
      ...DEMO_PREDICTION,
      originalImage: imageUrl,
      processingTime: 2340 + Math.floor(Math.random() * 500),
    };
  }

  // ---- اتصال واقعی به جنگو ----
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/predict/`, {
    method: 'POST',
    body: formData,
    // Django CSRF token - اگر از session authentication استفاده می‌کنید
    // headers: {
    //   'X-CSRFToken': getCsrfToken(),
    // },
  });

  if (!response.ok) {
    throw new Error(`خطا در پردازش تصویر: ${response.statusText}`);
  }

  return response.json();
}

/**
 * ارسال URL تصویر برای تشخیص
 * 
 * POST /api/predict-url/
 * Body: { url: string }
 */
export async function predictFromUrl(imageUrl: string): Promise<PredictionResult> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      ...DEMO_PREDICTION,
      originalImage: imageUrl,
      processingTime: 2780 + Math.floor(Math.random() * 500),
    };
  }

  const response = await fetch(`${API_BASE_URL}/predict-url/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!response.ok) {
    throw new Error(`خطا در پردازش تصویر: ${response.statusText}`);
  }

  return response.json();
}

/**
 * دریافت معیارهای ارزیابی مدل
 * 
 * GET /api/metrics/
 */
export async function getModelMetrics(): Promise<ModelMetrics> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DEMO_METRICS;
  }

  const response = await fetch(`${API_BASE_URL}/metrics/`);
  if (!response.ok) {
    throw new Error('خطا در دریافت معیارهای مدل');
  }
  return response.json();
}

/**
 * دریافت داده‌های آموزش مدل
 * 
 * GET /api/training-data/
 */
export async function getTrainingData(): Promise<TrainingData[]> {
  if (DEMO_MODE) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DEMO_TRAINING_DATA;
  }

  const response = await fetch(`${API_BASE_URL}/training-data/`);
  if (!response.ok) {
    throw new Error('خطا در دریافت داده‌های آموزش');
  }
  return response.json();
}
