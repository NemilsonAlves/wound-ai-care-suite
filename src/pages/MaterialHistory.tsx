import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const transactions = [
  {
    id: 1,
    date: "2025-01-15",
    type: "entrada",
    material: "Hidrofibra com Prata",
    quantity: 50,
    user: "João Silva",
    cost: 2250.00,
  },
  {
    id: 2,
    date: "2025-01-14",
    type: "saída",
    material: "Espuma com Silicone 10x10cm",
    quantity: 15,
    user: "Maria Santos",
    sector: "UTI",
  },
  {
    id: 3,
    date: "2025-01-13",
    type: "entrada",
    material: "Hidrogel",
    quantity: 30,
    user: "Carlos Oliveira",
    cost: 1140.00,
  },
  {
    id: 4,
    date: "2025-01-12",
    type: "saída",
    material: "Alginato de Cálcio",
    quantity: 8,
    user: "Ana Costa",
    sector: "Clínica Médica",
  },
  {
    id: 5,
    date: "2025-01-11",
    type: "saída",
    material: "Carvão Ativado com Prata",
    quantity: 5,
    user: "Pedro Alves",
    sector: "Emergência",
  },
];

export default function MaterialHistory() {
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
            <h1 className="text-3xl font-bold text-foreground">Histórico de Movimentações</h1>
            <p className="text-muted-foreground mt-1">Entradas e saídas de materiais</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="w-5 h-5" />
          Filtrar Período
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entradas (mês)</p>
                <p className="text-2xl font-bold">R$ 15.450</p>
              </div>
              <TrendingUp className="w-8 h-8 text-status-stable" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saídas (mês)</p>
                <p className="text-2xl font-bold">R$ 8.230</p>
              </div>
              <TrendingDown className="w-8 h-8 text-status-critical" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className="text-2xl font-bold text-status-stable">+R$ 7.220</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Setor/Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === "entrada" ? "default" : "secondary"}>
                      {transaction.type === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.material}</TableCell>
                  <TableCell>{transaction.quantity}</TableCell>
                  <TableCell>{transaction.user}</TableCell>
                  <TableCell>
                    {transaction.type === "entrada" 
                      ? `R$ ${transaction.cost?.toFixed(2)}` 
                      : transaction.sector}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
