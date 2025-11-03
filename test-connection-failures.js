// Teste de Simulação de Falhas de Conexão
// Este script testa diferentes cenários de falha e o sistema de retry

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🧪 TESTE DE SIMULAÇÃO DE FALHAS DE CONEXÃO');
console.log('==========================================\n');

// Configurações de teste
const TESTS = [
  {
    name: 'URL Inválida',
    config: {
      url: 'https://invalid-url.supabase.co',
      key: process.env.VITE_SUPABASE_ANON_KEY
    }
  },
  {
    name: 'Chave Inválida',
    config: {
      url: process.env.VITE_SUPABASE_URL,
      key: 'invalid-key-12345'
    }
  },
  {
    name: 'URL e Chave Inválidas',
    config: {
      url: 'https://invalid.supabase.co',
      key: 'invalid-key'
    }
  },
  {
    name: 'Configuração Correta (Controle)',
    config: {
      url: process.env.VITE_SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY
    }
  }
];

// Função de retry com backoff exponencial
async function retryOperation(operation, operationName, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  🔄 Tentativa ${attempt}/${maxRetries}`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`  ✅ Sucesso na tentativa ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.log(`  ⚠️ Tentativa ${attempt} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`  ⏳ Aguardando ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Testar conexão com configuração específica
async function testConnection(config, testName) {
  console.log(`\n📋 Teste: ${testName}`);
  console.log('─'.repeat(50));
  
  try {
    const supabase = createClient(config.url, config.key);
    
    const result = await retryOperation(
      async () => {
        const { data, error, count } = await supabase
          .from('patients')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          throw new Error(`${error.message} (Código: ${error.code})`);
        }
        
        return { success: true, count };
      },
      `conexão para ${testName}`,
      3,
      1000
    );
    
    console.log(`  ✅ SUCESSO: ${result.count || 0} registros encontrados`);
    return { success: true, ...result };
    
  } catch (error) {
    console.log(`  ❌ FALHA: ${error.message}`);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
}

// Executar todos os testes
async function runAllTests() {
  const results = [];
  
  for (const test of TESTS) {
    const result = await testConnection(test.config, test.name);
    results.push({
      name: test.name,
      ...result
    });
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('===================');
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${index + 1}. ${result.name}: ${status}`);
    
    if (!result.success) {
      console.log(`   Erro: ${result.error}`);
    } else if (result.count !== undefined) {
      console.log(`   Registros: ${result.count}`);
    }
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n📈 Resultado Final: ${passedTests}/${totalTests} testes passaram`);
  
  if (passedTests === 1 && results[results.length - 1].success) {
    console.log('✅ Sistema funcionando corretamente - apenas o teste de controle passou');
  } else if (passedTests === 0) {
    console.log('❌ Problema crítico - nenhum teste passou, incluindo o controle');
  } else if (passedTests > 1) {
    console.log('⚠️ Possível problema de segurança - testes inválidos estão passando');
  }
}

// Teste de timeout
async function testTimeout() {
  console.log('\n⏱️ TESTE DE TIMEOUT');
  console.log('==================');
  
  try {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    
    // Simular operação que pode dar timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout simulado')), 2000);
    });
    
    const operationPromise = supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    await Promise.race([operationPromise, timeoutPromise]);
    console.log('✅ Operação completada dentro do tempo limite');
    
  } catch (error) {
    console.log(`❌ Timeout ou erro: ${error.message}`);
    
    // Testar retry após timeout
    console.log('🔄 Testando retry após timeout...');
    try {
      await retryOperation(
        async () => {
          const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
          const { data, error } = await supabase
            .from('patients')
            .select('count')
            .limit(1);
          
          if (error) throw error;
          return data;
        },
        'retry após timeout',
        2,
        500
      );
      console.log('✅ Retry bem-sucedido');
    } catch (retryError) {
      console.log(`❌ Retry falhou: ${retryError.message}`);
    }
  }
}

// Executar todos os testes
async function main() {
  try {
    await runAllTests();
    await testTimeout();
    
    console.log('\n🎯 TESTES CONCLUÍDOS');
    console.log('Verifique os logs acima para identificar possíveis problemas.');
    
  } catch (error) {
    console.error('❌ Erro durante a execução dos testes:', error);
  }
}

main();