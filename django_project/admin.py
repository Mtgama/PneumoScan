# ===================================================
# admin.py - پنل مدیریت سامانه تشخیص ذات‌الریه
# ===================================================

from django.contrib import admin
from .models import PredictionRecord, ModelMetrics


@admin.register(PredictionRecord)
class PredictionRecordAdmin(admin.ModelAdmin):
    """مدیریت رکوردهای تشخیص"""
    list_display = [
        'id', 'label', 'confidence', 'processing_time',
        'ip_address', 'created_at'
    ]
    list_filter = ['label', 'created_at']
    search_fields = ['ip_address']
    readonly_fields = ['created_at']
    ordering = ['-created_at']

    fieldsets = (
        ('نتایج تشخیص', {
            'fields': ('label', 'confidence', 'processing_time')
        }),
        ('تصاویر', {
            'fields': ('original_image', 'heatmap_image', 'bbox_image')
        }),
        ('اطلاعات تکمیلی', {
            'fields': ('ip_address', 'created_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ModelMetrics)
class ModelMetricsAdmin(admin.ModelAdmin):
    """مدیریت معیارهای ارزیابی"""
    list_display = [
        'accuracy', 'precision', 'recall', 'f1_score',
        'roc_auc', 'updated_at'
    ]
    readonly_fields = ['updated_at']
