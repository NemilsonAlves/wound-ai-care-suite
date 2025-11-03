import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Scissors, Shield, Clock, AlertTriangle, Stethoscope } from 'lucide-react';

interface CirurgiasData {
  // Tipo de cirurgia
  tipoCirurgia: string;
  procedimento: string;
  indicacao: string;
  localizacao: string;
  
  // Anestesia
  tipoAnestesia: string;
  anestesicoUtilizado: string;
  volumeAnestesico: number;
  
  // Procedimento cirúrgico
  tecnicaCirurgica: string;
  instrumentosUtilizados: string[];
  tempoCircurgia: number;
  
  // Suturas
  tipoSutura: string;
  fioUtilizado: string;
  numeroSuturas: number;
  tecnicaSutura: string;
  
  // Hemostasia
  hemostasia: string;
  sangramento: string;
  
  // Curativo pós-operatório
  tipoCurativo: string;
  coberturaPrimaria: string;
  coberturaSecundaria: string;
  fixacao: string;
  
  // Complicações
  complicacoesIntraoperatorias: string[];
  complicacoesPosOperatorias: string[];
  
  // Orientações pós-operatórias
  cuidadosCurativo: string[];
  medicacoes: string;
  restricoes: string[];
  retorno: string;
  
  // Anatomia patológica
  materialEnviado: boolean;
  hipoteseDiagnostica: string;
  
  // Evolução
  aspectoFerida: string;
  sinaisInfeccao: string[];
  cicatrizacao: string;
  
  // Observações
  observacoes: string;
}

interface CirurgiasFieldsProps {
  data: Partial<CirurgiasData>;
  onChange: (data: Partial<CirurgiasData>) => void;
  readOnly?: boolean;
}

const CirurgiasFields: React.FC<CirurgiasFieldsProps> = ({ data, onChange, readOnly = false }) => {
  const handleChange = (field: keyof CirurgiasData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof CirurgiasData, value: string, checked: boolean) => {
    const currentArray = (data[field] as string[]) || [];
    if (checked) {
      handleChange(field, [...currentArray, value]);
    } else {
      handleChange(field, currentArray.filter(item => item !== value));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tipo de Cirurgia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scissors className="h-5 w-5" />
            <span>Tipo de Cirurgia</span>
          </CardTitle>
          <CardDescription>
            Informações sobre o procedimento cirúrgico realizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoCirurgia">Tipo de Cirurgia</Label>
              <Select
                value={data.tipoCirurgia || ''}
                onValueChange={(value) => handleChange('tipoCirurgia', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excisao-lesao">Excisão de Lesão</SelectItem>
                  <SelectItem value="biopsia-excisional">Biópsia Excisional</SelectItem>
                  <SelectItem value="biopsia-incisional">Biópsia Incisional</SelectItem>
                  <SelectItem value="curetagem">Curetagem</SelectItem>
                  <SelectItem value="eletrocauterizacao">Eletrocauterização</SelectItem>
                  <SelectItem value="criocirurgia">Criocirurgia</SelectItem>
                  <SelectItem value="drenagem-abscesso">Drenagem de Abscesso</SelectItem>
                  <SelectItem value="sutura-ferida">Sutura de Ferida</SelectItem>
                  <SelectItem value="remocao-corpo-estranho">Remoção de Corpo Estranho</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="procedimento">Procedimento Específico</Label>
              <Input
                id="procedimento"
                value={data.procedimento || ''}
                onChange={(e) => handleChange('procedimento', e.target.value)}
                placeholder="Descreva o procedimento"
                readOnly={readOnly}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="indicacao">Indicação</Label>
              <Input
                id="indicacao"
                value={data.indicacao || ''}
                onChange={(e) => handleChange('indicacao', e.target.value)}
                placeholder="Motivo da cirurgia"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                value={data.localizacao || ''}
                onChange={(e) => handleChange('localizacao', e.target.value)}
                placeholder="Local anatômico"
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anestesia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Anestesia</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tipoAnestesia">Tipo de Anestesia</Label>
              <Select
                value={data.tipoAnestesia || ''}
                onValueChange={(value) => handleChange('tipoAnestesia', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="topica">Tópica</SelectItem>
                  <SelectItem value="bloqueio-regional">Bloqueio Regional</SelectItem>
                  <SelectItem value="sem-anestesia">Sem Anestesia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="anestesicoUtilizado">Anestésico</Label>
              <Select
                value={data.anestesicoUtilizado || ''}
                onValueChange={(value) => handleChange('anestesicoUtilizado', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lidocaina-2">Lidocaína 2%</SelectItem>
                  <SelectItem value="lidocaina-2-epinefrina">Lidocaína 2% + Epinefrina</SelectItem>
                  <SelectItem value="prilocaina">Prilocaína</SelectItem>
                  <SelectItem value="bupivacaina">Bupivacaína</SelectItem>
                  <SelectItem value="emla">EMLA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="volumeAnestesico">Volume (ml)</Label>
              <Input
                id="volumeAnestesico"
                type="number"
                step="0.1"
                value={data.volumeAnestesico || ''}
                onChange={(e) => handleChange('volumeAnestesico', parseFloat(e.target.value))}
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Procedimento Cirúrgico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Procedimento Cirúrgico</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tecnicaCirurgica">Técnica Cirúrgica</Label>
              <Textarea
                id="tecnicaCirurgica"
                value={data.tecnicaCirurgica || ''}
                onChange={(e) => handleChange('tecnicaCirurgica', e.target.value)}
                placeholder="Descreva a técnica utilizada"
                rows={3}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="tempoCircurgia">Tempo de Cirurgia (min)</Label>
              <Input
                id="tempoCircurgia"
                type="number"
                value={data.tempoCircurgia || ''}
                onChange={(e) => handleChange('tempoCircurgia', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
          </div>
          
          <div>
            <Label>Instrumentos Utilizados</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {[
                'Bisturi',
                'Tesoura',
                'Pinça anatômica',
                'Pinça dente de rato',
                'Porta-agulha',
                'Eletrocautério',
                'Cureta',
                'Punch'
              ].map((instrumento) => (
                <div key={instrumento} className="flex items-center space-x-2">
                  <Checkbox
                    id={instrumento}
                    checked={(data.instrumentosUtilizados || []).includes(instrumento)}
                    onCheckedChange={(checked) => handleArrayChange('instrumentosUtilizados', instrumento, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={instrumento}>{instrumento}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suturas */}
      <Card>
        <CardHeader>
          <CardTitle>Suturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tipoSutura">Tipo de Sutura</Label>
              <Select
                value={data.tipoSutura || ''}
                onValueChange={(value) => handleChange('tipoSutura', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples</SelectItem>
                  <SelectItem value="continua">Contínua</SelectItem>
                  <SelectItem value="em-u">Em U</SelectItem>
                  <SelectItem value="colchoeiro">Colchoeiro</SelectItem>
                  <SelectItem value="intradermica">Intradérmica</SelectItem>
                  <SelectItem value="nao-realizada">Não Realizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fioUtilizado">Fio Utilizado</Label>
              <Select
                value={data.fioUtilizado || ''}
                onValueChange={(value) => handleChange('fioUtilizado', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nylon-3-0">Nylon 3-0</SelectItem>
                  <SelectItem value="nylon-4-0">Nylon 4-0</SelectItem>
                  <SelectItem value="nylon-5-0">Nylon 5-0</SelectItem>
                  <SelectItem value="seda-3-0">Seda 3-0</SelectItem>
                  <SelectItem value="seda-4-0">Seda 4-0</SelectItem>
                  <SelectItem value="vicryl-3-0">Vicryl 3-0</SelectItem>
                  <SelectItem value="vicryl-4-0">Vicryl 4-0</SelectItem>
                  <SelectItem value="prolene-4-0">Prolene 4-0</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="numeroSuturas">Número de Suturas</Label>
              <Input
                id="numeroSuturas"
                type="number"
                value={data.numeroSuturas || ''}
                onChange={(e) => handleChange('numeroSuturas', parseInt(e.target.value))}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="tecnicaSutura">Técnica</Label>
              <Input
                id="tecnicaSutura"
                value={data.tecnicaSutura || ''}
                onChange={(e) => handleChange('tecnicaSutura', e.target.value)}
                placeholder="Detalhes da técnica"
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hemostasia */}
      <Card>
        <CardHeader>
          <CardTitle>Hemostasia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hemostasia">Método de Hemostasia</Label>
              <Select
                value={data.hemostasia || ''}
                onValueChange={(value) => handleChange('hemostasia', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compressao">Compressão</SelectItem>
                  <SelectItem value="eletrocauterio">Eletrocautério</SelectItem>
                  <SelectItem value="ligadura">Ligadura</SelectItem>
                  <SelectItem value="agentes-hemostáticos">Agentes Hemostáticos</SelectItem>
                  <SelectItem value="nao-necessaria">Não Necessária</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sangramento">Sangramento</Label>
              <Select
                value={data.sangramento || ''}
                onValueChange={(value) => handleChange('sangramento', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="minimo">Mínimo</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="intenso">Intenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Curativo Pós-Operatório */}
      <Card>
        <CardHeader>
          <CardTitle>Curativo Pós-Operatório</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tipoCurativo">Tipo de Curativo</Label>
              <Select
                value={data.tipoCurativo || ''}
                onValueChange={(value) => handleChange('tipoCurativo', value)}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples</SelectItem>
                  <SelectItem value="compressivo">Compressivo</SelectItem>
                  <SelectItem value="oclusivo">Oclusivo</SelectItem>
                  <SelectItem value="semi-oclusivo">Semi-oclusivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="coberturaPrimaria">Cobertura Primária</Label>
              <Input
                id="coberturaPrimaria"
                value={data.coberturaPrimaria || ''}
                onChange={(e) => handleChange('coberturaPrimaria', e.target.value)}
                placeholder="Ex: Gaze vaselinada"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="coberturaSecundaria">Cobertura Secundária</Label>
              <Input
                id="coberturaSecundaria"
                value={data.coberturaSecundaria || ''}
                onChange={(e) => handleChange('coberturaSecundaria', e.target.value)}
                placeholder="Ex: Gaze estéril"
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="fixacao">Fixação</Label>
              <Input
                id="fixacao"
                value={data.fixacao || ''}
                onChange={(e) => handleChange('fixacao', e.target.value)}
                placeholder="Ex: Micropore"
                readOnly={readOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complicações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Complicações</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Complicações Intraoperatórias</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {[
                'Sangramento excessivo',
                'Lesão de estruturas adjacentes',
                'Reação anestésica',
                'Dificuldade técnica',
                'Nenhuma'
              ].map((complicacao) => (
                <div key={complicacao} className="flex items-center space-x-2">
                  <Checkbox
                    id={complicacao}
                    checked={(data.complicacoesIntraoperatorias || []).includes(complicacao)}
                    onCheckedChange={(checked) => handleArrayChange('complicacoesIntraoperatorias', complicacao, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={complicacao}>{complicacao}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Complicações Pós-Operatórias</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {[
                'Infecção',
                'Sangramento tardio',
                'Deiscência',
                'Necrose',
                'Cicatriz hipertrófica',
                'Nenhuma'
              ].map((complicacao) => (
                <div key={complicacao} className="flex items-center space-x-2">
                  <Checkbox
                    id={complicacao}
                    checked={(data.complicacoesPosOperatorias || []).includes(complicacao)}
                    onCheckedChange={(checked) => handleArrayChange('complicacoesPosOperatorias', complicacao, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={complicacao}>{complicacao}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orientações Pós-Operatórias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Orientações Pós-Operatórias</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cuidados com o Curativo</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {[
                'Manter curativo seco',
                'Trocar curativo em 24h',
                'Trocar curativo em 48h',
                'Limpeza com SF 0,9%',
                'Evitar molhar',
                'Observar sinais de infecção',
                'Retornar se sangramento',
                'Retornar se dor intensa'
              ].map((cuidado) => (
                <div key={cuidado} className="flex items-center space-x-2">
                  <Checkbox
                    id={cuidado}
                    checked={(data.cuidadosCurativo || []).includes(cuidado)}
                    onCheckedChange={(checked) => handleArrayChange('cuidadosCurativo', cuidado, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={cuidado}>{cuidado}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medicacoes">Medicações Prescritas</Label>
              <Textarea
                id="medicacoes"
                value={data.medicacoes || ''}
                onChange={(e) => handleChange('medicacoes', e.target.value)}
                placeholder="Medicações e posologia"
                rows={3}
                readOnly={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="retorno">Retorno</Label>
              <Input
                id="retorno"
                value={data.retorno || ''}
                onChange={(e) => handleChange('retorno', e.target.value)}
                placeholder="Ex: 7 dias para retirada de pontos"
                readOnly={readOnly}
              />
            </div>
          </div>
          
          <div>
            <Label>Restrições</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
              {[
                'Evitar esforço físico',
                'Não levantar peso',
                'Evitar exposição solar',
                'Não praticar esportes',
                'Repouso relativo',
                'Dieta normal'
              ].map((restricao) => (
                <div key={restricao} className="flex items-center space-x-2">
                  <Checkbox
                    id={restricao}
                    checked={(data.restricoes || []).includes(restricao)}
                    onCheckedChange={(checked) => handleArrayChange('restricoes', restricao, checked as boolean)}
                    disabled={readOnly}
                  />
                  <Label htmlFor={restricao}>{restricao}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anatomia Patológica */}
      <Card>
        <CardHeader>
          <CardTitle>Anatomia Patológica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="materialEnviado"
              checked={data.materialEnviado || false}
              onCheckedChange={(checked) => handleChange('materialEnviado', checked as boolean)}
              disabled={readOnly}
            />
            <Label htmlFor="materialEnviado">Material enviado para anatomia patológica</Label>
          </div>
          
          {data.materialEnviado && (
            <div>
              <Label htmlFor="hipoteseDiagnostica">Hipótese Diagnóstica</Label>
              <Input
                id="hipoteseDiagnostica"
                value={data.hipoteseDiagnostica || ''}
                onChange={(e) => handleChange('hipoteseDiagnostica', e.target.value)}
                placeholder="Hipótese diagnóstica para o patologista"
                readOnly={readOnly}
              />
            </div>
          )}
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
            placeholder="Observações adicionais sobre a cirurgia..."
            rows={4}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CirurgiasFields;