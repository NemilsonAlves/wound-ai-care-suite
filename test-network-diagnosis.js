// Diagnóstico de Rede e Conectividade Supabase (não execute em produção)
// Este script testa diferentes aspectos da conectividade
import dotenv from 'dotenv';
dotenv.config();

if (process.env.NODE_ENV === 'production') {
  console.error('Este script de diagnóstico não deve ser executado em produção. Abortando.');
  process.exit(1);
}

console.log('🔍 DIAGNÓSTICO DE REDE E CONECTIVIDADE SUPABASE');
console.log('==============================================\n');

// Configurações do ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Variáveis de ambiente VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não configuradas.');
  process.exit(1);
}

// Teste 1: Verificar se a URL é acessível
async function testUrlAccessibility() {
  console.log('📡 TESTE 1: Acessibilidade da URL');
  console.log('--------------------------------');
  
  try {
    console.log(`🔗 Testando: ${SUPABASE_URL}`);
    
    const response = await fetch(SUPABASE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));
    
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    console.log(`🔍 Tipo: ${error.constructor.name}`);
    return false;
  }
}

// Teste 2: Verificar endpoint REST API
async function testRestEndpoint() {
  console.log('\n🔌 TESTE 2: Endpoint REST API');
  console.log('-----------------------------');
  
  const restUrl = `${SUPABASE_URL}/rest/v1/`;
  
  try {
    console.log(`🔗 Testando: ${restUrl}`);
    
    const response = await fetch(restUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`📄 Resposta: ${text.substring(0, 200)}...`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    console.log(`🔍 Tipo: ${error.constructor.name}`);
    return false;
  }
}

// Teste 3: Verificar tabela específica
async function testPatientsTable() {
  console.log('\n👥 TESTE 3: Tabela Patients');
  console.log('---------------------------');
  
  const tableUrl = `${SUPABASE_URL}/rest/v1/patients?select=count`;
  
  try {
    console.log(`🔗 Testando: ${tableUrl}`);
    
    const response = await fetch(tableUrl, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.text();
      console.log(`📄 Dados: ${data}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Erro: ${errorText}`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    console.log(`🔍 Tipo: ${error.constructor.name}`);
    console.log(`📋 Stack: ${error.stack}`);
    return false;
  }
}

// Teste 4: Verificar DNS e conectividade
async function testDnsResolution() {
  console.log('\n🌐 TESTE 4: Resolução DNS');
  console.log('-------------------------');
  
  try {
    const hostname = new URL(SUPABASE_URL).hostname;
    console.log(`🔍 Hostname: ${hostname}`);
    
    // Teste simples de conectividade
    const startTime = Date.now();
    const response = await fetch(`https://${hostname}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    const endTime = Date.now();
    
    console.log(`⏱️ Tempo de resposta: ${endTime - startTime}ms`);
    console.log(`✅ DNS resolvido com sucesso`);
    
    return true;
  } catch (error) {
    console.log(`❌ Erro DNS: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.log(`⏰ Timeout - possível problema de conectividade`);
    }
    
    return false;
  }
}

// Teste 5: Verificar CORS
async function testCorsHeaders() {
  console.log('\n🔒 TESTE 5: Configuração CORS');
  console.log('-----------------------------');
  
  try {
    const response = await fetch(SUPABASE_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'apikey,authorization,content-type'
      }
    });
    
    console.log(`✅ Status: ${response.status} ${response.statusText}`);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      'Access-Control-Max-Age': response.headers.get('Access-Control-Max-Age')
    };
    
    console.log(`📊 Headers CORS:`, corsHeaders);
    
    return response.ok;
  } catch (error) {
    console.log(`❌ Erro CORS: ${error.message}`);
    return false;
  }
}

// Executar todos os testes
async function runDiagnosis() {
  const results = [];
  
  console.log('🚀 Iniciando diagnóstico completo...\n');
  
  // Executar testes sequencialmente
  results.push({ name: 'URL Accessibility', success: await testUrlAccessibility() });
  results.push({ name: 'REST Endpoint', success: await testRestEndpoint() });
  results.push({ name: 'Patients Table', success: await testPatientsTable() });
  results.push({ name: 'DNS Resolution', success: await testDnsResolution() });
  results.push({ name: 'CORS Headers', success: await testCorsHeaders() });
  
  // Resumo final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DO DIAGNÓSTICO');
  console.log('='.repeat(50));
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${index + 1}. ${result.name}: ${status}`);
  });
  
  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`\n📈 Resultado: ${passedTests}/${totalTests} testes passaram`);
  
  // Análise e recomendações
  console.log('\n🎯 ANÁLISE E RECOMENDAÇÕES:');
  
  if (passedTests === totalTests) {
    console.log('✅ Todos os testes passaram - conectividade OK');
    console.log('💡 O problema pode estar na aplicação React ou cache do browser');
  } else if (passedTests === 0) {
    console.log('❌ Nenhum teste passou - problema grave de conectividade');
    console.log('💡 Verifique sua conexão com a internet e firewall');
  } else {
    console.log('⚠️ Alguns testes falharam - problema parcial');
    
    if (!results[0].success) {
      console.log('💡 URL não acessível - verifique se o projeto Supabase está ativo');
    }
    
    if (!results[1].success) {
      console.log('💡 REST API com problema - verifique as credenciais');
    }
    
    if (!results[2].success) {
      console.log('💡 Tabela patients com problema - verifique RLS e estrutura');
    }
    
    if (!results[3].success) {
      console.log('💡 Problema de DNS - verifique conectividade de rede');
    }
    
    if (!results[4].success) {
      console.log('💡 Problema de CORS - pode ser configuração do Supabase');
    }
  }
  
  console.log('\n🔧 PRÓXIMOS PASSOS SUGERIDOS:');
  console.log('1. Limpar cache do browser (Ctrl+Shift+R)');
  console.log('2. Verificar se o projeto Supabase está pausado');
  console.log('3. Testar em uma aba anônima do browser');
  console.log('4. Verificar configurações de firewall/antivírus');
  console.log('5. Testar com uma conexão de rede diferente');
}

// Executar diagnóstico
runDiagnosis()
  .then(() => {
    console.log('\n🎉 DIAGNÓSTICO CONCLUÍDO!');
  })
  .catch((error) => {
    console.error('\n💥 ERRO DURANTE DIAGNÓSTICO:', error);
  });
