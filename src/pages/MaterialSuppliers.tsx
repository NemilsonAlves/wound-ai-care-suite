import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const suppliers = [
  {
    id: 1,
    name: "ConvaTec",
    contact: "João Silva",
    email: "joao@convatec.com",
    phone: "(11) 3456-7890",
    address: "São Paulo, SP",
    productsCount: 15,
    status: "active",
  },
  {
    id: 2,
    name: "Mepilex",
    contact: "Maria Santos",
    email: "maria@mepilex.com",
    phone: "(11) 9876-5432",
    address: "São Paulo, SP",
    productsCount: 12,
    status: "active",
  },
  {
    id: 3,
    name: "Smith & Nephew",
    contact: "Carlos Oliveira",
    email: "carlos@smithnephew.com",
    phone: "(21) 3456-7890",
    address: "Rio de Janeiro, RJ",
    productsCount: 18,
    status: "active",
  },
  {
    id: 4,
    name: "ActiSorb",
    contact: "Ana Costa",
    email: "ana@actisorb.com",
    phone: "(11) 2345-6789",
    address: "Campinas, SP",
    productsCount: 8,
    status: "inactive",
  },
];

export default function MaterialSuppliers() {
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
            <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground mt-1">Gerencie fornecedores de materiais</p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="w-5 h-5" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Suppliers List */}
      <div className="grid gap-4">
        {suppliers.map((supplier) => (
          <Card key={supplier.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-foreground">{supplier.name}</h3>
                    <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
                      {supplier.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{supplier.productsCount} produtos</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium">Contato:</span>
                      <span>{supplier.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{supplier.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Ver Produtos</Button>
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
