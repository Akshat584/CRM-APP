-- Migration: Make contact_id optional in activities table
ALTER TABLE activities ALTER COLUMN contact_id DROP NOT NULL;
