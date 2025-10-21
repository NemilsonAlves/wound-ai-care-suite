import { ArrowLeft, Scissors, Shield, Droplets, Zap, Info, Target, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const timeComponents = [
  {
    letter: "T",
    component: "Tissue Management",
    title: "Manejo do Tecido",
    icon: <Scissors className="w-6 h-6" />,
    color: "destructive",
    description: "Remoção de tecido necrótico e desvitalizado",
    objectives: [
      "Remover tecido necrótico e esfacelo",
      "Promover ambiente favorável à cicatrização",
      "Reduzir carga bacteriana",
      "Facilitar penetração de medicamentos"
    ],
    methods: [
      {
        type: "Desbridamento Cirúrgico",
        description: "Remoção rápida de grandes quantidades de tecido necrótico",
        indications: ["Necrose extensa", "Sinais de infecção sistêmica", "Urgência clínica"],
        contraindications: ["Coagulopatias", "Isquemia severa", "Feridas em calcâneos secos"]
      },
      {
        type: "Desbridamento Enzimático",
        description: "Uso de enzimas proteolíticas para digestão seletiva",
        indications: ["Pacientes que não toleram cirurgia", "Necrose localizada", "Complemento ao desbridamento cirúrgico"],
        contraindications: ["Hipersensibilidade às enzimas", "Feridas com exposição de estruturas nobres"]
      },
      {
        type: "Desbridamento Autolítico",
        description: "Uso da própria capacidade do organismo para remover tecido necrótico",
        indications: ["Pacientes estáveis", "Necrose pequena", "Manutenção entre outros métodos"],
        contraindications: ["Infecção ativa", "Necrose extensa", "Urgência de limpeza"]
      },
      {
        type: "Desbridamento Mecânico",
        description: "Remoção física através de irrigação ou fricção",
        indications: ["Complemento a outros métodos", "Limpeza de debris", "Feridas com fibrina"],
        contraindications: ["Tecido de granulação frágil", "Dor excessiva", "Sangramento ativo"]
      }
    ]
  },
  {
    letter: "I",
    component: "Infection/Inflammation",
    title: "Infecção e Inflamação",
    icon: <Shield className="w-6 h-6" />,
    color: "secondary",
    description: "Controle de infecção e processo inflamatório",
    objectives: [
      "Identificar e tratar infecção",
      "Reduzir carga bacteriana",
      "Controlar inflamação excessiva",
      "Promover resposta imune adequada"
    ],
    signs: {
      local: [
        "Eritema perilesional",
        "Edema aumentado",
        "Calor local",
        "Dor desproporcional",
        "Exsudato purulento",
        "Odor fétido",
        "Retardo na cicatrização"
      ],
      systemic: [
        "Febre",
        "Leucocitose",
        "Aumento de PCR",
        "Alteração do estado mental",
        "Instabilidade hemodinâmica"
      ]
    },
    interventions: [
      {
        level: "Prevenção",
        actions: ["Técnica asséptica", "Limpeza adequada", "Controle de umidade", "Proteção da pele perilesional"]
      },
      {
        level: "Colonização Crítica",
        actions: ["Antimicrobianos tópicos", "Curativos com prata", "Mel medicinal", "Desbridamento"]
      },
      {
        level: "Infecção Local",
        actions: ["Antibióticos tópicos", "Antissépticos", "Desbridamento agressivo", "Culturas"]
      },
      {
        level: "Infecção Sistêmica",
        actions: ["Antibióticos sistêmicos", "Desbridamento cirúrgico", "Suporte clínico", "Internação"]
      }
    ]
  },
  {
    letter: "M",
    component: "Moisture Balance",
    title: "Equilíbrio da Umidade",
    icon: <Droplets className="w-6 h-6" />,
    color: "default",
    description: "Manutenção do ambiente úmido ideal para cicatrização",
    objectives: [
      "Manter umidade adequada no leito da ferida",
      "Absorver excesso de exsudato",
      "Proteger pele perilesional",
      "Facilitar migração celular"
    ],
    exudateTypes: [
      {
        type: "Seroso",
        description: "Claro, aquoso, amarelo-claro",
        significance: "Normal no processo de cicatrização"
      },
      {
        type: "Sanguinolento",
        description: "Vermelho, com presença de sangue",
        significance: "Trauma, angiogênese ativa"
      },
      {
        type: "Serossanguinolento",
        description: "Rosa claro, mistura de soro e sangue",
        significance: "Fase inflamatória normal"
      },
      {
        type: "Purulento",
        description: "Espesso, amarelo-esverdeado, odor",
        significance: "Infecção bacteriana"
      }
    ],
    management: [
      {
        level: "Ferida Seca",
        products: ["Hidrogéis", "Curativos oclusivos", "Soluções salinas"],
        frequency: "Trocas menos frequentes"
      },
      {
        level: "Exsudato Mínimo",
        products: ["Filmes transparentes", "Hidrocoloides finos", "Espumas finas"],
        frequency: "2-3 vezes por semana"
      },
      {
        level: "Exsudato Moderado",
        products: ["Espumas", "Alginatos", "Hidrocoloides"],
        frequency: "Diário ou em dias alternados"
      },
      {
        level: "Exsudato Abundante",
        products: ["Alginatos", "Espumas absorventes", "Curativos superabsorventes"],
        frequency: "Diário ou mais frequente"
      }
    ]
  },
  {
    letter: "E",
    component: "Edge Effect",
    title: "Efeito das Bordas",
    icon: <Zap className="w-6 h-6" />,
    color: "default",
    description: "Avaliação e manejo das bordas da ferida",
    objectives: [
      "Avaliar viabilidade das bordas",
      "Promover migração epitelial",
      "Prevenir maceração perilesional",
      "Estimular contração da ferida"
    ],
    edgeTypes: [
      {
        type: "Bordas Aderidas",
        description: "Bem aderidas ao leito, rosa/vermelhas",
        significance: "Cicatrização normal",
        management: "Manter ambiente úmido, proteger"
      },
      {
        type: "Bordas Não Aderidas",
        description: "Elevadas, não aderidas ao leito",
        significance: "Possível infecção ou ressecamento",
        management: "Investigar causa, otimizar umidade"
      },
      {
        type: "Bordas Maceradas",
        description: "Brancas, amolecidas, friáveis",
        significance: "Excesso de umidade",
        management: "Reduzir umidade, proteger pele"
      },
      {
        type: "Bordas Hiperqueratóticas",
        description: "Espessas, calosidades",
        significance: "Pressão crônica, idade",
        management: "Desbridamento, alívio de pressão"
      },
      {
        type: "Bordas Necróticas",
        description: "Escuras, desvitalizadas",
        significance: "Isquemia, infecção",
        management: "Desbridamento, investigar causa"
      }
    ],
    interventions: [
      "Proteção da pele perilesional",
      "Uso de barreiras cutâneas",
      "Desbridamento de bordas não viáveis",
      "Estimulação da migração epitelial",
      "Controle de fatores sistêmicos"
    ]
  }
];

const implementationSteps = [
  {
    step: "Avaliação Inicial",
    description: "Examine todos os componentes do TIME",
    actions: ["Fotografar a ferida", "Medir dimensões", "Avaliar cada componente", "Documentar achados"]
  },
  {
    step: "Priorização",
    description: "Identifique qual componente necessita intervenção prioritária",
    actions: ["T: Se há necrose significativa", "I: Se há sinais de infecção", "M: Se há desequilíbrio de umidade", "E: Se bordas estão comprometidas"]
  },
  {
    step: "Intervenção",
    description: "Implemente as ações específicas para cada componente",
    actions: ["Selecionar produtos adequados", "Definir frequência de trocas", "Estabelecer metas", "Educar equipe/paciente"]
  },
  {
    step: "Reavaliação",
    description: "Monitore o progresso e ajuste o plano",
    actions: ["Reavaliar semanalmente", "Documentar mudanças", "Ajustar intervenções", "Comunicar equipe"]
  }
];

export default function TimeProtocol() {
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
            ⏰ TIME Framework
          </h1>
          <p className="text-muted-foreground mt-1">Tissue, Infection, Moisture, Edge - Preparo do Leito da Ferida</p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Framework Internacionalmente Reconhecido</AlertTitle>
        <AlertDescription>
          O TIME Framework é uma abordagem sistemática para o preparo do leito da ferida, 
          desenvolvida por especialistas internacionais e baseada em evidências científicas.
        </AlertDescription>
      </Alert>

      {/* Objetivo e Princípios */}
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
              Fornecer uma abordagem sistemática para otimizar o ambiente da ferida, 
              removendo barreiras à cicatrização e promovendo condições ideais para reparo tecidual.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Aplicação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Feridas crônicas de qualquer etiologia</li>
              <li>• Úlceras por pressão</li>
              <li>• Úlceras venosas e arteriais</li>
              <li>• Feridas diabéticas</li>
              <li>• Feridas cirúrgicas complicadas</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Componentes do TIME */}
      <div className="space-y-6">
        {timeComponents.map((component, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-${component.color} text-${component.color}-foreground flex items-center justify-center font-bold text-xl`}>
                  {component.letter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {component.icon}
                    {component.title}
                  </div>
                  <div className="text-sm font-normal text-muted-foreground">
                    {component.component}
                  </div>
                </div>
              </CardTitle>
              <CardDescription>{component.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Objetivos */}
                <div>
                  <h3 className="font-semibold mb-3">Objetivos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {component.objectives.map((objective, objIndex) => (
                      <div key={objIndex} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-status-stable flex-shrink-0" />
                        {objective}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Conteúdo específico por componente */}
                {component.letter === "T" && (
                  <div>
                    <h3 className="font-semibold mb-3">Métodos de Desbridamento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {component.methods.map((method, methodIndex) => (
                        <div key={methodIndex} className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">{method.type}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-status-stable">Indicações:</span>
                              <ul className="text-xs text-muted-foreground ml-2">
                                {method.indications.map((indication, indIndex) => (
                                  <li key={indIndex}>• {indication}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-destructive">Contraindicações:</span>
                              <ul className="text-xs text-muted-foreground ml-2">
                                {method.contraindications.map((contra, contraIndex) => (
                                  <li key={contraIndex}>• {contra}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {component.letter === "I" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Sinais de Infecção</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Sinais Locais</h4>
                          <ul className="space-y-1">
                            {component.signs.local.map((sign, signIndex) => (
                              <li key={signIndex} className="text-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                {sign}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Sinais Sistêmicos</h4>
                          <ul className="space-y-1">
                            {component.signs.systemic.map((sign, signIndex) => (
                              <li key={signIndex} className="text-sm flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                                {sign}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Níveis de Intervenção</h3>
                      <div className="space-y-3">
                        {component.interventions.map((intervention, intIndex) => (
                          <div key={intIndex} className="p-3 border rounded-lg">
                            <h4 className="font-medium mb-2">{intervention.level}</h4>
                            <div className="flex flex-wrap gap-2">
                              {intervention.actions.map((action, actionIndex) => (
                                <Badge key={actionIndex} variant="outline" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {component.letter === "M" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Tipos de Exsudato</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {component.exudateTypes.map((exudate, exIndex) => (
                          <div key={exIndex} className="p-3 border rounded-lg">
                            <h4 className="font-medium">{exudate.type}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{exudate.description}</p>
                            <p className="text-xs text-status-stable">{exudate.significance}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Manejo por Nível de Exsudato</h3>
                      <div className="space-y-3">
                        {component.management.map((mgmt, mgmtIndex) => (
                          <div key={mgmtIndex} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{mgmt.level}</h4>
                              <Badge variant="outline">{mgmt.frequency}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {mgmt.products.map((product, prodIndex) => (
                                <Badge key={prodIndex} variant="secondary" className="text-xs">
                                  {product}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {component.letter === "E" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Tipos de Bordas</h3>
                      <div className="space-y-3">
                        {component.edgeTypes.map((edge, edgeIndex) => (
                          <div key={edgeIndex} className="p-3 border rounded-lg">
                            <h4 className="font-medium">{edge.type}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{edge.description}</p>
                            <p className="text-xs text-status-stable mb-2">Significado: {edge.significance}</p>
                            <p className="text-xs font-medium">Manejo: {edge.management}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Intervenções Gerais</h3>
                      <ul className="space-y-2">
                        {component.interventions.map((intervention, intIndex) => (
                          <li key={intIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-status-stable flex-shrink-0" />
                            {intervention}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Implementação Prática */}
      <Card>
        <CardHeader>
          <CardTitle>Implementação Prática do TIME</CardTitle>
          <CardDescription>
            Passos sistemáticos para aplicação do framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {implementationSteps.map((step, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold">{step.step}</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-11">{step.description}</p>
                <ul className="ml-11 space-y-1">
                  {step.actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      {action}
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
        <AlertTitle>Documentação e Monitoramento</AlertTitle>
        <AlertDescription>
          Documente a avaliação de cada componente do TIME, as intervenções implementadas e 
          a resposta do paciente. Reavalie semanalmente e ajuste o plano conforme necessário.
        </AlertDescription>
      </Alert>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={() => navigate('/avaliacoes/nova')}>
          Aplicar TIME Framework
        </Button>
        <Button variant="outline" onClick={() => navigate('/protocolos')}>
          Voltar aos Protocolos
        </Button>
      </div>
    </div>
  );
}