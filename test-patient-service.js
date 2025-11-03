// Script de teste para verificar o PatientService
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatientService() {
  console.log('🔄 Testando PatientService...\n');

  try {
    // 1. Testar conexão básica
    console.log('1. Testando conexão com Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('patients')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Erro de conexão:', connectionError);
      return;
    }
    console.log('✅ Conexão OK');

    // 2. Testar busca de pacientes
    console.log('\n2. Testando busca de pacientes...');
    const { data: patients, error: fetchError } = await supabase
      .from('patients')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Erro ao buscar pacientes:', fetchError);
    } else {
      console.log(`✅ Busca OK - ${patients?.length || 0} pacientes encontrados`);
      if (patients && patients.length > 0) {
        console.log('   Primeiro paciente:', patients[0].full_name);
      }
    }

    // 3. Testar criação de paciente (dados de teste)
    console.log('\n3. Testando criação de paciente...');
    const testPatient = {
      full_name: 'Paciente Teste',
      cpf: '12345678901',
      birth_date: '1990-01-01',
      gender: 'masculino',
      phone: '11999999999',
      email: 'teste@email.com',
      address: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234-567',
      specialty: 'Curativos',
      consent_data_processing: true,
      consent_whatsapp: false,
      consent_email: false
    };

    const { data: newPatient, error: createError } = await supabase
      .from('patients')
      .insert([testPatient])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar paciente:', createError);
    } else {
      console.log('✅ Criação OK - ID:', newPatient.id);
      
      // 4. Testar atualização
      console.log('\n4. Testando atualização de paciente...');
      const { data: updatedPatient, error: updateError } = await supabase
        .from('patients')
        .update({ full_name: 'Paciente Teste Atualizado' })
        .eq('id', newPatient.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar paciente:', updateError);
      } else {
        console.log('✅ Atualização OK:', updatedPatient.full_name);
      }

      // 5. Testar exclusão
      console.log('\n5. Testando exclusão de paciente...');
      const { error: deleteError } = await supabase
        .from('patients')
        .delete()
        .eq('id', newPatient.id);

      if (deleteError) {
        console.error('❌ Erro ao excluir paciente:', deleteError);
      } else {
        console.log('✅ Exclusão OK');
      }
    }

    console.log('\n🎉 Todos os testes concluídos!');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

// Executar testes
testPatientService();