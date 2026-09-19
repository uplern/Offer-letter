-- SQL Migration Script for 65-Day Recruitment Specialist and Business Partnership Executive Role

-- 1. Insert or update the 65 Days tenure
INSERT INTO tenures (id, label, months)
VALUES (gen_random_uuid(), '65 Days', 65)
ON CONFLICT (months) DO NOTHING;

-- 2. Insert or update the RSBPE role
INSERT INTO roles (id, name, code, description)
VALUES (
    gen_random_uuid(),
    'Recruitment Specialist and Business Partnership Executive',
    'RSBPE',
    'Recruitment Specialist and Business Partnership Executive - 65 Days Training Tenure'
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;
