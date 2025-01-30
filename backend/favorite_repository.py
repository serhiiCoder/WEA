from database import get_db_connection

def add_to_favorites_in_db(user_id, book_isbn):
    """Přidá knihu do oblíbených pro daného uživatele."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM favorites WHERE user_id = %s AND book_isbn = %s", (user_id, book_isbn))
        if cursor.fetchone():
            return {"message": "Kniha již je v oblíbených."}, 200

        cursor.execute("INSERT INTO favorites (user_id, book_isbn) VALUES (%s, %s)", (user_id, book_isbn))
        connection.commit()
        return {"message": "Kniha byla přidána do oblíbených."}, 201
    finally:
        cursor.close()
        connection.close()

def remove_from_favorites_in_db(user_id, book_isbn):
    """Odstraní knihu z oblíbených pro daného uživatele."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        cursor.execute("DELETE FROM favorites WHERE user_id = %s AND book_isbn = %s", (user_id, book_isbn))
        connection.commit()
        return {"message": "Kniha byla odstraněna z oblíbených."}, 200
    finally:
        cursor.close()
        connection.close()

def get_favorites_from_db(user_id):
    """Vrátí všechny oblíbené knihy pro daného uživatele."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.*, 
                   CASE WHEN b.is_hidden = 1 THEN 'Nedostupné' ELSE 'Dostupné' END AS dostupnost
            FROM books b
            JOIN favorites f ON b.isbn13 = f.book_isbn
            WHERE f.user_id = %s
            ORDER BY f.added_at DESC
        """, (user_id,))
        return cursor.fetchall(), 200
    finally:
        cursor.close()
        connection.close()
