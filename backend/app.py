from flask import Flask
from flask_cors import CORS
from flask_session import Session
from config import configure_app, configure_logging
from books_routes import books_routes
from auth_routes import auth_routes
from comment_routes import comments_routes
from favorite_routes import favorite_routes
from comment_routes import comments_routes
from rating_routes import rating_routes
from user_routes import user_routes
from orders_routes import orders_routes

app = Flask(__name__)
CORS(app)

configure_app(app)
configure_logging(app)

Session(app)

app.register_blueprint(books_routes)
app.register_blueprint(comments_routes)
app.register_blueprint(auth_routes)
app.register_blueprint(favorite_routes)
app.register_blueprint(rating_routes)
app.register_blueprint(user_routes)
app.register_blueprint(orders_routes)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
