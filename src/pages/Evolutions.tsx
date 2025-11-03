import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { PageHeader } from '../components/ui/page-header';
import { EmptyState } from '../components/ui/empty-state';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { StatusBadge } from '../components/ui/status-badge';
import { EvolutionForm } from '../components/evolution/EvolutionForm';
import { Evolution, EvolutionService } from '../services/evolutionService';
import { PatientService } from '../services/patientService';
import { formatDate, formatDateTime } from '../lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  FileText, 
  Trash2,
  Calendar,
  Camera,
  TrendingUp,
  Clock,
  User,
  MapPin,
  Ruler
} from 'lucide-react';

export default function Evolutions() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [woundTypeFilter, setWoundTypeFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvolution, setSelectedEvolution] = useState<Evolution | null>(null);

  // Fetch evolutions
  const { data: evolutions = [], isLoading, error } = useQuery({
    queryKey: ['evolutions', searchTerm, woundTypeFilter, stageFilter, selectedPatientId],
    queryFn: async () => {
      if (selectedPatientId) {
        return EvolutionService.getEvolutionsByPatient(selectedPatientId);
      }
      // For now, we'll need to implement a general getAll method
      // This is a placeholder - you might want to implement pagination
      return [];
    },
  });

  // Fetch patients for filter
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => PatientService.getAll(),
  });

  const filteredEvolutions = evolutions.filter(evolution => {
    if (woundTypeFilter !== 'all' && evolution.wound_type !== woundTypeFilter) {
      return false;
    }
    if (stageFilter !== 'all' && evolution.wound_stage !== stageFilter) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        evolution.wound_location.toLowerCase().includes(searchLower) ||
        evolution.treatment_performed.toLowerCase().includes(searchLower) ||
        evolution.observations.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Evoluções Clínicas', href: '/evolutions' },
  ];

  const woundTypes = [
    { value: 'ulcera_venosa', label: 'Úlcera Venosa' },
    { value: 'ulcera_arterial', label: 'Úlcera Arterial' },
    { value: 'ulcera_diabetica', label: 'Úlcera Diabética' },
    { value: 'lesao_pressao', label: 'Lesão por Pressão' },
    { value: 'queimadura', label: 'Queimadura' },
    { value: 'trauma', label: 'Trauma' },
    { value: 'cirurgica', label: 'Cirúrgica' },
    { value: 'outras', label: 'Outras' }
  ];

  const stages = [
    { value: '1', label: 'Estágio I' },
    { value: '2', label: 'Estágio II' },
    { value: '3', label: 'Estágio III' },
    { value: '4', label: 'Estágio IV' },
    { value: 'nao_classificavel', label: 'Não Classificável' }
  ];

  const getWoundTypeColor = (type: Evolution['wound_type']) => {
    const colors = {
      'ulcera_venosa': 'bg-blue-100 text-blue-800',
      'ulcera_arterial': 'bg-red-100 text-red-800',
      'ulcera_diabetica': 'bg-purple-100 text-purple-800',
      'lesao_pressao': 'bg-orange-100 text-orange-800',
      'queimadura': 'bg-yellow-100 text-yellow-800',
      'trauma': 'bg-green-100 text-green-800',
      'cirurgica': 'bg-indigo-100 text-indigo-800',
      'outras': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage: Evolution['wound_stage']) => {
    const colors = {
      '1': 'bg-green-100 text-green-800',
      '2': 'bg-yellow-100 text-yellow-800',
      '3': 'bg-orange-100 text-orange-800',
      '4': 'bg-red-100 text-red-800',
      'nao_classificavel': 'bg-gray-100 text-gray-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evoluções Clínicas"
        description="Gerencie e acompanhe a evolução clínica dos pacientes"
        breadcrumbs={breadcrumbs}
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por localização, tratamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os pacientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os pacientes</SelectItem>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={woundTypeFilter} onValueChange={setWoundTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de lesão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {woundTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estágio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estágios</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Evolução
        </Button>
      </div>

      {/* Evolution Cards */}
      {filteredEvolutions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma evolução encontrada"
          description={
            selectedPatientId 
              ? "Este paciente ainda não possui evoluções clínicas registradas."
              : "Nenhuma evolução clínica foi registrada ainda."
          }
          action={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira evolução
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6">
          {filteredEvolutions.map((evolution) => (
            <Card key={evolution.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        {evolution.patient?.name || 'Paciente'}
                      </CardTitle>
                      <Badge className={getWoundTypeColor(evolution.wound_type)}>
                        {EvolutionService.getWoundTypeLabel(evolution.wound_type)}
                      </Badge>
                      <Badge className={getStageColor(evolution.wound_stage)}>
                        {EvolutionService.getWoundStageLabel(evolution.wound_stage)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(evolution.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {evolution.professional?.name || 'Profissional'}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedEvolution(evolution)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Localização:</span>
                      <span>{evolution.wound_location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Dimensões:</span>
                      <span>
                        {evolution.wound_size_length} x {evolution.wound_size_width}
                        {evolution.wound_size_depth && ` x ${evolution.wound_size_depth}`} cm
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Dor:</span>
                      <Badge variant="outline">{evolution.pain_scale}/10</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Exsudato:</span>
                      <span className="capitalize">{evolution.exudate_amount}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {evolution.photos && evolution.photos.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="h-4 w-4 text-muted-foreground" />
                        <span>{evolution.photos.length} foto(s)</span>
                      </div>
                    )}
                    {evolution.next_evaluation_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Próxima avaliação:</span>
                        <span>{formatDate(evolution.next_evaluation_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {evolution.observations && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Observações:</span> {evolution.observations}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Evolution Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Evolução Clínica</DialogTitle>
          </DialogHeader>
          <EvolutionForm
            patientId={selectedPatientId || undefined}
            onSuccess={() => {
              setIsCreateDialogOpen(false);
              // Refresh data
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Evolution Dialog */}
      {selectedEvolution && (
        <Dialog open={!!selectedEvolution} onOpenChange={() => setSelectedEvolution(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Evolução</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Evolution details would go here */}
              <p>Detalhes completos da evolução serão implementados aqui.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}