// ===================================================
// تایپ‌های اصلی سامانه تشخیص ذات‌الریه
// ===================================================

/** نتیجه پیش‌بینی مدل */
export interface PredictionResult {
  /** تصویر اصلی آپلود شده */
  originalImage: string;
  /** تصویر نقشه حرارتی (Grad-CAM) */
  heatmapImage: string;
  /** تصویر با کادر محدوده تشخیص */
  bboxImage: string;
  /** درصد اطمینان پیش‌بینی */
  confidence: number;
  /** برچسب پیش‌بینی */
  label: 'PNEUMONIA' | 'NORMAL';
  /** برچسب فارسی */
  labelFa: string;
  /** تصویر ماتریس درهم‌ریختگی */
  confusionMatrixImage: string;
  /** زمان پردازش (میلی‌ثانیه) */
  processingTime: number;
}

/** معیارهای ارزیابی مدل */
export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrixImage: string;
}

/** داده‌های نمودار آموزش */
export interface TrainingData {
  epoch: number;
  trainAccuracy: number;
  valAccuracy: number;
  trainLoss: number;
  valLoss: number;
}

/** وضعیت آپلود */
export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

/** اعلان */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

/** آیتم ناوبری */
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}
