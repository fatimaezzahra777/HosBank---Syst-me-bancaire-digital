/* la cration de la bd et l'utilisation */
CREATE DATABASE banking_app
USE banking_app;

/* La creation de role */

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

/* L'insertion de les roles */
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

/* La creation de users */ 
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    email_verified_at DATETIME NULL,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

/* La creation de accounts */
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    rib VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('CURRENT', 'SAVINGS') NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    status ENUM('ACTIVE', 'BLOCKED', 'CLOSED') NOT NULL DEFAULT 'ACTIVE',
   
    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_account_balance
        CHECK (balance >= 0)
);

/* la creation de beneficiaies */
CREATE TABLE beneficiaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    rib VARCHAR(50) NOT NULL,
    status ENUM('ACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT fk_beneficiaries_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* la creation de transfers */
CREATE TABLE transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    beneficiary_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM(
        'PENDING',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',
    description TEXT,

    CONSTRAINT fk_transfers_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_transfers_beneficiary
        FOREIGN KEY (beneficiary_id)
        REFERENCES beneficiaries(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_transfer_amount
        CHECK (amount > 0)

);

/* la creation de transactions */

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    transfer_id INT NULL,
    type ENUM(
        'TRANSFER',
        'DEPOSIT',
        'WITHDRAWAL',
        'PAYMENT'
    ) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    status ENUM(
        'PENDING',
        'COMPLETED',
        'FAILED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'COMPLETED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_transactions_transfer
        FOREIGN KEY (transfer_id)
        REFERENCES transfers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

/* La creation de cards */
CREATE TABLE cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_number VARCHAR(30) NOT NULL UNIQUE,
    type ENUM('PHYSICAL', 'VIRTUAL') NOT NULL,
    expiration_date DATE NOT NULL,
    status ENUM(
        'ACTIVE',
        'BLOCKED',
        'OPPOSITION',
        'EXPIRED'
    ) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cards_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* Comments */
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    bank_request_id INT NULL,
    complaint_id INT NULL,

    content TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_comments_request
        FOREIGN KEY (bank_request_id)
        REFERENCES bank_requests(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_comments_complaint
        FOREIGN KEY (complaint_id)
        REFERENCES complaints(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

/* la creation du interactions */

CREATE TABLE interactions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    client_id INT NOT NULL,
    advisor_id INT NOT NULL,

    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_interactions_client
        FOREIGN KEY (client_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_interactions_advisor
        FOREIGN KEY (advisor_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);