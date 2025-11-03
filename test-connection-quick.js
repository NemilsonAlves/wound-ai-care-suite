// Teste rápido de conexão após reinício do servidor (não execute em produção)
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

console.log('🔍 TESTE RÁPIDO DE CONEXÃO');
console.log('==========================\n');

async function testConnection() {
  try {
    console.log('1️⃣ Testando conectividade básica...');
    
    // Teste simples de ping
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      console.log('📋 Detalhes:', error);
      
      if (error.message.includes('full_name') || error.message.includes('city')) {
        console.log('\n🔧 DIAGNÓSTICO: Problema estrutural da tabela detectado');
        console.log('📝 SOLUÇÃO: Execute o script fix-patients-table-complete.sql no Supabase');
        console.log('🔗 Acesse: https://supabase.com/dashboard > SQL Editor');
      }
      
      return false;
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log('📊 Resposta:', data);
      return true;
    }
    
  } catch (error) {
    console.log('❌ Erro de rede:', error.message);
    
    if (error.message.includes('demo-project')) {
      console.log('\n🔧 DIAGNÓSTICO: URL incorreta detectada');
      console.log('📝 SOLUÇÃO: Limpar cache do navegador e reiniciar servidor');
    }
    
    return false;
  }
}

async function testTableStructure() {
  try {
    console.log('\n2️⃣ Testando estrutura da tabela...');
    
    const { data, error } = await supabase
      .from('patients')
      .select('full_name, city, cpf')
      .limit(1);
    
    if (error) {
      console.log('❌ Estrutura da tabela incorreta:', error.message);
      return false;
    } else {
      console.log('✅ Estrutura da tabela está correta!');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar estrutura:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes...\n');
  
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    const structureOk = await testTableStructure();
    
    if (structureOk) {
      console.log('\n🎉 RESULTADO: Tudo funcionando perfeitamente!');
      console.log('✅ Conexão: OK');
      console.log('✅ Estrutura: OK');
      console.log('✅ Sistema pronto para uso');
    } else {
      console.log('\n⚠️ RESULTADO: Conexão OK, mas estrutura precisa de correção');
      console.log('✅ Conexão: OK');
      console.log('❌ Estrutura: Precisa aplicar fix-patients-table-complete.sql');
    }
  } else {
    console.log('\n🔴 RESULTADO: Problemas de conectividade');
    console.log('❌ Conexão: FALHOU');
    console.log('❓ Estrutura: Não testada');
  }
  
  console.log('\n📋 Próximos passos:');
  if (!connectionOk) {
    console.log('1. Verificar variáveis de ambiente');
    console.log('2. Reiniciar servidor se necessário');
    console.log('3. Limpar cache do navegador');
  } else {
    console.log('1. Aplicar fix-patients-table-complete.sql no Supabase');
    console.log('2. Testar interface de pacientes');
    console.log('3. Validar operações CRUD');
  }
}

runTests().catch(console.error);
