from flask import Blueprint, request, jsonify
from orders_repository import create_order_in_db, fetch_orders_by_user_id

orders_routes = Blueprint('orders_routes', __name__)

@orders_routes.route('/confirm-order', methods=['POST'])
def confirm_order():
    """
    Endpoint pro potvrzení objednávky.
    Přijímá JSON s informacemi o objednávce a ukládá je do databáze.
    """
    try:
        order_data = request.get_json()
        if not order_data:
            return jsonify({"error": "No data provided"}), 400

        user_id = order_data.get('user_id')
        personal_address = order_data.get('personal_address')
        billing_address = order_data.get('billing_address')
        email = order_data.get('email')
        payment_method = order_data.get('payment_method')
        cart_books = order_data.get('cart')

        if not all([user_id, personal_address, billing_address, email, payment_method, cart_books]):
            return jsonify({"error": "Missing required fields"}), 400

        result, status_code = create_order_in_db(user_id, personal_address, billing_address, email, payment_method, cart_books)

        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@orders_routes.route('/orders/<int:user_id>', methods=['GET'])
def get_orders(user_id):
    try:
        orders = fetch_orders_by_user_id(user_id)
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

