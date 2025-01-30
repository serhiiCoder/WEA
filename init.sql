USE mydatabase;

CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn13 VARCHAR(13) UNIQUE,
    isbn10 VARCHAR(10),
    title VARCHAR(255),
    categories TEXT,
    subtitle VARCHAR(255),
    authors TEXT,
    thumbnail TEXT,
    description TEXT,
    published_year INT,
    average_rating FLOAT,
    num_pages INT,
    ratings_count INT,
    is_hidden BOOLEAN DEFAULT 0,
    price DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    username VARCHAR(255) NOT NULL,
    book_isbn VARCHAR(13) NOT NULL,
    comment_text TEXT NOT NULL,
    date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (book_isbn) REFERENCES books(isbn13) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_isbn VARCHAR(13) NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (book_isbn) REFERENCES books(isbn13) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    isbn13 VARCHAR(13) NOT NULL,
    rating_value INT CHECK (rating_value BETWEEN 1 AND 5),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (isbn13) REFERENCES books(isbn13) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_details (
    user_id INT PRIMARY KEY,
    personal_address VARCHAR(255),
    billing_address VARCHAR(255),
    billing_same_as_personal BOOLEAN DEFAULT 0,
    data_processing_consent BOOLEAN NOT NULL,
    gender ENUM('male', 'female'),
    age INT,
    favorite_genres TEXT,
    reference VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    user_id INT,
    username VARCHAR(255),
    event_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
); 


CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    personal_address VARCHAR(255) NOT NULL,
    billing_address VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('VYRIZOVANA', 'DORUCOVANA', 'ZRUSENA', 'DOKONCENA') DEFAULT 'VYRIZOVANA',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS order_books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    book_isbn VARCHAR(13) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_isbn) REFERENCES books(isbn13) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS book_categories (
    book_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (book_id, category_id),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
