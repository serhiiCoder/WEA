# auth_repository.py
from database import get_db_connection
from werkzeug.security import generate_password_hash
import mysql.connector

# auth_repository.py
from database import get_db_connection
from werkzeug.security import generate_password_hash
import mysql.connector


def get_user_by_name(name):
    """Načte uživatele podle jeho jména."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user WHERE name = %s", (name,))
        user = cursor.fetchone()
        return user
    finally:
        cursor.close()
        connection.close()


def create_user(name, password):
    """Vytvoří nového uživatele s hashovaným heslem."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO user (name, password) VALUES (%s, %s)", (name, hashed_password))
        connection.commit()
        user_id = cursor.lastrowid
        cursor.execute(
            "INSERT INTO audit_logs (event_type, user_id, username, details) VALUES (%s, %s, %s, %s)",
            ("Registrace uživatele", user_id, name, "Uživatel úspěšně zaregistrován.")
        )
        connection.commit()
        return user_id
    finally:
        cursor.close()
        connection.close()


def check_user_exists(name):
    """Zkontroluje, zda uživatel s daným jménem již existuje."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user WHERE name = %s", (name,))
        existing_user = cursor.fetchone()
        return existing_user is not None
    finally:
        cursor.close()
        connection.close()


def log_user_login(user_id, username):
    """Logování události přihlášení uživatele."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (event_type, user_id, username, details) VALUES (%s, %s, %s, %s)",
            ("Přihlášení uživatele", user_id, username, "Uživatel se úspěšně přihlásil.")
        )
        connection.commit()
    finally:
        cursor.close()
        connection.close()


def log_user_logout(user_id, username):
    """Logování události odhlášení uživatele."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO audit_logs (event_type, user_id, username, details) VALUES (%s, %s, %s, %s)",
            ("Odhlášení uživatele", user_id, username, "Uživatel se úspěšně odhlásil.")
        )
        connection.commit()
    finally:
        cursor.close()
        connection.close()


def check_user_exists(name):
    """Zkontroluje, zda uživatel s daným jménem již existuje."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM user WHERE name = %s", (name,))
        existing_user = cursor.fetchone()
        return existing_user is not None
    finally:
        cursor.close()
        connection.close()