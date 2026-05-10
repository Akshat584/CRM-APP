-- Migration: Properties, Emails, and Advanced Funnels

-- 1. Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, pending, sold
    property_type VARCHAR(50) DEFAULT 'residential',
    bedrooms INTEGER,
    bathrooms INTEGER,
    sqft INTEGER,
    address TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_properties_org_id ON properties(organization_id);

-- Link Deals to Properties
ALTER TABLE deals ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- 2. Emails Table
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    body TEXT,
    direction VARCHAR(20) DEFAULT 'outbound', -- inbound, outbound
    status VARCHAR(20) DEFAULT 'sent', -- draft, sent, received
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emails_org_id ON emails(organization_id);
CREATE INDEX IF NOT EXISTS idx_emails_contact_id ON emails(contact_id);

-- 3. Advanced Funnels (Stage duration tracking)
-- We will track when a deal enters a stage
CREATE TABLE IF NOT EXISTS deal_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    entered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    exited_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deal_stage_history_deal_id ON deal_stage_history(deal_id);
