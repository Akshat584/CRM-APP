-- Migration: Add unique constraint to contact email per user
ALTER TABLE contacts ADD CONSTRAINT unique_contact_email_per_user UNIQUE (user_id, email);
