import threading
from django.apps import AppConfig


class DjangoProjectConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'django_project'
    verbose_name = 'تشخیص ذات\u200cالریه'

    def ready(self):
        threading.Thread(target=self._warmup, daemon=True).start()

    def _warmup(self):
        try:
            from .inference import load_model_once, ensure_model_charts
            load_model_once()
            ensure_model_charts()
        except Exception:
            pass
