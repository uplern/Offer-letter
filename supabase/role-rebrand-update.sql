-- Run this once in Supabase SQL Editor for an existing database.
-- It updates the stored role names/codes to the new rebranded labels.

UPDATE roles
SET
    name = 'HR & Business Development',
    code = 'HRBD',
    description = 'HR and business development operations - Available tenures: 1M, 2M, 4M'
WHERE code = 'TA';

UPDATE roles
SET
    name = 'HR & Business Development Sales & Marketing Combined',
    code = 'HRBD_SM',
    description = 'Combined HR & BD and SM role - Available tenures: 2M, 4M'
WHERE code = 'TASM';
