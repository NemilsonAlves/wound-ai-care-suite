// Mock Authentication Service for Development
export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'professional' | 'patient';
  specialty?: string;
}

export class MockAuthService {
  private static users: MockUser[] = [
    {
      id: '1',
      email: 'admin@clinica.com',
      full_name: 'Administrador Sistema',
      role: 'admin'
    },
    {
      id: '2',
      email: 'medico@clinica.com',
      full_name: 'Dr. João Silva',
      role: 'professional',
      specialty: 'Dermatologia'
    },
    {
      id: '3',
      email: 'enfermeiro@clinica.com',
      full_name: 'Enfermeira Maria Santos',
      role: 'professional',
      specialty: 'Enfermagem'
    },
    {
      id: '4',
      email: 'paciente@email.com',
      full_name: 'José da Silva',
      role: 'patient'
    }
  ];

  static authenticate(email: string, password: string): MockUser | null {
    // Simple mock authentication - any password works for demo
    const user = this.users.find(u => u.email === email);
    return user || null;
  }

  static getUsers(): MockUser[] {
    return this.users;
  }

  static getUserByEmail(email: string): MockUser | null {
    return this.users.find(u => u.email === email) || null;
  }
}