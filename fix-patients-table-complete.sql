-- CORREÇÃO COMPLETA DA TABELA PATIENTS
-- Execute este script no SQL Editor do Supabase para corrigir a estrutura

-- 1. Remover tabela existente se houver problemas estruturais
DROP TABLE IF EXISTS patients CASCADE;

-- 2. Recriar tabela com estrutura completa e correta
CREATE TABLE patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Dados pessoais básicos
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('masculino', 'feminino', 'outro')),
    
    -- Contato
    phone TEXT NOT NULL,
    email TEXT,
    
    -- Endereço completo
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    
    -- Contato de emergência
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    
    -- Histórico médico
    medical_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    
    -- Especialidade
    specialty TEXT NOT NULL CHECK (specialty IN ('Curativos', 'Dermatologia', 'Cirurgias')),
    specialty_data JSONB DEFAULT '{}',

    -- Consentimentos
    consent_data_processing BOOLEAN NOT NULL DEFAULT false,
    consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
    consent_email BOOLEAN NOT NULL DEFAULT false,

    -- Identificador médico (MRN)
    mrn TEXT UNIQUE,

    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Aplicar trigger de updated_at
CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Habilitar Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON patients;
DROP POLICY IF EXISTS "patients_select_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON patients;

-- 7. Criar políticas RLS simples e funcionais
CREATE POLICY "patients_select_policy" 
    ON patients 
    FOR SELECT 
    USING (true);

CREATE POLICY "patients_insert_policy" 
    ON patients 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "patients_update_policy" 
    ON patients 
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "patients_delete_policy" 
    ON patients 
    FOR DELETE 
    USING (true);

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_specialty ON patients(specialty);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients(full_name);

-- 9. Inserir dados de teste para validação
INSERT INTO patients (
    full_name,
    cpf,
    birth_date,
    gender,
    phone,
    email,
    address,
    city,
    state,
    zip_code,
    specialty,
    consent_data_processing,
    consent_whatsapp,
    consent_email
) VALUES (
    'Paciente Teste',
    '12345678901',
    '1990-01-01',
    'masculino',
    '11999999999',
    'teste@exemplo.com',
    'Rua Teste, 123',
    'São Paulo',
    'SP',
    '01234-567',
    'Curativos',
    true,
    false,
    false
) ON CONFLICT (cpf) DO NOTHING;

-- 10. Verificar se a estrutura está correta
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- 11. Testar operações básicas
SELECT COUNT(*) as total_patients FROM patients;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Tabela patients criada com sucesso!';
    RAISE NOTICE 'Estrutura alinhada com o frontend TypeScript';
    RAISE NOTICE 'Políticas RLS configuradas corretamente';
    RAISE NOTICE 'Dados de teste inseridos';
END $$;
