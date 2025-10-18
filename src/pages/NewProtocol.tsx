import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const protocolSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(200, "Nome muito longo"),
  category: z.enum(["Avaliação", "Monitoramento", "Tratamento", "Classificação", "Prevenção"]),
  description: z.string().trim().min(10, "Descrição muito curta").max(1000, "Descrição muito longa"),
  objective: z.string().max(500).optional(),
  indications: z.string().max(1000).optional(),
  methodology: z.string().max(2000).optional(),
  references: z.string().max(1000).optional(),
});

export default function NewProtocol() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    objective: "",
    indications: "",
    methodology: "",
    references: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = protocolSchema.parse(formData);

      // Aqui você integraria com o backend (Supabase)
      console.log("Dados validados:", validatedData);

      toast({
        title: "Protocolo Criado",
        description: "O protocolo foi adicionado à biblioteca com sucesso",
      });

      setTimeout(() => navigate("/protocolos"), 1000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de Validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/protocolos")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Novo Protocolo</h1>
            <p className="text-muted-foreground mt-1">Adicione um novo protocolo clínico à biblioteca</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Protocolo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Escala de Braden, PUSH Tool, TIME Framework"
                required
                maxLength={200}
              />
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione a categoria..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Avaliação">Avaliação</SelectItem>
                  <SelectItem value="Monitoramento">Monitoramento</SelectItem>
                  <SelectItem value="Tratamento">Tratamento</SelectItem>
                  <SelectItem value="Classificação">Classificação</SelectItem>
                  <SelectItem value="Prevenção">Prevenção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva brevemente o protocolo e sua finalidade..."
                className="min-h-[100px]"
                required
                maxLength={1000}
              />
            </div>
          </CardContent>
        </Card>

        {/* Detalhes do Protocolo */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Protocolo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="objective">Objetivo</Label>
              <Textarea
                id="objective"
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Qual é o objetivo principal deste protocolo?"
                className="min-h-[80px]"
                maxLength={500}
              />
            </div>

            <div>
              <Label htmlFor="indications">Indicações</Label>
              <Textarea
                id="indications"
                value={formData.indications}
                onChange={(e) => setFormData({ ...formData, indications: e.target.value })}
                placeholder="Quando este protocolo deve ser aplicado?"
                className="min-h-[80px]"
                maxLength={1000}
              />
            </div>

            <div>
              <Label htmlFor="methodology">Metodologia de Aplicação</Label>
              <Textarea
                id="methodology"
                value={formData.methodology}
                onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                placeholder="Descreva o passo a passo para aplicar este protocolo..."
                className="min-h-[120px]"
                maxLength={2000}
              />
            </div>

            <div>
              <Label htmlFor="references">Referências Bibliográficas</Label>
              <Textarea
                id="references"
                value={formData.references}
                onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                placeholder="Fontes científicas e diretrizes utilizadas..."
                className="min-h-[80px]"
                maxLength={1000}
              />
            </div>
          </CardContent>
        </Card>

        {/* Anexos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos Anexos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste arquivos ou clique para fazer upload
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                PDF, DOC, DOCX até 10MB
              </p>
              <Button type="button" variant="outline" size="sm">
                Selecionar Arquivos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/protocolos")} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Criar Protocolo"}
          </Button>
        </div>
      </form>
    </div>
  );
}
