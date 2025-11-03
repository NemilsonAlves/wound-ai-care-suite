import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Phone, Calendar, Bell } from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  type: 'reminder' | 'confirmation' | 'follow_up' | 'manual';
  message: string;
  scheduledFor: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  appointmentId?: string;
  response?: string;
  responseAt?: Date;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: 'reminder' | 'confirmation' | 'follow_up';
  template: string;
  variables: string[];
}

const WhatsAppIntegration: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [scheduledTime, setScheduledTime] = useState('');
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'templates'>('send');

  // Mock data
  useEffect(() => {
    const mockTemplates: MessageTemplate[] = [
      {
        id: '1',
        name: 'Lembrete de Consulta',
        type: 'reminder',
        template: 'Olá {nome}! Lembramos que você tem consulta marcada para {data} às {hora} com {medico}. Confirme sua presença respondendo SIM. Clínica Pele & Saúde.',
        variables: ['nome', 'data', 'hora', 'medico']
      },
      {
        id: '2',
        name: 'Confirmação de Agendamento',
        type: 'confirmation',
        template: 'Olá {nome}! Sua consulta foi agendada para {data} às {hora} com {medico}. Endereço: {endereco}. Em caso de dúvidas, entre em contato.',
        variables: ['nome', 'data', 'hora', 'medico', 'endereco']
      },
      {
        id: '3',
        name: 'Acompanhamento Pós-Consulta',
        type: 'follow_up',
        template: 'Olá {nome}! Como você está se sentindo após a consulta de {data}? Se tiver alguma dúvida ou preocupação, não hesite em nos contatar.',
        variables: ['nome', 'data']
      },
      {
        id: '4',
        name: 'Lembrete de Medicação',
        type: 'follow_up',
        template: 'Olá {nome}! Lembre-se de tomar sua medicação {medicamento} conforme orientado. Qualquer reação adversa, entre em contato imediatamente.',
        variables: ['nome', 'medicamento']
      },
      {
        id: '5',
        name: 'Reagendamento',
        type: 'confirmation',
        template: 'Olá {nome}! Sua consulta foi reagendada para {nova_data} às {nova_hora}. Pedimos desculpas pelo inconveniente.',
        variables: ['nome', 'nova_data', 'nova_hora']
      }
    ];

    const mockMessages: WhatsAppMessage[] = [
      {
        id: '1',
        patientId: '1',
        patientName: 'Maria Santos',
        phone: '+5511999999999',
        type: 'reminder',
        message: 'Olá Maria! Lembramos que você tem consulta marcada para 15/01/2024 às 09:00 com Dr. João Silva. Confirme sua presença respondendo SIM.',
        scheduledFor: new Date('2024-01-14T18:00:00'),
        sentAt: new Date('2024-01-14T18:00:00'),
        status: 'read',
        response: 'SIM',
        responseAt: new Date('2024-01-14T18:30:00')
      },
      {
        id: '2',
        patientId: '2',
        patientName: 'João Oliveira',
        phone: '+5511888888888',
        type: 'confirmation',
        message: 'Olá João! Sua consulta foi agendada para 16/01/2024 às 14:00 com Dra. Ana Costa.',
        scheduledFor: new Date('2024-01-15T10:00:00'),
        sentAt: new Date('2024-01-15T10:00:00'),
        status: 'delivered'
      },
      {
        id: '3',
        patientId: '3',
        patientName: 'Ana Silva',
        phone: '+5511777777777',
        type: 'follow_up',
        message: 'Olá Ana! Como você está se sentindo após a consulta de 10/01/2024?',
        scheduledFor: new Date('2024-01-12T16:00:00'),
        status: 'pending'
      }
    ];

    setTemplates(mockTemplates);
    setMessages(mockMessages);
  }, []);

  const mockPatients = [
    { id: '1', name: 'Maria Santos', phone: '+5511999999999' },
    { id: '2', name: 'João Oliveira', phone: '+5511888888888' },
    { id: '3', name: 'Ana Silva', phone: '+5511777777777' },
    { id: '4', name: 'Carlos Ferreira', phone: '+5511666666666' }
  ];

  const sendMessage = () => {
    if (!customMessage && !selectedTemplate) {
      alert('Selecione um template ou digite uma mensagem personalizada.');
      return;
    }

    if (selectedPatients.length === 0) {
      alert('Selecione pelo menos um paciente.');
      return;
    }

    const messageText = selectedTemplate 
      ? templates.find(t => t.id === selectedTemplate)?.template || customMessage
      : customMessage;

    selectedPatients.forEach(patientId => {
      const patient = mockPatients.find(p => p.id === patientId);
      if (patient) {
        const newMessage: WhatsAppMessage = {
          id: Date.now().toString() + Math.random(),
          patientId: patient.id,
          patientName: patient.name,
          phone: patient.phone,
          type: 'manual',
          message: messageText.replace('{nome}', patient.name),
          scheduledFor: scheduledTime ? new Date(scheduledTime) : new Date(),
          status: 'pending'
        };

        setMessages(prev => [newMessage, ...prev]);
      }
    });

    // Reset form
    setCustomMessage('');
    setSelectedTemplate('');
    setSelectedPatients([]);
    setScheduledTime('');
    
    alert('Mensagens agendadas com sucesso!');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'read':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'sent': return 'Enviado';
      case 'delivered': return 'Entregue';
      case 'read': return 'Lido';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'confirmation': return 'bg-green-100 text-green-800';
      case 'follow_up': return 'bg-purple-100 text-purple-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'reminder': return 'Lembrete';
      case 'confirmation': return 'Confirmação';
      case 'follow_up': return 'Acompanhamento';
      case 'manual': return 'Manual';
      default: return type;
    }
  };

  const createTemplate = () => {
    const name = prompt('Nome do template:');
    const template = prompt('Conteúdo do template (use {variavel} para variáveis):');
    
    if (name && template) {
      const variables = template.match(/{([^}]+)}/g)?.map(v => v.slice(1, -1)) || [];
      
      const newTemplate: MessageTemplate = {
        id: Date.now().toString(),
        name,
        type: 'manual',
        template,
        variables
      };

      setTemplates(prev => [...prev, newTemplate]);
    }
  };

  const scheduleAutomaticReminders = () => {
    // Simular agendamento automático de lembretes
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const reminderMessage: WhatsAppMessage = {
      id: Date.now().toString(),
      patientId: '1',
      patientName: 'Maria Santos',
      phone: '+5511999999999',
      type: 'reminder',
      message: 'Olá Maria! Lembramos que você tem consulta marcada para amanhã às 09:00 com Dr. João Silva.',
      scheduledFor: tomorrow,
      status: 'pending'
    };

    setMessages(prev => [reminderMessage, ...prev]);
    alert('Lembretes automáticos configurados!');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Business</h2>
          <p className="text-gray-600">Confirmações e lembretes automáticos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={scheduleAutomaticReminders}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Lembretes Automáticos
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('send')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Enviar Mensagem
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Histórico
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Templates
          </button>
        </nav>
      </div>

      {/* Enviar Mensagem */}
      {activeTab === 'send' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Nova Mensagem</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Template
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    const template = templates.find(t => t.id === e.target.value);
                    setCustomMessage(template?.template || '');
                  }
                }}
              >
                <option value="">Selecione um template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem Personalizada
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Digite sua mensagem ou selecione um template acima..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Pacientes
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
                {mockPatients.map(patient => (
                  <label key={patient.id} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPatients(prev => [...prev, patient.id]);
                        } else {
                          setSelectedPatients(prev => prev.filter(id => id !== patient.id));
                        }
                      }}
                    />
                    <span className="text-sm">{patient.name} - {patient.phone}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agendar Envio (Opcional)
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={sendMessage}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {scheduledTime ? 'Agendar Envio' : 'Enviar Agora'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Histórico */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Histórico de Mensagens</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {messages.map(message => (
              <div key={message.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{message.patientName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(message.type)}`}>
                        {getTypeText(message.type)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="text-sm text-gray-600">{getStatusText(message.status)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{message.phone}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Agendado: {message.scheduledFor.toLocaleString('pt-BR')}</div>
                    {message.sentAt && (
                      <div>Enviado: {message.sentAt.toLocaleString('pt-BR')}</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-gray-800">{message.message}</p>
                </div>

                {message.response && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-3">
                    <div className="flex justify-between items-center">
                      <p className="text-green-800"><strong>Resposta:</strong> {message.response}</p>
                      <span className="text-sm text-green-600">
                        {message.responseAt?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma mensagem enviada ainda.</p>
            </div>
          )}
        </div>
      )}

      {/* Templates */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Templates de Mensagem</h3>
            <button
              onClick={createTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Novo Template
            </button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {templates.map(template => (
              <div key={template.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs ${getTypeColor(template.type)}`}>
                      {getTypeText(template.type)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-gray-800">{template.template}</p>
                </div>

                {template.variables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Variáveis disponíveis:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map(variable => (
                        <span key={variable} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {`{${variable}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppIntegration;