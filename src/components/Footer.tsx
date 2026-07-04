import { Heart, Stethoscope, Mail, Globe, Code2 } from 'lucide-react';

// ===================================================
// فوتر سایت
// ===================================================

export default function Footer() {
  return (
    <footer className="bg-medical-dark text-gray-300 mt-auto">
      {/* بخش اصلی */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ستون اول - درباره */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">PneumoAI</h3>
                <p className="text-xs text-gray-400">سامانه هوشمند تشخیص ذات‌الریه</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-7">
              این سامانه با استفاده از هوش مصنوعی و یادگیری عمیق،
              تصاویر رادیوگرافی قفسه سینه را تحلیل کرده و احتمال
              ابتلا به ذات‌الریه را تشخیص می‌دهد.
            </p>
          </div>

          {/* ستون دوم - لینک‌ها */}
          <div>
            <h4 className="text-white font-semibold mb-4">دسترسی سریع</h4>
            <ul className="space-y-2">
              <li>
                <a href="#/" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  صفحه اصلی
                </a>
              </li>
              <li>
                <a href="#/results" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  نتایج تشخیص
                </a>
              </li>
              <li>
                <a href="#/metrics" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  عملکرد مدل
                </a>
              </li>
              <li>
                <a href="#/training" className="text-sm text-gray-400 hover:text-teal-400 transition-colors">
                  گزارش آموزش
                </a>
              </li>
            </ul>
          </div>

          {/* ستون سوم - تماس */}
          <div>
            <h4 className="text-white font-semibold mb-4">ارتباط با ما</h4>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                <Mail className="w-4 h-4" />
                <span>info@pneumoai.ir</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                <Globe className="w-4 h-4" />
                <span>www.pneumoai.ir</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-gray-400 hover:text-teal-400 transition-colors">
                <Code2 className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* خط پایین */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} PneumoAI - تمامی حقوق محفوظ است.
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              ساخته شده با <Heart className="w-3 h-3 text-red-400" /> برای سلامت جامعه
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
