import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock do módulo supabase para evitar erro de import em ambiente de teste
const mockSupabase = {
  from: vi.fn(() => ({ select: vi.fn(), limit: vi.fn() })),
  rpc: vi.fn(),
  auth: { getSession: vi.fn() },
};
vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));
import * as SupabaseModule from '@/lib/supabase';
import { detectMissingPatientColumns, REQUIRED_PATIENT_COLUMNS } from '@/services/schemaGuard';

describe('schemaGuard.detectMissingPatientColumns', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('retorna lista vazia quando todas as colunas existem', async () => {
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });
    // @ts-expect-error: sobrescrevendo mock do supabase para teste
    SupabaseModule.supabase = {
      from: () => ({ select: mockSelect, limit: () => ({ data: [], error: null }) }),
    } as unknown;

    const res = await detectMissingPatientColumns(['full_name']);
    expect(res.missing).toEqual([]);
    expect(mockSelect).toHaveBeenCalled();
  });

  it('detecta coluna ausente (erro 42703)', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: { code: '42703', message: 'column does not exist' } }),
      limit: vi.fn(),
    });
    // @ts-expect-error: sobrescrevendo mock do supabase para teste
    SupabaseModule.supabase = { from: mockFrom } as unknown;

    const res = await detectMissingPatientColumns(['mrn']);
    expect(res.missing).toEqual(['mrn']);
  });
});
