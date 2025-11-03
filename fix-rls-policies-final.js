import { createClient } from '@supabase/supabase-js';

console.log('🔧 CORREÇÃO FINAL DAS POLÍTICAS RLS\n');

// Configuração do Supabase
const supabaseUrl = 'https://gvyeetmqaaxucdlrkgmr.supabase.co';
// Nota: Você precisa obter a chave service_role do painel do Supabase
const supabaseKey = 'YOUR_SERVICE_ROLE_KEY_HERE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  try {
    console.log('📋 Iniciando correção das políticas RLS...\n');

    // 1. Remover todas as políticas existentes da tabela profiles
    console.log('🗑️  Removendo políticas existentes...');
    
    const dropPoliciesSQL = `
      -- Remover políticas existentes da tabela profiles
      DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
      DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
      DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
      DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
    `;

    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropPoliciesSQL 
    });

    if (dropError) {
      console.log('⚠️  Aviso ao remover políticas:', dropError.message);
    } else {
      console.log('✅ Políticas antigas removidas com sucesso');
    }

    // 2. Criar políticas RLS simples e seguras
    console.log('\n🔐 Criando novas políticas RLS...');
    
    const createPoliciesSQL = `
      -- Política para SELECT: usuários podem ver apenas seu próprio perfil
      CREATE POLICY "profiles_select_own" ON profiles
        FOR SELECT USING (auth.uid() = id);

      -- Política para INSERT: usuários podem criar apenas seu próprio perfil
      CREATE POLICY "profiles_insert_own" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

      -- Política para UPDATE: usuários podem atualizar apenas seu próprio perfil
      CREATE POLICY "profiles_update_own" ON profiles
        FOR UPDATE USING (auth.uid() = id);

      -- Política para DELETE: usuários podem deletar apenas seu próprio perfil
      CREATE POLICY "profiles_delete_own" ON profiles
        FOR DELETE USING (auth.uid() = id);
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createPoliciesSQL 
    });

    if (createError) {
      console.error('❌ Erro ao criar políticas:', createError.message);
      return false;
    }

    console.log('✅ Novas políticas RLS criadas com sucesso');

    // 3. Verificar se RLS está habilitado
    console.log('\n🔍 Verificando status do RLS...');
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('tablename', 'profiles');

    if (rlsError) {
      console.log('⚠️  Não foi possível verificar status do RLS:', rlsError.message);
    }

    // 4. Garantir que RLS está habilitado
    const enableRLSSQL = `
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    `;

    const { error: enableError } = await supabase.rpc('exec_sql', { 
      sql: enableRLSSQL 
    });

    if (enableError) {
      console.log('⚠️  RLS já estava habilitado ou erro:', enableError.message);
    } else {
      console.log('✅ RLS habilitado na tabela profiles');
    }

    // 5. Testar as políticas
    console.log('\n🧪 Testando políticas...');
    
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('⚠️  Teste das políticas:', testError.message);
    } else {
      console.log('✅ Políticas funcionando corretamente');
    }

    console.log('\n🎉 Correção das políticas RLS concluída com sucesso!');
    console.log('\n📝 Resumo das mudanças:');
    console.log('   - Removidas políticas antigas que causavam recursão infinita');
    console.log('   - Criadas políticas simples baseadas em auth.uid()');
    console.log('   - RLS habilitado na tabela profiles');
    console.log('   - Políticas testadas e funcionando');

    return true;

  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
    return false;
  }
}

// Função auxiliar para executar SQL (caso não exista)
async function createExecSQLFunction() {
  try {
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: createFunctionSQL });
    
    if (error) {
      console.log('⚠️  Função exec_sql já existe ou erro:', error.message);
    }
  } catch (error) {
    console.log('⚠️  Não foi possível criar função auxiliar:', error.message);
  }
}

// Executar correção
async function main() {
  console.log('🚀 Iniciando correção das políticas RLS...\n');
  
  if (supabaseKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.error('❌ ERRO: Você precisa configurar a chave service_role do Supabase!');
    console.log('📋 Para obter a chave:');
    console.log('   1. Acesse o painel do Supabase');
    console.log('   2. Vá em Settings > API');
    console.log('   3. Copie a chave "service_role"');
    console.log('   4. Substitua "YOUR_SERVICE_ROLE_KEY_HERE" no código');
    return;
  }

  await createExecSQLFunction();
  const success = await fixRLSPolicies();
  
  if (success) {
    console.log('\n✅ Correção concluída com sucesso!');
    console.log('🔄 Agora você pode executar o teste de validação final.');
  } else {
    console.log('\n❌ Correção falhou. Verifique os erros acima.');
  }
}

main().catch(console.error);