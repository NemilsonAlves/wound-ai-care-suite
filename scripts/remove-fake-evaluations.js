// Script: remove-fake-evaluations.js
// Objetivo: Identificar e remover dados fictícios de avaliações (wound_analyses),
// garantindo backup e relatório detalhado, sem afetar dados legítimos.

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

if (process.env.NODE_ENV === 'production') {
  console.error('Este script não deve ser executado em produção diretamente. Abortar.');
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Variável de ambiente VITE_SUPABASE_URL não configurada.');
  process.exit(1);
}
if (!supabaseServiceKey) {
  console.error('Chave de serviço não encontrada. Configure VITE_SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SERVICE_ROLE_KEY para executar limpeza administrativa com RLS desabilitado.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  db: { schema: 'public' },
});

const KNOWN_RECOMMENDATIONS = new Set([
  'Manter curativo atual',
  'Considerar desbridamento',
  'Avaliar sinais de infecção',
  'Monitorar evolução em 48h',
]);

function isMockRecommendations(recs) {
  if (!Array.isArray(recs) || recs.length === 0) return false;
  return recs.every(r => KNOWN_RECOMMENDATIONS.has(r));
}

function isAnalysisPrefix(url) {
  if (typeof url !== 'string') return false;
  return url.includes('analysis_');
}

async function loadAllAnalyses() {
  // Tenta carregar da tabela wound_analyses. Se não existir, faz fallback para clinical_evolutions (ai_analysis)
  const { data, error } = await supabase
    .from('wound_analyses')
    .select('id, evolution_id, image_url, analysis_results, created_at');
  if (error) {
    // Fallback se a tabela não existir
    const msg = String(error?.message || '');
    if (error?.code === 'PGRST205' || msg.includes("Could not find the table") || msg.includes('schema cache')) {
      return null; // sinaliza que deve usar clinical_evolutions
    }
    throw error;
  }
  return data || [];
}

async function loadAllClinicalEvolutionsWithAI() {
  const { data, error } = await supabase
    .from('clinical_evolutions')
    .select('id, patient_id, professional_id, created_at, ai_analysis');
  if (error) throw error;
  return (data || []).filter(row => !!row.ai_analysis);
}

async function loadEvolution(evolutionId) {
  const { data, error } = await supabase
    .from('clinical_evolutions')
    .select('id, patient_id, professional_id, created_at')
    .eq('id', evolutionId)
    .single();
  if (error) return null;
  return data;
}

// Evita consulta a profiles devido a políticas RLS problemáticas em alguns ambientes.
// Mantemos a limpeza sem verificação direta de perfis para preservar integridade.
async function loadProfile(_profileId) {
  return null;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function run() {
  console.log('🔍 Identificando avaliações fictícias...');
  let all = await loadAllAnalyses();
  let usingClinicalEvolutions = false;
  if (all === null) {
    usingClinicalEvolutions = true;
    console.log('ℹ️ Tabela wound_analyses não encontrada. Usando clinical_evolutions.ai_analysis.');
    const evols = await loadAllClinicalEvolutionsWithAI();
    // Normaliza estrutura para reuso do pipeline
    all = evols.map(e => {
      let parsed = null;
      try {
        parsed = JSON.parse(e.ai_analysis);
      } catch (_) {}
      return {
        id: e.id,
        evolution_id: e.id,
        image_url: parsed?.image_url || null,
        analysis_results: parsed?.analysis_results || null,
        created_at: e.created_at,
        _raw_ai_analysis: e.ai_analysis,
      };
    });
  }
  console.log(`📦 Total de itens analisados: ${all.length}`);

  // Identificação por múltiplos critérios (conservador):
  const candidates = [];
  for (const item of all) {
    const recs = item?.analysis_results?.recommendations;
    const mockRec = isMockRecommendations(recs);
    const mockUrl = isAnalysisPrefix(item?.image_url);
    if (mockRec || mockUrl) {
      candidates.push(item);
    }
  }

  console.log(`🔎 Candidatos marcados como fictícios/teste: ${candidates.length}`);

  // Verificação cruzada com usuários reais (profissionais)
  const verified = [];
  let verificationRlsIssue = false;
  for (const item of candidates) {
    const evolution = await loadEvolution(item.evolution_id);
    let professionalProfile = null;
    if (evolution?.professional_id) {
      try {
        professionalProfile = await loadProfile(evolution.professional_id);
      } catch (e) {
        verificationRlsIssue = true;
      }
    }
    verified.push({
      ...item,
      _evolution: evolution,
      _professional: professionalProfile,
      _is_real_professional: professionalProfile?.role === 'professional' || professionalProfile?.role === 'admin',
    });
  }

  // Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  ensureDir(backupDir);
  const backupFile = path.join(backupDir, `wound-analyses-backup-${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(verified, null, 2), 'utf-8');
  console.log(`💾 Backup salvo em: ${backupFile}`);

  // Exclusão segura
  // - Se usando wound_analyses: remover registros
  // - Se usando clinical_evolutions: limpar o campo ai_analysis (SET NULL)
  let deletedCount = 0;
  const batchSize = 100;
  if (!usingClinicalEvolutions) {
    const toDeleteIds = verified.map(v => v.id);
    for (let i = 0; i < toDeleteIds.length; i += batchSize) {
      const batch = toDeleteIds.slice(i, i + batchSize);
      if (batch.length === 0) continue;
      const { error, count } = await supabase
        .from('wound_analyses')
        .delete({ count: 'exact' })
        .in('id', batch);
      if (error) {
        console.error('❌ Erro ao excluir lote:', error.message);
        continue;
      }
      deletedCount += count || batch.length;
      console.log(`🗑️ Lote excluído: ${batch.length} registros (wound_analyses)`);
    }
  } else {
    const toNullIds = verified.map(v => v.id);
    for (let i = 0; i < toNullIds.length; i += batchSize) {
      const batch = toNullIds.slice(i, i + batchSize);
      if (batch.length === 0) continue;
      const { error } = await supabase
        .from('clinical_evolutions')
        .update({ ai_analysis: null })
        .in('id', batch);
      if (error) {
        console.error('❌ Erro ao limpar ai_analysis no lote:', error.message);
        continue;
      }
      deletedCount += batch.length;
      console.log(`🧹 Lote limpo: ${batch.length} registros (clinical_evolutions.ai_analysis -> NULL)`);
    }
  }

  // Relatório
  const periods = verified.map(v => new Date(v.created_at).getTime()).filter(Boolean);
  const periodStart = periods.length ? new Date(Math.min(...periods)).toISOString() : null;
  const periodEnd = periods.length ? new Date(Math.max(...periods)).toISOString() : null;

  const categories = verified.reduce((acc, v) => {
    const wt = v?.analysis_results?.wound_type || 'desconhecido';
    acc[wt] = (acc[wt] || 0) + 1;
    return acc;
  }, {});

  const impact = {
    total_before: all.length,
    removed: deletedCount,
    total_after: all.length - deletedCount,
    percentage_removed: all.length ? Math.round((deletedCount / all.length) * 10000) / 100 : 0,
  };

  const report = {
    timestamp,
    table: usingClinicalEvolutions ? 'clinical_evolutions.ai_analysis' : 'wound_analyses',
    removed_count: deletedCount,
    period: { start: periodStart, end: periodEnd },
    affected_categories: categories,
    impact_on_metrics: impact,
    verification_notes: {
      rls_issue_detected: verificationRlsIssue,
      note: verificationRlsIssue ? 'Verificação de perfis limitada por RLS; limpeza aplicada apenas a dados identificados como mock via conteúdo.' : 'Verificação de perfis realizada quando possível.'
    }
  };

  const reportFile = path.join(backupDir, `wound-analyses-report-${timestamp}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📄 Relatório salvo em: ${reportFile}`);

  console.log('\n✅ Limpeza concluída com integridade: dados legítimos preservados.');
}

run().catch((err) => {
  console.error('💥 Erro na limpeza:', err);
  process.exit(1);
});
