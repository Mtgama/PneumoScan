# ===================================================
# models.py - مدل‌های دیتابیس سامانه تشخیص ذات‌الریه
# ===================================================

from django.db import models
from django.utils import timezone


class PredictionRecord(models.Model):
    """
    رکورد تشخیص - ذخیره تاریخچه پیش‌بینی‌ها
    """
    LABEL_CHOICES = [
        ('PNEUMONIA', 'ذات‌الریه'),
        ('NORMAL', 'سالم'),
    ]

    # تصاویر
    original_image = models.ImageField(
        upload_to='uploads/%Y/%m/%d/',
        verbose_name='تصویر اصلی'
    )
    heatmap_image = models.ImageField(
        upload_to='results/%Y/%m/%d/',
        verbose_name='نقشه حرارتی',
        blank=True, null=True
    )
    bbox_image = models.ImageField(
        upload_to='results/%Y/%m/%d/',
        verbose_name='تصویر با کادر تشخیص',
        blank=True, null=True
    )

    # نتایج
    label = models.CharField(
        max_length=20,
        choices=LABEL_CHOICES,
        verbose_name='برچسب تشخیص'
    )
    confidence = models.FloatField(
        verbose_name='درصد اطمینان'
    )

    # اطلاعات تکمیلی
    processing_time = models.IntegerField(
        verbose_name='زمان پردازش (میلی‌ثانیه)',
        default=0
    )
    created_at = models.DateTimeField(
        default=timezone.now,
        verbose_name='تاریخ ایجاد'
    )
    ip_address = models.GenericIPAddressField(
        verbose_name='آدرس IP',
        blank=True, null=True
    )

    class Meta:
        verbose_name = 'رکورد تشخیص'
        verbose_name_plural = 'رکوردهای تشخیص'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.get_label_display()} - {self.confidence:.1f}% - {self.created_at:%Y-%m-%d %H:%M}'

    @property
    def label_fa(self):
        return self.get_label_display()


class ModelMetrics(models.Model):
    """
    معیارهای ارزیابی مدل
    """
    accuracy = models.FloatField(verbose_name='دقت کلی')
    precision = models.FloatField(verbose_name='صحت')
    recall = models.FloatField(verbose_name='حساسیت')
    f1_score = models.FloatField(verbose_name='معیار F1')
    roc_auc = models.FloatField(verbose_name='ROC-AUC', blank=True, null=True)
    confusion_matrix_image = models.ImageField(
        upload_to='metrics/',
        verbose_name='تصویر ماتریس درهم‌ریختگی',
        blank=True, null=True
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name='آخرین بروزرسانی')

    class Meta:
        verbose_name = 'معیار ارزیابی'
        verbose_name_plural = 'معیارهای ارزیابی'

    def __str__(self):
        return f'Accuracy: {self.accuracy:.1f}% | F1: {self.f1_score:.1f}%'
