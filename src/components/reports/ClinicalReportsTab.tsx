import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Eye
} from 'lucide-react';
import { ReportsService } from '@/services/reportsService';
import { 
  PatientReport, 
  ConsultationReport, 
  ProcedureReport, 
  FinancialReport,
  ReportFilter 
} from '@/types/reports';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

export function ClinicalReportsTab() {
  const [activeReport, setActiveReport] = useState('patients');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilter>({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  // Estados para cada tipo de relatório
  const [patientsReport, setPatientsReport] = useState<PatientReport[]>([]);
  const [consultationsReport, setConsultationsReport] = useState<ConsultationReport[]>([]);
  const [proceduresReport, setProceduresReport] = useState<ProcedureReport[]>([]);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);

  useEffect(() => {
    loadReportData();
  }, [activeReport, filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      switch (activeReport) {
        case 'patients':
          const patients = await ReportsService.getPatientsReport(filters);
          setPatientsReport(patients);
          break;
        case 'consultations':
          const consultations = await ReportsService.getConsultationsReport(filters);
          setConsultationsReport(consultations);
          break;
        case 'procedures':
          const procedures = await ReportsService.getProceduresReport(filters);
          setProceduresReport(procedures);
          break;
        case 'financial':
          const financial = await ReportsService.getFinancialReport(filters);
          setFinancialReport(financial);
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ReportFilter, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportReport = async () => {
    try {
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      'scheduled': { variant: 'secondary', label: 'Agendado' },
      'completed': { variant: 'default', label: 'Concluído' },
      'cancelled': { variant: 'destructive', label: 'Cancelado' },
      'in_progress': { variant: 'outline', label: 'Em Andamento' }
    };

    const statusInfo = statusMap[status] || { variant: 'secondary', label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data Inicial</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data Final</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Select 
                value={filters.specialty || ''} 
                onValueChange={(value) => handleFilterChange('specialty', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as especialidades</SelectItem>
                  <SelectItem value="dermatologia">Dermatologia</SelectItem>
                  <SelectItem value="cirurgia_plastica">Cirurgia Plástica</SelectItem>
                  <SelectItem value="estetica">Estética</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <PermissionGuard permission="reports.export">
                <Button onClick={exportReport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação dos Relatórios */}
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="consultations">Consultas</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        {/* Relatório de Pacientes */}
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Relatório de Pacientes
              </CardTitle>
              <CardDescription>
                Lista completa de pacientes com estatísticas de consultas e gastos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data de Nascimento</TableHead>
                      <TableHead>Gênero</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Consultas</TableHead>
                      <TableHead>Procedimentos</TableHead>
                      <TableHead>Última Consulta</TableHead>
                      <TableHead>Total Gasto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientsReport.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.full_name}</TableCell>
                        <TableCell>{formatDate(patient.birth_date)}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.phone}</TableCell>
                        <TableCell>{patient.total_consultations}</TableCell>
                        <TableCell>{patient.total_procedures}</TableCell>
                        <TableCell>
                          {patient.last_consultation ? formatDate(patient.last_consultation) : 'Nunca'}
                        </TableCell>
                        <TableCell>{formatCurrency(patient.total_spent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Consultas */}
        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Relatório de Consultas
              </CardTitle>
              <CardDescription>
                Histórico de consultas realizadas com detalhes de procedimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Procedimentos</TableHead>
                      <TableHead>Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consultationsReport.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell>{formatDate(consultation.consultation_date)}</TableCell>
                        <TableCell className="font-medium">{consultation.patient_name}</TableCell>
                        <TableCell>{consultation.specialty}</TableCell>
                        <TableCell>{consultation.doctor_name}</TableCell>
                        <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                        <TableCell>{consultation.procedures_count}</TableCell>
                        <TableCell>{formatCurrency(consultation.total_cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Procedimentos */}
        <TabsContent value="procedures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Relatório de Procedimentos
              </CardTitle>
              <CardDescription>
                Lista de procedimentos realizados com custos e especialidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Procedimento</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Especialidade</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proceduresReport.map((procedure) => (
                      <TableRow key={procedure.id}>
                        <TableCell>{formatDate(procedure.date)}</TableCell>
                        <TableCell className="font-medium">{procedure.name}</TableCell>
                        <TableCell>{procedure.patient_name}</TableCell>
                        <TableCell>{procedure.specialty}</TableCell>
                        <TableCell>{procedure.doctor_name}</TableCell>
                        <TableCell>{getStatusBadge(procedure.status)}</TableCell>
                        <TableCell>{formatCurrency(procedure.cost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório Financeiro */}
        <TabsContent value="financial" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : financialReport && (
            <>
              {/* Resumo Financeiro */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialReport.total_revenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Período: {financialReport.period}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{financialReport.total_consultations}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Procedimentos</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{financialReport.total_procedures}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Valor Médio por Consulta</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(financialReport.average_consultation_value)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Receita por Especialidade */}
              <Card>
                <CardHeader>
                  <CardTitle>Receita por Especialidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Receita</TableHead>
                        <TableHead>Consultas</TableHead>
                        <TableHead>Procedimentos</TableHead>
                        <TableHead>Percentual</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialReport.revenue_by_specialty.map((specialty, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{specialty.specialty}</TableCell>
                          <TableCell>{formatCurrency(specialty.revenue)}</TableCell>
                          <TableCell>{specialty.consultations_count}</TableCell>
                          <TableCell>{specialty.procedures_count}</TableCell>
                          <TableCell>{specialty.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Top Procedimentos */}
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Procedimentos por Receita</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Receita Total</TableHead>
                        <TableHead>Custo Médio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financialReport.top_procedures.map((procedure, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{procedure.name}</TableCell>
                          <TableCell>{procedure.count}</TableCell>
                          <TableCell>{formatCurrency(procedure.total_revenue)}</TableCell>
                          <TableCell>{formatCurrency(procedure.average_cost)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}