import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Sun, Zap, Camera, Settings } from 'lucide-react';

interface DermatologiaData {
  // Fototipo e características da pele
  fototipo: string;
  tipoPele: string;
  sensibilidade: string;
  hidratacao: string;
  oleosidade: string;
  
  // Manchas e pigmentação
  tipoMancha: string[];
  localizacaoManchas: string;
  intensidadePigmentacao: string;
  tamanhoManchas: string;
  
  // Acne e comedões
  grauAcne: string;
  tiposLesoes: string[];
  distribuicaoAcne: string;
  cicatrizes: string;
  
  // Envelhecimento
  rugas: string[];
  flacidez: string;
  texturaPele: string;
  porosidade: string;
  
  // Procedimentos estéticos
  procedimentoRealizado: string;
  equipamentoUtilizado: string;
  parametrosEquipamento: {
    potencia?: number;
    frequencia?: number;
    tempo?: number;
    temperatura?: number;
    profundidade?: number;
  };
  
  // Peelings
  tipoPeeling: string;
  concentracao: string;
  tempoAplicacao: number;
  numeroPassadas: number;
  
  // Reações e efeitos
  reacoesImediatas: string[];
  eritema: string;
  edema: string;
  descamacao: string;
  
  // Cuidados pós-procedimento
  cuidadosImediatos: string[];
  protecaoSolar: string;
  hidratacao: string;
  medicacaoTopica: string;
  
  // Resultados esperados
  objetivoTratamento: string;
  numeroSessoes: number;
  intervaloBetweenSessions: string;
  
  // Observações
  observacoes: string;
}

interface DermatologiaFieldsProps {
  data: Partial<DermatologiaData>;
  onChange: (data: Partial<DermatologiaData>) => void;
  readOnly?: boolean;
}

const DermatologiaFields: React.FC<DermatologiaFieldsProps> = ({ data, onChange, readOnly = false }) => {
  const handleChange = (field: keyof DermatologiaData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof DermatologiaData, value: string, checked: boolean) => {
    const currentArray = (data[field] as string[]) || [];
    if (checked) {
      handleChange(field, [...currentArray, value]);
    } else {
      handleChange(field, currentArray.filter(item => item !== value));
    }
  };

  const handleParameterChange = (parameter: string, value: number) => {
    const currentParams = data.parametrosEquipamento || {};
    handleChange('parametrosEquipamento', {
      ...currentParams,
      [parameter]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Fototipo e Características da Pele */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="h-5 w-5" />
            <span>Fototipo e Características da Pele</span>
          </CardTitle>
          <CardDescription>
            Avaliação do tipo de pele e características básicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fototipo">Fototipo de Fitzpatrick</Label>
              <Select
                value={data.fototipo || ''}
                onValueChange={(value) => handleChange('fototipo', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">I - Sempre queima, nunca bronzeia</SelectItem>
                  <SelectItem value="II">II - Sempre queima, bronzeia pouco</SelectItem>
                  <SelectItem value="III">III - Queima moderadamente, bronzeia gradualmente</SelectItem>
                  <SelectItem value="IV">IV - Queima pouco, sempre bronzeia</SelectItem>
                  <SelectItem value="V">V - Raramente queima, bronzeia intensamente</SelectItem>
                  <SelectItem value="VI">VI - Nunca queima, sempre bronzeia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tipoPele">Tipo de Pele</Label>
              <Select
                value={data.tipoPele || ''}
                onValueChange={(value) => handleChange('tipoPele', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="seca">Seca</SelectItem>
                  <SelectItem value="oleosa">Oleosa</SelectItem>
                  <SelectItem value="mista">Mista</SelectItem>
                  <SelectItem value="sensivel">Sensível</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sensibilidade">Sensibilidade</Label>
              <Select
                value={data.sensibilidade || ''}
                onValueChange={(value) => handleChange('sensibilidade', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manchas e Pigmentação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Manchas e Pigmentação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tipos de Manchas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {[
                'Melasma',
                'Manchas solares',
                'Manchas senis',
                'Hiperpigmentação pós-inflamatória',
                'Efélides (sardas)',
                'Lentigos',
                'Hipocromias',
                'Vitiligo'
              ].map((tipo) => (
                <div key={tipo} className="flex items-center space-x-2">
                  <Checkbox
                    id={tipo}
                    checked={(data.tipoMancha || []).includes(tipo)}
                    onCheckedChange={(checked) => handleArrayChange('tipoMancha', tipo, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={tipo}>{tipo}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="localizacaoManchas">Localização</Label>
              <Input
                id="localizacaoManchas"
                value={data.localizacaoManchas || ''}
                onChange={(e) => handleChange('localizacaoManchas', e.target.value)}
                placeholder="Ex: Face, colo, mãos..."
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="intensidadePigmentacao">Intensidade</Label>
              <Select
                value={data.intensidadePigmentacao || ''}
                onValueChange={(value) => handleChange('intensidadePigmentacao', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="intensa">Intensa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tamanhoManchas">Tamanho</Label>
              <Input
                id="tamanhoManchas"
                value={data.tamanhoManchas || ''}
                onChange={(e) => handleChange('tamanhoManchas', e.target.value)}
                placeholder="Ex: 2x3cm, múltiplas pequenas..."
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acne */}
      <Card>
        <CardHeader>
          <CardTitle>Acne e Comedões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grauAcne">Grau da Acne</Label>
              <Select
                value={data.grauAcne || ''}
                onValueChange={(value) => handleChange('grauAcne', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Grau I - Comedônica</SelectItem>
                  <SelectItem value="II">Grau II - Pápulo-pustulosa leve</SelectItem>
                  <SelectItem value="III">Grau III - Pápulo-pustulosa moderada</SelectItem>
                  <SelectItem value="IV">Grau IV - Nódulo-cística</SelectItem>
                  <SelectItem value="V">Grau V - Conglobata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="distribuicaoAcne">Distribuição</Label>
              <Input
                id="distribuicaoAcne"
                value={data.distribuicaoAcne || ''}
                onChange={(e) => handleChange('distribuicaoAcne', e.target.value)}
                placeholder="Ex: Face, tórax, dorso..."
                readOnly={readOnly}
              />
            </div>
          </div>
          
          <div>
            <Label>Tipos de Lesões</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {[
                'Comedões abertos',
                'Comedões fechados',
                'Pápulas',
                'Pústulas',
                'Nódulos',
                'Cistos',
                'Cicatrizes atróficas',
                'Cicatrizes hipertróficas'
              ].map((tipo) => (
                <div key={tipo} className="flex items-center space-x-2">
                  <Checkbox
                    id={tipo}
                    checked={(data.tiposLesoes || []).includes(tipo)}
                    onCheckedChange={(checked) => handleArrayChange('tiposLesoes', tipo, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={tipo}>{tipo}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedimento Realizado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Procedimento Realizado</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="procedimentoRealizado">Procedimento</Label>
              <Select
                value={data.procedimentoRealizado || ''}
                onValueChange={(value) => handleChange('procedimentoRealizado', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="peeling-quimico">Peeling Químico</SelectItem>
                  <SelectItem value="microagulhamento">Microagulhamento</SelectItem>
                  <SelectItem value="laser-co2">Laser CO2</SelectItem>
                  <SelectItem value="ipl">IPL</SelectItem>
                  <SelectItem value="radiofrequencia">Radiofrequência</SelectItem>
                  <SelectItem value="criolipólise">Criolipólise</SelectItem>
                  <SelectItem value="toxina-botulinica">Toxina Botulínica</SelectItem>
                  <SelectItem value="preenchimento">Preenchimento</SelectItem>
                  <SelectItem value="limpeza-pele">Limpeza de Pele</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="equipamentoUtilizado">Equipamento</Label>
              <Input
                id="equipamentoUtilizado"
                value={data.equipamentoUtilizado || ''}
                onChange={(e) => handleChange('equipamentoUtilizado', e.target.value)}
                placeholder="Nome do equipamento utilizado"
                readOnly={readOnly}
              />
            </div>
          </div>
          
          {/* Parâmetros do Equipamento */}
          <div>
            <Label>Parâmetros do Equipamento</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
              <div>
                <Label htmlFor="potencia">Potência</Label>
                <Input
                  id="potencia"
                  type="number"
                  value={data.parametrosEquipamento?.potencia || ''}
                  onChange={(e) => handleParameterChange('potencia', parseFloat(e.target.value))}
                  placeholder="W"
                  readOnly={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="frequencia">Frequência</Label>
                <Input
                  id="frequencia"
                  type="number"
                  value={data.parametrosEquipamento?.frequencia || ''}
                  onChange={(e) => handleParameterChange('frequencia', parseFloat(e.target.value))}
                  placeholder="Hz"
                  readOnly={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="tempo">Tempo</Label>
                <Input
                  id="tempo"
                  type="number"
                  value={data.parametrosEquipamento?.tempo || ''}
                  onChange={(e) => handleParameterChange('tempo', parseFloat(e.target.value))}
                  placeholder="min"
                  readOnly={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="temperatura">Temperatura</Label>
                <Input
                  id="temperatura"
                  type="number"
                  value={data.parametrosEquipamento?.temperatura || ''}
                  onChange={(e) => handleParameterChange('temperatura', parseFloat(e.target.value))}
                  placeholder="°C"
                  readOnly={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="profundidade">Profundidade</Label>
                <Input
                  id="profundidade"
                  type="number"
                  step="0.1"
                  value={data.parametrosEquipamento?.profundidade || ''}
                  onChange={(e) => handleParameterChange('profundidade', parseFloat(e.target.value))}
                  placeholder="mm"
                  readOnly={readOnly}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peeling Químico */}
      {data.procedimentoRealizado === 'peeling-quimico' && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Peeling Químico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="tipoPeeling">Tipo de Peeling</Label>
                <Select
                  value={data.tipoPeeling || ''}
                  onValueChange={(value) => handleChange('tipoPeeling', value)}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acido-glicolico">Ácido Glicólico</SelectItem>
                    <SelectItem value="acido-salicilico">Ácido Salicílico</SelectItem>
                    <SelectItem value="acido-mandélico">Ácido Mandélico</SelectItem>
                    <SelectItem value="acido-lactico">Ácido Lático</SelectItem>
                    <SelectItem value="acido-tricloroacetico">Ácido Tricloroacético</SelectItem>
                    <SelectItem value="fenol">Fenol</SelectItem>
                    <SelectItem value="jessner">Jessner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="concentracao">Concentração (%)</Label>
                <Input
                  id="concentracao"
                  value={data.concentracao || ''}
                  onChange={(e) => handleChange('concentracao', e.target.value)}
                  placeholder="Ex: 30%"
                  readOnly={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="tempoAplicacao">Tempo (min)</Label>
                <Input
                  id="tempoAplicacao"
                  type="number"
                  value={data.tempoAplicacao || ''}
                  onChange={(e) => handleChange('tempoAplicacao', parseInt(e.target.value))}
                  readOnly={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="numeroPassadas">Nº Passadas</Label>
                <Input
                  id="numeroPassadas"
                  type="number"
                  value={data.numeroPassadas || ''}
                  onChange={(e) => handleChange('numeroPassadas', parseInt(e.target.value))}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reações e Efeitos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Reações e Efeitos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Reações Imediatas</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {[
                'Eritema leve',
                'Eritema moderado',
                'Eritema intenso',
                'Edema',
                'Ardência',
                'Prurido',
                'Descamação',
                'Hiperpigmentação'
              ].map((reacao) => (
                <div key={reacao} className="flex items-center space-x-2">
                  <Checkbox
                    id={reacao}
                    checked={(data.reacoesImediatas || []).includes(reacao)}
                    onCheckedChange={(checked) => handleArrayChange('reacoesImediatas', reacao, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={reacao}>{reacao}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cuidados Pós-Procedimento */}
      <Card>
        <CardHeader>
          <CardTitle>Cuidados Pós-Procedimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cuidados Imediatos</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {[
                'Aplicação de protetor solar',
                'Hidratação intensiva',
                'Evitar exposição solar',
                'Não manipular a área',
                'Compressas frias',
                'Medicação anti-inflamatória',
                'Retorno em 7 dias',
                'Retorno em 15 dias'
              ].map((cuidado) => (
                <div key={cuidado} className="flex items-center space-x-2">
                  <Checkbox
                    id={cuidado}
                    checked={(data.cuidadosImediatos || []).includes(cuidado)}
                    onCheckedChange={(checked) => handleArrayChange('cuidadosImediatos', cuidado, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={cuidado}>{cuidado}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="protecaoSolar">Proteção Solar</Label>
              <Input
                id="protecaoSolar"
                value={data.protecaoSolar || ''}
                onChange={(e) => handleChange('protecaoSolar', e.target.value)}
                placeholder="FPS recomendado"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="hidratacao">Hidratação</Label>
              <Input
                id="hidratacao"
                value={data.hidratacao || ''}
                onChange={(e) => handleChange('hidratacao', e.target.value)}
                placeholder="Produto recomendado"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="medicacaoTopica">Medicação Tópica</Label>
              <Input
                id="medicacaoTopica"
                value={data.medicacaoTopica || ''}
                onChange={(e) => handleChange('medicacaoTopica', e.target.value)}
                placeholder="Se necessário"
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planejamento do Tratamento */}
      <Card>
        <CardHeader>
          <CardTitle>Planejamento do Tratamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="objetivoTratamento">Objetivo</Label>
              <Input
                id="objetivoTratamento"
                value={data.objetivoTratamento || ''}
                onChange={(e) => handleChange('objetivoTratamento', e.target.value)}
                placeholder="Ex: Clareamento de manchas"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="numeroSessoes">Número de Sessões</Label>
              <Input
                id="numeroSessoes"
                type="number"
                value={data.numeroSessoes || ''}
                onChange={(e) => handleChange('numeroSessoes', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="intervaloBetweenSessions">Intervalo entre Sessões</Label>
              <Input
                id="intervaloBetweenSessions"
                value={data.intervaloBetweenSessions || ''}
                onChange={(e) => handleChange('intervaloBetweenSessions', e.target.value)}
                placeholder="Ex: 15 dias"
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.observacoes || ''}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Observações adicionais sobre o procedimento..."
            rows={4}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DermatologiaFields;