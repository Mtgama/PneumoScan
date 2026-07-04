import os
import json
import time
import uuid
from datetime import timedelta
from django.conf import settings
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db.models import Count, Avg, Q
from django.utils import timezone

from .inference import predict_pneumonia
from .inference import get_model_metrics
from .inference import get_training_history
from .inference import ensure_model_charts
from .inference import get_model_chart_paths
from .models import PredictionRecord


# ===================================================
# Helper
# ===================================================
def _abs_uri(request, rel_path):
    if not rel_path:
        return None
    return request.build_absolute_uri(rel_path)


# ===================================================
# Template Views
# ===================================================
def home_view(request):
    return render(request, 'diagnosis/home.html')


def results_view(request):
    return render(request, 'diagnosis/results.html', {'result': None})


def metrics_view(request):
    metrics = get_model_metrics()
    return render(request, 'diagnosis/metrics.html', {'metrics': metrics})


def training_view(request):
    history = get_training_history()
    training_data = []
    if history and isinstance(history, dict) and 'accuracy' in history:
        for i in range(len(history['accuracy'])):
            training_data.append({
                'epoch': i + 1,
                'trainAccuracy': round(history['accuracy'][i] * 100, 2),
                'valAccuracy': round(history['val_accuracy'][i] * 100, 2),
                'trainLoss': round(history['loss'][i], 4),
                'valLoss': round(history['val_loss'][i], 4),
            })
    return render(request, 'diagnosis/training.html', {
        'training_data_json': json.dumps(training_data),
    })


def dashboard_view(request):
    return render(request, 'diagnosis/dashboard.html')


# ===================================================
# API: Predict
# ===================================================
@csrf_exempt
@require_http_methods(["POST"])
def api_predict(request):
    try:
        image_file = request.FILES.get('image')
        if not image_file:
            return JsonResponse({'error': 'لطفاً یک تصویر آپلود کنید.'}, status=400)

        allowed_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.dcm']
        ext = os.path.splitext(image_file.name)[1].lower()
        if ext not in allowed_extensions:
            return JsonResponse({'error': 'فرمت فایل پشتیبانی نمی‌شود.'}, status=400)

        if image_file.size > 10 * 1024 * 1024:
            return JsonResponse({'error': 'حجم فایل بیش از ۱۰ مگابایت است.'}, status=400)

        # Read threshold from form data
        threshold = float(request.POST.get('threshold', 0.5))
        threshold = max(0.1, min(0.9, threshold))

        result_id = str(uuid.uuid4())[:8]
        upload_dir = os.path.join('uploads', result_id)
        file_path = default_storage.save(
            os.path.join(upload_dir, image_file.name),
            ContentFile(image_file.read())
        )
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)

        start_time = time.time()
        result = predict_pneumonia(full_path, threshold=threshold)
        processing_time = int((time.time() - start_time) * 1000)

        ensure_model_charts()
        model_charts = get_model_chart_paths()

        # Save to database
        try:
            PredictionRecord.objects.create(
                original_image=result['originalImage'].replace('/media/', ''),
                label=result['label'],
                confidence=result['confidence'],
                processing_time=processing_time,
                ip_address=_get_client_ip(request),
            )
        except Exception as e:
            print(f"[views] Failed to save prediction record: {e}")

        response_data = {
            'originalImage': _abs_uri(request, result['originalImage']),
            'heatmapImage': _abs_uri(request, result['heatmapImage']),
            'bboxImage': _abs_uri(request, result['bboxImage']),
            'confidence': result['confidence'],
            'label': result['label'],
            'labelFa': result['labelFa'],
            'processingTime': processing_time,
            'threshold': threshold,
            'modelCharts': {k: _abs_uri(request, v) for k, v in model_charts.items()},
        }
        return JsonResponse(response_data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': f'خطا در پردازش تصویر: {str(e)}'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_predict_url(request):
    try:
        body = json.loads(request.body)
        image_url = body.get('url')
        threshold = float(body.get('threshold', 0.5))
        threshold = max(0.1, min(0.9, threshold))

        if not image_url:
            return JsonResponse({'error': 'لطفاً آدرس تصویر را وارد کنید.'}, status=400)

        import requests
        response = requests.get(image_url, timeout=10)
        if response.status_code != 200:
            return JsonResponse({'error': 'تصویر قابل دانلود نیست.'}, status=400)

        result_id = str(uuid.uuid4())[:8]
        file_name = f'url_image_{result_id}.jpg'
        upload_dir = os.path.join('uploads', result_id)
        file_path = default_storage.save(
            os.path.join(upload_dir, file_name),
            ContentFile(response.content)
        )
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)

        start_time = time.time()
        result = predict_pneumonia(full_path, threshold=threshold)
        processing_time = int((time.time() - start_time) * 1000)

        ensure_model_charts()
        model_charts = get_model_chart_paths()

        # Save to database
        try:
            PredictionRecord.objects.create(
                original_image=result['originalImage'].replace('/media/', ''),
                label=result['label'],
                confidence=result['confidence'],
                processing_time=processing_time,
                ip_address=_get_client_ip(request),
            )
        except Exception:
            pass

        return JsonResponse({
            'originalImage': _abs_uri(request, result['originalImage']),
            'heatmapImage': _abs_uri(request, result['heatmapImage']),
            'bboxImage': _abs_uri(request, result['bboxImage']),
            'confidence': result['confidence'],
            'label': result['label'],
            'labelFa': result['labelFa'],
            'processingTime': processing_time,
            'threshold': threshold,
            'modelCharts': {k: _abs_uri(request, v) for k, v in model_charts.items()},
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'فرمت داده نامعتبر است.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'خطا: {str(e)}'}, status=500)


# ===================================================
# API: Metrics & Training
# ===================================================
@require_http_methods(["GET"])
def api_metrics(request):
    metrics = get_model_metrics()
    return JsonResponse({
        'accuracy': metrics.get('accuracy'),
        'precision': metrics.get('precision'),
        'recall': metrics.get('recall'),
        'f1Score': metrics.get('f1Score') or metrics.get('f1_score'),
        'rocAuc': metrics.get('rocAuc') or metrics.get('roc_auc'),
    })


@require_http_methods(["GET"])
def api_training_data(request):
    history = get_training_history()
    data = []
    if history and isinstance(history, dict) and 'accuracy' in history:
        for i in range(len(history['accuracy'])):
            data.append({
                'epoch': i + 1,
                'trainAccuracy': history['accuracy'][i] * 100,
                'valAccuracy': history['val_accuracy'][i] * 100,
                'trainLoss': history['loss'][i],
                'valLoss': history['val_loss'][i],
            })
    return JsonResponse(data, safe=False)


# ===================================================
# API: Dashboard / History
# ===================================================
def _get_client_ip(request):
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    return xff.split(',')[0].strip() if xff else request.META.get('REMOTE_ADDR')


@require_http_methods(["GET"])
def api_dashboard_stats(request):
    """Return summary statistics for the dashboard."""
    now = timezone.now()
    last_24h = now - timedelta(hours=24)
    last_7d = now - timedelta(days=7)

    total = PredictionRecord.objects.count()
    pneumonia_count = PredictionRecord.objects.filter(label='PNEUMONIA').count()
    normal_count = PredictionRecord.objects.filter(label='NORMAL').count()
    last_24h_count = PredictionRecord.objects.filter(created_at__gte=last_24h).count()
    last_7d_count = PredictionRecord.objects.filter(created_at__gte=last_7d).count()
    avg_confidence = PredictionRecord.objects.aggregate(avg=Avg('confidence'))['avg'] or 0
    avg_time = PredictionRecord.objects.aggregate(avg=Avg('processing_time'))['avg'] or 0

    return JsonResponse({
        'total': total,
        'pneumonia': pneumonia_count,
        'normal': normal_count,
        'pneumoniaRate': round(pneumonia_count / total * 100, 1) if total > 0 else 0,
        'last24h': last_24h_count,
        'last7d': last_7d_count,
        'avgConfidence': round(avg_confidence, 1),
        'avgProcessingTime': int(avg_time),
    })


@require_http_methods(["GET"])
def api_history(request):
    """Return paginated prediction history."""
    page = int(request.GET.get('page', 1))
    page_size = 20
    offset = (page - 1) * page_size

    records = PredictionRecord.objects.all()[offset:offset + page_size]
    total = PredictionRecord.objects.count()

    data = []
    for r in records:
        data.append({
            'id': r.id,
            'label': r.label,
            'labelFa': r.get_label_display(),
            'confidence': r.confidence,
            'processingTime': r.processing_time,
            'createdAt': r.created_at.isoformat(),
            'originalImage': r.original_image if r.original_image else None,
        })

    return JsonResponse({
        'results': data,
        'total': total,
        'page': page,
        'pageSize': page_size,
        'totalPages': (total + page_size - 1) // page_size,
    })


@require_http_methods(["GET"])
def api_daily_stats(request):
    """Return daily prediction counts for the last 30 days chart."""
    now = timezone.now()
    days = 30
    stats = []
    for i in range(days - 1, -1, -1):
        day = (now - timedelta(days=i)).date()
        day_start = timezone.make_aware(timezone.datetime.combine(day, timezone.datetime.min.time()))
        day_end = day_start + timedelta(days=1)
        count = PredictionRecord.objects.filter(created_at__gte=day_start, created_at__lt=day_end).count()
        pneumonia = PredictionRecord.objects.filter(created_at__gte=day_start, created_at__lt=day_end, label='PNEUMONIA').count()
        stats.append({
            'date': day.isoformat(),
            'total': count,
            'pneumonia': pneumonia,
            'normal': count - pneumonia,
        })
    return JsonResponse(stats, safe=False)
