-- Script simplificado para criar a tabela patients no Supabase
-- Execute este script no SQL Editor do Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the patients table with all required fields
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    emergency_contact TEXT NOT NULL,
    medical_history TEXT NOT NULL,
    allergies TEXT,
    medications TEXT,
    status TEXT DEFAULT 'active',
    specialties TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    specialty_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies for the patients table
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON patients;
CREATE POLICY "Allow all operations for authenticated users" 
    ON patients 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients(full_name);

-- Insert a test patient to verify the table is working
INSERT INTO patients (
    full_name, 
    cpf, 
    birth_date, 
    phone, 
    address, 
    emergency_contact, 
    medical_history
) VALUES (
    'Paciente Teste',
    '000.000.000-00',
    '1990-01-01',
    '(11) 99999-9999',
    'Endereço de Teste, 123',
    'Contato de Emergência - (11) 88888-8888',
    'Histórico médico de teste'
) ON CONFLICT (cpf) DO NOTHING;

-- Verify the table was created successfully
SELECT 'Tabela patients criada com sucesso!' as status;
SELECT COUNT(*) as total_patients FROM patients;