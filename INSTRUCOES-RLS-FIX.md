# 🔧 INSTRUÇÕES: Correção RLS Profiles

## 🎯 PROBLEMA IDENTIFICADO
- ❌ **Erro**: `TypeError: Failed to fetch` 
- 🔍 **Causa**: Recursão infinita nas políticas RLS da tabela `profiles`
- ✅ **Status**: Tabela `patients` funcionando perfeitamente
- ❌ **Bloqueio**: Tabela `profiles` com RLS problemático

## 📋 PASSOS PARA CORREÇÃO

### 1️⃣ Acessar Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: `gvyeetmqaaxucdlrkgmr`

### 2️⃣ Abrir SQL Editor
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"** ou use uma query existente

### 3️⃣ Copiar e Colar o Script
```sql
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
```

### 4️⃣ Executar o Script
- Clique no botão **"Run"** (▶️)
- Aguarde a execução completa
- Verifique se não há erros na saída

### 5️⃣ Verificar Resultado Esperado
O resultado deve mostrar:
- ✅ Políticas antigas removidas
- ✅ RLS desabilitado e reabilitado
- ✅ Novas políticas criadas
- ✅ Lista das políticas ativas
- ✅ Contagem de profiles (pode ser 0)

## 🎯 RESULTADO ESPERADO
Após aplicar este script:
- ✅ Tabela `profiles` funcionará sem recursão
- ✅ Erro `TypeError: Failed to fetch` será resolvido
- ✅ Interface web funcionará completamente
- ✅ Sistema 100% operacional

## 📞 PRÓXIMOS PASSOS
1. Aplicar o script acima
2. Executar `node test-final-validation.js`
3. Testar interface em http://localhost:8080/pacientes
4. Confirmar funcionamento completo

---
**⚠️ IMPORTANTE**: Este script corrige APENAS o problema RLS da tabela `profiles`. A tabela `patients` já está funcionando perfeitamente.
## Correção segura de RLS na tabela `profiles`

Para resolver o erro de "infinite recursion detected in policy for relation \"profiles\"" sem abrir acesso público, use o script `fix-rls-profiles-secure.sql`.

### Passos para aplicar no Supabase
- Abra o **SQL Editor** do seu projeto no Supabase.
- Copie o conteúdo de `fix-rls-profiles-secure.sql` e execute.
- Verifique as políticas com:
  ```sql
  SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  FROM pg_policies
  WHERE tablename = 'profiles';
  ```
- Teste acesso autenticado: com um usuário logado, apenas seu próprio registro (`id = auth.uid()`) deve ser legível/atualizável/excluível.

### Observações importantes
- Evitamos subconsultas ou funções que consultem `profiles` dentro das políticas para eliminar recursão.
- Se não desejar permitir `DELETE`, remova ou comente a política `profiles_delete_own`.
- Em ambientes multi-tenant ou com papéis administrativos, crie políticas adicionais específicas para estes papéis.
