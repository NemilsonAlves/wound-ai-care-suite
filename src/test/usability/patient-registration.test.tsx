import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PatientForm from '../../components/patients/PatientForm';

// Mock do PatientService (usar vi.hoisted para evitar erro de hoisting)
const mockPatientService = vi.hoisted(() => ({
  createPatient: vi.fn(),
  checkCpfExists: vi.fn(),
}));

vi.mock('../../services/patientService', () => ({
  PatientService: mockPatientService,
}));

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

describe('Testes de Usabilidade - Cadastro de Pacientes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatientService.checkCpfExists.mockResolvedValue(false);
  });

  describe('Experiência do Usuário - Preenchimento de Formulário', () => {
    it('deve permitir navegação por teclado entre campos', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      const nomeInput = screen.getByLabelText(/nome completo/i);
      const cpfInput = screen.getByLabelText(/cpf/i);
      const nascimentoInput = screen.getByLabelText(/data de nascimento/i);

      // Focar no primeiro campo
      nomeInput.focus();
      expect(nomeInput).toHaveFocus();

      // Navegar com Tab
      await user.tab();
      expect(cpfInput).toHaveFocus();

      await user.tab();
      expect(nascimentoInput).toHaveFocus();
    });

    it('deve aplicar máscaras automaticamente durante digitação', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      // Testar máscara do CPF em tempo real
      const cpfInput = screen.getByLabelText(/cpf/i);
      await user.type(cpfInput, '1');
      expect(cpfInput).toHaveValue('1');
      
      await user.type(cpfInput, '23');
      expect(cpfInput).toHaveValue('123');
      
      await user.type(cpfInput, '456789');
      expect(cpfInput).toHaveValue('123.456.789');
      
      await user.type(cpfInput, '09');
      expect(cpfInput).toHaveValue('123.456.789-09');
    });

    it('deve mostrar feedback visual imediato para campos inválidos', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      
      // Digitar email inválido
      await user.type(emailInput, 'email-invalido');
      await user.tab(); // Sair do campo

      // Verificar se há indicação visual de erro
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('deve permitir correção fácil de erros', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      const cpfInput = screen.getByLabelText(/cpf/i);
      
      // Digitar CPF inválido
      await user.type(cpfInput, '123.456.789-00');
      await user.tab();

      // Verificar mensagem de erro
      await waitFor(() => {
        expect(screen.getByText(/cpf inválido/i)).toBeInTheDocument();
      });

      // Corrigir o CPF
      await user.clear(cpfInput);
      await user.type(cpfInput, '123.456.789-09');
      await user.tab();

      // Verificar se erro foi removido
      await waitFor(() => {
        expect(screen.queryByText(/cpf inválido/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Fluxo Completo de Cadastro', () => {
    it('deve completar cadastro de paciente em cenário real', async () => {
      const user = userEvent.setup();
      
      mockPatientService.createPatient.mockResolvedValue({
        success: true,
        data: { id: '123' },
      });
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      // Simular preenchimento completo por usuário real
      
      // 1. Informações pessoais
      await user.type(screen.getByLabelText(/nome completo/i), 'Maria Silva Santos');
      await user.type(screen.getByLabelText(/cpf/i), '98765432100');
      await user.type(screen.getByLabelText(/data de nascimento/i), '1985-03-15');
      await user.selectOptions(screen.getByLabelText(/gênero/i), 'feminino');

      // 2. Contato
      await user.type(screen.getByLabelText(/telefone/i), '11987654321');
      await user.type(screen.getByLabelText(/email/i), 'maria.santos@email.com');

      // 3. Endereço
      await user.type(screen.getByLabelText(/endereço/i), 'Av. Paulista, 1000, Apto 101');
      await user.type(screen.getByLabelText(/cidade/i), 'São Paulo');
      await user.selectOptions(screen.getByLabelText(/estado/i), 'SP');
      await user.type(screen.getByLabelText(/cep/i), '01310100');

      // 4. Informações médicas
      await user.selectOptions(screen.getByLabelText(/especialidade/i), 'Dermatologia');
      
      // 5. Consentimentos
      await user.click(screen.getByLabelText(/processamento de dados/i));
      await user.click(screen.getByLabelText(/whatsapp/i));

      // 6. Submeter
      await user.click(screen.getByRole('button', { name: /cadastrar paciente/i }));

      // Verificar se cadastro foi realizado
      await waitFor(() => {
        expect(mockPatientService.createPatient).toHaveBeenCalledWith(
          expect.objectContaining({
            full_name: 'Maria Silva Santos',
            cpf: '987.654.321-00',
            birth_date: '1985-03-15',
            gender: 'feminino',
            phone: '(11) 98765-4321',
            email: 'maria.santos@email.com',
            address: 'Av. Paulista, 1000, Apto 101',
            city: 'São Paulo',
            state: 'SP',
            zip_code: '01310-100',
            specialty: 'Dermatologia',
            consent_data_processing: true,
            consent_whatsapp: true,
            consent_email: false,
          })
        );
      });
    });

    it('deve lidar com interrupções no fluxo de cadastro', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      // Preencher parcialmente
      await user.type(screen.getByLabelText(/nome completo/i), 'João Interrompido');
      await user.type(screen.getByLabelText(/cpf/i), '12345678909');

      // Simular saída do campo (usuário pode ter sido interrompido)
      const nomeInput = screen.getByLabelText(/nome completo/i);
      nomeInput.blur();

      // Verificar se dados permanecem
      expect(nomeInput).toHaveValue('João Interrompido');
      expect(screen.getByLabelText(/cpf/i)).toHaveValue('123.456.789-09');
    });
  });

  describe('Acessibilidade e Inclusão', () => {
    it('deve ter labels apropriados para leitores de tela', () => {
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      // Verificar se todos os campos têm labels associados
      const campos = [
        /nome completo/i,
        /cpf/i,
        /data de nascimento/i,
        /gênero/i,
        /telefone/i,
        /email/i,
        /endereço/i,
        /cidade/i,
        /estado/i,
        /cep/i,
        /especialidade/i,
      ];

      campos.forEach(campo => {
        const input = screen.getByLabelText(campo);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAccessibleName();
      });
    });

    it('deve indicar campos obrigatórios claramente', () => {
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      // Verificar se campos obrigatórios têm indicação visual
      const camposObrigatorios = [
        screen.getByLabelText(/nome completo/i),
        screen.getByLabelText(/cpf/i),
        screen.getByLabelText(/data de nascimento/i),
      ];

      camposObrigatorios.forEach(campo => {
        expect(campo).toHaveAttribute('required');
      });
    });

    it('deve ter contraste adequado para mensagens de erro', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      // Gerar erro de validação
      await user.click(screen.getByRole('button', { name: /cadastrar paciente/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText(/nome completo é obrigatório/i);
        expect(errorMessage).toBeInTheDocument();
        
        // Verificar se tem classe de erro (assumindo que há estilização apropriada)
        expect(errorMessage).toHaveClass(expect.stringMatching(/error|danger|red/i));
      });
    });
  });

  describe('Performance e Responsividade', () => {
    it('deve responder rapidamente a interações do usuário', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      const startTime = performance.now();
      
      // Simular digitação rápida
      await user.type(screen.getByLabelText(/nome completo/i), 'Teste Performance');
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Verificar se resposta foi rápida (menos de 100ms para digitação)
      expect(responseTime).toBeLessThan(100);
    });

    it('deve manter estado durante redimensionamento', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <PatientForm />
        </TestWrapper>
      );

      // Preencher dados
      await user.type(screen.getByLabelText(/nome completo/i), 'Teste Responsivo');
      await user.type(screen.getByLabelText(/cpf/i), '12345678909');

      // Simular redimensionamento (mudança de viewport)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768, // Tablet size
      });

      window.dispatchEvent(new Event('resize'));

      // Verificar se dados permanecem
      expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Teste Responsivo');
      expect(screen.getByLabelText(/cpf/i)).toHaveValue('123.456.789-09');
    });
  });
});
