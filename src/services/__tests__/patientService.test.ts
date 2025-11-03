import { describe, it, expect, vi } from 'vitest';

// Mock simples do Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn(),
    })),
  },
}));

import { PatientService } from '../patientService';

describe('PatientService', () => {
  describe('checkCpfExists', () => {
    it('deve ser uma função', () => {
      expect(typeof PatientService.checkCpfExists).toBe('function');
    });
  });

  describe('create', () => {
    it('deve ser uma função', () => {
      expect(typeof PatientService.create).toBe('function');
    });
  });

  describe('getById', () => {
    it('deve ser uma função', () => {
      expect(typeof PatientService.getById).toBe('function');
    });
  });

  describe('update', () => {
    it('deve ser uma função', () => {
      expect(typeof PatientService.update).toBe('function');
    });
  });

  describe('getAll', () => {
    it('deve ser uma função', () => {
      expect(typeof PatientService.getAll).toBe('function');
    });
  });

  describe('delete', () => {
    it('deve ser uma função', () => {
      expect(typeof PatientService.delete).toBe('function');
    });
  });
});