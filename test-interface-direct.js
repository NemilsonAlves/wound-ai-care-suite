// Teste direto da interface - simula exatamente o que React está fazendo (não execute em produção)
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

// Configuração exata do Supabase como na aplicação
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

console.log('🔍 TESTE DIRETO DA INTERFACE\n');

// Simular exatamente o PatientService
class TestPatientService {
  static async testConnection() {
    try {
      console.log('🔗 Testando conexão...');
      
      const { error } = await supabase
        .from('patients')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Erro na conexão:', error);
        return false;
      }
      
      console.log('✅ Conexão OK');
      return true;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return false;
    }
  }

  static async getAll() {
    try {
      console.log('📋 Buscando todos os pacientes...');
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar pacientes:', error);
        throw error;
      }

      console.log('✅ Pacientes encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  static subscribeToPatients(callback) {
    console.log('📡 Configurando real-time...');
    
    try {
      const subscription = supabase
        .channel('patients-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'patients' }, 
          callback
        )
        .subscribe();

      console.log('✅ Real-time configurado');
      return subscription;
    } catch (error) {
      console.error('❌ Erro no real-time:', error);
      return null;
    }
  }
}

// Simular o fluxo exato da interface React
async function simulateReactFlow() {
  console.log('⚛️ SIMULANDO FLUXO DO REACT\n');
  
  // 1. useEffect - testar conexão
  console.log('1️⃣ useEffect: Testando conexão inicial...');
  const connectionStatus = await TestPatientService.testConnection();
  
  if (!connectionStatus) {
    console.log('❌ Conexão falhou - interface mostrará erro');
    return;
  }
  
  // 2. useQuery - buscar pacientes
  console.log('\n2️⃣ useQuery: Buscando pacientes...');
  try {
    const patients = await TestPatientService.getAll();
    console.log('✅ useQuery sucesso:', patients.length, 'pacientes');
    
    // Mostrar alguns dados
    if (patients.length > 0) {
      console.log('📄 Primeiro paciente:', {
        id: patients[0].id,
        name: patients[0].full_name,
        cpf: patients[0].cpf
      });
    }
  } catch (error) {
    console.log('❌ useQuery falhou:', error.message);
    return;
  }
  
  // 3. useEffect - configurar real-time
  console.log('\n3️⃣ useEffect: Configurando real-time...');
  const subscription = TestPatientService.subscribeToPatients((payload) => {
    console.log('📡 Real-time update recebido:', payload);
  });
  
  if (subscription) {
    console.log('✅ Real-time ativo');
    
    // Simular cleanup após 2 segundos
    setTimeout(() => {
      subscription.unsubscribe();
      console.log('🔌 Real-time desconectado');
    }, 2000);
  }
  
  console.log('\n🎉 SIMULAÇÃO COMPLETA - INTERFACE DEVERIA FUNCIONAR!');
}

// Teste de fetch direto (como no browser)
async function testBrowserFetch() {
  console.log('\n🌐 TESTE DE FETCH DIRETO (COMO NO BROWSER)\n');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/patients?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Fetch direto OK:', data.length, 'pacientes');
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Fetch direto falhou:', errorText);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no fetch:', error.message);
    return false;
  }
}

async function runCompleteInterfaceTest() {
  console.log('🚀 TESTE COMPLETO DA INTERFACE\n');
  
  await testBrowserFetch();
  await simulateReactFlow();
  
  console.log('\n📊 CONCLUSÃO');
  console.log('=============');
  console.log('Se todos os testes passaram, o problema pode ser:');
  console.log('1. 🔄 Cache do browser');
  console.log('2. 🛠️ Configuração do React Query');
  console.log('3. 🔧 Problema no build/dev server');
  console.log('4. 🌐 CORS ou headers específicos do browser');
}

runCompleteInterfaceTest().catch(console.error);
