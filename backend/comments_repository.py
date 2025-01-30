# comments_repository.py
from database import get_db_connection
import mysql.connector

def get_user_by_id(user_id):
    """Načte uživatele podle jeho ID a vrátí jeho jméno."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT name FROM user WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise ValueError("Uživatel neexistuje.")
        return user['name']
    finally:
        cursor.close()
        connection.close()

def add_comment_to_db(user_id, book_isbn, comment_text, username):
    """Přidá komentář do databáze."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            INSERT INTO comments (user_id, book_isbn, comment_text, username)
            VALUES (%s, %s, %s, %s)
        """, (user_id, book_isbn, comment_text, username))
        connection.commit()
    finally:
        cursor.close()
        connection.close()

def get_comments_by_book_isbn(book_isbn):
    """Načte všechny komentáře pro danou knihu podle ISBN."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.comment_id, c.comment_text, c.date_added, u.name AS user_name
            FROM comments c
            JOIN user u ON c.user_id = u.id
            WHERE c.book_isbn = %s
            ORDER BY c.date_added DESC
        """, (book_isbn,))
        comments = cursor.fetchall()
        return comments
    finally:
        cursor.close()
        connection.close()
