import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const categories = [
  { id: 1, name: "Curativos Primários", description: "Materiais em contato direto com a lesão", itemCount: 8, color: "bg-blue-500" },
  { id: 2, name: "Curativos Secundários", description: "Coberturas e fixações", itemCount: 12, color: "bg-green-500" },
  { id: 3, name: "Desbridantes", description: "Remoção de tecido necrótico", itemCount: 5, color: "bg-yellow-500" },
  { id: 4, name: "Hemostáticos", description: "Controle de sangramento", itemCount: 4, color: "bg-red-500" },
  { id: 5, name: "Antimicrobianos", description: "Prevenção e tratamento de infecções", itemCount: 6, color: "bg-purple-500" },
  { id: 6, name: "Alginatos", description: "Absorção de exsudato", itemCount: 3, color: "bg-orange-500" },
];

export default function MaterialCategories() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/materiais")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Categorias de Materiais</h1>
            <p className="text-muted-foreground mt-1">Organize materiais por categoria</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-5 h-5" />
          Nova Categoria
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center`}>
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {category.itemCount} itens
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
