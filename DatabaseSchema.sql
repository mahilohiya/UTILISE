-- Database Schema for Advanced Library Features

-- 1. Role-Based Access
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'LIBRARIAN', 'ADMIN', 'SYSTEM') DEFAULT 'STUDENT',
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (username, password_hash, role, email) VALUES ('SYSTEM', 'system', 'SYSTEM', 'system@utilise.local');
INSERT IGNORE INTO users (username, password_hash, role, email) VALUES ('admin', 'admin123', 'ADMIN', 'admin@utilise.local');

-- 2. Book Inventory & Condition Tracking
ALTER TABLE books ADD COLUMN IF NOT EXISTS isbn VARCHAR(20);
ALTER TABLE books ADD COLUMN IF NOT EXISTS total_copies INT DEFAULT 1;
ALTER TABLE books ADD COLUMN IF NOT EXISTS available_copies INT DEFAULT 1;
ALTER TABLE books ADD COLUMN IF NOT EXISTS physical_condition ENUM('NEW', 'GOOD', 'FAIR', 'POOR') DEFAULT 'GOOD';
ALTER TABLE books ADD COLUMN IF NOT EXISTS qr_code VARCHAR(255); -- For QR Book Scanning

-- 3. Automatic Due-Date/Fine System & Borrowing History
CREATE TABLE IF NOT EXISTS borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP NULL,
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    status ENUM('BORROWED', 'RETURNED', 'OVERDUE') DEFAULT 'BORROWED',
    renewals_count INT DEFAULT 0, -- For Automatic Renewal
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 4. Reservation/Waitlist
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'FULFILLED', 'CANCELLED') DEFAULT 'PENDING',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 5. Book Request System
CREATE TABLE IF NOT EXISTS book_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    reason TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED') DEFAULT 'PENDING',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Automated Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 8. Admin Analytics Dashboard (Views for easy querying)
CREATE OR REPLACE VIEW library_stats AS
SELECT 
    (SELECT COUNT(*) FROM books) as total_books,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM borrowings WHERE status = 'BORROWED') as active_borrowings,
    (SELECT SUM(fine_amount) FROM borrowings) as total_fines_collected;
