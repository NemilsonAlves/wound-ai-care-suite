// Mock service para demonstração de pacientes
export interface MockPatient {
  id: string;
  full_name: string;
  email?: string;
  cpf: string;
  birth_date: string;
  phone: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  medications?: string;
  status: 'active' | 'inactive';
  specialties?: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

const defaultMockPatients: MockPatient[] = [
  {
    id: '1',
    full_name: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    cpf: '123.456.789-01',
    birth_date: '1975-03-15',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    emergency_contact: 'João Silva - (11) 99999-8888',
    medical_history: 'Diabetes tipo 2, Hipertensão',
    allergies: 'Penicilina',
    medications: 'Metformina, Losartana',
    status: 'active',
    specialties: ['dermatology'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    full_name: 'João Carlos Oliveira',
    email: 'joao.carlos@email.com',
    cpf: '987.654.321-09',
    birth_date: '1982-07-22',
    phone: '(11) 97654-3210',
    address: 'Av. Paulista, 456 - São Paulo, SP',
    emergency_contact: 'Ana Oliveira - (11) 88888-7777',
    medical_history: 'Úlcera venosa crônica',
    allergies: 'Látex',
    medications: 'Diosmina, Hesperidina',
    status: 'active',
    specialties: ['wound_care'],
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    full_name: 'Ana Paula Costa',
    email: 'ana.costa@email.com',
    cpf: '456.789.123-45',
    birth_date: '1990-11-08',
    phone: '(11) 96543-2109',
    address: 'Rua Augusta, 789 - São Paulo, SP',
    emergency_contact: 'Carlos Costa - (11) 77777-6666',
    medical_history: 'Queimadura de 2º grau em recuperação',
    allergies: 'Nenhuma conhecida',
    medications: 'Sulfadiazina de prata',
    status: 'active',
    specialties: ['surgery'],
    created_at: '2024-01-05T09:15:00Z',
    updated_at: '2024-01-05T09:15:00Z'
  },
  {
    id: '4',
    full_name: 'Roberto Ferreira Lima',
    email: 'roberto.lima@email.com',
    cpf: '789.123.456-78',
    birth_date: '1968-05-30',
    phone: '(11) 95432-1098',
    address: 'Rua da Consolação, 321 - São Paulo, SP',
    emergency_contact: 'Maria Lima - (11) 66666-5555',
    medical_history: 'Úlcera por pressão, Diabetes',
    allergies: 'Iodo',
    medications: 'Insulina, Papaína',
    status: 'active',
    specialties: ['wound_care', 'dermatology'],
    created_at: '2024-01-01T16:45:00Z',
    updated_at: '2024-01-01T16:45:00Z'
  },
  {
    id: '5',
    full_name: 'Carmen Rodriguez',
    email: 'carmen.rodriguez@email.com',
    cpf: '321.654.987-12',
    birth_date: '1955-12-12',
    phone: '(11) 94321-0987',
    address: 'Rua Liberdade, 654 - São Paulo, SP',
    emergency_contact: 'Pedro Rodriguez - (11) 55555-4444',
    medical_history: 'Pós-operatório de cirurgia plástica',
    allergies: 'Aspirina',
    medications: 'Dipirona, Omeprazol',
    status: 'inactive',
    specialties: ['surgery'],
    created_at: '2023-12-20T11:20:00Z',
    updated_at: '2023-12-20T11:20:00Z'
  }
];

// Funções para persistência local
const STORAGE_KEY = 'wound-ai-mock-patients';

const loadPatientsFromStorage = (): MockPatient[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedPatients = JSON.parse(stored);
      console.log('📦 Pacientes carregados do localStorage:', parsedPatients.length);
      return parsedPatients;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar pacientes do localStorage:', error);
  }
  
  console.log('📦 Usando pacientes padrão (primeira vez)');
  return [...defaultMockPatients];
};

const savePatientsToStorage = (patients: MockPatient[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    console.log('💾 Pacientes salvos no localStorage:', patients.length);
  } catch (error) {
    console.error('❌ Erro ao salvar pacientes no localStorage:', error);
  }
};

// Array de pacientes com persistência
const mockPatients: MockPatient[] = loadPatientsFromStorage();

export class MockPatientService {
  static async getAll(): Promise<MockPatient[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPatients.filter(p => p.status === 'active');
  }

  static async getById(id: string): Promise<MockPatient | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPatients.find(p => p.id === id) || null;
  }

  static async search(query: string): Promise<MockPatient[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const lowercaseQuery = query.toLowerCase();
    return mockPatients.filter(p => 
      p.full_name.toLowerCase().includes(lowercaseQuery) ||
      p.email?.toLowerCase().includes(lowercaseQuery) ||
      p.cpf.includes(query)
    );
  }

  static async getBySpecialty(specialty: string): Promise<MockPatient[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockPatients.filter(p => 
      p.specialties?.includes(specialty)
    );
  }

  static async create(patient: Partial<MockPatient>): Promise<MockPatient> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const newPatient: MockPatient = {
      id: Date.now().toString(),
      full_name: patient.full_name || '',
      email: patient.email,
      cpf: patient.cpf || '',
      birth_date: patient.birth_date || '',
      phone: patient.phone || '',
      address: patient.address,
      emergency_contact: patient.emergency_contact,
      medical_history: patient.medical_history,
      allergies: patient.allergies,
      medications: patient.medications,
      status: 'active',
      specialties: patient.specialties || [],
      avatar_url: patient.avatar_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockPatients.push(newPatient);
    savePatientsToStorage(mockPatients); // Salvar no localStorage
    console.log('✅ Paciente criado e salvo:', newPatient.full_name);
    return newPatient;
  }

  static async update(id: string, updates: Partial<MockPatient>): Promise<MockPatient> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Paciente não encontrado');
    
    mockPatients[index] = {
      ...mockPatients[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    savePatientsToStorage(mockPatients); // Salvar no localStorage
    console.log('✅ Paciente atualizado e salvo:', mockPatients[index].full_name);
    return mockPatients[index];
  }

  static async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Paciente não encontrado');
    
    const deletedPatient = mockPatients[index];
    mockPatients.splice(index, 1);
    savePatientsToStorage(mockPatients); // Salvar no localStorage
    console.log('✅ Paciente removido e salvo:', deletedPatient.full_name);
  }
}
