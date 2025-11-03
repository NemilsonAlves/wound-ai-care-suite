import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.NODE_ENV === 'production') {
  console.error('Este script de debug não deve ser executado em produção. Abortando.');
  process.exit(1);
}

console.log('🔍 TESTE ESPECÍFICO DO ERRO DA INTERFACE\n');

// Configuração do Supabase (mesma da aplicação)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientService() {
  console.log('🔄 Simulando chamadas do PatientService...\n');
  
  try {
    // 1. Testar testConnection()
    console.log('1️⃣ Testando testConnection()...');
    const { error: testError } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.log('❌ Erro em testConnection():', testError.message);
      return false;
    } else {
      console.log('✅ testConnection(): OK');
    }

    // 2. Testar getAll()
    console.log('\n2️⃣ Testando getAll()...');
    const { data: patients, error: getAllError } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (getAllError) {
      console.log('❌ Erro em getAll():', getAllError.message);
      console.log('📋 Detalhes do erro:', getAllError);
      return false;
    } else {
      console.log(`✅ getAll(): OK - ${patients?.length || 0} pacientes encontrados`);
    }

    // 3. Testar subscribeToPatients()
    console.log('\n3️⃣ Testando subscribeToPatients()...');
    try {
      const subscription = supabase
        .channel('patients_changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'patients' },
          (payload) => console.log('📡 Real-time update:', payload)
        )
        .subscribe();

      console.log('✅ subscribeToPatients(): OK');
      
      // Limpar subscription
      setTimeout(() => {
        subscription.unsubscribe();
      }, 1000);
      
    } catch (subError) {
      console.log('❌ Erro em subscribeToPatients():', subError.message);
    }

    return true;

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

async function testAuthState() {
  console.log('\n🔐 Testando estado de autenticação...\n');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('⚠️  Erro ao obter usuário:', error.message);
    }
    
    if (user) {
      console.log('✅ Usuário autenticado:', user.email);
    } else {
      console.log('⚠️  Nenhum usuário autenticado (usando chave anônima)');
    }
    
    // Testar sessão
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('✅ Sessão ativa');
    } else {
      console.log('⚠️  Nenhuma sessão ativa');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar autenticação:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando teste do erro da interface...\n');
  
  await testAuthState();
  
  const success = await testPatientService();
  
  if (success) {
    console.log('\n✅ Todos os testes passaram!');
    console.log('🤔 O erro pode estar relacionado ao estado da aplicação React.');
    console.log('💡 Sugestões:');
    console.log('   - Verificar console do navegador');
    console.log('   - Limpar cache do navegador');
    console.log('   - Reiniciar o servidor de desenvolvimento');
  } else {
    console.log('\n❌ Erro encontrado nos testes!');
    console.log('🔧 Aplicar correções necessárias.');
  }
}

main().catch(console.error);
