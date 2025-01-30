from flask import Blueprint, jsonify, request
from favorite_repository import add_to_favorites_in_db, remove_from_favorites_in_db, get_favorites_from_db

favorite_routes = Blueprint('favorite_routes', __name__)

@favorite_routes.route('/favoriteadd', methods=['POST'])
def add_to_favorites():
    data = request.get_json()
    user_id = data.get('user_id')
    book_isbn = data.get('book_isbn')

    if not user_id or not book_isbn:
        return jsonify({"error": "Chybí potřebné informace."}), 400

    response, status_code = add_to_favorites_in_db(user_id, book_isbn)
    return jsonify(response), status_code

@favorite_routes.route('/favoriteremove', methods=['DELETE'])
def remove_from_favorites():
    data = request.get_json()
    user_id = data.get('user_id')
    book_isbn = data.get('book_isbn')

    if not user_id or not book_isbn:
        return jsonify({"error": "Chybí potřebné informace."}), 400

    response, status_code = remove_from_favorites_in_db(user_id, book_isbn)
    return jsonify(response), status_code

@favorite_routes.route('/favorite', methods=['GET'])
def get_favorites():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({"error": "Chybí ID uživatele."}), 400

    favorites, status_code = get_favorites_from_db(user_id)
    return jsonify(favorites), status_code

