from flask import Blueprint, jsonify, request
from books_repository import get_books_data, get_book_by_isbn, upload_books_data, get_categories, fetch_books_with_filters
import mysql.connector

books_routes = Blueprint('books_routes', __name__)

@books_routes.route('/getdata', methods=['GET'])
def get_data():
    """Načtení dat z databáze s vybranými sloupci, včetně isbn13 jako ID, pouze pro knihy, které nejsou skryté"""
    try:
        results = get_books_data()
        return jsonify(results)
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

@books_routes.route('/book/<string:isbn>', methods=['GET'])
def get_book(isbn):
    """Načtení detailů o knize podle ISBN"""
    try:
        book = get_book_by_isbn(isbn)
        if book:
            return jsonify(book)
        else:
            return jsonify({"error": "Book not found"}), 404
    except mysql.connector.Error as e:
        return jsonify({"error": "Database error"}), 500

@books_routes.route('/upload', methods=['POST'])
def upload_data():
    """Nahrání dat do databáze s aktualizací a zachováním skrytých knih"""
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({"error": "Data must be a JSON array."}), 400

    try:
        upload_books_data(data)
        return jsonify({"message": "Data successfully uploaded!"}), 201
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    

@books_routes.route('/categories', methods=['GET'])
def get_categories_route():
    """Načtení unikátních kategorií."""
    try:
        categories = get_categories()
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@books_routes.route('/books', methods=['GET'])
def get_books_with_filters_route():
    """
    Endpoint pro načtení knih s možností filtrování podle zadaných parametrů.
    """
    filters = {
        "category": request.args.get('category'),
        "sort_by_date": request.args.get('sort_by_date'),
        "title": request.args.get('title'),
        "author": request.args.get('author'),
        "favorites": request.args.get('favorites'),
        "user_id": request.args.get('user_id')
    }
    
    try:
        books = fetch_books_with_filters(filters)
        return jsonify(books), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500