from database import get_db_connection
import mysql.connector

def rate_book_in_db(user_id, isbn13, rating_value):
    """Přidání hodnocení knihy do databáze a výpočet nového průměrného hodnocení."""
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT rating_id FROM book_ratings WHERE user_id = %s AND isbn13 = %s", (user_id, isbn13))
        if cursor.fetchone():
            return {"error": "Uživatel již tuto knihu hodnotil"}, 400

        cursor.execute("INSERT INTO book_ratings (user_id, isbn13, rating_value) VALUES (%s, %s, %s)",
                       (user_id, isbn13, rating_value))

        cursor.execute("SELECT average_rating, ratings_count FROM books WHERE isbn13 = %s", (isbn13,))
        book = cursor.fetchone()

        if book is None:
            return {"error": "Kniha nebyla nalezena"}, 404
        current_average_rating = book[0] or 0
        current_ratings_count = book[1] or 0
        new_ratings_count = current_ratings_count + 1
        new_average_rating = (current_average_rating * current_ratings_count + rating_value) / new_ratings_count
        cursor.execute("""
            UPDATE books 
            SET average_rating = %s, 
                ratings_count = %s
            WHERE isbn13 = %s
        """, (new_average_rating, new_ratings_count, isbn13))

        connection.commit()
        return {
            "message": "Hodnocení úspěšně přidáno a zaktualizováno",
            "new_average_rating": new_average_rating
        }, 200

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return {"error": str(err)}, 500
    finally:
        cursor.close()
        connection.close()

def check_user_rating_in_db(user_id, isbn13):
    """Zkontroluje, zda uživatel již hodnotil tuto knihu a vrátí hodnotu hodnocení."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT rating_value FROM book_ratings WHERE user_id = %s AND isbn13 = %s", (user_id, isbn13))
        rating = cursor.fetchone()
        has_rated = rating is not None
        if has_rated:
            return {"user_has_rated": has_rated, "rating_value": rating['rating_value']}, 200
        else:
            return {"user_has_rated": has_rated}, 200
    except mysql.connector.Error as e:
        return {"error": "Database error"}, 500
    finally:
        cursor.close()
        connection.close()