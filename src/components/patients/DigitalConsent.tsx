import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, FileCheck, Clock, User, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import crypto from 'crypto';

interface ConsentTemplate {
  id: string;
  title: string;
  content: string;
  type: 'treatment' | 'data_sharing' | 'marketing' | 'photography' | 'research';
  required: boolean;
  version: string;
}

interface DigitalConsentRecord {
  id: string;
  template_id: string;
  patient_id: string;
  consent_given: boolean;
  signed_at: Date;
  signed_by: string;
  ip_address: string;
  user_agent: string;
  hash: string;
  version: string;
  witness?: string;
}

interface DigitalConsentProps {
  patientId: string;
  patientName: string;
  consents?: DigitalConsentRecord[];
  onConsentUpdate?: (consents: DigitalConsentRecord[]) => void;
}

const consentTemplates: ConsentTemplate[] = [
  {
    id: 'treatment_consent',
    title: 'Consentimento para Tratamento Médico',
    content: `Eu, paciente ou responsável legal, declaro que:

1. Fui devidamente informado(a) sobre o tratamento proposto, incluindo seus benefícios, riscos e alternativas.
2. Tive a oportunidade de esclarecer todas as minhas dúvidas com o profissional responsável.
3. Compreendo que nenhum tratamento médico oferece garantia de resultados.
4. Autorizo a realização do tratamento conforme explicado pelo profissional.
5. Estou ciente de que posso retirar este consentimento a qualquer momento.

Este consentimento é válido para o tratamento específico discutido e não se estende a outros procedimentos.`,
    type: 'treatment',
    required: true,
    version: '1.0'
  },
  {
    id: 'data_sharing_consent',
    title: 'Consentimento para Compartilhamento de Dados',
    content: `Autorizo o compartilhamento dos meus dados médicos para:

1. Outros profissionais de saúde envolvidos no meu tratamento.
2. Laboratórios e clínicas parceiras para realização de exames.
3. Convênios médicos para fins de autorização e cobrança.
4. Sistemas de saúde integrados para continuidade do cuidado.

Os dados serão compartilhados apenas para fins médicos e seguindo as normas da LGPD.`,
    type: 'data_sharing',
    required: false,
    version: '1.0'
  },
  {
    id: 'photography_consent',
    title: 'Consentimento para Fotografias Médicas',
    content: `Autorizo a captura e uso de fotografias para:

1. Documentação do meu tratamento e evolução clínica.
2. Fins educacionais e científicos (com identidade preservada).
3. Apresentações em congressos médicos (com identidade preservada).
4. Publicações científicas (com identidade preservada).

As fotografias serão armazenadas de forma segura e utilizadas apenas para os fins autorizados.`,
    type: 'photography',
    required: false,
    version: '1.0'
  },
  {
    id: 'marketing_consent',
    title: 'Consentimento para Comunicações de Marketing',
    content: `Autorizo o recebimento de comunicações sobre:

1. Novos tratamentos e procedimentos disponíveis.
2. Campanhas de prevenção e cuidados com a saúde.
3. Lembretes de consultas e retornos.
4. Pesquisas de satisfação sobre os serviços.

Posso cancelar o recebimento dessas comunicações a qualquer momento.`,
    type: 'marketing',
    required: false,
    version: '1.0'
  }
];

export function DigitalConsent({ 
  patientId, 
  patientName, 
  consents = [], 
  onConsentUpdate 
}: DigitalConsentProps) {
  const [selectedConsents, setSelectedConsents] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Inicializar com consentimentos já dados
    const initialConsents: Record<string, boolean> = {};
    consents.forEach(consent => {
      initialConsents[consent.template_id] = consent.consent_given;
    });
    setSelectedConsents(initialConsents);
  }, [consents]);

  const generateConsentHash = (data: {
    templateId: string;
    patientId: string;
    consentGiven: boolean;
    timestamp: string;
    version: string;
  }) => {
    const hashString = `${data.templateId}:${data.patientId}:${data.consentGiven}:${data.timestamp}:${data.version}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
  };

  const handleConsentChange = (templateId: string, checked: boolean) => {
    setSelectedConsents(prev => ({
      ...prev,
      [templateId]: checked
    }));
  };

  const handleSubmitConsents = async () => {
    setIsSubmitting(true);
    
    try {
      const timestamp = new Date().toISOString();
      const userAgent = navigator.userAgent;
      const ipAddress = '127.0.0.1'; // Em produção, seria obtido do servidor
      
      const newConsents: DigitalConsentRecord[] = consentTemplates.map(template => {
        const consentGiven = selectedConsents[template.id] || false;
        const hash = generateConsentHash({
          templateId: template.id,
          patientId,
          consentGiven,
          timestamp,
          version: template.version
        });

        return {
          id: `consent_${template.id}_${Date.now()}`,
          template_id: template.id,
          patient_id: patientId,
          consent_given: consentGiven,
          signed_at: new Date(timestamp),
          signed_by: patientName,
          ip_address: ipAddress,
          user_agent: userAgent,
          hash,
          version: template.version
        };
      });

      onConsentUpdate?.(newConsents);
      toast.success('Consentimentos atualizados com sucesso');
    } catch (error) {
      toast.error('Erro ao salvar consentimentos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConsentRecord = (templateId: string) => {
    return consents.find(consent => consent.template_id === templateId);
  };

  const hasRequiredConsents = () => {
    return consentTemplates
      .filter(template => template.required)
      .every(template => selectedConsents[template.id]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Consentimentos Digitais</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Paciente: <strong>{patientName}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {consentTemplates.map(template => {
            const consentRecord = getConsentRecord(template.id);
            const isChecked = selectedConsents[template.id] || false;
            
            return (
              <Card key={template.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{template.title}</h3>
                          {template.required && (
                            <Badge variant="destructive">Obrigatório</Badge>
                          )}
                          <Badge variant="outline">v{template.version}</Badge>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                            {template.content}
                          </pre>
                        </div>

                        {consentRecord && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileCheck className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                Status: {consentRecord.consent_given ? 'Consentimento Dado' : 'Consentimento Negado'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-700">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {format(new Date(consentRecord.signed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{consentRecord.signed_by}</span>
                              </div>
                              <div className="flex items-center space-x-1 md:col-span-2">
                                <Hash className="h-3 w-3" />
                                <span className="font-mono text-xs break-all">
                                  {consentRecord.hash.substring(0, 32)}...
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={template.id}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleConsentChange(template.id, !!checked)}
                      />
                      <Label htmlFor={template.id} className="text-sm">
                        {isChecked ? 'Eu concordo com os termos acima' : 'Eu não concordo com os termos acima'}
                        {template.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {!hasRequiredConsents() && (
                <p className="text-red-600">
                  * Consentimentos obrigatórios devem ser aceitos para prosseguir
                </p>
              )}
            </div>
            <Button 
              onClick={handleSubmitConsents}
              disabled={isSubmitting || !hasRequiredConsents()}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Consentimentos'}
            </Button>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Segurança e Privacidade</p>
                <p>
                  Todos os consentimentos são protegidos por hash criptográfico SHA-256 para garantir 
                  integridade e autenticidade. Os dados são armazenados de acordo com a LGPD e 
                  regulamentações médicas aplicáveis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}