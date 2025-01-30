from database import get_db_connection

def get_books_data():
    """Načte data z databáze s vybranými sloupci, včetně isbn13 jako ID, pouze pro knihy, které nejsou skryté."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT isbn13, published_year, thumbnail, title, authors, price, categories FROM books WHERE is_hidden = 0")
        results = cursor.fetchall()
        return results
    finally:
        cursor.close()
        connection.close()

def get_book_by_isbn(isbn):
    """Načte detaily o knize podle ISBN."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT * FROM books WHERE isbn13 = %s", (isbn,))
        book = cursor.fetchone()
        return book
    finally:
        cursor.close()
        connection.close()

from database import get_db_connection


def upload_books_data(data):
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)

        cursor.execute("UPDATE books SET is_hidden = 1")
        connection.commit()

        for book in data:
            try:
                price = float(book['price']) if book['price'] else None

                cursor.execute("""
                    INSERT INTO books (isbn13, isbn10, title, subtitle, authors, thumbnail, description,
                                       published_year, average_rating, num_pages, ratings_count, price, is_hidden)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
                    ON DUPLICATE KEY UPDATE
                        title = VALUES(title), subtitle = VALUES(subtitle),
                        authors = VALUES(authors), thumbnail = VALUES(thumbnail), description = VALUES(description),
                        published_year = VALUES(published_year), average_rating = VALUES(average_rating),
                        num_pages = VALUES(num_pages), ratings_count = VALUES(ratings_count), price = VALUES(price), 
                        is_hidden = 0
                """, (book['isbn13'], book['isbn10'], book['title'], book['subtitle'], book['authors'], 
                      book['thumbnail'], book['description'], book['published_year'], book['average_rating'], 
                      book['num_pages'], book['ratings_count'], price))

                categories = book['categories'].split(",") if book['categories'] else []
                for category in categories:
                    category = category.strip()

                    cursor.execute("INSERT IGNORE INTO categories (name) VALUES (%s)", (category,))

                    cursor.execute("SELECT id FROM categories WHERE name = %s", (category,))
                    category_id = cursor.fetchone()['id']

                    cursor.execute("""
                        INSERT IGNORE INTO book_categories (book_id, category_id)
                        VALUES ((SELECT id FROM books WHERE isbn13 = %s), %s)
                    """, (book['isbn13'], category_id))

                if cursor.rowcount == 1:
                    cursor.execute(
                        "INSERT INTO audit_logs (event_type, user_id, username, details) VALUES (%s, %s, %s, %s)",
                        ("Přidání nové knihy", None, "CDB", f"Kniha '{book['title']}' (ISBN: {book['isbn13']}) byla přidána.")
                    )
                else:
                    cursor.execute(
                        "INSERT INTO audit_logs (event_type, user_id, username, details) VALUES (%s, %s, %s, %s)",
                        ("Znovu zobrazení knihy", None, "CDB", f"Kniha '{book['title']}' (ISBN: {book['isbn13']}) byla znovu zobrazena.")
                    )

            except Exception as e:
                print(f"Chyba při zpracování knihy ISBN: {book.get('isbn13', 'Neznámé')} - {str(e)}")
                cursor.execute(
                    "INSERT INTO audit_logs (event_type, user_id, username, details) VALUES (%s, %s, %s, %s)",
                    ("Chyba při zpracování knihy", None, "CDB", f"Kniha s ISBN: {book.get('isbn13', 'Neznámé')} - Chyba: {str(e)}")
                )

        cursor.execute("SELECT isbn13, title FROM books WHERE is_hidden = 1")
        hidden_books = cursor.fetchall()
        for hidden_book in hidden_books:
            cursor.execute(
                "INSERT INTO audit_logs (event_type, user_id, username, details) VALUES (%s, %s, %s, %s)",
                ("Skrytí knihy", None, "CDB", f"Kniha '{hidden_book['title']}' (ISBN: {hidden_book['isbn13']}) byla skryta.")
            )

        connection.commit()
    except Exception as e:
        print(f"Obecná chyba při zpracování dat: {str(e)}")
    finally:
        cursor.close()
        connection.close()

def get_categories():
    """Načte seznam unikátních kategorií."""
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        query = "SELECT name FROM categories"
        cursor.execute(query)
        rows = cursor.fetchall()

        categories = [row[0] for row in rows]

        return sorted(categories)
    finally:
        cursor.close()
        connection.close()

def fetch_books_with_filters(filters):
    connection = get_db_connection()
    try:
        cursor = connection.cursor(dictionary=True)
        query = """
            SELECT b.isbn13, b.published_year, b.thumbnail, b.title, b.authors, b.price, b.is_hidden
            FROM books b
            LEFT JOIN book_categories bc ON b.id = bc.book_id
            LEFT JOIN categories c ON bc.category_id = c.id
            WHERE 1=1
        """
        params = []

        if filters.get('favorites') and filters['favorites'] == 'true':
            user_id = filters.get('user_id')
            if not user_id:
                raise ValueError("Chybí ID uživatele pro zobrazení oblíbených knih.")

            cursor.execute("SELECT book_isbn FROM favorites WHERE user_id = %s", (user_id,))
            favorites = [row['book_isbn'] for row in cursor.fetchall()]

            if favorites:
                isbn_placeholders = ", ".join(["%s"] * len(favorites))
                query += f" AND b.isbn13 IN ({isbn_placeholders})"
                params.extend(favorites)
            else:
                return []

        if not filters.get('favorites') or filters['favorites'] != 'true':
            query += " AND b.is_hidden = 0"

        if filters.get('category'):
            query += " AND c.name = %s"
            params.append(filters['category'])

        if filters.get('title'):
            query += " AND b.title LIKE %s"
            params.append(f"%{filters['title']}%")

        if filters.get('author'):
            query += " AND b.authors LIKE %s"
            params.append(f"%{filters['author']}%")

        if filters.get('sort_by_date') == 'newest':
            query += " ORDER BY b.published_year DESC"
        elif filters.get('sort_by_date') == 'oldest':
            query += " ORDER BY b.published_year ASC"

        print("Final query:", query)
        print("Query parameters:", params)

        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        return results

    except Exception as e:
        print(f"Chyba při zpracování dotazu: {str(e)}")
        raise
    finally:
        cursor.close()
        connection.close()
