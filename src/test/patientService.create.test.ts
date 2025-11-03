import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock do módulo supabase para evitar erro de import em ambiente de teste
const mockSupabase = {
  from: vi.fn(() => ({ select: vi.fn(), limit: vi.fn() })),
  rpc: vi.fn(),
  auth: { getSession: vi.fn() },
};
vi.mock('@/lib/supabase', () => ({ supabase: mockSupabase }));
import * as SupabaseModule from '@/lib/supabase';
import type { PatientFormData } from '@/types/patient';
import { PatientService } from '@/services/patientService';

describe('PatientService.create - verificação de schema e inserção', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const formData: PatientFormData = {
    full_name: 'Teste',
    cpf: '12345678901',
    birth_date: '1990-01-01',
    gender: 'masculino',
    phone: '11999999999',
    email: 't@e.st',
    address: 'Rua X',
    city: 'SP',
    state: 'SP',
    zip_code: '01000-000',
    specialty: 'Curativos',
    consent_data_processing: true,
    consent_whatsapp: false,
    consent_email: false,
  };

  it('usa RPC quando há colunas faltantes e retorna paciente', async () => {
    // Simular geração de MRN
    vi.spyOn(PatientService, 'generateMRN').mockResolvedValue('MRN-123');

    // from.select para detectar coluna ausente
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: { code: '42703', message: 'column mrn does not exist' } }),
      limit: vi.fn(),
    });

    // rpc para realizar operação atômica
    const mockRpc = vi.fn().mockResolvedValue({
      data: { id: 'uuid', full_name: 'Teste', specialty: 'Curativos' },
      error: null,
    });

    // @ts-expect-error: Mocking supabase module shape for test environment
    SupabaseModule.supabase = { from: mockFrom, rpc: mockRpc, auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u' } } } }) } } as unknown;

    const res = await PatientService.create(formData);
    expect(res.full_name).toBe('Teste');
    expect(mockRpc).toHaveBeenCalled();
  });

  it('retorna erro claro quando RPC falha com colunas faltantes', async () => {
    vi.spyOn(PatientService, 'generateMRN').mockResolvedValue('MRN-123');
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: { code: '42703', message: 'column mrn does not exist' } }),
      limit: vi.fn(),
    });
    const mockRpc = vi.fn().mockResolvedValue({ data: null, error: { message: 'function missing' } });
    // @ts-expect-error: Mocking supabase module shape for test environment
    SupabaseModule.supabase = { from: mockFrom, rpc: mockRpc, auth: { getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'u' } } } }) } } as unknown;

    await expect(PatientService.create(formData)).rejects.toThrow(/faltam \[mrn\]/);
  });
});
