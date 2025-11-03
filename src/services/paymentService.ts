import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Configuração do MercadoPago
const client = new MercadoPagoConfig({
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
  options: {
    timeout: 5000,
    idempotencyKey: 'abc'
  }
});

export interface PaymentItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

export interface PaymentPreference {
  items: PaymentItem[];
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      street_name?: string;
      street_number?: number;
      zip_code?: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  payment_methods?: {
    excluded_payment_methods?: Array<{ id: string }>;
    excluded_payment_types?: Array<{ id: string }>;
    installments?: number;
  };
  notification_url?: string;
  statement_descriptor?: string;
  external_reference?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  date_created: string;
  date_approved?: string;
  money_release_date?: string;
  operation_type: string;
  issuer_id: string;
  payment_method_id: string;
  payment_type_id: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  description: string;
  external_reference?: string;
  payer: {
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
    type: string;
  };
}

class PaymentService {
  private payment: Payment;
  private preference: Preference;

  constructor() {
    this.payment = new Payment(client);
    this.preference = new Preference(client);
  }

  // Criar preferência de pagamento
  async createPreference(preferenceData: PaymentPreference): Promise<Record<string, unknown>> {
    try {
      const response = await this.preference.create({
        body: {
          items: preferenceData.items,
          payer: preferenceData.payer,
          back_urls: preferenceData.back_urls || {
            success: `${window.location.origin}/payment/success`,
            failure: `${window.location.origin}/payment/failure`,
            pending: `${window.location.origin}/payment/pending`
          },
          auto_return: preferenceData.auto_return || 'approved',
          payment_methods: preferenceData.payment_methods,
          notification_url: preferenceData.notification_url,
          statement_descriptor: preferenceData.statement_descriptor || 'WoundCare',
          external_reference: preferenceData.external_reference
        }
      });

      return response as Record<string, unknown>;
    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error);
      throw new Error('Falha ao criar preferência de pagamento');
    }
  }

  // Buscar status do pagamento
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await this.payment.get({ id: paymentId });
      return response as PaymentStatus;
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      throw new Error('Falha ao buscar status do pagamento');
    }
  }

  // Processar webhook do MercadoPago
  async processWebhook(data: { type?: string; data?: { id?: string } }): Promise<void> {
    try {
      if (data?.type === 'payment' && data?.data?.id) {
        const paymentId = data.data.id;
        const paymentStatus = await this.getPaymentStatus(paymentId);
        
        // Aqui você pode implementar a lógica para atualizar o status do pagamento no seu sistema
        console.log('Status do pagamento atualizado:', paymentStatus);
        
        // Exemplo: atualizar banco de dados, enviar notificações, etc.
        await this.updatePaymentInDatabase(paymentStatus);
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw new Error('Falha ao processar webhook');
    }
  }

  // Simular atualização no banco de dados
  private async updatePaymentInDatabase(paymentStatus: PaymentStatus): Promise<void> {
    // Implementar lógica para atualizar o status do pagamento no banco de dados
    console.log('Atualizando pagamento no banco de dados:', paymentStatus.id);
  }

  // Criar pagamento para consulta
  async createConsultationPayment(consultationData: {
    patientId: string;
    doctorId: string;
    consultationType: 'online' | 'presencial';
    amount: number;
    description: string;
  }): Promise<Record<string, unknown>> {
    const preferenceData: PaymentPreference = {
      items: [{
        id: `consultation-${Date.now()}`,
        title: 'Consulta Médica - WoundCare',
        description: consultationData.description,
        quantity: 1,
        unit_price: consultationData.amount,
        currency_id: 'BRL'
      }],
      external_reference: `consultation-${consultationData.patientId}-${consultationData.doctorId}`,
      statement_descriptor: 'WoundCare Consulta'
    };

    return await this.createPreference(preferenceData);
  }

  // Criar pagamento para plano de assinatura
  async createSubscriptionPayment(subscriptionData: {
    patientId: string;
    planType: 'basic' | 'premium' | 'enterprise';
    amount: number;
    description: string;
  }): Promise<Record<string, unknown>> {
    const preferenceData: PaymentPreference = {
      items: [{
        id: `subscription-${subscriptionData.planType}-${Date.now()}`,
        title: `Plano ${subscriptionData.planType.toUpperCase()} - WoundCare`,
        description: subscriptionData.description,
        quantity: 1,
        unit_price: subscriptionData.amount,
        currency_id: 'BRL'
      }],
      external_reference: `subscription-${subscriptionData.patientId}-${subscriptionData.planType}`,
      statement_descriptor: 'WoundCare Plano'
    };

    return await this.createPreference(preferenceData);
  }

  // Validar dados do cartão (para pagamentos diretos)
  validateCardData(cardData: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }): boolean {
    // Validação básica do cartão
    const cardNumber = cardData.number.replace(/\s/g, '');
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvcRegex = /^\d{3,4}$/;

    return (
      cardNumber.length >= 13 && cardNumber.length <= 19 &&
      expiryRegex.test(cardData.expiry) &&
      cvcRegex.test(cardData.cvc) &&
      cardData.name.trim().length > 0
    );
  }

  // Formatar valor monetário
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  }
}

export default new PaymentService();
