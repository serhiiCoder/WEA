import os
import logging
from dotenv import load_dotenv
from logging.handlers import RotatingFileHandler

load_dotenv()

def configure_app(app):
    """Aplikuje konfiguraci na Flask aplikaci."""
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your_secret_key')

def configure_logging(app):
    """Nastaví logování s rotujícími soubory."""
    rotating_handler = RotatingFileHandler('/app/logs/app.log', maxBytes=1 * 1024 * 1024, backupCount=3)
    rotating_handler.setLevel(logging.INFO)
    rotating_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))

    error_handler = RotatingFileHandler('/app/logs/error.log')
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(message)s'))

    app.logger.addHandler(rotating_handler)
    app.logger.addHandler(error_handler)

db_config = {
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'host': os.getenv('MYSQL_HOST'),
    'database': os.getenv('MYSQL_DATABASE')
}
