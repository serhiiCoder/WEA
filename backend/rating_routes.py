from flask import Blueprint, jsonify, request
from rating_repository import rate_book_in_db, check_user_rating_in_db

rating_routes = Blueprint('rating_routes', __name__)

@rating_routes.route('/rate-book', methods=['POST'])
def rate_book():
    data = request.get_json()
    user_id = data.get('user_id')
    isbn13 = data.get('isbn13')
    rating_value = data.get('rating_value')

    if not (1 <= rating_value <= 5):
        return jsonify({"error": "Hodnocení musí být mezi 1 a 5"}), 400

    response, status = rate_book_in_db(user_id, isbn13, rating_value)
    return jsonify(response), status

@rating_routes.route('/check-rating', methods=['POST'])
def check_rating():
    """Kontrola, zda uživatel knihu ohodnotil."""
    data = request.get_json()
    user_id = data.get('user_id')
    isbn13 = data.get('isbn13')

    response, status = check_user_rating_in_db(user_id, isbn13)
    return jsonify(response), status
