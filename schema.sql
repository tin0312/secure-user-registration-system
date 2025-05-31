CREATE DATABASE registration_db;
USE registration_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY, -- ensure each record is unique avoiding the case when user information changed
    account_type ENUM('individual', 'company') NOT NULL, -- only check of the expected value
    username VARCHAR(50) UNIQUE, -- username should be unique for login but optional
    password VARCHAR(255) NOT NULL, -- store hashed password, 255 length is good for bcrypt
    full_name VARCHAR(255) NOT NULL, -- should be required as this acts as an ID of a person
    person_title VARCHAR(100) DEFAULT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- centralized logging for bad requests
CREATE TABLE rate_limit_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(45) NOT NULL UNIQUE,
    attempt_count INT NOT NULL,
    last_attempt_time INT NOT NULL
);

-- schedule event that is enabled by hosting platfrom using mySQL

SHOW VARIABLES LIKE 'event_scheduler';
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_rate_limit_attempts
ON SCHEDULE EVERY  1 MINUTE
DO
  DELETE FROM rate_limit_attempts WHERE attempt_time < UNIX_TIMESTAMP() - 60;

SHOW EVENTS;



