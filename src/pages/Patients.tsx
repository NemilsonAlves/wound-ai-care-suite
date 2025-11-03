import { PatientProfile } from '@/components/patients/PatientProfile';
import { PatientService } from '../services/patientService';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatPhone, formatCPF, calculateAge } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  FileText, 
  Trash2,
  Users,
  X,
  Calendar as CalendarIcon,
  MapPin,
  Download,
  Upload,
  RefreshCw,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, Calendar, MoreHorizontal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AdvancedFilters {
  searchTerm: string;
  specialty: string;
  status: string;
  city: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  ageRange: {
    min: number | undefined;
    max: number | undefined;
  };
}

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export default function Patients() {
  const navigate = useNavigate();
  
  // Estados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({
    searchTerm: '',
    specialty: 'all',
    status: 'all',
    city: 'all',
    dateRange: { from: undefined, to: undefined },
    ageRange: { min: undefined, max: undefined }
  });

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0
  });

  const [sortBy, setSortBy] = useState<'name' | 'date' | 'age' | 'city'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  // Estados para ações em lote
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Testar conexão com Supabase na inicialização
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await PatientService.testConnection();
        setConnectionStatus(isConnected ? 'connected' : 'error');
      } catch (error) {
        console.error('Erro ao testar conexão:', error);
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, []);

  // Configurar real-time updates
  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    const subscription = PatientService.subscribeToPatients((payload) => {
      console.log('📡 Real-time update:', payload);
      // Refetch data when changes occur
      refetch();
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [connectionStatus]);

  const {
    data: patients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      console.log('🔄 Fetching patients with filters:', filters);
      
      try {
        if (filters.searchTerm.trim()) {
          return await PatientService.search(filters.searchTerm);
        } else if (filters.specialty !== 'all') {
          return await PatientService.getBySpecialty(filters.specialty);
        } else {
          return await PatientService.getAll();
        }
      } catch (error) {
        console.error('❌ Erro ao buscar pacientes:', error);
        throw error;
      }
    },
    enabled: connectionStatus === 'connected',
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true,
  });

  // Aplicar filtros avançados nos dados
  // Filtrar e ordenar pacientes
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients.filter(patient => {
      // Filtro por termo de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          patient.full_name.toLowerCase().includes(searchLower) ||
          patient.email?.toLowerCase().includes(searchLower) ||
          patient.cpf?.includes(filters.searchTerm) ||
          patient.phone?.includes(filters.searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Filtro por especialidade
      if (filters.specialty !== 'all' && patient.specialty !== filters.specialty) {
        return false;
      }

      // Filtro por status
      if (filters.status !== 'all' && patient.status !== filters.status) {
        return false;
      }

      // Filtro por cidade
      if (filters.city !== 'all' && patient.city !== filters.city) {
        return false;
      }

      // Filtro por faixa etária
      if (filters.ageRange.min !== undefined || filters.ageRange.max !== undefined) {
        const age = calculateAge(patient.birth_date);
        if (filters.ageRange.min !== undefined && age < filters.ageRange.min) return false;
        if (filters.ageRange.max !== undefined && age > filters.ageRange.max) return false;
      }

      // Filtro por data de cadastro
      if (filters.dateRange.from || filters.dateRange.to) {
        const patientDate = new Date(patient.created_at || patient.birth_date);
        if (filters.dateRange.from && patientDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && patientDate > filters.dateRange.to) return false;
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.full_name.localeCompare(b.full_name);
          break;
        case 'date':
          comparison = new Date(a.created_at || a.birth_date).getTime() - 
                      new Date(b.created_at || b.birth_date).getTime();
          break;
        case 'age':
          comparison = calculateAge(a.birth_date) - calculateAge(b.birth_date);
          break;
        case 'city':
          comparison = (a.city || '').localeCompare(b.city || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [patients, filters, sortBy, sortOrder]);

  // Paginação
  const paginatedPatients = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredAndSortedPatients.slice(startIndex, endIndex);
  }, [filteredAndSortedPatients, pagination.currentPage, pagination.itemsPerPage]);

  // Atualizar informações de paginação
  useEffect(() => {
    const totalItems = filteredAndSortedPatients.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages,
      currentPage: Math.min(prev.currentPage, Math.max(1, totalPages))
    }));
  }, [filteredAndSortedPatients.length, pagination.itemsPerPage]);

  // Usar utilitários importados de '@/lib/utils' para formatPhone e calculateAge

  // Obter lista única de cidades para o filtro
  const uniqueCities = Array.from(new Set(patients.map(p => p.city).filter(Boolean)));

  const handleDeletePatient = async (patientId: string) => {
    if (!confirm('Tem certeza que deseja remover este paciente?')) return;
    
    try {
      await PatientService.delete(patientId);
      toast({
        title: "Sucesso",
        description: "Paciente removido com sucesso",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover paciente",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      specialty: 'all',
      status: 'all',
      city: 'all',
      dateRange: { from: undefined, to: undefined },
      ageRange: { min: undefined, max: undefined }
    });
  };

  // Funções para ações em lote
  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === paginatedPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(paginatedPatients.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja remover ${selectedPatients.length} paciente(s)?`)) return;
    
    setBulkActionLoading(true);
    try {
      await Promise.all(selectedPatients.map(id => PatientService.delete(id)));
      toast({
        title: "Sucesso",
        description: `${selectedPatients.length} paciente(s) removido(s) com sucesso`,
      });
      setSelectedPatients([]);
      refetch();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover pacientes",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedPatientsData = patients.filter(p => selectedPatients.includes(p.id));
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'CPF', 'Data de Nascimento', 'Cidade', 'Especialidade', 'Status'].join(','),
      ...selectedPatientsData.map(p => [
        p.full_name,
        p.email,
        p.phone,
        p.cpf,
        p.birth_date,
        p.city || '',
        p.specialty || '',
        p.status || 'Ativo'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pacientes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Sucesso",
      description: `${selectedPatients.length} paciente(s) exportado(s) com sucesso`,
    });
  };

  const handleFilteredExport = () => {
    const list = filteredAndSortedPatients;
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'CPF', 'Data de Nascimento', 'Cidade', 'Especialidade', 'Status'].join(','),
      ...list.map(p => [
        p.full_name,
        p.email || '',
        p.phone || '',
        p.cpf || '',
        p.birth_date,
        p.city || '',
        p.specialty || '',
        p.status || 'Ativo'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `pacientes_filtrados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Sucesso',
      description: `${list.length} paciente(s) exportado(s) com sucesso`,
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm !== '' || 
           filters.specialty !== 'all' || 
           filters.status !== 'all' || 
           filters.city !== 'all' ||
           filters.dateRange.from !== undefined ||
           filters.dateRange.to !== undefined ||
           filters.ageRange.min !== undefined ||
           filters.ageRange.max !== undefined;
  };

  const getSpecialtyLabel = (specialty: string) => {
    const labels = {
      'dermatology': 'Dermatologia',
      'wound_care': 'Curativos',
      'surgery': 'Cirurgia'
    };
    return labels[specialty] || specialty;
  };

  const getSpecialtyColor = (specialty: string) => {
    const colors = {
      'dermatology': 'bg-blue-100 text-blue-800',
      'wound_care': 'bg-green-100 text-green-800',
      'surgery': 'bg-purple-100 text-purple-800'
    };
    return colors[specialty] || 'bg-gray-100 text-gray-800';
  };

  // Status de conexão
  if (connectionStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando conexão com o banco de dados...</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Erro de Conexão!</strong>
            <span className="block sm:inline"> Não foi possível conectar ao banco de dados.</span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Renderização de erro
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong className="font-bold">Erro ao carregar pacientes!</strong>
          <span className="block sm:inline"> {error.message}</span>
          <button 
            onClick={() => refetch()} 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description={`Gerencie todos os pacientes da clínica (${filteredAndSortedPatients.length} ${filteredAndSortedPatients.length === 1 ? 'paciente' : 'pacientes'})`}
        action={{
          label: "Novo Paciente",
          onClick: () => navigate("/pacientes/novo")
        }}
      />

      {/* Filtros Básicos */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10"
          />
        </div>
        
        <Select 
          value={filters.specialty} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas especialidades</SelectItem>
            <SelectItem value="Curativos">Curativos</SelectItem>
            <SelectItem value="Dermatologia">Dermatologia</SelectItem>
            <SelectItem value="Cirurgia Plástica">Cirurgia Plástica</SelectItem>
            <SelectItem value="Enfermagem">Enfermagem</SelectItem>
            <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
            <SelectItem value="Nutrição">Nutrição</SelectItem>
            <SelectItem value="Psicologia">Psicologia</SelectItem>
            <SelectItem value="Clínica Geral">Clínica Geral</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={filters.status} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros Avançados
        </Button>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => refetch()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avançados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Cidade */}
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select 
                  value={filters.city} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {uniqueCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Faixa Etária */}
              <div className="space-y-2">
                <Label>Idade Mínima</Label>
                <Input
                  type="number"
                  placeholder="Ex: 18"
                  value={filters.ageRange.min || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    ageRange: { ...prev.ageRange, min: e.target.value ? parseInt(e.target.value) : undefined }
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Idade Máxima</Label>
                <Input
                  type="number"
                  placeholder="Ex: 65"
                  value={filters.ageRange.max || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    ageRange: { ...prev.ageRange, max: e.target.value ? parseInt(e.target.value) : undefined }
                  }))}
                />
              </div>

              {/* Filtro por Data de Cadastro */}
              <div className="space-y-2">
                <Label>Data de Cadastro</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? (
                          format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "De"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, from: date }
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? (
                          format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          "Até"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => setFilters(prev => ({ 
                          ...prev, 
                          dateRange: { ...prev.dateRange, to: date }
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {hasActiveFilters() && (
                  <span>Filtros ativos: {filteredAndSortedPatients.length} de {patients.length} pacientes</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
                <Button onClick={() => setShowAdvancedFilters(false)}>
                  Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={handleFilteredExport} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar CSV (Filtrados)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barra de Ações em Lote */}
      {selectedPatients.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {selectedPatients.length} paciente(s) selecionado(s)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatients([])}
                  className="text-blue-700 hover:text-blue-900"
                >
                  Limpar seleção
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                  className="flex items-center gap-2"
                >
                  {bulkActionLoading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Remover
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controles de Ordenação e Paginação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Checkbox Selecionar Todos */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2 p-2"
            >
              {selectedPatients.length === paginatedPatients.length && paginatedPatients.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="text-sm">
                {selectedPatients.length === paginatedPatients.length && paginatedPatients.length > 0 
                  ? 'Desmarcar todos' 
                  : 'Selecionar todos'
                }
              </span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Ordenar por:</Label>
            <Select value={sortBy} onValueChange={(value: 'name' | 'date' | 'age' | 'city') => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="age">Idade</SelectItem>
                <SelectItem value="city">Cidade</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Itens por página:</Label>
            <Select 
              value={pagination.itemsPerPage.toString()} 
              onValueChange={(value) => setPagination(prev => ({ ...prev, itemsPerPage: parseInt(value), currentPage: 1 }))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{' '}
          {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
          {pagination.totalItems} pacientes
        </div>
      </div>

      {filteredAndSortedPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={hasActiveFilters() 
            ? "Nenhum paciente encontrado" 
            : "Nenhum paciente cadastrado"}
          description={hasActiveFilters()
            ? "Não há pacientes que correspondam aos filtros aplicados. Tente ajustar os critérios de busca."
            : "Comece cadastrando o primeiro paciente da clínica."}
          action={{
            label: hasActiveFilters() ? "Limpar Filtros" : "Novo Paciente",
            onClick: hasActiveFilters() ? clearFilters : () => navigate("/pacientes/novo")
          }}
        />
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Checkbox de seleção individual */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectPatient(patient.id)}
                        className="p-1"
                      >
                        {selectedPatients.includes(patient.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </Button>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={patient.avatar_url || ""} />
                        <AvatarFallback>
                          {patient.full_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{patient.full_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {patient.email && (
                            <div className="flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              {patient.email}
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center">
                              <Phone className="mr-1 h-3 w-3" />
                              {formatPhone(patient.phone)}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {calculateAge(patient.birth_date)} anos
                          </div>
                          {patient.city && (
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {patient.city}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge 
                        status={patient.status === 'active' ? 'active' : 'inactive'} 
                      />
                      {patient.specialty && (
                        <Badge variant="secondary">
                          {patient.specialty}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/pacientes/${patient.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/pacientes/${patient.id}/editar`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/avaliacoes/nova?paciente=${patient.id}`)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Nova avaliação
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeletePatient(patient.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Controles de Paginação */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNumber;
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + i;
                    } else {
                      pageNumber = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={pagination.currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNumber }))}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.totalPages }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Página {pagination.currentPage} de {pagination.totalPages}
              </div>
            </div>
      )}
    </>
  )}
</div>
);
}
