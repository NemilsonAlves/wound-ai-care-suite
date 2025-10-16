import { Package, AlertTriangle, TrendingDown, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const materials = [
  {
    id: 1,
    name: "Hidrofibra com Prata",
    category: "Curativos Primários",
    stock: 12,
    minStock: 20,
    unit: "unidades",
    cost: 45.00,
    supplier: "ConvaTec",
    lastPurchase: "2025-01-10"
  },
  {
    id: 2,
    name: "Espuma com Silicone 10x10cm",
    category: "Curativos Secundários",
    stock: 28,
    minStock: 15,
    unit: "unidades",
    cost: 32.00,
    supplier: "Mepilex",
    lastPurchase: "2025-01-12"
  },
  {
    id: 3,
    name: "Hidrogel",
    category: "Desbridantes",
    stock: 15,
    minStock: 10,
    unit: "tubos",
    cost: 38.00,
    supplier: "Smith & Nephew",
    lastPurchase: "2025-01-08"
  },
  {
    id: 4,
    name: "Alginato de Cálcio",
    category: "Hemostáticos",
    stock: 8,
    minStock: 12,
    unit: "unidades",
    cost: 52.00,
    supplier: "Alginate Plus",
    lastPurchase: "2025-01-05"
  },
  {
    id: 5,
    name: "Carvão Ativado com Prata",
    category: "Antimicrobianos",
    stock: 5,
    minStock: 15,
    unit: "unidades",
    cost: 68.00,
    supplier: "ActiSorb",
    lastPurchase: "2024-12-28"
  }
];

export default function Materials() {
  const lowStockCount = materials.filter(m => m.stock < m.minStock).length;
  const totalValue = materials.reduce((acc, m) => acc + (m.stock * m.cost), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Materiais</h1>
          <p className="text-muted-foreground mt-1">Controle de estoque e curativos</p>
        </div>
        <Button className="gap-2">
          <ShoppingCart className="w-5 h-5" />
          Nova Requisição
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Itens</p>
                <p className="text-2xl font-bold">{materials.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estoque Baixo</p>
                <p className="text-2xl font-bold text-status-critical">{lowStockCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-status-critical" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-status-stable" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Mês</p>
                <p className="text-2xl font-bold">R$ 2.845</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar materiais..." className="pl-10" />
        </div>
        <Button variant="outline">Filtrar por Categoria</Button>
        <Button variant="outline">Exportar</Button>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventário de Materiais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials.map((material) => {
              const stockPercentage = (material.stock / material.minStock) * 100;
              const isLowStock = material.stock < material.minStock;
              
              return (
                <div
                  key={material.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{material.name}</h3>
                      <Badge variant="secondary">{material.category}</Badge>
                      {isLowStock && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Estoque Baixo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>Fornecedor: <strong>{material.supplier}</strong></span>
                      <span>Custo: <strong>R$ {material.cost.toFixed(2)}</strong></span>
                      <span>Última compra: {material.lastPurchase}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estoque: <strong className={isLowStock ? "text-status-critical" : ""}>{material.stock}</strong> / {material.minStock} {material.unit}
                        </span>
                        <span className="text-muted-foreground">{stockPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={stockPercentage} 
                        className={isLowStock ? "[&>div]:bg-status-critical" : "[&>div]:bg-status-stable"}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Solicitar</Button>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
