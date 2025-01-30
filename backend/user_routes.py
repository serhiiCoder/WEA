from flask import Blueprint, jsonify, request
from user_repository import get_user_details_from_db, add_or_update_user_details_in_db

user_routes = Blueprint('user_routes', __name__)

@user_routes.route('/user-details/<int:user_id>', methods=['GET'])
def get_user_details(user_id):
    """Načtení detailů uživatele podle jeho ID"""
    user_details, status = get_user_details_from_db(user_id)
    return jsonify(user_details), status

@user_routes.route('/user-details', methods=['POST'])
def add_or_update_user_details():
    """Přidání nebo aktualizace detailů uživatele"""
    data = request.get_json()
    user_id = data.get('user_id')
    personal_address = data.get('personal_address')
    billing_address = data.get('billing_address')
    billing_same_as_personal = data.get('billing_same_as_personal')
    data_processing_consent = data.get('data_processing_consent')
    gender = data.get('gender')
    age = data.get('age')
    favorite_genres = data.get('favorite_genres')
    reference = data.get('reference')

    if not user_id or data_processing_consent is None:
        return jsonify({"error": "Chybí povinné informace."}), 400

    user_details, status = add_or_update_user_details_in_db(user_id, personal_address, billing_address, billing_same_as_personal,
                                                           data_processing_consent, gender, age, favorite_genres, reference)
    return jsonify(user_details), status
