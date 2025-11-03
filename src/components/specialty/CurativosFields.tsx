import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Ruler, Droplets, Zap, Clock } from 'lucide-react';

interface CurativosData {
  // Localização e dimensões
  localizacao: string;
  lateralidade: string;
  comprimento: number;
  largura: number;
  profundidade: number;
  area: number;
  
  // Características da lesão
  tipoLesao: string;
  etiologia: string;
  tempoLesao: string;
  
  // Leito da ferida
  tecidoNecrotico: number;
  tecidoDesvitalizado: number;
  tecidoGranulacao: number;
  tecidoEpitelizacao: number;
  
  // Exsudato
  quantidadeExsudato: string;
  aspectoExsudato: string;
  odor: string;
  
  // Bordas e pele perilesional
  tiposBordas: string;
  pelePerilesional: string;
  sinaisInfeccao: string[];
  
  // Dor
  escalaDor: number;
  caracteristicaDor: string;
  
  // Cicatrização
  faseCicatrizacao: string;
  evolucao: string;
  
  // Tratamento
  limpeza: string;
  desbridamento: string;
  coberturaPrimaria: string;
  coberturaSecundaria: string;
  fixacao: string;
  
  // Observações
  observacoes: string;
}

interface CurativosFieldsProps {
  data: Partial<CurativosData>;
  onChange: (data: Partial<CurativosData>) => void;
  readOnly?: boolean;
}

const CurativosFields: React.FC<CurativosFieldsProps> = ({ data, onChange, readOnly = false }) => {
  const handleChange = (field: keyof CurativosData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof CurativosData, value: string, checked: boolean) => {
    const currentArray = (data[field] as string[]) || [];
    if (checked) {
      handleChange(field, [...currentArray, value]);
    } else {
      handleChange(field, currentArray.filter(item => item !== value));
    }
  };

  return (
    <div className="space-y-6">
      {/* Localização e Dimensões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ruler className="h-5 w-5" />
            <span>Localização e Dimensões</span>
          </CardTitle>
          <CardDescription>
            Informações sobre localização anatômica e medidas da lesão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="localizacao">Localização Anatômica</Label>
              <Input
                id="localizacao"
                value={data.localizacao || ''}
                onChange={(e) => handleChange('localizacao', e.target.value)}
                placeholder="Ex: Região sacral, calcâneo direito..."
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="lateralidade">Lateralidade</Label>
              <Select
                value={data.lateralidade || ''}
                onValueChange={(value) => handleChange('lateralidade', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direita">Direita</SelectItem>
                  <SelectItem value="esquerda">Esquerda</SelectItem>
                  <SelectItem value="bilateral">Bilateral</SelectItem>
                  <SelectItem value="central">Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="comprimento">Comprimento (cm)</Label>
              <Input
                id="comprimento"
                type="number"
                step="0.1"
                value={data.comprimento || ''}
                onChange={(e) => handleChange('comprimento', parseFloat(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="largura">Largura (cm)</Label>
              <Input
                id="largura"
                type="number"
                step="0.1"
                value={data.largura || ''}
                onChange={(e) => handleChange('largura', parseFloat(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="profundidade">Profundidade (cm)</Label>
              <Input
                id="profundidade"
                type="number"
                step="0.1"
                value={data.profundidade || ''}
                onChange={(e) => handleChange('profundidade', parseFloat(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="area">Área (cm²)</Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                value={data.area || (data.comprimento && data.largura ? data.comprimento * data.largura : '')}
                onChange={(e) => handleChange('area', parseFloat(e.target.value))}
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Características da Lesão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Características da Lesão</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tipoLesao">Tipo de Lesão</Label>
              <Select
                value={data.tipoLesao || ''}
                onValueChange={(value) => handleChange('tipoLesao', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ulcera-pressao">Úlcera por Pressão</SelectItem>
                  <SelectItem value="ulcera-venosa">Úlcera Venosa</SelectItem>
                  <SelectItem value="ulcera-arterial">Úlcera Arterial</SelectItem>
                  <SelectItem value="ulcera-diabetica">Úlcera Diabética</SelectItem>
                  <SelectItem value="ferida-cirurgica">Ferida Cirúrgica</SelectItem>
                  <SelectItem value="ferida-traumatica">Ferida Traumática</SelectItem>
                  <SelectItem value="queimadura">Queimadura</SelectItem>
                  <SelectItem value="outras">Outras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="etiologia">Etiologia</Label>
              <Input
                id="etiologia"
                value={data.etiologia || ''}
                onChange={(e) => handleChange('etiologia', e.target.value)}
                placeholder="Causa da lesão"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="tempoLesao">Tempo de Lesão</Label>
              <Input
                id="tempoLesao"
                value={data.tempoLesao || ''}
                onChange={(e) => handleChange('tempoLesao', e.target.value)}
                placeholder="Ex: 2 semanas, 1 mês..."
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leito da Ferida */}
      <Card>
        <CardHeader>
          <CardTitle>Leito da Ferida (%)</CardTitle>
          <CardDescription>
            Percentual de cada tipo de tecido presente no leito da ferida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tecidoNecrotico">Tecido Necrótico (%)</Label>
              <Input
                id="tecidoNecrotico"
                type="number"
                min="0"
                max="100"
                value={data.tecidoNecrotico || ''}
                onChange={(e) => handleChange('tecidoNecrotico', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="tecidoDesvitalizado">Tecido Desvitalizado (%)</Label>
              <Input
                id="tecidoDesvitalizado"
                type="number"
                min="0"
                max="100"
                value={data.tecidoDesvitalizado || ''}
                onChange={(e) => handleChange('tecidoDesvitalizado', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="tecidoGranulacao">Tecido de Granulação (%)</Label>
              <Input
                id="tecidoGranulacao"
                type="number"
                min="0"
                max="100"
                value={data.tecidoGranulacao || ''}
                onChange={(e) => handleChange('tecidoGranulacao', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="tecidoEpitelizacao">Epitelização (%)</Label>
              <Input
                id="tecidoEpitelizacao"
                type="number"
                min="0"
                max="100"
                value={data.tecidoEpitelizacao || ''}
                onChange={(e) => handleChange('tecidoEpitelizacao', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exsudato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Droplets className="h-5 w-5" />
            <span>Exsudato</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantidadeExsudato">Quantidade</Label>
              <Select
                value={data.quantidadeExsudato || ''}
                onValueChange={(value) => handleChange('quantidadeExsudato', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="escasso">Escasso</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="abundante">Abundante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="aspectoExsudato">Aspecto</Label>
              <Select
                value={data.aspectoExsudato || ''}
                onValueChange={(value) => handleChange('aspectoExsudato', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seroso">Seroso</SelectItem>
                  <SelectItem value="sanguinolento">Sanguinolento</SelectItem>
                  <SelectItem value="purulento">Purulento</SelectItem>
                  <SelectItem value="seropurulento">Seropurulento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="odor">Odor</Label>
              <Select
                value={data.odor || ''}
                onValueChange={(value) => handleChange('odor', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="forte">Forte</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sinais de Infecção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Sinais de Infecção</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Eritema',
              'Edema',
              'Calor local',
              'Dor aumentada',
              'Odor fétido',
              'Exsudato purulento',
              'Febre',
              'Linfangite',
              'Linfadenopatia'
            ].map((sinal) => (
              <div key={sinal} className="flex items-center space-x-2">
                <Checkbox
                  id={sinal}
                  checked={(data.sinaisInfeccao || []).includes(sinal)}
                  onCheckedChange={(checked) => handleArrayChange('sinaisInfeccao', sinal, checked as boolean)}
                  disabled={readOnly}
                />
                <Label htmlFor={sinal}>{sinal}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dor e Cicatrização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Dor e Cicatrização</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="escalaDor">Escala de Dor (0-10)</Label>
              <Input
                id="escalaDor"
                type="number"
                min="0"
                max="10"
                value={data.escalaDor || ''}
                onChange={(e) => handleChange('escalaDor', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="faseCicatrizacao">Fase de Cicatrização</Label>
              <Select
                value={data.faseCicatrizacao || ''}
                onValueChange={(value) => handleChange('faseCicatrizacao', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inflamatoria">Inflamatória</SelectItem>
                  <SelectItem value="proliferativa">Proliferativa</SelectItem>
                  <SelectItem value="maturacao">Maturação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="evolucao">Evolução</Label>
              <Select
                value={data.evolucao || ''}
                onValueChange={(value) => handleChange('evolucao', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="melhorando">Melhorando</SelectItem>
                  <SelectItem value="estavel">Estável</SelectItem>
                  <SelectItem value="piorando">Piorando</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tratamento */}
      <Card>
        <CardHeader>
          <CardTitle>Tratamento Realizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="limpeza">Limpeza</Label>
              <Input
                id="limpeza"
                value={data.limpeza || ''}
                onChange={(e) => handleChange('limpeza', e.target.value)}
                placeholder="Ex: SF 0,9%, PHMB..."
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="desbridamento">Desbridamento</Label>
              <Select
                value={data.desbridamento || ''}
                onValueChange={(value) => handleChange('desbridamento', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao-realizado">Não realizado</SelectItem>
                  <SelectItem value="mecanico">Mecânico</SelectItem>
                  <SelectItem value="enzimatico">Enzimático</SelectItem>
                  <SelectItem value="autolitico">Autolítico</SelectItem>
                  <SelectItem value="cirurgico">Cirúrgico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coberturaPrimaria">Cobertura Primária</Label>
              <Input
                id="coberturaPrimaria"
                value={data.coberturaPrimaria || ''}
                onChange={(e) => handleChange('coberturaPrimaria', e.target.value)}
                placeholder="Ex: Hidrogel, Alginato..."
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="coberturaSecundaria">Cobertura Secundária</Label>
              <Input
                id="coberturaSecundaria"
                value={data.coberturaSecundaria || ''}
                onChange={(e) => handleChange('coberturaSecundaria', e.target.value)}
                placeholder="Ex: Gaze, Filme transparente..."
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
            placeholder="Observações adicionais sobre o curativo..."
            rows={4}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CurativosFields;