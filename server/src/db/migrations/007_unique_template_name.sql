-- Migration: Add unique constraint to whatsapp_templates name
ALTER TABLE whatsapp_templates ADD CONSTRAINT whatsapp_templates_name_unique UNIQUE (name);
