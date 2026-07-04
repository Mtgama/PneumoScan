import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import MetricsPage from './pages/MetricsPage';
import TrainingPage from './pages/TrainingPage';

// ===================================================
// کامپوننت اصلی اپلیکیشن
// PneumoAI - سامانه هوشمند تشخیص ذات‌الریه
// ===================================================

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col" dir="rtl">
        {/* نوار ناوبری */}
        <Navbar />

        {/* محتوای اصلی */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/training" element={<TrainingPage />} />
          </Routes>
        </main>

        {/* فوتر */}
        <Footer />

        {/* اعلان‌ها */}
        <Toast />
      </div>
    </AppProvider>
  );
}
