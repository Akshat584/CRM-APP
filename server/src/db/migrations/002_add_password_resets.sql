-- Migration: Create password_resets table

CREATE TABLE IF NOT EXISTS password_resets (
    token VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
);
