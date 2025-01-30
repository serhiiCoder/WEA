from database import get_db_connection
import mysql.connector

def get_user_details_from_db(user_id):
    """Načte detaily uživatele podle jeho ID."""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT user_id, personal_address, billing_address, billing_same_as_personal,
                   data_processing_consent, gender, age, favorite_genres, reference
            FROM user_details
            WHERE user_id = %s
        """, (user_id,))
        user_details = cursor.fetchone()
        if user_details:
            return user_details, 200
        else:
            return {"message": "Uživatelské detaily nebyly nalezeny."}, 404
    except mysql.connector.Error as e:
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        connection.close()

def add_or_update_user_details_in_db(user_id, personal_address, billing_address, billing_same_as_personal,
                                     data_processing_consent, gender, age, favorite_genres, reference):
    """Přidá nebo aktualizuje detaily uživatele v databázi."""
    connection = get_db_connection()
    cursor = connection.cursor()

    if billing_same_as_personal:
        billing_address = personal_address

    try:
        cursor.execute("""
            INSERT INTO user_details (user_id, personal_address, billing_address, billing_same_as_personal,
                                      data_processing_consent, gender, age, favorite_genres, reference)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                personal_address = VALUES(personal_address),
                billing_address = VALUES(billing_address),
                billing_same_as_personal = VALUES(billing_same_as_personal),
                data_processing_consent = VALUES(data_processing_consent),
                gender = VALUES(gender),
                age = VALUES(age),
                favorite_genres = VALUES(favorite_genres),
                reference = VALUES(reference)
        """, (user_id, personal_address, billing_address, billing_same_as_personal,
              data_processing_consent, gender, age, favorite_genres, reference))
        connection.commit()
        return {"message": "Uživatelské detaily byly úspěšně uloženy."}, 201
    except mysql.connector.Error as e:
        return {"error": str(e)}, 500
    finally:
        cursor.close()
        connection.close()
