// Teste das variáveis de ambiente
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carrega o arquivo .env
config();

console.log('🔍 Verificando variáveis de ambiente...');
console.log('');

// Lê o arquivo .env diretamente
try {
  const envContent = readFileSync('.env', 'utf8');
  console.log('📄 Conteúdo do arquivo .env:');
  console.log(envContent);
  console.log('');
} catch (error) {
  console.error('❌ Erro ao ler .env:', error.message);
}

// Verifica as variáveis no process.env
console.log('🌐 Variáveis no process.env:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'NÃO DEFINIDA');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');
console.log('');

// Verifica todas as variáveis que começam com VITE_
console.log('🔧 Todas as variáveis VITE_:');
Object.keys(process.env)
  .filter(key => key.startsWith('VITE_'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`${key}: ${key.includes('KEY') ? (value ? 'DEFINIDA' : 'NÃO DEFINIDA') : value}`);
  });

console.log('');
console.log('✅ Teste concluído!');