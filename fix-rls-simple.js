import { createClient } from '@supabase/supabase-js';

console.log('🔧 CORREÇÃO SIMPLIFICADA DAS POLÍTICAS RLS\n');

// Configuração do Supabase (usando chave anônima)
const supabaseUrl = 'https://gvyeetmqaaxucdlrkgmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eWVldG1xYWF4dWNkbHJrZ21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDMwNzQsImV4cCI6MjA3NjkxOTA3NH0.IbkDvRbKBYe66ok4rwPD5DFBpYAjEZYS8HpoDbe-90g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCurrentState() {
  console.log('🔍 Testando estado atual das políticas RLS...\n');
  
  try {
    // Testar acesso à tabela patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true });
    
    if (patientsError) {
      console.log('❌ Erro ao acessar patients:', patientsError.message);
      return false;
    } else {
      console.log('✅ Acesso à tabela patients: OK');
    }

    // Testar acesso à tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (profilesError) {
      console.log('❌ Erro ao acessar profiles:', profilesError.message);
      if (profilesError.message.includes('infinite recursion')) {
        console.log('🔄 Detectada recursão infinita nas políticas RLS!');
        return false;
      }
    } else {
      console.log('✅ Acesso à tabela profiles: OK');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
    return false;
  }
}

async function showInstructions() {
  console.log('\n📋 INSTRUÇÕES PARA CORREÇÃO MANUAL\n');
  console.log('Como as políticas RLS precisam ser corrigidas com privilégios administrativos,');
  console.log('você precisa aplicar a correção manualmente no painel do Supabase:\n');
  
  console.log('1️⃣ Acesse o painel do Supabase: https://supabase.com/dashboard');
  console.log('2️⃣ Vá para o projeto: gvyeetmqaaxucdlrkgmr');
  console.log('3️⃣ Clique em "SQL Editor" no menu lateral');
  console.log('4️⃣ Cole e execute o seguinte SQL:\n');
  
  console.log('-- CORREÇÃO DAS POLÍTICAS RLS');
  console.log('-- Desabilitar RLS temporariamente');
  console.log('ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE patients DISABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('-- Remover políticas problemáticas');
  console.log('DROP POLICY IF EXISTS "Users can view own profile" ON profiles;');
  console.log('DROP POLICY IF EXISTS "Users can update own profile" ON profiles;');
  console.log('DROP POLICY IF EXISTS "Professionals can view other profiles" ON profiles;');
  console.log('');
  console.log('-- Criar políticas simples');
  console.log('CREATE POLICY "Enable read for authenticated" ON profiles FOR SELECT USING (auth.role() = \'authenticated\');');
  console.log('CREATE POLICY "Enable insert for authenticated" ON profiles FOR INSERT WITH CHECK (auth.role() = \'authenticated\');');
  console.log('CREATE POLICY "Enable update for own" ON profiles FOR UPDATE USING (auth.uid() = id);');
  console.log('');
  console.log('CREATE POLICY "Enable all for authenticated" ON patients FOR ALL USING (auth.role() = \'authenticated\');');
  console.log('');
  console.log('-- Reabilitar RLS');
  console.log('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
  console.log('ALTER TABLE patients ENABLE ROW LEVEL SECURITY;');
  console.log('');
  console.log('5️⃣ Execute o comando e aguarde a confirmação');
  console.log('6️⃣ Teste novamente a interface de pacientes\n');
}

async function main() {
  console.log('🚀 Iniciando diagnóstico das políticas RLS...\n');
  
  const isWorking = await testCurrentState();
  
  if (!isWorking) {
    console.log('\n⚠️  Políticas RLS precisam ser corrigidas!');
    await showInstructions();
  } else {
    console.log('\n✅ Políticas RLS estão funcionando corretamente!');
    console.log('🎉 O problema pode estar em outro lugar.');
  }
}

main().catch(console.error);