import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PatientForm from '../PatientForm';

// Mock do PatientService (usar vi.hoisted para evitar erro de hoisting)
const mockPatientService = vi.hoisted(() => ({
  createPatient: vi.fn(),
  checkCpfExists: vi.fn(),
  updatePatient: vi.fn(),
}));

vi.mock('../../../services/patientService', () => ({
  PatientService: mockPatientService,
}));

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Wrapper para testes
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('PatientForm - Testes de Integração', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar todos os campos obrigatórios', () => {
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    // Verificar se todos os campos obrigatórios estão presentes
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/data de nascimento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
  });

  it('deve mostrar erros de validação para campos obrigatórios vazios', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    // Tentar submeter formulário vazio
    const submitButton = screen.getByRole('button', { name: /cadastrar paciente/i });
    await user.click(submitButton);

    // Verificar se mensagens de erro aparecem
    await waitFor(() => {
      expect(screen.getByText(/nome completo é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/cpf é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/data de nascimento é obrigatória/i)).toBeInTheDocument();
    });
  });

  it('deve validar formato do CPF', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    const cpfInput = screen.getByLabelText(/cpf/i);
    
    // Inserir CPF inválido
    await user.type(cpfInput, '123.456.789-00');
    await user.tab(); // Sair do campo para trigger validação

    await waitFor(() => {
      expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
    });
  });

  it('deve verificar duplicação de CPF', async () => {
    const user = userEvent.setup();
    
    // Mock para CPF já existente
    mockPatientService.checkCpfExists.mockResolvedValue(true);
    
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    const cpfInput = screen.getByLabelText(/cpf/i);
    
    // Inserir CPF válido mas já existente
    await user.type(cpfInput, '123.456.789-09');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/cpf já cadastrado/i)).toBeInTheDocument();
    });
  });

  it('deve submeter formulário com dados válidos', async () => {
    const user = userEvent.setup();
    
    // Mock para CPF não existente e criação bem-sucedida
    mockPatientService.checkCpfExists.mockResolvedValue(false);
    mockPatientService.createPatient.mockResolvedValue({
      success: true,
      data: { id: '123' },
    });
    
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    // Preencher todos os campos obrigatórios
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
    await user.type(screen.getByLabelText(/data de nascimento/i), '1990-01-01');
    await user.selectOptions(screen.getByLabelText(/gênero/i), 'masculino');
    await user.type(screen.getByLabelText(/telefone/i), '(11) 99999-9999');
    await user.type(screen.getByLabelText(/email/i), 'joao@email.com');
    await user.type(screen.getByLabelText(/endereço/i), 'Rua das Flores, 123');
    await user.type(screen.getByLabelText(/cidade/i), 'São Paulo');
    await user.selectOptions(screen.getByLabelText(/estado/i), 'SP');
    await user.type(screen.getByLabelText(/cep/i), '01234-567');
    await user.selectOptions(screen.getByLabelText(/especialidade/i), 'Dermatologia');

    // Marcar consentimentos obrigatórios
    await user.click(screen.getByLabelText(/processamento de dados/i));

    // Submeter formulário
    await user.click(screen.getByRole('button', { name: /cadastrar paciente/i }));

    await waitFor(() => {
      expect(mockPatientService.createPatient).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'João Silva',
          cpf: '123.456.789-09',
          birth_date: '1990-01-01',
          gender: 'masculino',
          phone: '(11) 99999-9999',
          email: 'joao@email.com',
          address: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01234-567',
          specialty: 'Dermatologia',
          consent_data_processing: true,
        })
      );
    });
  });

  it('deve mostrar mensagem de erro quando criação falha', async () => {
    const user = userEvent.setup();
    
    // Mock para falha na criação
    mockPatientService.checkCpfExists.mockResolvedValue(false);
    mockPatientService.createPatient.mockResolvedValue({
      success: false,
      error: 'Erro interno do servidor',
    });
    
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    // Preencher campos mínimos e submeter
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
    await user.type(screen.getByLabelText(/data de nascimento/i), '1990-01-01');
    await user.click(screen.getByLabelText(/processamento de dados/i));
    
    await user.click(screen.getByRole('button', { name: /cadastrar paciente/i }));

    await waitFor(() => {
      expect(screen.getByText(/erro interno do servidor/i)).toBeInTheDocument();
    });
  });

  it('deve aplicar máscaras nos campos de entrada', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    // Testar máscara do CPF
    const cpfInput = screen.getByLabelText(/cpf/i);
    await user.type(cpfInput, '12345678909');
    expect(cpfInput).toHaveValue('123.456.789-09');

    // Testar máscara do telefone
    const phoneInput = screen.getByLabelText(/telefone/i);
    await user.type(phoneInput, '11999999999');
    expect(phoneInput).toHaveValue('(11) 99999-9999');

    // Testar máscara do CEP
    const cepInput = screen.getByLabelText(/cep/i);
    await user.type(cepInput, '01234567');
    expect(cepInput).toHaveValue('01234-567');
  });

  it('deve navegar para lista de pacientes após criação bem-sucedida', async () => {
    const user = userEvent.setup();
    
    mockPatientService.checkCpfExists.mockResolvedValue(false);
    mockPatientService.createPatient.mockResolvedValue({
      success: true,
      data: { id: '123' },
    });
    
    render(
      <TestWrapper>
        <PatientForm />
      </TestWrapper>
    );

    // Preencher e submeter formulário
    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/cpf/i), '123.456.789-09');
    await user.type(screen.getByLabelText(/data de nascimento/i), '1990-01-01');
    await user.click(screen.getByLabelText(/processamento de dados/i));
    
    await user.click(screen.getByRole('button', { name: /cadastrar paciente/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/patients');
    });
  });
});
