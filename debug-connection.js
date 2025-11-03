// Script de debug para testar conexão com Supabase (não execute em produção)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.NODE_ENV === 'production') {
  console.error('Este script de debug não deve ser executado em produção. Abortando.');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não configuradas.');
  process.exit(1);
}

console.log('🔍 DIAGNÓSTICO DETALHADO DE CONEXÃO');
console.log('=====================================\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicConnection() {
  console.log('1️⃣ Testando conexão básica...');
  try {
    const { data, error } = await supabase.from('patients').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro na conexão básica:', error);
      return false;
    }
    
    console.log('✅ Conexão básica funcionando');
    return true;
  } catch (error) {
    console.error('❌ Exceção na conexão:', error);
    return false;
  }
}

async function testTableAccess() {
  console.log('\n2️⃣ Testando acesso à tabela patients...');
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro no acesso à tabela:', error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      console.error('   Detalhes:', error.details);
      return false;
    }
    
    console.log('✅ Acesso à tabela funcionando');
    console.log('📊 Dados encontrados:', data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Exceção no acesso à tabela:', error);
    return false;
  }
}

async function testRLSPolicies() {
  console.log('\n3️⃣ Testando políticas RLS...');
  try {
    // Teste de inserção
    const testData = {
      full_name: 'Teste Debug',
      cpf: '00000000000',
      birth_date: '1990-01-01',
      phone: '11999999999',
      email: 'debug@test.com',
      address: 'Rua Teste',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '00000-000',
      gender: 'masculino',
      specialty: 'Curativos',
      consent_data_processing: true,
      consent_whatsapp: false,
      consent_email: false
    };
    
    const { data, error } = await supabase
      .from('patients')
      .insert([testData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro nas políticas RLS:', error);
      console.error('   Código:', error.code);
      console.error('   Mensagem:', error.message);
      
      if (error.code === '42501') {
        console.error('🚨 PROBLEMA IDENTIFICADO: Políticas RLS bloqueando operações');
        console.error('   Solução: Executar fix-rls-policies.sql no Supabase');
      }
      
      return false;
    }
    
    console.log('✅ Políticas RLS funcionando');
    
    // Limpar dados de teste
    if (data?.id) {
      await supabase.from('patients').delete().eq('id', data.id);
      console.log('🧹 Dados de teste removidos');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Exceção nas políticas RLS:', error);
    return false;
  }
}

async function testNetworkConnectivity() {
  console.log('\n4️⃣ Testando conectividade de rede...');
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erro de rede:', response.status, response.statusText);
      return false;
    }
    
    console.log('✅ Conectividade de rede funcionando');
    return true;
  } catch (error) {
    console.error('❌ Erro de conectividade:', error);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log('\n5️⃣ Verificando variáveis de ambiente...');
  
  const checks = [
    { name: 'SUPABASE_URL', value: supabaseUrl },
    { name: 'SUPABASE_KEY', value: supabaseKey ? 'Configurada' : 'Não configurada' }
  ];
  
  checks.forEach(check => {
    if (check.value && check.value !== 'Não configurada') {
      console.log(`✅ ${check.name}: ${check.name === 'SUPABASE_KEY' ? 'Configurada' : check.value}`);
    } else {
      console.log(`❌ ${check.name}: Não configurada`);
    }
  });
  
  return true;
}

async function runDiagnostic() {
  console.log('🚀 Iniciando diagnóstico completo...\n');
  
  const results = {
    environment: await checkEnvironmentVariables(),
    network: await testNetworkConnectivity(),
    connection: await testBasicConnection(),
    tableAccess: await testTableAccess(),
    rlsPolicies: await testRLSPolicies()
  };
  
  console.log('\n📋 RESUMO DO DIAGNÓSTICO');
  console.log('========================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅' : '❌';
    const testName = {
      environment: 'Variáveis de Ambiente',
      network: 'Conectividade de Rede',
      connection: 'Conexão Básica',
      tableAccess: 'Acesso à Tabela',
      rlsPolicies: 'Políticas RLS'
    }[test];
    
    console.log(`${status} ${testName}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Todos os testes passaram! O sistema deveria estar funcionando.');
  } else {
    console.log('\n🚨 Problemas identificados. Verifique os erros acima.');
    
    console.log('\n🔧 SOLUÇÕES RECOMENDADAS:');
    if (!results.rlsPolicies) {
      console.log('1. Executar fix-rls-policies.sql no Supabase Dashboard');
    }
    if (!results.connection || !results.tableAccess) {
      console.log('2. Verificar configuração do projeto Supabase');
    }
    if (!results.network) {
      console.log('3. Verificar conectividade de internet');
    }
  }
}

runDiagnostic().catch(console.error);
