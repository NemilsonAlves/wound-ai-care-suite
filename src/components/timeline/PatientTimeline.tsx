import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Camera, Stethoscope, Phone, MessageSquare, Filter, Search } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'appointment' | 'evolution' | 'consent' | 'photo' | 'call' | 'message' | 'exam';
  title: string;
  description: string;
  date: Date;
  user: string;
  specialty?: string;
  attachments?: {
    type: 'photo' | 'document' | 'audio';
    url: string;
    name: string;
  }[];
  metadata?: any;
}

interface PatientTimelineProps {
  patientId: string;
  patientName: string;
}

const PatientTimeline: React.FC<PatientTimelineProps> = ({ patientId, patientName }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockEvents: TimelineEvent[] = [
      {
        id: '1',
        type: 'appointment',
        title: 'Consulta Inicial - Curativos',
        description: 'Primeira consulta para avaliação de ferida no pé direito',
        date: new Date('2024-01-15T09:00:00'),
        user: 'Dr. João Silva',
        specialty: 'Curativos',
        metadata: {
          duration: 60,
          status: 'completed'
        }
      },
      {
        id: '2',
        type: 'photo',
        title: 'Fotos Iniciais',
        description: 'Documentação fotográfica da lesão inicial',
        date: new Date('2024-01-15T09:30:00'),
        user: 'Dr. João Silva',
        attachments: [
          { type: 'photo', url: '/mock-photo1.jpg', name: 'Lesão inicial - vista frontal' },
          { type: 'photo', url: '/mock-photo2.jpg', name: 'Lesão inicial - vista lateral' }
        ]
      },
      {
        id: '3',
        type: 'consent',
        title: 'Consentimento Digital',
        description: 'Consentimento para tratamento e uso de imagens assinado digitalmente',
        date: new Date('2024-01-15T10:00:00'),
        user: 'Maria Santos (Paciente)',
        metadata: {
          consentTypes: ['treatment', 'photography'],
          hash: 'a1b2c3d4e5f6...'
        }
      },
      {
        id: '4',
        type: 'evolution',
        title: 'Primeira Evolução',
        description: 'Limpeza da ferida, aplicação de curativo com hidrogel. Área: 3x2cm, profundidade parcial.',
        date: new Date('2024-01-22T14:00:00'),
        user: 'Enf. Ana Costa',
        specialty: 'Curativos',
        attachments: [
          { type: 'photo', url: '/mock-evolution1.jpg', name: 'Após limpeza - 1ª semana' }
        ],
        metadata: {
          painLevel: 4,
          area: '3x2cm',
          depth: 'parcial'
        }
      },
      {
        id: '5',
        type: 'call',
        title: 'Ligação de Acompanhamento',
        description: 'Paciente relatou melhora da dor, sem sinais de infecção',
        date: new Date('2024-01-25T16:30:00'),
        user: 'Enf. Ana Costa',
        metadata: {
          duration: 5,
          outcome: 'positive'
        }
      },
      {
        id: '6',
        type: 'message',
        title: 'Mensagem WhatsApp',
        description: 'Paciente enviou foto da ferida, questionando sobre vermelhidão',
        date: new Date('2024-01-28T19:45:00'),
        user: 'Maria Santos (Paciente)',
        attachments: [
          { type: 'photo', url: '/mock-patient-photo.jpg', name: 'Foto enviada pelo paciente' }
        ]
      },
      {
        id: '7',
        type: 'evolution',
        title: 'Segunda Evolução',
        description: 'Redução significativa da área da lesão. Tecido de granulação saudável.',
        date: new Date('2024-01-29T10:00:00'),
        user: 'Dr. João Silva',
        specialty: 'Curativos',
        attachments: [
          { type: 'photo', url: '/mock-evolution2.jpg', name: 'Evolução - 2ª semana' }
        ],
        metadata: {
          painLevel: 2,
          area: '2x1cm',
          depth: 'superficial'
        }
      },
      {
        id: '8',
        type: 'exam',
        title: 'Exame Laboratorial',
        description: 'Cultura da ferida - resultado negativo para bactérias patogênicas',
        date: new Date('2024-02-01T08:00:00'),
        user: 'Lab. Central',
        attachments: [
          { type: 'document', url: '/mock-lab-result.pdf', name: 'Resultado da cultura' }
        ]
      }
    ];

    setEvents(mockEvents.sort((a, b) => b.date.getTime() - a.date.getTime()));
  }, [patientId]);

  // Filtrar eventos
  useEffect(() => {
    let filtered = events;

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por data
    if (dateRange.start) {
      filtered = filtered.filter(event => event.date >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(event => event.date <= new Date(dateRange.end));
    }

    setFilteredEvents(filtered);
  }, [events, filterType, searchTerm, dateRange]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'evolution':
        return <Stethoscope className="w-5 h-5 text-green-600" />;
      case 'consent':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'photo':
        return <Camera className="w-5 h-5 text-orange-600" />;
      case 'call':
        return <Phone className="w-5 h-5 text-indigo-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-pink-600" />;
      case 'exam':
        return <FileText className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'border-blue-200 bg-blue-50';
      case 'evolution':
        return 'border-green-200 bg-green-50';
      case 'consent':
        return 'border-purple-200 bg-purple-50';
      case 'photo':
        return 'border-orange-200 bg-orange-50';
      case 'call':
        return 'border-indigo-200 bg-indigo-50';
      case 'message':
        return 'border-pink-200 bg-pink-50';
      case 'exam':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportTimeline = () => {
    const data = filteredEvents.map(event => ({
      Data: formatDate(event.date),
      Tipo: event.type,
      Título: event.title,
      Descrição: event.description,
      Usuário: event.user,
      Especialidade: event.specialty || 'N/A'
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-${patientName}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timeline do Paciente</h2>
          <p className="text-gray-600">{patientName}</p>
        </div>
        <button
          onClick={exportTimeline}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Exportar Timeline
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Evento
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              <option value="appointment">Consultas</option>
              <option value="evolution">Evoluções</option>
              <option value="consent">Consentimentos</option>
              <option value="photo">Fotos</option>
              <option value="call">Ligações</option>
              <option value="message">Mensagens</option>
              <option value="exam">Exames</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            {filteredEvents.length} evento(s) encontrado(s)
          </p>
          <button
            onClick={() => {
              setFilterType('all');
              setSearchTerm('');
              setDateRange({ start: '', end: '' });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative flex items-start">
              {/* Ícone do evento */}
              <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white border-2 border-gray-200 rounded-full">
                {getEventIcon(event.type)}
              </div>

              {/* Conteúdo do evento */}
              <div className={`ml-6 flex-1 p-4 rounded-lg border ${getEventColor(event.type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {event.user}
                      </span>
                      {event.specialty && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {event.specialty}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{event.description}</p>

                {/* Metadados específicos */}
                {event.metadata && (
                  <div className="bg-white bg-opacity-50 rounded p-3 mb-3">
                    {event.type === 'evolution' && event.metadata.painLevel !== undefined && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <span><strong>Dor:</strong> {event.metadata.painLevel}/10</span>
                        {event.metadata.area && <span><strong>Área:</strong> {event.metadata.area}</span>}
                        {event.metadata.depth && <span><strong>Profundidade:</strong> {event.metadata.depth}</span>}
                      </div>
                    )}
                    {event.type === 'appointment' && (
                      <div className="text-sm">
                        <span><strong>Duração:</strong> {event.metadata.duration} min</span>
                        <span className="ml-4"><strong>Status:</strong> {event.metadata.status}</span>
                      </div>
                    )}
                    {event.type === 'call' && (
                      <div className="text-sm">
                        <span><strong>Duração:</strong> {event.metadata.duration} min</span>
                        <span className="ml-4"><strong>Resultado:</strong> {event.metadata.outcome}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Anexos */}
                {event.attachments && event.attachments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Anexos:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {event.attachments.map((attachment, idx) => (
                        <div key={idx} className="bg-white rounded border p-2">
                          {attachment.type === 'photo' ? (
                            <div className="aspect-square bg-gray-100 rounded mb-1 flex items-center justify-center">
                              <Camera className="w-6 h-6 text-gray-400" />
                            </div>
                          ) : (
                            <div className="aspect-square bg-gray-100 rounded mb-1 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <p className="text-xs text-gray-600 truncate">{attachment.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum evento encontrado para os filtros aplicados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientTimeline;