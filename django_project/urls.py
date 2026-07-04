from django.urls import path
from . import views

app_name = 'diagnosis'

urlpatterns = [
    # Pages
    path('', views.home_view, name='home'),
    path('results/', views.results_view, name='results'),
    path('metrics/', views.metrics_view, name='metrics'),
    path('training/', views.training_view, name='training'),
    path('dashboard/', views.dashboard_view, name='dashboard'),

    # API
    path('api/predict/', views.api_predict, name='api_predict'),
    path('api/predict-url/', views.api_predict_url, name='api_predict_url'),
    path('api/metrics/', views.api_metrics, name='api_metrics'),
    path('api/training-data/', views.api_training_data, name='api_training_data'),
    path('api/dashboard-stats/', views.api_dashboard_stats, name='api_dashboard_stats'),
    path('api/history/', views.api_history, name='api_history'),
    path('api/daily-stats/', views.api_daily_stats, name='api_daily_stats'),
]
