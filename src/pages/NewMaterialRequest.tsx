import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, ShoppingCart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const materials = [
  { id: 1, name: "Hidrofibra com Prata", category: "Curativos Primários", stock: 12, cost: 45.00 },
  { id: 2, name: "Espuma com Silicone 10x10cm", category: "Curativos Secundários", stock: 28, cost: 32.00 },
  { id: 3, name: "Hidrogel", category: "Desbridantes", stock: 15, cost: 38.00 },
  { id: 4, name: "Alginato de Cálcio", category: "Hemostáticos", stock: 8, cost: 52.00 },
  { id: 5, name: "Carvão Ativado com Prata", category: "Antimicrobianos", stock: 5, cost: 68.00 },
];

interface RequestItem {
  materialId: string;
  quantity: number;
}

const requestSchema = z.object({
  sector: z.string().trim().min(1, "Setor é obrigatório"),
  priority: z.enum(["Baixa", "Média", "Alta", "Urgente"]),
  justification: z.string().trim().min(10, "Justificativa muito curta").max(1000, "Justificativa muito longa"),
  items: z.array(z.object({
    materialId: z.string().min(1),
    quantity: z.number().min(1, "Quantidade mínima é 1").max(1000, "Quantidade máxima é 1000"),
  })).min(1, "Adicione pelo menos um material"),
});

export default function NewMaterialRequest() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RequestItem[]>([{ materialId: "", quantity: 1 }]);
  const [formData, setFormData] = useState({
    sector: "",
    priority: "",
    justification: "",
  });

  const addItem = () => {
    setItems([...items, { materialId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof RequestItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const material = materials.find(m => m.id.toString() === item.materialId);
      return total + (material ? material.cost * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = requestSchema.parse({
        ...formData,
        items: items.map(item => ({ ...item, quantity: Number(item.quantity) })),
      });

      // Aqui você integraria com o backend (Supabase)
      console.log("Dados validados:", validatedData);

      toast({
        title: "Requisição Criada",
        description: "A requisição de materiais foi enviada com sucesso",
      });

      setTimeout(() => navigate("/materiais"), 1000);
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/materiais")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Nova Requisição de Materiais</h1>
            <p className="text-muted-foreground mt-1">Solicite materiais para o estoque</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações da Requisição */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Informações da Requisição
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sector">Setor Solicitante *</Label>
                <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Selecione o setor..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTI">UTI</SelectItem>
                    <SelectItem value="Clínica Médica">Clínica Médica</SelectItem>
                    <SelectItem value="Cirurgia Geral">Cirurgia Geral</SelectItem>
                    <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                    <SelectItem value="Comissão de Pele">Comissão de Pele</SelectItem>
                    <SelectItem value="Consultório">Consultório</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioridade *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecione a prioridade..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa</SelectItem>
                    <SelectItem value="Média">Média</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="justification">Justificativa *</Label>
              <Textarea
                id="justification"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Descreva o motivo da requisição e a necessidade dos materiais..."
                className="min-h-[100px]"
                required
                maxLength={1000}
              />
            </div>
          </CardContent>
        </Card>

        {/* Materiais Solicitados */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Materiais Solicitados</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Material
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => {
              const selectedMaterial = materials.find(m => m.id.toString() === item.materialId);
              return (
                <div key={index} className="flex gap-4 p-4 rounded-lg border">
                  <div className="flex-1 space-y-3">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Label>Material</Label>
                        <Select
                          value={item.materialId}
                          onValueChange={(value) => updateItem(index, "materialId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o material..." />
                          </SelectTrigger>
                          <SelectContent>
                            {materials.map((material) => (
                              <SelectItem key={material.id} value={material.id.toString()}>
                                {material.name} - Estoque: {material.stock}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>

                    {selectedMaterial && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4 text-muted-foreground">
                          <span>Categoria: <strong>{selectedMaterial.category}</strong></span>
                          <span>Estoque Atual: <strong>{selectedMaterial.stock}</strong></span>
                          <span>Custo Unitário: <strong>R$ {selectedMaterial.cost.toFixed(2)}</strong></span>
                        </div>
                        <span className="font-semibold text-foreground">
                          Subtotal: R$ {(selectedMaterial.cost * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}

            {items.length > 0 && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border-2 border-primary">
                <span className="font-semibold text-foreground">Total Estimado</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {calculateTotal().toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/materiais")} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Enviando..." : "Enviar Requisição"}
          </Button>
        </div>
      </form>
    </div>
  );
}
