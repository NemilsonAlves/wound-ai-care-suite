-- Função RPC para verificação e correção atômica da tabela patients
-- Deve ser executada no SQL Editor do Supabase antes do uso em produção

-- Ajustar search_path e garantir privilégios de execução
CREATE OR REPLACE FUNCTION public.ensure_patients_schema_and_insert(p_data JSONB)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  cpf TEXT,
  birth_date DATE,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  current_medications TEXT,
  allergies TEXT,
  specialty TEXT,
  specialty_data JSONB,
  consent_data_processing BOOLEAN,
  consent_whatsapp BOOLEAN,
  consent_email BOOLEAN,
  mrn TEXT,
  status TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  missing_cols TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Operação atômica: criar colunas que faltam e inserir o registro
  PERFORM set_config('search_path', 'public', true);
  BEGIN
    -- Iniciar transação explícita dentro da função
    -- Nota: plpgsql executa atomically, mas usamos controle cuidadoso

    -- Checar e criar colunas, mantendo tipos e restrições
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='full_name') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN full_name TEXT NOT NULL';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='cpf') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN cpf TEXT';
      EXECUTE 'ALTER TABLE public.patients ADD CONSTRAINT patients_cpf_unique UNIQUE (cpf)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='birth_date') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN birth_date DATE';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='gender') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN gender TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='phone') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN phone TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='email') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN email TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='address') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN address TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='city') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN city TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='state') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN state TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='zip_code') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN zip_code TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='emergency_contact_name') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN emergency_contact_name TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='emergency_contact_phone') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN emergency_contact_phone TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='medical_history') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN medical_history TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='current_medications') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN current_medications TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='allergies') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN allergies TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='specialty') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN specialty TEXT NOT NULL';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='specialty_data') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN specialty_data JSONB DEFAULT ''{}''';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='consent_data_processing') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN consent_data_processing BOOLEAN NOT NULL DEFAULT false';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='consent_whatsapp') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN consent_whatsapp BOOLEAN NOT NULL DEFAULT false';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='consent_email') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN consent_email BOOLEAN NOT NULL DEFAULT false';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='mrn') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN mrn TEXT';
      EXECUTE 'ALTER TABLE public.patients ADD CONSTRAINT patients_mrn_unique UNIQUE (mrn)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='status') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN status TEXT DEFAULT ''active''';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='avatar_url') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN avatar_url TEXT';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='created_at') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='patients' AND column_name='updated_at') THEN
      EXECUTE 'ALTER TABLE public.patients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()';
    END IF;

    -- Inserir o registro
    RETURN QUERY
    INSERT INTO public.patients (
      full_name, cpf, birth_date, gender, phone, email,
      address, city, state, zip_code,
      emergency_contact_name, emergency_contact_phone,
      medical_history, current_medications, allergies,
      specialty, specialty_data,
      consent_data_processing, consent_whatsapp, consent_email,
      mrn, status, avatar_url, created_at, updated_at
    ) VALUES (
      (p_data->>'full_name'),
      (p_data->>'cpf'),
      (p_data->>'birth_date')::DATE,
      (p_data->>'gender'),
      (p_data->>'phone'),
      (p_data->>'email'),
      (p_data->>'address'),
      (p_data->>'city'),
      (p_data->>'state'),
      (p_data->>'zip_code'),
      (p_data->>'emergency_contact_name'),
      (p_data->>'emergency_contact_phone'),
      (p_data->>'medical_history'),
      (p_data->>'current_medications'),
      (p_data->>'allergies'),
      (p_data->>'specialty'),
      COALESCE(p_data->'specialty_data', '{}'::jsonb),
      COALESCE((p_data->>'consent_data_processing')::BOOLEAN, false),
      COALESCE((p_data->>'consent_whatsapp')::BOOLEAN, false),
      COALESCE((p_data->>'consent_email')::BOOLEAN, false),
      (p_data->>'mrn'),
      COALESCE((p_data->>'status'), 'active'),
      (p_data->>'avatar_url'),
      COALESCE((p_data->>'created_at')::TIMESTAMPTZ, NOW()),
      COALESCE((p_data->>'updated_at')::TIMESTAMPTZ, NOW())
    )
    RETURNING *;

  EXCEPTION WHEN OTHERS THEN
    -- Em caso de erro em qualquer passo, não persistir nada
    RAISE EXCEPTION 'Falha ao garantir schema/inserir paciente: %', SQLERRM;
  END;
END;
$$;

COMMENT ON FUNCTION public.ensure_patients_schema_and_insert IS 'Garante colunas obrigatórias da tabela patients e realiza insert de forma atômica.';

