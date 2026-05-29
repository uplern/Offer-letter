-- Enable Extensions (If needed, though gen_random_uuid is built-in in newer PG)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table for Uplern Dashboard
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenures table
CREATE TABLE tenures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL,
    months INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'docx',
    created_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (job applicants)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    father_name VARCHAR(100),
    college_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    tenure_id UUID REFERENCES tenures(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    -- File upload fields
    aadhar_front_url TEXT,
    aadhar_back_url TEXT,
    photo_url TEXT,
    college_id_url TEXT,
    marksheet_12th_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offer letters table
CREATE TABLE offer_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    generated_by_admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default data
-- Default admin user
INSERT INTO admins (name, email, password_hash) VALUES 
('System Admin', 'admin@system.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Default roles with available tenures
INSERT INTO roles (name, code, description) VALUES 
('Human Resources', 'HR', 'Human Resources operations - Available tenures: 2M'),
('Business Development', 'BD', 'Business Development operations - Available tenures: 2M');

-- Default tenures
INSERT INTO tenures (label, months) VALUES 
('2 Months', 2);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_tenure_id ON users(tenure_id);
CREATE INDEX idx_templates_active ON templates(active);
CREATE INDEX idx_offer_letters_user_id ON offer_letters(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenures ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_letters ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (applications)
CREATE POLICY "Allow public read access to roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tenures" ON tenures FOR SELECT USING (true);
CREATE POLICY "Allow public insert to users" ON users FOR INSERT WITH CHECK (true);

-- Create policies for admin access
CREATE POLICY "Allow admin full access to all tables" ON admins FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow admin full access to templates" ON templates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow admin full access to users" ON users FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow admin full access to offer_letters" ON offer_letters FOR ALL USING (auth.uid() IS NOT NULL);
