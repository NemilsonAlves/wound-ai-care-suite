import { supabase } from '@/lib/supabase';

// Campos obrigatórios esperados na tabela patients conforme tipos e UI
export const REQUIRED_PATIENT_COLUMNS = [
  'full_name',
  'cpf',
  'birth_date',
  'gender',
  'phone',
  'email',
  'address',
  'city',
  'state',
  'zip_code',
  'emergency_contact_name',
  'emergency_contact_phone',
  'medical_history',
  'current_medications',
  'allergies',
  'specialty',
  'specialty_data',
  'consent_data_processing',
  'consent_whatsapp',
  'consent_email',
  'mrn',
  'status',
  'avatar_url',
  'created_at',
  'updated_at',
];

export interface SchemaCheckResult {
  missing: string[];
}

// Verifica coluna a coluna para identificar ausências sem depender de catálogos do Postgres
export async function detectMissingPatientColumns(columns: string[] = REQUIRED_PATIENT_COLUMNS): Promise<SchemaCheckResult> {
  const missing: string[] = [];

  for (const col of columns) {
    // Tenta selecionar a coluna isoladamente; se não existir, PostgREST retorna 42703
    const { data, error } = await supabase
      .from('patients')
      .select(col)
      .limit(1);

    if (error && (error.code === '42703' || /does not exist/i.test(error.message))) {
      missing.push(col);
      continue;
    }
    // Nenhuma ação para tipos aqui — tipos são validados por Zod no fluxo de dados
    // A seleção sem erro indica que a coluna existe
  }

  return { missing };
}

// Tenta correção atômica via função RPC instalada no banco
export async function ensureSchemaAndInsertAtomically(payload: Record<string, unknown>) {
  // A função precisa existir no banco; se não existir, retornamos erro claro
  const { data, error } = await supabase.rpc('ensure_patients_schema_and_insert', { p_data: payload });
  return { data, error };
}
