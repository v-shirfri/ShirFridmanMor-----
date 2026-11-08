CREATE DATABASE IF NOT EXISTS chatproj_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE chatproj_db;

CREATE TABLE IF NOT EXISTS conversations (
    id         INT          NOT NULL AUTO_INCREMENT,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    title      VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS messages (
    id              INT          NOT NULL AUTO_INCREMENT,
    conversation_id INT          NOT NULL,
    role            ENUM('user', 'assistant') NOT NULL,
    content         TEXT         NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
