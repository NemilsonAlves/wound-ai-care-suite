// Teste após aplicar a correção da tabela patients (não execute em produção)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.NODE_ENV === 'production') {
  console.error('Este script de teste não deve ser executado em produção. Abortando.');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não configuradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTableStructure() {
  console.log('🔍 Testando estrutura da tabela patients...');
  
  try {
    // Testar se todas as colunas existem
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id,
        full_name,
        cpf,
        birth_date,
        gender,
        phone,
        email,
        address,
        city,
        state,
        zip_code,
        emergency_contact_name,
        emergency_contact_phone,
        medical_history,
        current_medications,
        allergies,
        specialty,
        specialty_data,
        consent_data_processing,
        consent_whatsapp,
        consent_email,
        created_at,
        updated_at
      `)
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na estrutura da tabela:', error);
      return false;
    }
    
    console.log('✅ Estrutura da tabela correta');
    console.log('📊 Dados encontrados:', data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Exceção ao testar estrutura:', error);
    return false;
  }
}

async function testCRUDOperations() {
  console.log('\n🔄 Testando operações CRUD...');
  
  try {
    // 1. CREATE - Inserir paciente
    const newPatient = {
      full_name: 'João Silva Teste',
      cpf: '98765432100',
      birth_date: '1985-05-15',
      gender: 'masculino',
      phone: '11987654321',
      email: 'joao.teste@email.com',
      address: 'Rua das Flores, 456',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '04567-890',
      emergency_contact_name: 'Maria Silva',
      emergency_contact_phone: '11987654322',
      medical_history: 'Histórico de teste',
      current_medications: 'Nenhuma',
      allergies: 'Nenhuma conhecida',
      specialty: 'Dermatologia',
      consent_data_processing: true,
      consent_whatsapp: true,
      consent_email: false
    };
    
    console.log('1. Testando CREATE...');
    const { data: created, error: createError } = await supabase
      .from('patients')
      .insert([newPatient])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Erro ao criar paciente:', createError);
      return false;
    }
    
    console.log('✅ CREATE funcionando - ID:', created.id);
    
    // 2. READ - Buscar paciente
    console.log('2. Testando READ...');
    const { data: found, error: readError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', created.id)
      .single();
    
    if (readError) {
      console.error('❌ Erro ao buscar paciente:', readError);
      return false;
    }
    
    console.log('✅ READ funcionando - Nome:', found.full_name);
    
    // 3. UPDATE - Atualizar paciente
    console.log('3. Testando UPDATE...');
    const { data: updated, error: updateError } = await supabase
      .from('patients')
      .update({ 
        full_name: 'João Silva Atualizado',
        phone: '11999888777'
      })
      .eq('id', created.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erro ao atualizar paciente:', updateError);
      return false;
    }
    
    console.log('✅ UPDATE funcionando - Nome atualizado:', updated.full_name);
    
    // 4. DELETE - Remover paciente
    console.log('4. Testando DELETE...');
    const { error: deleteError } = await supabase
      .from('patients')
      .delete()
      .eq('id', created.id);
    
    if (deleteError) {
      console.error('❌ Erro ao deletar paciente:', deleteError);
      return false;
    }
    
    console.log('✅ DELETE funcionando - Paciente removido');
    
    return true;
  } catch (error) {
    console.error('❌ Exceção nas operações CRUD:', error);
    return false;
  }
}

async function testPatientService() {
  console.log('\n🧪 Testando compatibilidade com PatientService...');
  
  try {
    // Simular dados do formulário
    const formData = {
      full_name: 'Ana Costa Teste',
      cpf: '11122233344',
      birth_date: '1992-08-20',
      gender: 'feminino',
      phone: '11888777666',
      email: 'ana.teste@email.com',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01310-100',
      specialty: 'Curativos',
      consent_data_processing: true,
      consent_whatsapp: false,
      consent_email: true
    };
    
    // Testar inserção com dados do formulário
    const { data, error } = await supabase
      .from('patients')
      .insert([formData])
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro na compatibilidade:', error);
      return false;
    }
    
    console.log('✅ Compatibilidade com PatientService funcionando');
    
    // Limpar dados de teste
    await supabase.from('patients').delete().eq('id', data.id);
    
    return true;
  } catch (error) {
    console.error('❌ Exceção na compatibilidade:', error);
    return false;
  }
}

async function runCompleteTest() {
  console.log('🚀 TESTE COMPLETO APÓS CORREÇÃO');
  console.log('================================\n');
  
  const results = {
    structure: await testTableStructure(),
    crud: await testCRUDOperations(),
    service: await testPatientService()
  };
  
  console.log('\n📋 RESULTADO DOS TESTES');
  console.log('=======================');
  
  const tests = {
    structure: 'Estrutura da Tabela',
    crud: 'Operações CRUD',
    service: 'Compatibilidade PatientService'
  };
  
  Object.entries(results).forEach(([key, result]) => {
    const status = result ? '✅' : '❌';
    console.log(`${status} ${tests[key]}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Tabela patients corrigida com sucesso');
    console.log('✅ Operações CRUD funcionando');
    console.log('✅ Compatibilidade com frontend mantida');
    console.log('\n🚀 O sistema está pronto para uso!');
  } else {
    console.log('\n🚨 ALGUNS TESTES FALHARAM');
    console.log('❌ Verifique se o script fix-patients-table-complete.sql foi executado');
    console.log('❌ Confirme se não há erros no Supabase Dashboard');
  }
}

runCompleteTest().catch(console.error);
