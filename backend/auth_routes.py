from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash
from auth_repository import get_user_by_name, create_user, check_user_exists, log_user_login, log_user_logout
import mysql.connector

auth_routes = Blueprint('auth_routes', __name__)

@auth_routes.route('/login', methods=['POST'])
def login_user():
    """Přihlášení uživatele"""
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    if not name or not password:
        return jsonify({"error": "Name and password are required"}), 400

    try:
        user = get_user_by_name(name)
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            log_user_login(user['id'], user['name'])
            return jsonify({"user_id": user['id'], "message": "Login successful!"}), 200
        else:
            return jsonify({"error": "Invalid name or password"}), 401
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

@auth_routes.route('/register', methods=['POST'])
def register_user():
    """Registrace nového uživatele"""
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')

    if not name or not password:
        return jsonify({"error": "Name and password are required"}), 400

    try:
        if check_user_exists(name):
            return jsonify({"error": "User already exists"}), 409

        user_id = create_user(name, password)
        return jsonify({"user_id": user_id, "message": "User registered successfully!"}), 201
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500

@auth_routes.route('/logout', methods=['POST'])
def logout_user():
    """Odhlášení uživatele"""
    user_id = session.get('user_id')
    if user_id:
        user = get_user_by_name(user_id)
        if user:
            log_user_logout(user['id'], user['name'])

    session.pop('user_id', None)
    return jsonify({"message": "Logout successful!"}), 200
