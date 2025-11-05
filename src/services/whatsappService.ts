// Serviço de integração com WhatsApp usando Evolution API
interface WhatsAppMessage {
  number: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'audio' | 'video';
  fileName?: string;
}

interface WhatsAppContact {
  name: string;
  number: string;
}

interface AppointmentReminder {
  patientName: string;
  patientPhone: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  location?: string;
}

interface WoundUpdateNotification {
  patientName: string;
  patientPhone: string;
  woundType: string;
  updateType: 'evolution' | 'photo' | 'report';
  details: string;
}

class WhatsAppService {
  private baseUrl: string;
  private instanceName: string;
  private apiKey: string;

  constructor(opts?: { baseUrl?: string; instanceName?: string; apiKey?: string }) {
    this.baseUrl = opts?.baseUrl || (import.meta.env.VITE_EVOLUTION_API_URL as string) || 'http://localhost:8080';
    this.instanceName = opts?.instanceName || (import.meta.env.VITE_EVOLUTION_INSTANCE as string) || 'wound-care-instance';
    this.apiKey = opts?.apiKey || (import.meta.env.VITE_EVOLUTION_API_KEY as string) || '';
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/connectionState/${this.instanceName}`, {
        headers: {
          'apikey': this.apiKey
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.instance?.state === 'open';
      }
      return false;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      return false;
    }
  }

  // Enviar mensagem de texto
  async sendTextMessage(number: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: this.formatPhoneNumber(number),
          text: message
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.key?.id !== undefined;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  // Enviar mídia (imagem, documento, etc.)
  async sendMediaMessage(messageData: WhatsAppMessage): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/message/sendMedia/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: this.formatPhoneNumber(messageData.number),
          mediatype: messageData.mediaType || 'image',
          media: messageData.mediaUrl,
          caption: messageData.message,
          fileName: messageData.fileName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.key?.id !== undefined;
    } catch (error) {
      console.error('Erro ao enviar mídia WhatsApp:', error);
      return false;
    }
  }

  // Formatar número de telefone para padrão internacional
  private formatPhoneNumber(number: string): string {
    // Remove todos os caracteres não numéricos
    const cleanNumber = number.replace(/\D/g, '');
    
    // Se o número não começar com código do país, adiciona +55 (Brasil)
    if (!cleanNumber.startsWith('55') && cleanNumber.length === 11) {
      return `55${cleanNumber}`;
    }
    
    return cleanNumber;
  }

  // Enviar lembrete de consulta
  async sendAppointmentReminder(reminder: AppointmentReminder): Promise<boolean> {
    const message = `🏥 *Lembrete de Consulta - Central de Pele AI*

Olá, ${reminder.patientName}! 

📅 Você tem uma consulta agendada:
👨‍⚕️ Médico: Dr(a). ${reminder.doctorName}
📅 Data: ${reminder.appointmentDate}
⏰ Horário: ${reminder.appointmentTime}
${reminder.location ? `📍 Local: ${reminder.location}` : ''}

Por favor, chegue com 15 minutos de antecedência.

Em caso de dúvidas, entre em contato conosco.

*Central de Pele AI - Cuidando da sua saúde* 🩺`;

    return await this.sendTextMessage(reminder.patientPhone, message);
  }

  // Enviar notificação de atualização de ferida
  async sendWoundUpdateNotification(notification: WoundUpdateNotification): Promise<boolean> {
    let message = `🔔 *Atualização - Central de Pele AI*

Olá, ${notification.patientName}!

`;

    switch (notification.updateType) {
      case 'evolution':
        message += `📈 Nova evolução registrada para sua ${notification.woundType}:
${notification.details}`;
        break;
      case 'photo':
        message += `📸 Nova foto adicionada para sua ${notification.woundType}:
${notification.details}`;
        break;
      case 'report':
        message += `📋 Novo relatório disponível para sua ${notification.woundType}:
${notification.details}`;
        break;
    }

    message += `

Acesse o portal do paciente para mais detalhes: ${window.location.origin}/portal

*Central de Pele AI - Cuidando da sua saúde* 🩺`;

    return await this.sendTextMessage(notification.patientPhone, message);
  }

  // Enviar confirmação de pagamento
  async sendPaymentConfirmation(patientName: string, patientPhone: string, paymentDetails: {
    amount: number;
    description: string;
    paymentId: string;
  }): Promise<boolean> {
    const message = `✅ *Pagamento Confirmado - Central de Pele AI*

Olá, ${patientName}!

Seu pagamento foi processado com sucesso:

💰 Valor: R$ ${paymentDetails.amount.toFixed(2)}
📝 Descrição: ${paymentDetails.description}
🔢 ID do Pagamento: ${paymentDetails.paymentId}

Obrigado por escolher a Central de Pele AI!

*Central de Pele AI - Cuidando da sua saúde* 🩺`;

    return await this.sendTextMessage(patientPhone, message);
  }

  // Enviar mensagem de boas-vindas
  async sendWelcomeMessage(patientName: string, patientPhone: string): Promise<boolean> {
    const message = `🎉 *Bem-vindo(a) à Central de Pele AI!*

Olá, ${patientName}!

Seja bem-vindo(a) à nossa plataforma de cuidados com feridas! 

🔹 Acesse seu portal: ${window.location.origin}/portal
🔹 Acompanhe sua evolução
🔹 Visualize seus relatórios
🔹 Receba lembretes automáticos

Estamos aqui para cuidar da sua saúde! 

Em caso de dúvidas, responda esta mensagem.

*Central de Pele AI - Cuidando da sua saúde* 🩺`;

    return await this.sendTextMessage(patientPhone, message);
  }

  // Enviar alerta de emergência
  async sendEmergencyAlert(patientName: string, patientPhone: string, alertType: string, details: string): Promise<boolean> {
    const message = `🚨 *ALERTA MÉDICO - Central de Pele AI*

${patientName}, detectamos uma situação que requer atenção:

⚠️ Tipo: ${alertType}
📋 Detalhes: ${details}

🏥 RECOMENDAÇÃO: Procure atendimento médico imediatamente ou entre em contato com seu médico.

📞 Em caso de emergência, ligue 192 (SAMU)

*Central de Pele AI - Cuidando da sua saúde* 🩺`;

    return await this.sendTextMessage(patientPhone, message);
  }

  // Verificar se um número está no WhatsApp
  async checkWhatsAppNumber(number: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/whatsappNumbers/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numbers: [this.formatPhoneNumber(number)]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.length > 0 && result[0].exists;
    } catch (error) {
      console.error('Erro ao verificar número WhatsApp:', error);
      return false;
    }
  }

  // Obter QR Code para conectar instância
  async getQRCode(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/connect/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.base64 || null;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      return null;
    }
  }

  // Desconectar instância
  async disconnect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/logout/${this.instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      return false;
    }
  }
}

export default new WhatsAppService();
