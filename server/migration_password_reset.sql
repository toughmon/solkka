CREATE TABLE IF NOT EXISTS solkka.password_reset_token (
  id SERIAL PRIMARY KEY,
  user_account_id INT REFERENCES solkka.user_account(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user
ON solkka.password_reset_token(user_account_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_expires
ON solkka.password_reset_token(expires_at);
