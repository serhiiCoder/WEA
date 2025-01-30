# comments_routes.py
from flask import Blueprint, jsonify, request
from comments_repository import get_user_by_id, add_comment_to_db, get_comments_by_book_isbn
import mysql.connector

comments_routes = Blueprint('comments_routes', __name__)

@comments_routes.route('/add-comment', methods=['POST'])
def add_comment():
    """Přidání komentáře k určité knize"""
    data = request.get_json()
    user_id = data.get('user_id')
    book_isbn = data.get('book_isbn')
    comment_text = data.get('comment_text')

    if not user_id or not book_isbn or not comment_text:
        return jsonify({"error": "Chybí potřebné informace."}), 400

    try:
        username = get_user_by_id(user_id)
        add_comment_to_db(user_id, book_isbn, comment_text, username)
        return jsonify({"message": "Komentář byl úšpěšně přidán."}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

@comments_routes.route('/comments/<string:isbn13>', methods=['GET'])
def get_comments(isbn13):
    """Načtení všech komentářů pro danou knihu podle isbn13"""
    try:
        comments = get_comments_by_book_isbn(isbn13)

        if not comments:
            return jsonify({"message": "Žádné komentáře nebyly nalezeny pro tuto knihu."}), 404

        return jsonify(comments), 200
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
