-- Setup admin user for Uplern admin panel
-- Run this in Supabase SQL Editor

-- 1. Create admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS and create policy for login
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public select for login (client needs to read this)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'admins' 
      AND policyname = 'public select for login'
  ) THEN
    CREATE POLICY "public select for login"
      ON admins FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- 3. Insert your admin user (admin@system.com / admin123)
INSERT INTO admins (name, email, password_hash)
VALUES ('System Admin', 'admin@system.com', '$2b$10$9gxBPYCVX5OR1orhzGtMmeoBR0THmHTQNvou5By1ZPWjPI8mJzDNe')
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  password_hash = EXCLUDED.password_hash;

-- 4. Verify the admin was created
SELECT email, created_at FROM admins WHERE email = 'admin@system.com';
