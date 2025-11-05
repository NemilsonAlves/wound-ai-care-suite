import { ArrowLeft, Layers, AlertTriangle, Activity, Stethoscope, Info, Target, Clock, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const wagnerGrades = [
  {
    grade: 0,
    title: "Pé em Risco",
    description: "Pé com risco de ulceração, mas sem lesão aberta",
    characteristics: [
      "Pele íntegra",
      "Deformidades ósseas",
      "Calosidades",
      "Neuropatia presente",
      "Doença vascular periférica"
    ],
    treatment: [
      "Educação do paciente",
      "Cuidados preventivos",
      "Calçados adequados",
      "Controle glicêmico",
      "Inspeção diária dos pés"
    ],
    prognosis: "Excelente com cuidados preventivos",
    color: "default"
  },
  {
    grade: 1,
    title: "Úlcera Superficial",
    description: "Úlcera superficial sem sinais de infecção",
    characteristics: [
      "Lesão superficial",
      "Não atinge estruturas profundas",
      "Sem sinais de infecção",
      "Bordas bem definidas",
      "Base limpa"
    ],
    treatment: [
      "Desbridamento se necessário",
      "Curativo adequado",
      "Alívio de pressão",
      "Controle glicêmico",
      "Antibiótico tópico se indicado"
    ],
    prognosis: "Boa com tratamento adequado",
    color: "secondary"
  },
  {
    grade: 2,
    title: "Úlcera Profunda",
    description: "Úlcera profunda, pode atingir tendões e cápsulas articulares",
    characteristics: [
      "Lesão profunda",
      "Pode expor tendões",
      "Pode atingir cápsulas articulares",
      "Sem envolvimento ósseo",
      "Sem abscesso"
    ],
    treatment: [
      "Desbridamento cirúrgico",
      "Antibióticos sistêmicos",
      "Imobilização",
      "Curativos especializados",
      "Avaliação vascular"
    ],
    prognosis: "Reservada, requer tratamento intensivo",
    color: "secondary"
  },
  {
    grade: 3,
    title: "Úlcera com Osteomielite",
    description: "Úlcera profunda com abscesso, osteomielite ou infecção articular",
    characteristics: [
      "Infecção profunda",
      "Osteomielite",
      "Artrite séptica",
      "Abscesso",
      "Necrose óssea"
    ],
    treatment: [
      "Desbridamento cirúrgico agressivo",
      "Antibióticos IV prolongados",
      "Possível amputação menor",
      "Controle rigoroso da diabetes",
      "Cuidados intensivos"
    ],
    prognosis: "Reservada, alto risco de amputação",
    color: "destructive"
  },
  {
    grade: 4,
    title: "Gangrena Localizada",
    description: "Gangrena limitada aos dedos ou parte do pé",
    characteristics: [
      "Necrose tecidual",
      "Gangrena localizada",
      "Isquemia severa",
      "Infecção associada",
      "Dor intensa"
    ],
    treatment: [
      "Amputação menor",
      "Revascularização se possível",
      "Antibióticos IV",
      "Controle da dor",
      "Cuidados intensivos"
    ],
    prognosis: "Reservada, amputação necessária",
    color: "destructive"
  },
  {
    grade: 5,
    title: "Gangrena Extensa",
    description: "Gangrena extensa do pé",
    characteristics: [
      "Necrose extensa",
      "Gangrena de todo o pé",
      "Sepse sistêmica",
      "Isquemia crítica",
      "Risco de vida"
    ],
    treatment: [
      "Amputação maior",
      "Cuidados intensivos",
      "Antibióticos IV",
      "Suporte hemodinâmico",
      "Controle da sepse"
    ],
    prognosis: "Grave, risco de vida",
    color: "destructive"
  }
];

const riskFactors = [
  {
    category: "Fatores Metabólicos",
    factors: [
      "Diabetes mellitus descompensado",
      "HbA1c > 7%",
      "Duração do diabetes > 10 anos",
      "Nefropatia diabética",
      "Retinopatia diabética"
    ]
  },
  {
    category: "Fatores Vasculares",
    factors: [
      "Doença arterial periférica",
      "Índice tornozelo-braço < 0,9",
      "Ausência de pulsos pedais",
      "Claudicação intermitente",
      "Tempo de enchimento capilar > 3s"
    ]
  },
  {
    category: "Fatores Neurológicos",
    factors: [
      "Neuropatia diabética",
      "Perda da sensibilidade protetora",
      "Teste do monofilamento alterado",
      "Reflexos aquileus ausentes",
      "Deformidades do pé"
    ]
  },
  {
    category: "Fatores Biomecânicos",
    factors: [
      "Deformidades ósseas",
      "Calosidades plantares",
      "Pressões plantares elevadas",
      "Mobilidade articular limitada",
      "Calçados inadequados"
    ]
  }
];

const preventiveMeasures = [
  {
    level: "Prevenção Primária",
    target: "Pacientes diabéticos sem úlceras",
    measures: [
      "Educação sobre cuidados com os pés",
      "Inspeção diária dos pés",
      "Controle glicêmico rigoroso",
      "Calçados adequados e palmilhas",
      "Cuidados com unhas e calosidades",
      "Avaliação anual dos pés"
    ]
  },
  {
    level: "Prevenção Secundária",
    target: "Pacientes com história de úlceras",
    measures: [
      "Monitoramento mais frequente",
      "Calçados terapêuticos",
      "Palmilhas personalizadas",
      "Cuidados podológicos regulares",
      "Controle rigoroso de fatores de risco",
      "Educação continuada"
    ]
  },
  {
    level: "Prevenção Terciária",
    target: "Pacientes com úlceras ativas",
    measures: [
      "Tratamento adequado da úlcera",
      "Alívio de pressão",
      "Controle de infecção",
      "Otimização da cicatrização",
      "Prevenção de complicações",
      "Reabilitação funcional"
    ]
  }
];

const assessmentProtocol = [
  {
    domain: "História Clínica",
    items: [
      "Duração e controle do diabetes",
      "História de úlceras prévias",
      "Amputações anteriores",
      "Sintomas vasculares",
      "Medicações em uso"
    ]
  },
  {
    domain: "Exame Físico",
    items: [
      "Inspeção geral dos pés",
      "Palpação de pulsos",
      "Teste de sensibilidade",
      "Avaliação de deformidades",
      "Medição de pressões plantares"
    ]
  },
  {
    domain: "Exames Complementares",
    items: [
      "Índice tornozelo-braço",
      "Doppler arterial",
      "Radiografias dos pés",
      "Ressonância magnética (se indicada)",
      "Culturas (se infecção)"
    ]
  },
  {
    domain: "Avaliação da Úlcera",
    items: [
      "Localização e dimensões",
      "Profundidade e estruturas expostas",
      "Características do leito",
      "Sinais de infecção",
      "Classificação Wagner"
    ]
  }
];

const treatmentAlgorithm = [
  {
    grade: "0-1",
    approach: "Conservador",
    interventions: [
      "Cuidados locais da ferida",
      "Alívio de pressão",
      "Controle glicêmico",
      "Antibióticos tópicos se necessário"
    ]
  },
  {
    grade: "2",
    approach: "Cirúrgico Menor",
    interventions: [
      "Desbridamento cirúrgico",
      "Antibióticos sistêmicos",
      "Imobilização",
      "Avaliação vascular"
    ]
  },
  {
    grade: "3",
    approach: "Cirúrgico Agressivo",
    interventions: [
      "Desbridamento ósseo",
      "Antibióticos IV prolongados",
      "Possível amputação menor",
      "Revascularização se indicada"
    ]
  },
  {
    grade: "4-5",
    approach: "Amputação",
    interventions: [
      "Amputação menor ou maior",
      "Cuidados intensivos",
      "Controle de sepse",
      "Reabilitação"
    ]
  }
];

export default function WagnerProtocol() {
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
            🦶 Classificação de Wagner
          </h1>
          <p className="text-muted-foreground mt-1">Sistema de Classificação para Úlceras em Pé Diabético</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Sistema de Classificação Clássico</AlertTitle>
        <AlertDescription>
          A Classificação de Wagner é o sistema mais utilizado mundialmente para estratificar 
          úlceras em pé diabético, orientando decisões terapêuticas e prognóstico.
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
              Classificar úlceras em pé diabético de acordo com a profundidade e presença de infecção, 
              orientando o tratamento adequado e estabelecendo prognóstico.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Indicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Todos os pacientes diabéticos</li>
              <li>• Úlceras em pés de qualquer etiologia</li>
              <li>• Planejamento terapêutico</li>
              <li>• Avaliação prognóstica</li>
              <li>• Comunicação entre profissionais</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Classificação Wagner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Graus da Classificação Wagner
          </CardTitle>
          <CardDescription>
            Sistema de 6 graus baseado na profundidade e presença de infecção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {wagnerGrades.map((grade, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={grade.color as 'default' | 'secondary' | 'destructive' | 'outline'} className="text-lg px-3 py-1">
                        Grau {grade.grade}
                      </Badge>
                      <h3 className="font-semibold text-lg">{grade.title}</h3>
                    </div>
                    {grade.grade >= 3 && (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <p className="text-muted-foreground">{grade.description}</p>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Características
                      </h4>
                      <ul className="space-y-1">
                        {grade.characteristics.map((char, charIndex) => (
                          <li key={charIndex} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Tratamento
                      </h4>
                      <ul className="space-y-1">
                        {grade.treatment.map((treat, treatIndex) => (
                          <li key={treatIndex} className="text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-status-stable flex-shrink-0" />
                            {treat}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Prognóstico</h4>
                      <p className="text-sm text-muted-foreground">{grade.prognosis}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fatores de Risco */}
      <Card>
        <CardHeader>
          <CardTitle>Fatores de Risco para Úlceras em Pé Diabético</CardTitle>
          <CardDescription>
            Identificação e manejo dos principais fatores de risco
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskFactors.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold">{category.category}</h3>
                <ul className="space-y-2">
                  {category.factors.map((factor, factorIndex) => (
                    <li key={factorIndex} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Protocolo de Avaliação */}
      <Card>
        <CardHeader>
          <CardTitle>Protocolo de Avaliação</CardTitle>
          <CardDescription>
            Avaliação sistemática do pé diabético
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessmentProtocol.map((domain, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-semibold">{domain.domain}</h3>
                <ul className="space-y-2">
                  {domain.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-status-stable flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Algoritmo de Tratamento */}
      <Card>
        <CardHeader>
          <CardTitle>Algoritmo de Tratamento</CardTitle>
          <CardDescription>
            Abordagem terapêutica baseada no grau Wagner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {treatmentAlgorithm.map((algorithm, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="outline">Grau {algorithm.grade}</Badge>
                  <span className="font-semibold">{algorithm.approach}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {algorithm.interventions.map((intervention, intIndex) => (
                    <div key={intIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-status-stable flex-shrink-0" />
                      {intervention}
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
            Estratégias de prevenção em diferentes níveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {preventiveMeasures.map((prevention, index) => (
              <div key={index} className="space-y-3">
                <div>
                  <h3 className="font-semibold">{prevention.level}</h3>
                  <p className="text-sm text-muted-foreground">{prevention.target}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {prevention.measures.map((measure, measureIndex) => (
                    <div key={measureIndex} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                      <CheckCircle className="w-4 h-4 text-status-stable flex-shrink-0" />
                      {measure}
                    </div>
                  ))}
                </div>
                {index < preventiveMeasures.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Considerações Especiais */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Considerações Importantes</AlertTitle>
        <AlertDescription>
          A classificação Wagner deve ser complementada com avaliação vascular e microbiológica. 
          Pacientes com graus 3-5 requerem abordagem multidisciplinar urgente. 
          O controle glicêmico é fundamental em todos os graus.
        </AlertDescription>
      </Alert>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={() => navigate('/avaliacoes/nova')}>
          Iniciar Avaliação Wagner
        </Button>
        <Button variant="outline" onClick={() => navigate('/protocolos')}>
          Voltar aos Protocolos
        </Button>
      </div>
    </div>
  );
}
