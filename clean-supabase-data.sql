-- Script para limpar todos os dados fictícios do Supabase
-- Execute este script no SQL Editor do Supabase

-- Desabilitar verificações de chave estrangeira temporariamente
SET session_replication_role = replica;

-- Limpar dados das tabelas em ordem de dependência (das dependentes para as principais)

-- 1. Limpar logs de auditoria
DELETE FROM audit_logs;
TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE;

-- 2. Limpar notificações WhatsApp
DELETE FROM whatsapp_notifications;
TRUNCATE TABLE whatsapp_notifications RESTART IDENTITY CASCADE;

-- 3. Limpar tokens do portal do paciente
DELETE FROM patient_portal_tokens;
TRUNCATE TABLE patient_portal_tokens RESTART IDENTITY CASCADE;

-- 4. Limpar pacotes de pacientes
DELETE FROM patient_packages;
TRUNCATE TABLE patient_packages RESTART IDENTITY CASCADE;

-- 5. Limpar pacotes de tratamento
DELETE FROM treatment_packages;
TRUNCATE TABLE treatment_packages RESTART IDENTITY CASCADE;

-- 6. Limpar pagamentos
DELETE FROM payments;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;

-- 7. Limpar movimentos de inventário
DELETE FROM inventory_movements;
TRUNCATE TABLE inventory_movements RESTART IDENTITY CASCADE;

-- 8. Limpar inventário
DELETE FROM inventory;
TRUNCATE TABLE inventory RESTART IDENTITY CASCADE;

-- 9. Limpar consentimentos digitais
DELETE FROM digital_consents;
TRUNCATE TABLE digital_consents RESTART IDENTITY CASCADE;

-- 10. Limpar evoluções clínicas
DELETE FROM clinical_evolutions;
TRUNCATE TABLE clinical_evolutions RESTART IDENTITY CASCADE;

-- 11. Limpar consultas/agendamentos
DELETE FROM appointments;
TRUNCATE TABLE appointments RESTART IDENTITY CASCADE;

-- 12. Limpar pacientes
DELETE FROM patients;
TRUNCATE TABLE patients RESTART IDENTITY CASCADE;

-- 13. Limpar perfis (exceto usuários autenticados do sistema)
-- Manter apenas perfis de admin/profissionais se existirem
DELETE FROM profiles WHERE role = 'patient';

-- Reabilitar verificações de chave estrangeira
SET session_replication_role = DEFAULT;

-- Verificar se as tabelas foram limpas
SELECT 
    'patients' as tabela, COUNT(*) as registros FROM patients
UNION ALL
SELECT 
    'profiles' as tabela, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 
    'appointments' as tabela, COUNT(*) as registros FROM appointments
UNION ALL
SELECT 
    'clinical_evolutions' as tabela, COUNT(*) as registros FROM clinical_evolutions
UNION ALL
SELECT 
    'digital_consents' as tabela, COUNT(*) as registros FROM digital_consents
UNION ALL
SELECT 
    'inventory' as tabela, COUNT(*) as registros FROM inventory
UNION ALL
SELECT 
    'inventory_movements' as tabela, COUNT(*) as registros FROM inventory_movements
UNION ALL
SELECT 
    'payments' as tabela, COUNT(*) as registros FROM payments
UNION ALL
SELECT 
    'treatment_packages' as tabela, COUNT(*) as registros FROM treatment_packages
UNION ALL
SELECT 
    'patient_packages' as tabela, COUNT(*) as registros FROM patient_packages
UNION ALL
SELECT 
    'patient_portal_tokens' as tabela, COUNT(*) as registros FROM patient_portal_tokens
UNION ALL
SELECT 
    'whatsapp_notifications' as tabela, COUNT(*) as registros FROM whatsapp_notifications
UNION ALL
SELECT 
    'audit_logs' as tabela, COUNT(*) as registros FROM audit_logs;

-- Mensagem de confirmação
SELECT 'Limpeza de dados fictícios concluída com sucesso!' as status;