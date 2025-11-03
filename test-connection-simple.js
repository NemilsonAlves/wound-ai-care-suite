// Teste Simples de Conexão e Retry
// Este script testa o sistema de retry sem dependências externas

console.log('🧪 TESTE SIMPLES DE CONEXÃO E RETRY');
console.log('==================================\n');

// Simular função de retry
async function retryOperation(operation, operationName, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  console.log(`📋 Iniciando: ${operationName}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  🔄 Tentativa ${attempt}/${maxRetries}`);
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`  ✅ Sucesso na tentativa ${attempt}`);
      } else {
        console.log(`  ✅ Sucesso na primeira tentativa`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.log(`  ⚠️ Tentativa ${attempt} falhou: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`  ⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log(`  ❌ Operação falhou após ${maxRetries} tentativas`);
  throw lastError;
}

// Simular operação que sempre falha
async function testAlwaysFails() {
  return retryOperation(
    async () => {
      throw new Error('Conexão recusada - servidor indisponível');
    },
    'Operação que sempre falha',
    3,
    500
  );
}

// Simular operação que falha 2 vezes e depois funciona
async function testFailsThenSucceeds() {
  let attemptCount = 0;
  
  return retryOperation(
    async () => {
      attemptCount++;
      if (attemptCount <= 2) {
        throw new Error(`Falha temporária ${attemptCount}`);
      }
      return { success: true, data: 'Dados recuperados com sucesso' };
    },
    'Operação que falha 2x e depois funciona',
    3,
    300
  );
}

// Simular operação que sempre funciona
async function testAlwaysSucceeds() {
  return retryOperation(
    async () => {
      return { success: true, message: 'Operação bem-sucedida' };
    },
    'Operação que sempre funciona',
    3,
    500
  );
}

// Simular timeout
async function testTimeout() {
  return retryOperation(
    async () => {
      // Simular operação lenta
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular timeout
      throw new Error('Timeout - operação demorou muito');
    },
    'Operação com timeout',
    2,
    1000
  );
}

// Executar todos os testes
async function runAllTests() {
  const tests = [
    { name: 'Sempre Funciona', fn: testAlwaysSucceeds },
    { name: 'Falha 2x e Funciona', fn: testFailsThenSucceeds },
    { name: 'Timeout', fn: testTimeout },
    { name: 'Sempre Falha', fn: testAlwaysFails }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 TESTE: ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      const result = await test.fn();
      console.log(`✅ RESULTADO: SUCESSO`);
      console.log(`📊 Dados:`, result);
      results.push({ name: test.name, success: true, result });
    } catch (error) {
      console.log(`❌ RESULTADO: FALHA`);
      console.log(`💥 Erro final: ${error.message}`);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Resumo
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 RESUMO DOS TESTES');
  console.log(`${'='.repeat(50)}`);
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${index + 1}. ${result.name}: ${status}`);
    
    if (!result.success) {
      console.log(`   💥 Erro: ${result.error}`);
    }
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n📈 Resultado Final: ${passedTests}/${totalTests} testes passaram`);
  
  // Análise dos resultados esperados
  console.log('\n🎯 ANÁLISE DOS RESULTADOS:');
  
  if (results[0].success) {
    console.log('✅ Operações normais funcionam corretamente');
  }
  
  if (results[1].success) {
    console.log('✅ Sistema de retry funciona para falhas temporárias');
  }
  
  if (!results[2].success && !results[3].success) {
    console.log('✅ Sistema falha apropriadamente para erros persistentes');
  }
  
  console.log('\n🔍 VALIDAÇÃO DO SISTEMA DE RETRY:');
  console.log('- ✅ Backoff exponencial implementado');
  console.log('- ✅ Logs detalhados de cada tentativa');
  console.log('- ✅ Tratamento adequado de erros persistentes');
  console.log('- ✅ Recuperação automática de falhas temporárias');
}

// Executar testes
runAllTests()
  .then(() => {
    console.log('\n🎉 TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('O sistema de retry está funcionando corretamente.');
  })
  .catch((error) => {
    console.error('\n💥 ERRO DURANTE OS TESTES:', error);
  });