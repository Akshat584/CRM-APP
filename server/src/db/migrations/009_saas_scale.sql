-- Migration: SaaS Scaling (Multi-Tenancy, Billing, Automation)

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a default organization for legacy data migration
INSERT INTO organizations (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Legacy Default Organization') 
ON CONFLICT DO NOTHING;

-- 2. Add organization_id to all major tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE deals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE activities ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE whatsapp_conversations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE whatsapp_templates ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';
ALTER TABLE whatsapp_campaigns ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000000';

-- Add indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_org_id ON whatsapp_conversations(organization_id);

-- 3. WhatsApp Automations
CREATE TABLE IF NOT EXISTS whatsapp_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    keyword VARCHAR(255) NOT NULL,
    reply_type VARCHAR(50) DEFAULT 'text',
    reply_text TEXT,
    reply_template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_whatsapp_automations_updated_at BEFORE UPDATE ON whatsapp_automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE INDEX IF NOT EXISTS idx_wa_auto_org_id ON whatsapp_automations(organization_id);
