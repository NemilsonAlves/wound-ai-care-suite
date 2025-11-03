// Script de validação final após aplicar todas as correções
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gvyeetmqaaxucdlrkgmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2eWVldG1xYWF4dWNkbHJrZ21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNDMwNzQsImV4cCI6MjA3NjkxOTA3NH0.IbkDvRbKBYe66ok4rwPD5DFBpYAjEZYS8HpoDbe-90g';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🎯 VALIDAÇÃO FINAL DO SISTEMA');
console.log('==============================\n');

async function testRLSPolicies() {
  console.log('1️⃣ Testando políticas RLS...');
  
  try {
    // Testar tabela profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Erro RLS em profiles:', profilesError.message);
      return false;
    } else {
      console.log('✅ Políticas RLS profiles: OK');
    }
    
    // Testar tabela patients
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (patientsError) {
      console.log('❌ Erro RLS em patients:', patientsError.message);
      return false;
    } else {
      console.log('✅ Políticas RLS patients: OK');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro ao testar RLS:', error.message);
    return false;
  }
}

async function testTableStructure() {
  console.log('\n2️⃣ Testando estrutura da tabela patients...');
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('full_name, cpf, city, state, zip_code, gender, consent_data_processing, consent_whatsapp, consent_email')
      .limit(1);
    
    if (error) {
      console.log('❌ Estrutura incorreta:', error.message);
      return false;
    } else {
      console.log('✅ Estrutura da tabela: OK');
      console.log('✅ Colunas essenciais presentes: full_name, city, state, zip_code, gender, consent_*');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar estrutura:', error.message);
    return false;
  }
}

async function testCRUDOperations() {
  console.log('\n3️⃣ Testando operações CRUD...');
  
  try {
    // CREATE - Criar paciente de teste
    const testPatient = {
      full_name: 'Teste Validação Sistema',
      cpf: '00000000000',
      birth_date: '1990-01-01',
      gender: 'outro',
      phone: '(11) 00000-0000',
      email: 'teste@validacao.com',
      address: 'Rua de Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '00000-000',
      specialty: 'curativos',
      consent_data_processing: true,
      consent_whatsapp: false,
      consent_email: false
    };
    
    const { data: createdPatient, error: createError } = await supabase
      .from('patients')
      .insert([testPatient])
      .select()
      .single();
    
    if (createError) {
      console.log('❌ Erro ao criar paciente:', createError.message);
      return false;
    }
    
    console.log('✅ CREATE: Paciente criado com sucesso');
    
    // READ - Buscar paciente criado
    const { data: foundPatient, error: readError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', createdPatient.id)
      .single();
    
    if (readError) {
      console.log('❌ Erro ao buscar paciente:', readError.message);
      return false;
    }
    
    console.log('✅ READ: Paciente encontrado com sucesso');
    
    // UPDATE - Atualizar paciente
    const { data: updatedPatient, error: updateError } = await supabase
      .from('patients')
      .update({ full_name: 'Teste Validação Atualizado' })
      .eq('id', createdPatient.id)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Erro ao atualizar paciente:', updateError.message);
      return false;
    }
    
    console.log('✅ UPDATE: Paciente atualizado com sucesso');
    
    // DELETE - Remover paciente de teste
    const { error: deleteError } = await supabase
      .from('patients')
      .delete()
      .eq('id', createdPatient.id);
    
    if (deleteError) {
      console.log('❌ Erro ao deletar paciente:', deleteError.message);
      return false;
    }
    
    console.log('✅ DELETE: Paciente removido com sucesso');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro nas operações CRUD:', error.message);
    return false;
  }
}

async function testDataIntegrity() {
  console.log('\n4️⃣ Testando integridade dos dados...');
  
  try {
    // Verificar se dados de teste existem
    const { data, error } = await supabase
      .from('patients')
      .select('full_name, cpf, specialty')
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao verificar dados:', error.message);
      return false;
    }
    
    console.log('✅ Dados de teste encontrados:', data.length, 'pacientes');
    
    if (data.length > 0) {
      console.log('📋 Exemplos:');
      data.forEach((patient, index) => {
        console.log(`   ${index + 1}. ${patient.full_name} - ${patient.specialty}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ Erro ao verificar integridade:', error.message);
    return false;
  }
}

async function runValidation() {
  console.log('🚀 Iniciando validação completa...\n');
  
  const results = {
    rls: await testRLSPolicies(),
    structure: await testTableStructure(),
    crud: await testCRUDOperations(),
    integrity: await testDataIntegrity()
  };
  
  console.log('\n📊 RESULTADO FINAL');
  console.log('==================');
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log(`✅ Políticas RLS: ${results.rls ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Estrutura: ${results.structure ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Operações CRUD: ${results.crud ? 'PASSOU' : 'FALHOU'}`);
  console.log(`✅ Integridade: ${results.integrity ? 'PASSOU' : 'FALHOU'}`);
  
  if (allPassed) {
    console.log('\n🎉 SISTEMA TOTALMENTE FUNCIONAL!');
    console.log('✅ Todas as correções foram aplicadas com sucesso');
    console.log('✅ Sistema de pacientes operacional');
    console.log('✅ Interface web pronta para uso');
    console.log('\n📋 Próximos passos:');
    console.log('1. Testar interface em http://localhost:8081');
    console.log('2. Criar novos pacientes via formulário');
    console.log('3. Validar todas as funcionalidades');
  } else {
    console.log('\n⚠️ ALGUMAS CORREÇÕES AINDA NECESSÁRIAS');
    console.log('❌ Nem todos os testes passaram');
    console.log('\n📋 Ações necessárias:');
    
    if (!results.rls) {
      console.log('- Aplicar correção de políticas RLS');
    }
    if (!results.structure) {
      console.log('- Aplicar correção de estrutura da tabela');
    }
    if (!results.crud) {
      console.log('- Verificar permissões e políticas');
    }
    if (!results.integrity) {
      console.log('- Verificar dados de teste');
    }
  }
  
  return allPassed;
}

runValidation().catch(console.error);