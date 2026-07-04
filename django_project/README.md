# راهنمای اتصال به بکند جنگو (Django)

## ساختار پروژه جنگو

```
pneumoai_project/
├── manage.py
├── pneumoai_project/
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── diagnosis/
│   ├── __init__.py
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── forms.py
│   ├── admin.py
│   ├── inference.py          ← کد استنتاج مدل شما
│   ├── templates/
│   │   └── diagnosis/
│   │       ├── base.html
│   │       ├── home.html
│   │       ├── results.html
│   │       ├── metrics.html
│   │       └── training.html
│   ├── static/
│   │   └── diagnosis/
│   │       ├── css/
│   │       ├── js/
│   │       └── images/
│   └── media/
│       ├── uploads/
│       └── results/
└── ml_model/
    ├── model.h5               ← فایل مدل آموزش‌دیده
    └── config.json
```

## مراحل اتصال

### ۱. نصب جنگو
```bash
pip install django djangorestframework django-cors-headers Pillow tensorflow
```

### ۲. تنظیمات settings.py
فایل `settings.py` موجود در این پوشه را مشاهده کنید.

### ۳. تنظیم URLs
فایل `urls.py` را کپی کنید.

### ۴. تنظیم Views
فایل `views.py` حاوی ویوهای API است. محل فراخوانی تابع استنتاج مشخص شده.

### ۵. اتصال فرانت‌اند
در فایل `src/services/api.ts`، متغیر `DEMO_MODE` را `false` کنید
و `API_BASE_URL` را به آدرس سرور جنگو تغییر دهید.

## نکات مهم
- فایل‌های آپلود شده در `MEDIA_ROOT/uploads/` ذخیره می‌شوند
- نتایج مدل در `MEDIA_ROOT/results/` ذخیره می‌شوند
- CORS باید فعال باشد تا فرانت‌اند بتواند به API دسترسی داشته باشد
