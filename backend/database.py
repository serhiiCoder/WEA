import mysql.connector
from config import db_config

def get_db_connection():
    """Vytvoří nové připojení k databázi"""
    return mysql.connector.connect(**db_config)
