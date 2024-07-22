source .venv/bin/activate
celery -A settings beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler