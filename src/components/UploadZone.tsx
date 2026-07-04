import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  FileImage,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { uploadAndPredict, predictFromUrl } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

// ===================================================
// ناحیه آپلود تصویر
// ===================================================

const SUPPORTED_FORMATS = ['PNG', 'JPG', 'JPEG', 'DICOM', 'BMP'];

export default function UploadZone() {
  const [mode, setMode] = useState<'file' | 'url'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUploadStatus, uploadStatus, setPrediction, addNotification } = useApp();
  const navigate = useNavigate();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
      setError('فرمت فایل پشتیبانی نمی‌شود. لطفاً تصویر PNG، JPG یا BMP آپلود کنید.');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('حجم فایل بیش از ۱۰ مگابایت است.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageUrl('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    try {
      setUploadStatus('uploading');
      addNotification({ type: 'info', message: 'در حال ارسال تصویر...' });

      setTimeout(() => setUploadStatus('processing'), 500);

      let result;
      if (mode === 'file' && selectedFile) {
        result = await uploadAndPredict(selectedFile);
      } else if (mode === 'url' && imageUrl.trim()) {
        result = await predictFromUrl(imageUrl.trim());
      } else {
        throw new Error('لطفاً یک تصویر انتخاب کنید یا URL وارد نمایید.');
      }

      setPrediction(result);
      setUploadStatus('success');
      addNotification({ type: 'success', message: 'تحلیل تصویر با موفقیت انجام شد!' });
      navigate('/results');
    } catch (err: any) {
      setUploadStatus('error');
      const msg = err?.message || 'خطا در پردازش تصویر. لطفاً دوباره تلاش کنید.';
      setError(msg);
      addNotification({ type: 'error', message: msg });
    }
  };

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'processing';
  const canSubmit = mode === 'file' ? !!selectedFile : !!imageUrl.trim();

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* انتخاب روش آپلود */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => { setMode('file'); clearSelection(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'file'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileImage className="w-4 h-4" />
          آپلود فایل
        </button>
        <button
          onClick={() => { setMode('url'); clearSelection(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'url'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          آدرس تصویر
        </button>
      </div>

      {/* نمایش انیمیشن پردازش */}
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
          >
            <LoadingSpinner
              message={uploadStatus === 'uploading' ? 'در حال ارسال تصویر...' : 'در حال تحلیل هوشمند...'}
              subMessage="مدل یادگیری عمیق در حال بررسی تصویر است"
            />
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {mode === 'file' ? (
              <>
                {/* ناحیه کشیدن و رها کردن */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging
                      ? 'border-primary-400 bg-primary-50 scale-[1.02]'
                      : selectedFile
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-gray-300 hover:border-primary-300 hover:bg-primary-50/30 bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                  />

                  <AnimatePresence mode="wait">
                    {previewUrl ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="relative inline-block">
                          <img
                            src={previewUrl}
                            alt="پیش‌نمایش"
                            className="max-h-48 rounded-xl shadow-md mx-auto"
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                            className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{selectedFile?.name}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {selectedFile && `حجم: ${(selectedFile.size / 1024 / 1024).toFixed(2)} مگابایت`}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-primary-500" />
                        </div>
                        <div>
                          <p className="text-gray-700 font-bold">
                            تصویر رادیوگرافی را اینجا بکشید و رها کنید
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            یا برای انتخاب فایل کلیک کنید
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* ورود آدرس تصویر */
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-gray-600 mb-2">
                  <LinkIcon className="w-5 h-5 text-primary-500" />
                  <span className="font-medium text-sm">آدرس اینترنتی تصویر</span>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/xray.jpg"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-left dir-ltr focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  dir="ltr"
                />
                {imageUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex justify-center"
                  >
                    <img
                      src={imageUrl}
                      alt="پیش‌نمایش"
                      className="max-h-48 rounded-xl shadow-md"
                      onError={() => setError('تصویر قابل بارگذاری نیست. لطفاً آدرس را بررسی کنید.')}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {/* فرمت‌های پشتیبانی شده */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">فرمت‌های پشتیبانی شده:</span>
              {SUPPORTED_FORMATS.map((fmt) => (
                <span
                  key={fmt}
                  className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md"
                >
                  {fmt}
                </span>
              ))}
            </div>

            {/* پیام خطا */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* دکمه ارسال */}
            <motion.button
              whileHover={{ scale: canSubmit ? 1.02 : 1 }}
              whileTap={{ scale: canSubmit ? 0.98 : 1 }}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full mt-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                canSubmit
                  ? 'bg-gradient-to-l from-primary-500 to-teal-500 hover:shadow-xl hover:shadow-primary-500/25 cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed shadow-none'
              }`}
            >
              <Upload className="w-5 h-5" />
              شروع تحلیل هوشمند
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
