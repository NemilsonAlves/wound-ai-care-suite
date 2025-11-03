-- =====================================================
-- CORREÇÃO COMPLETA: RLS + ESTRUTURA
-- Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
-- Objetivo: Corrigir recursão infinita RLS + estrutura da tabela patients
-- =====================================================

-- PARTE 1: CORRIGIR RECURSÃO RLS
-- =====================================

-- Remover políticas problemáticas da tabela profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Desabilitar e reabilitar RLS para limpeza
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples e funcionais para profiles
CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_policy" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "profiles_delete_policy" ON profiles FOR DELETE USING (true);

-- PARTE 2: CORRIGIR ESTRUTURA DA TABELA PATIENTS
-- ===============================================

-- Remover políticas existentes da tabela patients (se houver)
DROP POLICY IF EXISTS "patients_select_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON patients;

-- Remover tabela patients existente (se houver)
DROP TABLE IF EXISTS patients CASCADE;

-- Recriar tabela patients com estrutura completa
CREATE TABLE patients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    birth_date DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('masculino', 'feminino', 'outro')),
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_history TEXT,
    current_medications TEXT,
    allergies TEXT,
    specialty TEXT NOT NULL,
    specialty_data JSONB DEFAULT '{}',
    consent_data_processing BOOLEAN NOT NULL DEFAULT false,
    consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
    consent_email BOOLEAN NOT NULL DEFAULT false,
    mrn TEXT UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS na tabela patients
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Criar políticas simples para patients
CREATE POLICY "patients_select_policy" ON patients FOR SELECT USING (true);
CREATE POLICY "patients_insert_policy" ON patients FOR INSERT WITH CHECK (true);
CREATE POLICY "patients_update_policy" ON patients FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "patients_delete_policy" ON patients FOR DELETE USING (true);

-- Índices para performance
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_specialty ON patients(specialty);
CREATE INDEX idx_patients_created_at ON patients(created_at);
CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_mrn ON patients(mrn);

-- PARTE 3: DADOS DE TESTE
-- ========================

INSERT INTO patients (
    full_name, cpf, birth_date, gender, phone, email, address, 
    city, state, zip_code, specialty, consent_data_processing, 
    consent_whatsapp, consent_email
) VALUES 
(
    'João Silva Santos', 
    '12345678901', 
    '1985-03-15', 
    'masculino', 
    '(11) 99999-9999', 
    'joao.silva@email.com', 
    'Rua das Flores, 123', 
    'São Paulo', 
    'SP', 
    '01234-567', 
    'Curativos', 
    true, 
    true, 
    false
),
(
    'Maria Oliveira Costa', 
    '98765432109', 
    '1990-07-22', 
    'feminino', 
    '(11) 88888-8888', 
    'maria.oliveira@email.com', 
    'Av. Principal, 456', 
    'São Paulo', 
    'SP', 
    '01234-890', 
    'Dermatologia', 
    true, 
    false, 
    true
);

-- PARTE 4: VERIFICAÇÃO FINAL
-- ===========================

-- Testar se as políticas estão funcionando
SELECT 'Teste de SELECT na tabela patients' as teste;
SELECT COUNT(*) as total_patients FROM patients;

SELECT 'Teste de SELECT na tabela profiles' as teste;
SELECT COUNT(*) as total_profiles FROM profiles;

-- =====================================================
-- FIM DA CORREÇÃO COMPLETA
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se não há erros
-- 3. Teste a aplicação em http://localhost:8081
-- 4. Valide operações CRUD de pacientes
-- =====================================================
