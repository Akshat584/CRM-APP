-- Migration: Seed initial data

-- Seed users
INSERT INTO users (id, name, email, password_hash, role) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Admin User',
    'admin@demo.com',
    '$2b$12$MMQlAwk0SyYA53/q3gZUm.sBPbv8uBw2JAA0da9D54tSA2Z5DW/4m',
    'admin'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Member User',
    'member@demo.com',
    '$2b$12$MMQlAwk0SyYA53/q3gZUm.sBPbv8uBw2JAA0da9D54tSA2Z5DW/4m',
    'member'
) ON CONFLICT (id) DO NOTHING;

-- Helper function to get avatar initials
CREATE OR REPLACE FUNCTION get_initials(name TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(LEFT(SPLIT_PART(name, ' ', 1), 1) ||
           CASE WHEN SPLIT_PART(name, ' ', 2) != ''
                THEN LEFT(SPLIT_PART(name, ' ', 2), 1)
                ELSE ''
           END);
END;
$$ LANGUAGE plpgsql;

-- Seed contacts
INSERT INTO contacts (id, user_id, name, company, email, phone, status, lifetime_value, tags, avatar_initials, notes) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Sarah Johnson',
    'TechCorp Inc',
    'sarah@techcorp.com',
    '+1 (555) 123-4567',
    'Customer',
    150000.00,
    ARRAY['Enterprise', 'Long-term'],
    get_initials('Sarah Johnson'),
    'Key decision maker for enterprise software'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Michael Chen',
    'StartupXYZ',
    'mchen@startupxyz.com',
    '+1 (555) 234-5678',
    'Lead',
    45000.00,
    ARRAY['Startup'],
    get_initials('Michael Chen'),
    'Interested in consulting services'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Emily Rodriguez',
    'Design Studio Co',
    'emily@designstudioco.com',
    '+1 (555) 345-6789',
    'Prospect',
    0.00,
    ARRAY['Design'],
    get_initials('Emily Rodriguez'),
    'Looking for website redesign'
),
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'David Park',
    'Finance Solutions',
    'dpark@financesolutions.com',
    '+1 (555) 456-7890',
    'Customer',
    89000.00,
    ARRAY['Finance'],
    get_initials('David Park'),
    'CRM implementation project'
),
(
    'b0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'Lisa Anderson',
    'HealthTech',
    'lisa@healthtech.io',
    '+1 (555) 567-8901',
    'Lead',
    75000.00,
    ARRAY['Healthcare'],
    get_initials('Lisa Anderson'),
    'Mobile app development opportunity'
),
(
    'b0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'James Wilson',
    'RetailCorp',
    'jwilson@retailcorp.com',
    '+1 (555) 678-9012',
    'Prospect',
    120000.00,
    ARRAY['Retail'],
    get_initials('James Wilson'),
    'E-commerce platform project'
),
(
    'b0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    'Rachel Kim',
    'EduTech',
    'rachel@edutech.com',
    '+1 (555) 789-0123',
    'Churned',
    25000.00,
    ARRAY['Education'],
    get_initials('Rachel Kim'),
    'Previously a customer, now evaluating competitors'
),
(
    'b0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000001',
    'Robert Martinez',
    'Manufacturing Plus',
    'rmartinez@manplus.com',
    '+1 (555) 890-1234',
    'Customer',
    120000.00,
    ARRAY['Manufacturing'],
    get_initials('Robert Martinez'),
    'Data analytics tool implementation'
),
(
    'b0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000001',
    'Jennifer Lee',
    'Green Energy Co',
    'jlee@greenenergy.com',
    '+1 (555) 901-2345',
    'Lead',
    95000.00,
    ARRAY['Energy'],
    get_initials('Jennifer Lee'),
    'Solar panel monitoring system'
),
(
    'b0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000001',
    'Thomas Anderson',
    'CloudTech Solutions',
    'tanderson@cloudtech.com',
    '+1 (555) 012-3456',
    'Prospect',
    65000.00,
    ARRAY['Cloud'],
    get_initials('Thomas Anderson'),
    'Cloud migration project'
) ON CONFLICT (id) DO NOTHING;

-- Seed deals
INSERT INTO deals (id, user_id, contact_id, title, company, value, stage, probability, due_date, notes) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Enterprise Software License',
    'TechCorp Inc',
    150000.00,
    'Closed Won',
    100,
    '2024-03-15',
    'Annual license renewal with expanded features'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Consulting Services',
    'StartupXYZ',
    45000.00,
    'Negotiation',
    75,
    '2024-03-30',
    '3-month consulting engagement'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'Website Redesign',
    'Design Studio Co',
    35000.00,
    'Qualified',
    60,
    '2024-04-15',
    'Full site redesign project'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000004',
    'CRM Implementation',
    'Finance Solutions',
    89000.00,
    'Proposal',
    70,
    '2024-03-20',
    'Custom CRM deployment'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000005',
    'Mobile App Development',
    'HealthTech',
    75000.00,
    'New',
    40,
    '2024-05-01',
    'Healthcare patient portal app'
),
(
    'c0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000006',
    'E-commerce Platform',
    'RetailCorp',
    120000.00,
    'Proposal',
    65,
    '2024-04-01',
    'Multi-vendor marketplace'
),
(
    'c0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000008',
    'Data Analytics Tool',
    'Manufacturing Plus',
    95000.00,
    'Negotiation',
    80,
    '2024-03-10',
    'Manufacturing analytics suite'
),
(
    'c0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Cloud Migration',
    'TechCorp Inc',
    65000.00,
    'Qualified',
    55,
    '2024-04-20',
    'Infrastructure migration to AWS'
),
(
    'c0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000009',
    'Solar Monitoring System',
    'Green Energy Co',
    95000.00,
    'New',
    45,
    '2024-05-15',
    'Solar panel monitoring and analytics'
),
(
    'c0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000010',
    'Cloud Infrastructure Setup',
    'CloudTech Solutions',
    65000.00,
    'Proposal',
    70,
    '2024-04-10',
    'Complete cloud infrastructure setup'
) ON CONFLICT (id) DO NOTHING;

-- Seed activities
INSERT INTO activities (id, user_id, contact_id, deal_id, type, subject, body, activity_date) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'call',
    'Renewal Discussion',
    'Discussed renewal terms and expansion opportunities. Client very satisfied with current service.',
    '2024-03-20 14:30:00'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'email',
    'Proposal Sent',
    'Sent proposal for consulting services. Awaiting feedback.',
    '2024-03-19 10:15:00'
),
(
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'meeting',
    'Discovery Meeting',
    'Discovery meeting went well. Client interested in our design process.',
    '2024-03-18 11:00:00'
),
(
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    'note',
    'Follow-up Scheduled',
    'Follow-up call scheduled for next week to discuss CRM implementation timeline.',
    '2024-03-17 16:45:00'
),
(
    'd0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000005',
    'task',
    'Send Case Studies',
    'Send over case studies from similar healthcare projects.',
    '2024-03-16 09:20:00'
),
(
    'd0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000006',
    'call',
    'Discovery Call',
    'Initial discovery call completed. Need to send technical requirements document.',
    '2024-03-15 15:00:00'
),
(
    'd0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000007',
    NULL,
    'email',
    'Re-engagement Email',
    'Sent follow-up email to re-engage after product pivot.',
    '2024-03-14 13:30:00'
),
(
    'd0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000008',
    'c0000000-0000-0000-0000-000000000007',
    'meeting',
    'Demo Session',
    'Demonstrated data analytics tool capabilities. Client impressed with real-time features.',
    '2024-03-13 10:00:00'
) ON CONFLICT (id) DO NOTHING;

-- Seed tasks
INSERT INTO tasks (id, user_id, contact_id, deal_id, title, priority, status, assignee_id, due_date, notes) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Prepare renewal proposal for Sarah',
    'High',
    'Todo',
    'a0000000-0000-0000-0000-000000000001',
    '2024-03-25',
    'Include new features and pricing tiers'
),
(
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'Send contract to Michael',
    'Medium',
    'In Progress',
    'a0000000-0000-0000-0000-000000000001',
    '2024-03-23',
    'Draft agreement ready for review'
),
(
    'e0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'Schedule demo for Emily',
    'Medium',
    'Todo',
    'a0000000-0000-0000-0000-000000000001',
    '2024-03-22',
    'Prepare design portfolio presentation'
),
(
    'e0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    'Update proposal for David',
    'Low',
    'Done',
    'a0000000-0000-0000-0000-000000000001',
    '2024-03-20',
    'Include implementation timeline'
),
(
    'e0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000005',
    'Research healthcare compliance',
    'High',
    'Done',
    'a0000000-0000-0000-0000-000000000001',
    '2024-03-19',
    'HIPAA requirements documentation'
),
(
    'e0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000006',
    'c0000000-0000-0000-0000-000000000006',
    'Technical requirements meeting',
    'Medium',
    'Todo',
    'a0000000-0000-0000-0000-000000000001',
    '2024-03-26',
    'Invite technical team from RetailCorp'
) ON CONFLICT (id) DO NOTHING;

-- Seed tags
INSERT INTO tags (id, name, color, user_id) VALUES
(
    'f0000000-0000-0000-0000-000000000001',
    'Enterprise',
    '#4f8ef7',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'f0000000-0000-0000-0000-000000000002',
    'Startup',
    '#a78bfa',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'f0000000-0000-0000-0000-000000000003',
    'Long-term',
    '#10b981',
    'a0000000-0000-0000-0000-000000000001'
),
(
    'f0000000-0000-0000-0000-000000000004',
    'High Priority',
    '#f59e0b',
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;