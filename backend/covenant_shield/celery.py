import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'covenant_shield.settings')

app = Celery('covenant_shield')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
