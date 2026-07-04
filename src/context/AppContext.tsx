import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PredictionResult, Notification, UploadStatus } from '../types';

// ===================================================
// کانتکست اصلی اپلیکیشن
// ===================================================

interface AppContextType {
  /** نتیجه پیش‌بینی */
  prediction: PredictionResult | null;
  setPrediction: (result: PredictionResult | null) => void;
  /** وضعیت آپلود */
  uploadStatus: UploadStatus;
  setUploadStatus: (status: UploadStatus) => void;
  /** اعلان‌ها */
  notifications: Notification[];
  addNotification: (notif: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  /** صفحه فعال */
  activePage: string;
  setActivePage: (page: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activePage, setActivePage] = useState('home');

  const addNotification = useCallback((notif: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    const newNotif: Notification = { ...notif, id };
    setNotifications(prev => [...prev, newNotif]);

    // حذف خودکار پس از مدت مشخص
    const duration = notif.duration || 5000;
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        prediction,
        setPrediction,
        uploadStatus,
        setUploadStatus,
        notifications,
        addNotification,
        removeNotification,
        activePage,
        setActivePage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
