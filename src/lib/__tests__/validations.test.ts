import { describe, it, expect } from 'vitest';
import { 
  validateCPF, 
  validateEmail, 
  validatePhone, 
  validateCEP, 
  validateAge,
  patterns 
} from '../validations';

describe('Validações de CPF', () => {
  it('deve validar CPF correto', () => {
    expect(validateCPF('123.456.789-09')).toBe(true);
    expect(validateCPF('11144477735')).toBe(true);
  });

  it('deve rejeitar CPF inválido', () => {
    expect(validateCPF('123.456.789-00')).toBe(false);
    expect(validateCPF('111.111.111-11')).toBe(false);
    expect(validateCPF('000.000.000-00')).toBe(false);
  });

  it('deve rejeitar CPF com formato incorreto', () => {
    expect(validateCPF('123456789')).toBe(false);
    expect(validateCPF('123.456.789')).toBe(false);
    expect(validateCPF('abc.def.ghi-jk')).toBe(false);
  });
});

describe('Validações de Telefone', () => {
  it('deve validar telefone correto', () => {
    expect(validatePhone('(11) 99999-9999')).toBe(true);
    expect(validatePhone('11999999999')).toBe(true);
  });

  it('deve rejeitar telefone inválido', () => {
    expect(validatePhone('123456')).toBe(false);
    expect(validatePhone('(11) 9999-999')).toBe(false);
  });
});

describe('Validações de Email', () => {
  it('deve validar email correto', () => {
    expect(validateEmail('teste@email.com')).toBe(true);
    expect(validateEmail('usuario.teste@dominio.com.br')).toBe(true);
  });

  it('deve rejeitar email inválido', () => {
    expect(validateEmail('email-invalido')).toBe(false);
    expect(validateEmail('teste@')).toBe(false);
    expect(validateEmail('@dominio.com')).toBe(false);
  });
});

describe('Validações de CEP', () => {
  it('deve validar CEP correto', () => {
    expect(validateCEP('01234-567')).toBe(true);
    expect(validateCEP('01234567')).toBe(true);
  });

  it('deve rejeitar CEP inválido', () => {
    expect(validateCEP('1234-567')).toBe(false);
    expect(validateCEP('01234-56')).toBe(false);
    expect(validateCEP('abcde-fgh')).toBe(false);
  });
});

describe('Validações de Idade', () => {
  it('deve validar idade válida', () => {
    const birthDate = new Date('1990-01-01');
    expect(validateAge(birthDate)).toBe(true);
  });

  it('deve rejeitar idade menor que 0', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(validateAge(futureDate)).toBe(false);
  });

  it('deve rejeitar idade maior que 120', () => {
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 121);
    expect(validateAge(oldDate)).toBe(false);
  });
});

describe('Regex Patterns', () => {
  it('deve validar padrão de telefone', () => {
    expect(patterns.phone.test('(11) 99999-9999')).toBe(true);
    expect(patterns.phoneNumbers.test('11999999999')).toBe(true);
    expect(patterns.phone.test('123456')).toBe(false);
  });

  it('deve validar padrão de CEP', () => {
    expect(patterns.cep.test('01234-567')).toBe(true);
    expect(patterns.cepNumbers.test('01234567')).toBe(true);
    expect(patterns.cep.test('1234-567')).toBe(false);
  });

  it('deve validar padrão de CPF', () => {
    expect(patterns.cpf.test('123.456.789-09')).toBe(true);
    expect(patterns.cpfNumbers.test('12345678909')).toBe(true);
    expect(patterns.cpf.test('123456789')).toBe(false);
  });
});