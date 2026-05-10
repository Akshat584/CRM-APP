-- Add last_inbound_at to track the 24-hour window
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMPTZ;

-- Update existing conversations with the timestamp of their latest inbound message
UPDATE whatsapp_conversations c
SET last_inbound_at = (
    SELECT created_at 
    FROM whatsapp_messages 
    WHERE conversation_id = c.id AND direction = 'inbound' 
    ORDER BY created_at DESC 
    LIMIT 1
);
