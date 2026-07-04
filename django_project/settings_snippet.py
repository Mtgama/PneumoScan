# ===================================================
# settings.py - تنظیمات مربوط به سامانه تشخیص ذات‌الریه
# ===================================================
# 
# این تنظیمات را به فایل settings.py پروژه جنگو اضافه کنید.
# ===================================================

import os

# ===================================================
# تنظیمات اپلیکیشن‌ها
# ===================================================
INSTALLED_APPS = [
    # ... اپلیکیشن‌های پیش‌فرض جنگو ...
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # اپلیکیشن‌های شخص ثالث
    'corsheaders',           # برای اجازه دسترسی فرانت‌اند
    'rest_framework',         # (اختیاری) Django REST Framework
    
    # اپلیکیشن تشخیص
    'diagnosis',
]

# ===================================================
# Middleware
# ===================================================
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # باید اول باشد
    # ... بقیه middleware‌ها ...
]

# ===================================================
# CORS - اجازه دسترسی فرانت‌اند
# ===================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# یا برای حالت توسعه:
# CORS_ALLOW_ALL_ORIGINS = True

# ===================================================
# تنظیمات فایل‌های استاتیک و مدیا
# ===================================================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ===================================================
# حداکثر حجم آپلود (10MB)
# ===================================================
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# ===================================================
# تنظیمات زبان فارسی
# ===================================================
LANGUAGE_CODE = 'fa-ir'
TIME_ZONE = 'Asia/Tehran'
USE_I18N = True
USE_TZ = True

# ===================================================
# تنظیمات مدل هوش مصنوعی
# ===================================================
ML_MODEL_PATH = os.path.join(BASE_DIR, 'ml_model', 'model.h5')
ML_MODEL_CONFIG = os.path.join(BASE_DIR, 'ml_model', 'config.json')
