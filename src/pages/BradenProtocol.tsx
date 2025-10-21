import { ArrowLeft, AlertTriangle, CheckCircle, Info, Users, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const bradenScores = [
  {
    category: "Percepção Sensorial",
    description: "Capacidade de responder significativamente ao desconforto relacionado à pressão",
    scores: [
      { value: 1, label: "Completamente Limitada", description: "Não responde a estímulos dolorosos devido ao nível de consciência diminuído ou sedação" },
      { value: 2, label: "Muito Limitada", description: "Responde somente a estímulos dolorosos, não consegue comunicar desconforto" },
      { value: 3, label: "Ligeiramente Limitada", description: "Responde a comandos verbais, mas nem sempre consegue comunicar desconforto" },
      { value: 4, label: "Nenhuma Limitação", description: "Responde a comandos verbais, não tem déficit sensorial que limitaria a capacidade de sentir dor" }
    ]
  },
  {
    category: "Umidade",
    description: "Grau em que a pele é exposta à umidade",
    scores: [
      { value: 1, label: "Constantemente Úmida", description: "A pele é mantida úmida quase constantemente por transpiração, urina, etc." },
      { value: 2, label: "Muito Úmida", description: "A pele está frequentemente, mas nem sempre úmida" },
      { value: 3, label: "Ocasionalmente Úmida", description: "A pele está ocasionalmente úmida, requerendo troca de lençóis aproximadamente uma vez por dia" },
      { value: 4, label: "Raramente Úmida", description: "A pele está geralmente seca, a troca de lençóis é feita nos intervalos de rotina" }
    ]
  },
  {
    category: "Atividade",
    description: "Grau de atividade física",
    scores: [
      { value: 1, label: "Acamado", description: "Confinado à cama" },
      { value: 2, label: "Confinado à Cadeira", description: "A capacidade de caminhar está severamente limitada ou inexistente" },
      { value: 3, label: "Caminha Ocasionalmente", description: "Caminha ocasionalmente durante o dia, mas por distâncias muito curtas" },
      { value: 4, label: "Caminha Frequentemente", description: "Caminha fora do quarto pelo menos 2 vezes por dia e dentro do quarto pelo menos uma vez a cada 2 horas" }
    ]
  },
  {
    category: "Mobilidade",
    description: "Capacidade de mudar e controlar a posição do corpo",
    scores: [
      { value: 1, label: "Completamente Imóvel", description: "Não faz nem mesmo pequenas mudanças na posição do corpo ou extremidades sem ajuda" },
      { value: 2, label: "Muito Limitada", description: "Faz pequenas mudanças ocasionais na posição do corpo ou extremidades, mas é incapaz de fazer mudanças frequentes ou significativas" },
      { value: 3, label: "Ligeiramente Limitada", description: "Faz mudanças frequentes, embora pequenas, na posição do corpo ou extremidades" },
      { value: 4, label: "Não Apresenta Limitações", description: "Faz mudanças grandes e frequentes na posição sem assistência" }
    ]
  },
  {
    category: "Nutrição",
    description: "Padrão usual de consumo alimentar",
    scores: [
      { value: 1, label: "Muito Pobre", description: "Nunca come uma refeição completa, raramente come mais que 1/3 de qualquer comida oferecida" },
      { value: 2, label: "Provavelmente Inadequada", description: "Raramente come uma refeição completa e geralmente come apenas cerca da metade de qualquer comida oferecida" },
      { value: 3, label: "Adequada", description: "Come mais da metade da maioria das refeições, come um total de 4 porções de proteína por dia" },
      { value: 4, label: "Excelente", description: "Come a maior parte de cada refeição, nunca recusa uma refeição" }
    ]
  },
  {
    category: "Fricção e Cisalhamento",
    description: "Fricção ocorre quando a pele move contra as superfícies de apoio",
    scores: [
      { value: 1, label: "Problema", description: "Requer assistência moderada a máxima para mover-se, é impossível levantar completamente sem esfregar contra os lençóis" },
      { value: 2, label: "Problema em Potencial", description: "Move-se independentemente, mas tem pouca força muscular, não consegue levantar-se completamente durante o movimento" },
      { value: 3, label: "Nenhum Problema Aparente", description: "Move-se independentemente na cama e na cadeira e tem suficiente força muscular para levantar-se completamente durante o movimento" }
    ]
  }
];

const riskLevels = [
  { range: "≤ 9", level: "Risco Muito Alto", color: "destructive", actions: ["Mudança de decúbito a cada 1-2h", "Colchão de ar", "Coxins para calcâneos", "Avaliação nutricional", "Hidratação da pele"] },
  { range: "10-12", level: "Risco Alto", color: "destructive", actions: ["Mudança de decúbito a cada 2h", "Colchão viscoelástico", "Proteção de proeminências ósseas", "Controle de umidade"] },
  { range: "13-14", level: "Risco Moderado", color: "secondary", actions: ["Mudança de decúbito a cada 3h", "Colchão de espuma", "Inspeção diária da pele", "Mobilização precoce"] },
  { range: "15-18", level: "Risco Baixo", color: "default", actions: ["Mudança de decúbito a cada 4h", "Colchão hospitalar padrão", "Inspeção da pele", "Manutenção da mobilidade"] },
  { range: "19-23", level: "Sem Risco", color: "default", actions: ["Cuidados de rotina", "Manutenção da mobilidade", "Educação do paciente"] }
];

const preventiveMeasures = [
  {
    category: "Cuidados com a Pele",
    measures: [
      "Inspeção diária da pele, especialmente sobre proeminências ósseas",
      "Limpeza da pele com sabão neutro e água morna",
      "Hidratação da pele com cremes ou loções não oleosas",
      "Manter a pele seca e livre de umidade excessiva",
      "Evitar massagem sobre proeminências ósseas"
    ]
  },
  {
    category: "Reposicionamento",
    measures: [
      "Mudança de decúbito conforme escore de risco",
      "Uso de travesseiros e coxins para alívio de pressão",
      "Elevação dos calcâneos com coxins",
      "Posicionamento em ângulo de 30° para decúbito lateral",
      "Evitar posição de Fowler > 30° por períodos prolongados"
    ]
  },
  {
    category: "Superfícies de Apoio",
    measures: [
      "Colchão adequado conforme nível de risco",
      "Almofadas de gel ou ar para cadeiras",
      "Lençóis sem dobras ou migalhas",
      "Evitar superfícies tipo 'rosquinha' ou argolas",
      "Manutenção adequada dos equipamentos"
    ]
  },
  {
    category: "Nutrição e Hidratação",
    measures: [
      "Avaliação nutricional completa",
      "Suplementação proteica quando necessário",
      "Hidratação adequada (30-35ml/kg/dia)",
      "Controle glicêmico em diabéticos",
      "Suplementação vitamínica quando indicado"
    ]
  }
];

export default function BradenProtocol() {
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
            📊 Escala de Braden
          </h1>
          <p className="text-muted-foreground mt-1">Protocolo para Avaliação de Risco de Úlceras por Pressão</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Protocolo Baseado em Evidências</AlertTitle>
        <AlertDescription>
          Este protocolo segue as diretrizes da National Pressure Injury Advisory Panel (NPIAP) e 
          recomendações da Comissão de Controle de Infecção Hospitalar.
        </AlertDescription>
      </Alert>

      {/* Objetivo e Indicações */}
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
              Identificar pacientes em risco para desenvolvimento de úlceras por pressão através de 
              avaliação sistemática de fatores de risco, permitindo implementação de medidas preventivas adequadas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Indicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Todos os pacientes internados</li>
              <li>• Pacientes em atendimento domiciliar</li>
              <li>• Residentes de instituições de longa permanência</li>
              <li>• Pacientes em cuidados paliativos</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Frequência de Avaliação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Frequência de Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="font-semibold">Admissão</div>
              <div className="text-sm text-muted-foreground">Primeiras 8 horas</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="font-semibold">Reavaliação</div>
              <div className="text-sm text-muted-foreground">A cada 48 horas</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="font-semibold">Mudança Clínica</div>
              <div className="text-sm text-muted-foreground">Sempre que houver alteração</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorias de Avaliação */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Avaliação</CardTitle>
          <CardDescription>
            Avalie cada categoria e some os pontos para obter o escore total
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {bradenScores.map((category, index) => (
            <div key={index} className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{category.category}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.scores.map((score) => (
                  <div key={score.value} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{score.value}</Badge>
                      <span className="font-medium">{score.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{score.description}</p>
                  </div>
                ))}
              </div>
              {index < bradenScores.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Interpretação dos Resultados */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretação dos Resultados</CardTitle>
          <CardDescription>
            Classificação do risco baseada no escore total (6-23 pontos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskLevels.map((level, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Badge variant={level.color as any}>{level.range} pontos</Badge>
                    <span className="font-semibold">{level.level}</span>
                  </div>
                  {level.level.includes("Alto") && (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {level.actions.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-status-stable" />
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Medidas Preventivas */}
      <Card>
        <CardHeader>
          <CardTitle>Medidas Preventivas</CardTitle>
          <CardDescription>
            Intervenções baseadas em evidências para prevenção de úlceras por pressão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {preventiveMeasures.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold text-lg">{category.category}</h3>
                <ul className="space-y-2">
                  {category.measures.map((measure, measureIndex) => (
                    <li key={measureIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-status-stable mt-0.5 flex-shrink-0" />
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documentação */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Documentação Obrigatória</AlertTitle>
        <AlertDescription>
          Registre o escore de Braden, nível de risco identificado e medidas preventivas implementadas 
          no prontuário do paciente. Comunique alterações significativas à equipe multidisciplinar.
        </AlertDescription>
      </Alert>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={() => navigate('/avaliacoes/nova')}>
          Iniciar Avaliação
        </Button>
        <Button variant="outline" onClick={() => navigate('/protocolos')}>
          Voltar aos Protocolos
        </Button>
      </div>
    </div>
  );
}