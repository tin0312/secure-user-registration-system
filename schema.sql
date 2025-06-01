CREATE DATABASE registration_db;

USE registration_db;

CREATE TABLE
  account_types (
    account_type_id INT PRIMARY KEY,
    type_name ENUM ('individual', 'company') UNIQUE NOT NULL
  );

INSERT INTO
  account_types (account_type_id, type_name)
VALUES
  (1, 'individual'),
  (2, 'company');

CREATE TABLE
  users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    account_type_id INT,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_type_id) REFERENCES account_types (account_type_id)
  );

  CREATE TABLE
  person_titles (
    user_id INT PRIMARY KEY,
    person_title VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id)
  );


-- centralized logging for bad requests
CREATE TABLE
  rate_limit_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip VARCHAR(45) NOT NULL UNIQUE,
    attempt_count INT NOT NULL,
    last_attempt_time INT NOT NULL
  );

-- schedule event that is enabled by hosting platfrom using mySQL
SHOW VARIABLES LIKE 'event_scheduler';

SET
  GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_rate_limit_attempts ON SCHEDULE EVERY 1 MINUTE DO
DELETE FROM rate_limit_attempts
WHERE
  attempt_time < UNIX_TIMESTAMP () - 60;

SHOW EVENTS;