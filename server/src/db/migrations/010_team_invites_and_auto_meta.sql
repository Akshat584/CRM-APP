-- Migration: Team Invitations and Automation Metadata

-- 1. Invitations Table
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations(organization_id);

-- 2. Add description to automations for better UI
ALTER TABLE whatsapp_automations ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE whatsapp_automations ADD COLUMN IF NOT EXISTS trigger_count INTEGER DEFAULT 0;
