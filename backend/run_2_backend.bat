cd c:\Ansar\backend
start wsl.exe ./start_celery_worker.sh
start wsl.exe ./start_celery_beat.sh
start wsl.exe ./start_django.sh
exit