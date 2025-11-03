-- =====================================================
-- CORREÇÃO ESPECÍFICA: RLS PROFILES
-- Objetivo: Corrigir recursão infinita apenas na tabela profiles
-- =====================================================

-- REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- CRIAR POLÍTICAS SIMPLES E FUNCIONAIS
CREATE POLICY "profiles_public_select" ON profiles 
    FOR SELECT 
    USING (true);

CREATE POLICY "profiles_public_insert" ON profiles 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "profiles_public_update" ON profiles 
    FOR UPDATE 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "profiles_public_delete" ON profiles 
    FOR DELETE 
    USING (true);

-- VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- TESTAR ACESSO À TABELA
SELECT COUNT(*) as total_profiles FROM profiles;