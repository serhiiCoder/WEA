from database import get_db_connection
import mysql.connector

def create_order_in_db(user_id, personal_address, billing_address, email, payment_method, cart_books):
    """
    Uloží objednávku do databáze s finální cenou, kvantitami a cenami knih.
    """
    connection = get_db_connection()
    cursor = connection.cursor()

    if not cart_books:
        return {"error": "Košík je prázdný. Nelze vytvořit objednávku."}, 400

    try:
        total_price = 0
        for book in cart_books:
            quantity = int(book.get('quantity', 1))
            price_per_unit = float(book.get('price', 0))
            total_price += quantity * price_per_unit


        if payment_method == "dobirka":
            total_price += 50
        elif payment_method == "kartou":
            total_price += total_price * 0.01 

        cursor.execute("""
            INSERT INTO orders (user_id, personal_address, billing_address, email, payment_method, total_price)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, personal_address, billing_address, email, payment_method, round(total_price, 2)))
        connection.commit()

        order_id = cursor.lastrowid

        for book in cart_books:
            cursor.execute("""
                INSERT INTO order_books (order_id, book_isbn, quantity, price_per_unit)
                VALUES (%s, %s, %s, %s)
            """, (
                order_id,
                book['isbn13'],
                book.get('quantity', 1),
                book.get('price', 0)
            ))
        connection.commit()

        return {
            "message": "Objednávka byla úspěšně uložena.",
            "order_id": order_id,
            "total_price": round(total_price, 2)
        }, 201

    except mysql.connector.Error as e:
        connection.rollback()
        return {"error": str(e)}, 500

    finally:
        cursor.close()
        connection.close()


def fetch_orders_by_user_id(user_id):
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, created_at, total_price, status
            FROM orders
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        orders = cursor.fetchall()

        for order in orders:
            cursor.execute("""
                SELECT b.title, ob.quantity, b.price
                FROM order_books ob
                JOIN books b ON ob.book_isbn = b.isbn13
                WHERE ob.order_id = %s
            """, (order['id'],))
            order['books'] = cursor.fetchall()

        return orders
    finally:
        cursor.close()
        connection.close()