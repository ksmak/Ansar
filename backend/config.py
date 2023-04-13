import os
from dotenv import load_dotenv


load_dotenv()


SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG')
REDIS_HOST = os.environ.get('REDIS_HOST')\
    or "127.0.0.1"
REDIS_PORT = os.environ.get('REDIS_PORT')\
    or 6379
