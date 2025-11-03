// Teste de debug específico para conexão Supabase (não execute em produção)
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

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DEBUG: Testando conexão Supabase passo a passo\n');

async function testStep1_BasicConnection() {
  console.log('1️⃣ Testando conexão básica...');
  try {
    // Teste mais simples possível
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Conexão HTTP básica: OK');
      return true;
    } else {
      console.log('❌ Conexão HTTP básica: FALHOU', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na conexão HTTP:', error.message);
    return false;
  }
}

async function testStep2_PatientsTable() {
  console.log('\n2️⃣ Testando acesso à tabela patients...');
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro na tabela patients:', error.message);
      console.log('   Código:', error.code);
      console.log('   Detalhes:', error.details);
      return false;
    } else {
      console.log('✅ Acesso à tabela patients: OK');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro ao acessar patients:', error.message);
    return false;
  }
}

async function testStep3_ProfilesTable() {
  console.log('\n3️⃣ Testando acesso à tabela profiles...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro na tabela profiles:', error.message);
      console.log('   Código:', error.code);
      console.log('   Detalhes:', error.details);
      return false;
    } else {
      console.log('✅ Acesso à tabela profiles: OK');
      return true;
    }
  } catch (error) {
    console.log('❌ Erro ao acessar profiles:', error.message);
    return false;
  }
}

async function testStep4_SimpleQuery() {
  console.log('\n4️⃣ Testando query simples...');
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na query simples:', error.message);
      return false;
    } else {
      console.log('✅ Query simples: OK');
      console.log('   Dados encontrados:', data?.length || 0);
      return true;
    }
  } catch (error) {
    console.log('❌ Erro na query:', error.message);
    return false;
  }
}

async function runDebugTests() {
  console.log('🚀 Iniciando testes de debug...\n');
  
  const results = {
    basicConnection: await testStep1_BasicConnection(),
    patientsTable: await testStep2_PatientsTable(),
    profilesTable: await testStep3_ProfilesTable(),
    simpleQuery: await testStep4_SimpleQuery()
  };
  
  console.log('\n📊 RESULTADOS DO DEBUG');
  console.log('========================');
  console.log(`✅ Conexão HTTP: ${results.basicConnection ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Tabela Patients: ${results.patientsTable ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Tabela Profiles: ${results.profilesTable ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Query Simples: ${results.simpleQuery ? 'PASSOU' : 'FALHOU'}`);
  
  if (results.basicConnection && results.patientsTable && !results.profilesTable) {
    console.log('\n🎯 DIAGNÓSTICO: Problema específico na tabela PROFILES');
    console.log('💡 SOLUÇÃO: Aplicar fix-rls-profiles-only.sql');
  } else if (!results.basicConnection) {
    console.log('\n🎯 DIAGNÓSTICO: Problema de conectividade básica');
    console.log('💡 SOLUÇÃO: Verificar URL e chaves do Supabase');
  } else if (results.basicConnection && !results.patientsTable) {
    console.log('\n🎯 DIAGNÓSTICO: Problema na tabela PATIENTS');
    console.log('💡 SOLUÇÃO: Verificar estrutura da tabela');
  }
  
  return results;
}

runDebugTests().catch(console.error);
