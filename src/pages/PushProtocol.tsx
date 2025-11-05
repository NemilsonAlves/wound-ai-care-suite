import { ArrowLeft, Ruler, Palette, Droplets, Info, Target, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const pushParameters = [
  {
    parameter: "Comprimento x Largura",
    icon: <Ruler className="w-5 h-5" />,
    description: "Medida da maior extensão da úlcera em centímetros",
    scores: [
      { value: 0, range: "0 cm²", description: "Úlcera fechada" },
      { value: 1, range: "< 0,3 cm²", description: "Úlcera muito pequena" },
      { value: 2, range: "0,3 - 0,6 cm²", description: "Úlcera pequena" },
      { value: 3, range: "0,7 - 1,0 cm²", description: "Úlcera pequena-média" },
      { value: 4, range: "1,1 - 2,0 cm²", description: "Úlcera média" },
      { value: 5, range: "2,1 - 3,0 cm²", description: "Úlcera média-grande" },
      { value: 6, range: "3,1 - 4,0 cm²", description: "Úlcera grande" },
      { value: 7, range: "4,1 - 8,0 cm²", description: "Úlcera muito grande" },
      { value: 8, range: "8,1 - 12,0 cm²", description: "Úlcera extensa" },
      { value: 9, range: "12,1 - 24,0 cm²", description: "Úlcera muito extensa" },
      { value: 10, range: "> 24,0 cm²", description: "Úlcera extremamente extensa" }
    ]
  },
  {
    parameter: "Quantidade de Exsudato",
    icon: <Droplets className="w-5 h-5" />,
    description: "Quantidade de drenagem observada após remoção do curativo",
    scores: [
      { value: 0, label: "Ausente", description: "Leito da ferida seco, sem exsudato observável" },
      { value: 1, label: "Pequena", description: "Leito da ferida úmido, exsudato mínimo" },
      { value: 2, label: "Moderada", description: "Leito da ferida molhado, exsudato moderado" },
      { value: 3, label: "Grande", description: "Leito da ferida saturado, exsudato abundante" }
    ]
  },
  {
    parameter: "Tipo de Tecido",
    icon: <Palette className="w-5 h-5" />,
    description: "Tipo de tecido predominante no leito da ferida",
    scores: [
      { value: 0, label: "Fechada", description: "Pele intacta com cicatrização completa" },
      { value: 1, label: "Tecido Epitelial", description: "Novo tecido rosa ou brilhante (pele) que cresce a partir das bordas ou como ilhas na superfície da ferida" },
      { value: 2, label: "Tecido de Granulação", description: "Tecido rosa ou vermelho brilhante com aparência granular úmida" },
      { value: 3, label: "Esfacelo", description: "Tecido amarelo ou branco que adere ao leito da ferida em cordões ou crostas grossas" },
      { value: 4, label: "Tecido Necrótico", description: "Tecido preto, marrom ou castanho que adere firmemente ao leito e/ou bordas da ferida" }
    ]
  }
];

const healingStatus = [
  { range: "Diminuição do escore", status: "Cicatrização", color: "default", description: "A ferida está melhorando" },
  { range: "Escore inalterado", status: "Sem cicatrização", color: "secondary", description: "A ferida não está progredindo" },
  { range: "Aumento do escore", status: "Deterioração", color: "destructive", description: "A ferida está piorando" }
];

const interventionGuidelines = [
  {
    category: "Escore 0-5 (Baixo)",
    color: "default",
    interventions: [
      "Manter curativo atual se adequado",
      "Monitoramento semanal",
      "Continuar medidas preventivas",
      "Documentar progresso"
    ]
  },
  {
    category: "Escore 6-10 (Moderado)",
    color: "secondary",
    interventions: [
      "Reavaliar plano de cuidados",
      "Considerar mudança de curativo",
      "Avaliação nutricional",
      "Monitoramento mais frequente"
    ]
  },
  {
    category: "Escore 11-17 (Alto)",
    color: "destructive",
    interventions: [
      "Revisão completa do plano terapêutico",
      "Avaliação médica especializada",
      "Otimização do tratamento",
      "Monitoramento diário"
    ]
  }
];

const measurementTechnique = [
  {
    step: "1. Preparação",
    description: "Remova o curativo e limpe suavemente a ferida com solução salina"
  },
  {
    step: "2. Posicionamento",
    description: "Posicione o paciente para visualização adequada da ferida"
  },
  {
    step: "3. Medição do Comprimento",
    description: "Meça a maior distância de ponta a ponta (cefalocaudal)"
  },
  {
    step: "4. Medição da Largura",
    description: "Meça a maior distância perpendicular ao comprimento"
  },
  {
    step: "5. Cálculo da Área",
    description: "Multiplique comprimento x largura para obter a área em cm²"
  },
  {
    step: "6. Avaliação do Exsudato",
    description: "Observe a quantidade após remoção completa do curativo"
  },
  {
    step: "7. Identificação do Tecido",
    description: "Identifique o tipo de tecido predominante (>50% da área)"
  }
];

export default function PushProtocol() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/protocolos')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            📏 PUSH Tool
          </h1>
          <p className="text-muted-foreground mt-1">Pressure Ulcer Scale for Healing - Ferramenta de Monitoramento</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Ferramenta Validada</AlertTitle>
        <AlertDescription>
          O PUSH Tool é uma ferramenta validada internacionalmente para monitoramento da cicatrização 
          de úlceras por pressão, desenvolvida pela National Pressure Ulcer Advisory Panel (NPUAP).
        </AlertDescription>
      </Alert>

      {/* Objetivo e Aplicação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitorar objetivamente a cicatrização de úlceras por pressão através da avaliação 
              sistemática de três parâmetros: tamanho da ferida, quantidade de exsudato e tipo de tecido.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Frequência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Avaliação inicial na admissão</li>
              <li>• Reavaliação semanal</li>
              <li>• Após mudanças no tratamento</li>
              <li>• Na alta ou transferência</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Técnica de Medição */}
      <Card>
        <CardHeader>
          <CardTitle>Técnica de Medição</CardTitle>
          <CardDescription>
            Procedimento padronizado para avaliação precisa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurementTechnique.map((step, index) => (
              <div key={index} className="flex gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{step.step}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros de Avaliação */}
      <div className="space-y-6">
        {pushParameters.map((param, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {param.icon}
                {param.parameter}
              </CardTitle>
              <CardDescription>{param.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {param.scores.map((score) => (
                  <div key={score.value} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{score.value}</Badge>
                      <span className="font-medium">
                        {score.label || score.range}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{score.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interpretação dos Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretação dos Resultados</CardTitle>
          <CardDescription>
            Escore total: soma dos três parâmetros (0-17 pontos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {healingStatus.map((status, index) => (
                <div key={index} className="p-4 border rounded-lg text-center">
                  <Badge variant={status.color as 'default' | 'secondary' | 'destructive' | 'outline'} className="mb-2">{status.status}</Badge>
                  <div className="font-medium">{status.range}</div>
                  <div className="text-sm text-muted-foreground mt-1">{status.description}</div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-semibold">Diretrizes de Intervenção por Escore</h3>
              {interventionGuidelines.map((guideline, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={guideline.color as 'default' | 'secondary' | 'destructive' | 'outline'}>{guideline.category}</Badge>
                  </div>
                  <ul className="space-y-1">
                    {guideline.interventions.map((intervention, intIndex) => (
                      <li key={intIndex} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {intervention}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Considerações Especiais */}
      <Card>
        <CardHeader>
          <CardTitle>Considerações Especiais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Limitações da Ferramenta</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Não avalia profundidade da ferida</li>
                <li>• Não considera presença de tunelização</li>
                <li>• Não avalia bordas da ferida</li>
                <li>• Limitada para feridas irregulares</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Fatores que Influenciam</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Estado nutricional do paciente</li>
                <li>• Perfusão tecidual</li>
                <li>• Presença de infecção</li>
                <li>• Medicamentos em uso</li>
                <li>• Comorbidades associadas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentação */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Documentação e Comunicação</AlertTitle>
        <AlertDescription>
          Registre todos os escores PUSH, fotografe a ferida quando possível, e comunique mudanças 
          significativas à equipe. Mantenha gráfico de evolução para acompanhamento visual do progresso.
        </AlertDescription>
      </Alert>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={() => navigate('/avaliacoes/nova')}>
          Iniciar Avaliação PUSH
        </Button>
        <Button variant="outline" onClick={() => navigate('/protocolos')}>
          Voltar aos Protocolos
        </Button>
      </div>
    </div>
  );
}
