USE electroshop_db;

CREATE TABLE IF NOT EXISTS password_reset_otps (
    reset_otp_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    email VARCHAR(255)
      CHARACTER SET utf8mb4
      COLLATE utf8mb4_unicode_ci
      NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME NULL,
    used_at DATETIME NULL,
    attempts INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_password_reset_email_created (email, created_at),
    INDEX idx_password_reset_user (user_id),

    CONSTRAINT fk_password_reset_otps_user
      FOREIGN KEY (user_id)
      REFERENCES users(user_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

SELECT 'PASSWORD RESET OTP TABLE READY' AS result;
