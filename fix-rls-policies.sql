-- Script para corrigir políticas RLS que causam recursão infinita
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para limpeza
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_evolutions DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes que causam recursão
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Professionals can view other profiles" ON profiles;
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
DROP POLICY IF EXISTS "Professionals can view all patients" ON patients;
DROP POLICY IF EXISTS "Professionals can insert patients" ON patients;
DROP POLICY IF EXISTS "Professionals can update patients" ON patients;
DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Professionals can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Patients can view own evolutions" ON clinical_evolutions;
DROP POLICY IF EXISTS "Professionals can view all evolutions" ON clinical_evolutions;
DROP POLICY IF EXISTS "Professionals can manage evolutions" ON clinical_evolutions;

-- 3. Criar políticas simples e seguras (sem recursão)

-- Políticas para profiles (mais simples)
CREATE POLICY "Enable read access for authenticated users" ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on id" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para patients (sem referência circular)
CREATE POLICY "Enable read access for authenticated users" ON patients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON patients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON patients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON patients FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para appointments (sem referência circular)
CREATE POLICY "Enable read access for authenticated users" ON appointments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON appointments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON appointments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON appointments FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para clinical_evolutions (sem referência circular)
CREATE POLICY "Enable read access for authenticated users" ON clinical_evolutions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON clinical_evolutions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON clinical_evolutions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON clinical_evolutions FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Reabilitar RLS com as novas políticas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_evolutions ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se as tabelas existem e estão acessíveis
SELECT 'profiles' as table_name, count(*) as record_count FROM profiles
UNION ALL
SELECT 'patients' as table_name, count(*) as record_count FROM patients
UNION ALL
SELECT 'appointments' as table_name, count(*) as record_count FROM appointments
UNION ALL
SELECT 'clinical_evolutions' as table_name, count(*) as record_count FROM clinical_evolutions;