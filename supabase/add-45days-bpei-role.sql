-- SQL Migration: Add 45-Day Tenure and Business Partnership Executive Intern (BPEI) Role

-- 1. Insert 45 Days tenure if it doesn't exist
INSERT INTO tenures (id, label, months)
VALUES (gen_random_uuid(), '45 Days', 45)
ON CONFLICT (months) DO NOTHING;

-- 2. Insert or update the Business Partnership Executive Intern role
INSERT INTO roles (id, name, code, description)
VALUES (
    gen_random_uuid(),
    'Business Partnership Executive Intern',
    'BPEI',
    'Business Partnership Executive Intern - 45 Days Internship Tenure'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 3. Verify the changes
SELECT * FROM tenures ORDER BY months;
SELECT * FROM roles ORDER BY name;
