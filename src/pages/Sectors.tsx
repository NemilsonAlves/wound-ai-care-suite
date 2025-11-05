import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, Edit, Trash2, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Sector {
  id: string;
  name: string;
  description: string;
  capacity: number;
  currentOccupancy: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockSectors: Sector[] = [
  {
    id: "1",
    name: "Clínica Médica",
    description: "Setor de internação para pacientes clínicos",
    capacity: 30,
    currentOccupancy: 25,
    isActive: true,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: "2",
    name: "Consultório",
    description: "Área de consultas ambulatoriais",
    capacity: 10,
    currentOccupancy: 8,
    isActive: true,
    createdAt: "2024-01-10",
    updatedAt: "2024-01-18"
  },
  {
    id: "3",
    name: "UTI",
    description: "Unidade de Terapia Intensiva",
    capacity: 15,
    currentOccupancy: 12,
    isActive: true,
    createdAt: "2024-01-05",
    updatedAt: "2024-01-22"
  },
  {
    id: "4",
    name: "Emergência",
    description: "Pronto Socorro e atendimento de emergência",
    capacity: 20,
    currentOccupancy: 18,
    isActive: true,
    createdAt: "2024-01-08",
    updatedAt: "2024-01-19"
  },
  {
    id: "5",
    name: "Cirurgia",
    description: "Centro cirúrgico e recuperação pós-operatória",
    capacity: 12,
    currentOccupancy: 7,
    isActive: false,
    createdAt: "2024-01-12",
    updatedAt: "2024-01-21"
  }
];

export default function Sectors() {
  const enableMockData = (import.meta.env.VITE_ENABLE_MOCK_DATA ?? (import.meta.env.DEV ? 'true' : 'false')) === 'true';
  const [sectors, setSectors] = useState<Sector[]>(enableMockData ? mockSectors : []);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    capacity: "",
    isActive: true
  });
  const { toast } = useToast();

  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (sector?: Sector) => {
    if (sector) {
      setEditingSector(sector);
      setFormData({
        name: sector.name,
        description: sector.description,
        capacity: sector.capacity.toString(),
        isActive: sector.isActive
      });
    } else {
      setEditingSector(null);
      setFormData({
        name: "",
        description: "",
        capacity: "",
        isActive: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSector(null);
    setFormData({
      name: "",
      description: "",
      capacity: "",
      isActive: true
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.capacity) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const capacity = parseInt(formData.capacity);
    if (isNaN(capacity) || capacity <= 0) {
      toast({
        title: "Erro",
        description: "Capacidade deve ser um número válido maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (editingSector) {
      // Update existing sector
      setSectors(prev => prev.map(sector => 
        sector.id === editingSector.id 
          ? {
              ...sector,
              name: formData.name,
              description: formData.description,
              capacity,
              isActive: formData.isActive,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : sector
      ));
      toast({
        title: "Sucesso",
        description: "Setor atualizado com sucesso"
      });
    } else {
      // Create new sector
      const newSector: Sector = {
        id: (sectors.length + 1).toString(),
        name: formData.name,
        description: formData.description,
        capacity,
        currentOccupancy: 0,
        isActive: formData.isActive,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setSectors(prev => [...prev, newSector]);
      toast({
        title: "Sucesso",
        description: "Setor criado com sucesso"
      });
    }

    handleCloseDialog();
  };

  const handleDelete = (sectorId: string) => {
    setSectors(prev => prev.filter(sector => sector.id !== sectorId));
    toast({
      title: "Sucesso",
      description: "Setor removido com sucesso"
    });
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return "destructive";
    if (percentage >= 70) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {!enableMockData && (
        <Alert>
          <AlertTitle>Dados de demonstração desativados</AlertTitle>
          <AlertDescription>
            Ative `VITE_ENABLE_MOCK_DATA` para visualizar setores de exemplo.
          </AlertDescription>
        </Alert>
      )}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Setores
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os setores do hospital</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Setor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingSector ? "Editar Setor" : "Novo Setor"}
              </DialogTitle>
              <DialogDescription>
                {editingSector 
                  ? "Atualize as informações do setor" 
                  : "Adicione um novo setor ao sistema"
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Setor</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Clínica Médica"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva a função do setor"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Número de leitos/vagas"
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Setor ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingSector ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre os setores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sectors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Setores</CardTitle>
          <CardDescription>
            {filteredSectors.length} setor(es) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSectors.map((sector) => (
                <TableRow key={sector.id}>
                  <TableCell className="font-medium">{sector.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{sector.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={getOccupancyColor(sector.currentOccupancy, sector.capacity)}>
                        {sector.currentOccupancy}/{sector.capacity}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ({Math.round((sector.currentOccupancy / sector.capacity) * 100)}%)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sector.isActive ? "default" : "secondary"}>
                      {sector.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(sector.updatedAt).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(sector)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(sector.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
