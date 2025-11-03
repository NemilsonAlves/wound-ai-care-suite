import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  User, 
  Shield, 
  Check, 
  Star,
  Zap,
  Crown,
  Building
} from 'lucide-react';
import PaymentService from '../services/paymentService';
import { useAuth } from '../contexts/AuthContext';

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const Payment: React.FC = () => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const plans: PaymentPlan[] = [
    {
      id: 'basic',
      name: 'Básico',
      price: 29.90,
      period: 'mês',
      icon: <Star className="h-6 w-6" />,
      features: [
        'Até 5 consultas por mês',
        'Acompanhamento básico de feridas',
        'Relatórios mensais',
        'Suporte por email',
        'Acesso ao portal do paciente'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 59.90,
      period: 'mês',
      popular: true,
      icon: <Zap className="h-6 w-6" />,
      features: [
        'Consultas ilimitadas',
        'Análise avançada com IA',
        'Relatórios detalhados',
        'Suporte prioritário 24/7',
        'Telemedicina incluída',
        'Histórico completo',
        'Notificações WhatsApp'
      ]
    },
    {
      id: 'enterprise',
      name: 'Empresarial',
      price: 199.90,
      period: 'mês',
      icon: <Building className="h-6 w-6" />,
      features: [
        'Tudo do Premium',
        'Múltiplos usuários (até 10)',
        'Dashboard administrativo',
        'API personalizada',
        'Treinamento da equipe',
        'Suporte dedicado',
        'Relatórios customizados',
        'Integração com sistemas'
      ]
    }
  ];

  const consultationTypes = [
    {
      id: 'online',
      name: 'Consulta Online',
      price: 89.90,
      duration: '30 min',
      description: 'Consulta por videochamada com especialista'
    },
    {
      id: 'presencial',
      name: 'Consulta Presencial',
      price: 149.90,
      duration: '45 min',
      description: 'Consulta presencial em clínica parceira'
    }
  ];

  const handlePlanPayment = async (plan: PaymentPlan) => {
    setLoading(true);
    try {
      const preference = await PaymentService.createSubscriptionPayment({
        patientId: user?.id || 'demo-user',
        planType: plan.id as 'basic' | 'premium' | 'enterprise',
        amount: plan.price,
        description: `Plano ${plan.name} - ${plan.period}`
      });

      // Redirecionar para o checkout do MercadoPago
      if (preference.init_point) {
        window.open(preference.init_point, '_blank');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationPayment = async (consultation: any) => {
    setLoading(true);
    try {
      const preference = await PaymentService.createConsultationPayment({
        patientId: user?.id || 'demo-user',
        doctorId: 'demo-doctor',
        consultationType: consultation.id,
        amount: consultation.price,
        description: consultation.description
      });

      // Redirecionar para o checkout do MercadoPago
      if (preference.init_point) {
        window.open(preference.init_point, '_blank');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Pagamentos</h1>
          <p className="text-muted-foreground">
            Escolha o plano ideal ou agende uma consulta
          </p>
        </div>

        <Tabs defaultValue="plans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans">Planos de Assinatura</TabsTrigger>
            <TabsTrigger value="consultations">Consultas Avulsas</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-2">
                      {plan.icon}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-3xl font-bold text-foreground">
                        {PaymentService.formatCurrency(plan.price)}
                      </span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handlePlanPayment(plan)}
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : 'Assinar Plano'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="consultations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {consultationTypes.map((consultation) => (
                <Card key={consultation.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      {consultation.name}
                    </CardTitle>
                    <CardDescription>{consultation.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-2xl font-bold">
                          {PaymentService.formatCurrency(consultation.price)}
                        </span>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {consultation.duration}
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleConsultationPayment(consultation)}
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : 'Agendar e Pagar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações de Pagamento</CardTitle>
                <CardDescription>
                  Seus dados estão protegidos com criptografia SSL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="card">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Cartão
                    </TabsTrigger>
                    <TabsTrigger value="pix">PIX</TabsTrigger>
                    <TabsTrigger value="boleto">Boleto</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input
                          id="cardName"
                          placeholder="João Silva"
                          value={cardData.name}
                          onChange={(e) => setCardData({...cardData, name: e.target.value})}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.number}
                          onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiry">Validade</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, '')})}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pix" className="text-center py-8">
                    <div className="space-y-4">
                      <div className="text-6xl">📱</div>
                      <h3 className="text-lg font-semibold">Pagamento via PIX</h3>
                      <p className="text-muted-foreground">
                        Após confirmar o pedido, você receberá o código PIX para pagamento
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="boleto" className="text-center py-8">
                    <div className="space-y-4">
                      <div className="text-6xl">🧾</div>
                      <h3 className="text-lg font-semibold">Boleto Bancário</h3>
                      <p className="text-muted-foreground">
                        O boleto será gerado após a confirmação do pedido
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Separator className="my-6" />

                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Pagamento seguro processado pelo MercadoPago</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Payment;