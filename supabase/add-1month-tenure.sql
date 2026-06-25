-- Migration: Add 1 Month tenure for HR role
-- Run this SQL in your Supabase SQL Editor to add the 1-month tenure option

-- 1. Insert the '1 Month' tenure (only if it doesn't already exist)
INSERT INTO tenures (label, months)
SELECT '1 Month', 1
WHERE NOT EXISTS (
    SELECT 1 FROM tenures WHERE months = 1
);

-- 2. Update the HR role description to reflect both tenures
UPDATE roles
SET description = 'Human Resources operations - Available tenures: 1M, 2M'
WHERE code = 'HR';

-- Verify the changes
SELECT * FROM tenures ORDER BY months;
SELECT * FROM roles WHERE code = 'HR';
