import { Search, Star, TrendingUp, FileText, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const protocols = [
  {
    id: 1,
    name: "Escala de Braden",
    description: "Avaliação de risco para desenvolvimento de úlceras por pressão",
    category: "Avaliação",
    usage: 245,
    rating: 5,
    icon: "📊"
  },
  {
    id: 2,
    name: "PUSH Tool",
    description: "Ferramenta de monitoramento de cicatrização de úlceras por pressão",
    category: "Monitoramento",
    usage: 189,
    rating: 5,
    icon: "📈"
  },
  {
    id: 3,
    name: "TIME Framework",
    description: "Preparo do leito da ferida - Tecido, Inflamação, Umidade, Borda",
    category: "Tratamento",
    usage: 312,
    rating: 5,
    icon: "🔬"
  },
  {
    id: 4,
    name: "Wagner Classification",
    description: "Classificação de úlceras em pé diabético",
    category: "Classificação",
    usage: 156,
    rating: 4,
    icon: "🦶"
  }
];

const recommendations = [
  {
    id: 1,
    product: "Hidrofibra com Prata",
    indication: "Úlcera por Pressão Estágio III",
    confidence: 95,
    justification: "Alta absorção + antimicrobiano indicado para exsudato moderado/alto",
    cost: "R$ 45,00",
    stock: 12
  },
  {
    id: 2,
    product: "Espuma com Silicone",
    indication: "Úlcera Venosa com Exsudato Moderado",
    confidence: 88,
    justification: "Boa absorção e atraumático para remoção",
    cost: "R$ 32,00",
    stock: 28
  },
  {
    id: 3,
    product: "Hidrogel",
    indication: "Ferida Seca - Necrose",
    confidence: 92,
    justification: "Hidratação e desbridamento autolítico",
    cost: "R$ 38,00",
    stock: 15
  }
];

export default function Protocols() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Protocolos & Recomendações</h1>
          <p className="text-muted-foreground mt-1">Diretrizes baseadas em evidências e recomendações por IA</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate('/protocolos/novo')}>
          <FileText className="w-5 h-5" />
          Adicionar Protocolo
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar protocolos..." className="pl-10" />
      </div>

      <Tabs defaultValue="protocols" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="protocols">Protocolos</TabsTrigger>
          <TabsTrigger value="recommendations">
            <Sparkles className="w-4 h-4 mr-2" />
            Recomendações IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocols.map((protocol) => (
              <Card key={protocol.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{protocol.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{protocol.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">{protocol.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-status-warning">
                      {[...Array(protocol.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{protocol.description}</CardDescription>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      {protocol.usage} usos este mês
                    </span>
                    <Button size="sm">Ver Protocolo</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Motor de Recomendação IA
              </CardTitle>
              <CardDescription>
                Recomendações baseadas em tipo de lesão, exsudato, infecção e profundidade
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{rec.product}</h3>
                        <Badge variant="outline" className="text-xs">
                          {rec.indication}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rec.justification}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">Custo: <strong>{rec.cost}</strong></span>
                        <span className="text-muted-foreground">Estoque: <strong>{rec.stock} un</strong></span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Confiança IA:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-status-stable transition-all" 
                                style={{ width: `${rec.confidence}%` }}
                              />
                            </div>
                            <span className="font-semibold text-status-stable">{rec.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button>Prescrever</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
