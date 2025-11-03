// Teste específico para capturar o erro exato (não execute em produção)
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

console.log('🔍 TESTE ESPECÍFICO DO ERRO\n');

async function testPatientServiceExact() {
  console.log('📋 Simulando exatamente o que o PatientService faz...\n');
  
  try {
    console.log('1️⃣ Testando testConnection()...');
    
    // Exatamente como no PatientService
    const { error } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ ERRO na testConnection():');
      console.log('   Mensagem:', error.message);
      console.log('   Código:', error.code);
      console.log('   Detalhes:', error.details);
      console.log('   Hint:', error.hint);
      return false;
    } else {
      console.log('✅ testConnection(): OK');
    }
    
    console.log('\n2️⃣ Testando getAllPatients()...');
    
    // Exatamente como no PatientService
    const { data, error: getAllError } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (getAllError) {
      console.log('❌ ERRO na getAllPatients():');
      console.log('   Mensagem:', getAllError.message);
      console.log('   Código:', getAllError.code);
      console.log('   Detalhes:', getAllError.details);
      console.log('   Hint:', getAllError.hint);
      return false;
    } else {
      console.log('✅ getAllPatients(): OK');
      console.log('   Pacientes encontrados:', data?.length || 0);
    }
    
    console.log('\n3️⃣ Testando createPatient()...');
    
    // Teste de inserção
    const testPatient = {
      full_name: 'Teste Paciente',
      cpf: '11111111111',
      birth_date: '1990-01-01',
      gender: 'masculino',
      phone: '(11) 99999-9999',
      email: 'teste@email.com',
      address: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      specialty: 'dermatologia'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('patients')
      .insert([testPatient])
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ ERRO na createPatient():');
      console.log('   Mensagem:', insertError.message);
      console.log('   Código:', insertError.code);
      console.log('   Detalhes:', insertError.details);
      console.log('   Hint:', insertError.hint);
      return false;
    } else {
      console.log('✅ createPatient(): OK');
      console.log('   Paciente criado:', insertData.id);
      
      // Limpar o teste
      await supabase.from('patients').delete().eq('id', insertData.id);
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ ERRO GERAL:');
    console.log('   Tipo:', error.constructor.name);
    console.log('   Mensagem:', error.message);
    console.log('   Stack:', error.stack);
    return false;
  }
}

async function testNetworkConnectivity() {
  console.log('\n🌐 TESTE DE CONECTIVIDADE DE REDE\n');
  
  try {
    console.log('1️⃣ Testando fetch direto para Supabase...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Status:', response.status);
    console.log('   StatusText:', response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Conectividade de rede: OK');
      return true;
    } else {
      console.log('❌ Conectividade de rede: FALHOU');
      const text = await response.text();
      console.log('   Resposta:', text);
      return false;
    }
    
  } catch (error) {
    console.log('❌ ERRO de rede:');
    console.log('   Tipo:', error.constructor.name);
    console.log('   Mensagem:', error.message);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 INICIANDO TESTE COMPLETO DO ERRO\n');
  
  const networkOk = await testNetworkConnectivity();
  const serviceOk = await testPatientServiceExact();
  
  console.log('\n📊 RESULTADO FINAL');
  console.log('==================');
  console.log(`🌐 Rede: ${networkOk ? 'OK' : 'FALHOU'}`);
  console.log(`📋 PatientService: ${serviceOk ? 'OK' : 'FALHOU'}`);
  
  if (!networkOk) {
    console.log('\n🎯 PROBLEMA: Conectividade de rede');
    console.log('💡 VERIFICAR: Firewall, proxy, internet');
  } else if (!serviceOk) {
    console.log('\n🎯 PROBLEMA: Configuração Supabase');
    console.log('💡 APLICAR: fix-complete-final.sql');
  } else {
    console.log('\n🎉 TUDO FUNCIONANDO!');
  }
}

runCompleteTest().catch(console.error);
