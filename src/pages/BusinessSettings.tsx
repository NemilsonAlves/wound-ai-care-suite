import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useClinicConfig } from '@/contexts/ClinicConfigContextBase';
import { Settings, Stethoscope, Scissors, Heart, Users, DollarSign, FileText, Package } from 'lucide-react';
import { toast } from 'sonner';

const BusinessSettings = () => {
  const { config, loading, enableSpecialty, disableSpecialty, updateProcedure, addProcedure } = useClinicConfig();
  const [activeTab, setActiveTab] = useState('specialties');

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSpecialtyToggle = async (specialtyId: string, enabled: boolean) => {
    try {
      if (enabled) {
        await enableSpecialty(specialtyId);
        toast.success('Especialidade ativada com sucesso!');
      } else {
        await disableSpecialty(specialtyId);
        toast.success('Especialidade desativada com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar especialidade');
    }
  };

  const getSpecialtyIcon = (specialtyId: string) => {
    switch (specialtyId) {
      case 'curativos':
        return <Heart className="h-5 w-5" />;
      case 'dermatologia':
        return <Stethoscope className="h-5 w-5" />;
      case 'cirurgias':
        return <Scissors className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações do Negócio</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="specialties">Especialidades</TabsTrigger>
          <TabsTrigger value="procedures">Procedimentos</TabsTrigger>
          <TabsTrigger value="roles">Perfis</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="specialties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ativação de Especialidades</CardTitle>
              <CardDescription>
                Configure quais especialidades estão ativas na sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.specialties.map((specialty) => (
                <div key={specialty.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getSpecialtyIcon(specialty.id)}
                    <div>
                      <h3 className="font-medium">{specialty.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {specialty.procedures.length} procedimentos configurados
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={specialty.enabled ? 'default' : 'secondary'}>
                      {specialty.enabled ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <Switch
                      checked={specialty.enabled}
                      onCheckedChange={(checked) => handleSpecialtyToggle(specialty.id, checked)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Procedimentos</CardTitle>
              <CardDescription>
                Gerencie os procedimentos e valores por especialidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.specialties
                .filter(specialty => specialty.enabled)
                .map((specialty) => (
                  <div key={specialty.id} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getSpecialtyIcon(specialty.id)}
                      <h3 className="text-lg font-semibold">{specialty.name}</h3>
                    </div>
                    
                    <div className="grid gap-4">
                      {specialty.procedures.map((procedure) => (
                        <div key={procedure.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{procedure.name}</h4>
                            <Badge variant="outline">
                              R$ {procedure.price.toFixed(2)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor={`price-${procedure.id}`}>Valor (R$)</Label>
                              <Input
                                id={`price-${procedure.id}`}
                                type="number"
                                step="0.01"
                                value={procedure.price}
                                onChange={(e) => updateProcedure(specialty.id, procedure.id, {
                                  price: parseFloat(e.target.value) || 0
                                })}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`duration-${procedure.id}`}>Duração (min)</Label>
                              <Input
                                id={`duration-${procedure.id}`}
                                type="number"
                                value={procedure.duration}
                                onChange={(e) => updateProcedure(specialty.id, procedure.id, {
                                  duration: parseInt(e.target.value) || 0
                                })}
                              />
                            </div>
                            
                            <div>
                              <Label>Materiais</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {procedure.materials.map((material, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {material}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {procedure.description && (
                            <p className="text-sm text-muted-foreground">
                              {procedure.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Package className="h-4 w-4 mr-2" />
                      Adicionar Procedimento
                    </Button>
                    
                    <Separator />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfis de Usuário</CardTitle>
              <CardDescription>
                Configure permissões e acessos por perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.userRoles.map((role) => (
                <div key={role.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <h3 className="font-medium">{role.name}</h3>
                    </div>
                    <Badge variant="outline">
                      {role.permissions.length} permissões
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Especialidades com acesso:</Label>
                    <div className="flex flex-wrap gap-2">
                      {role.canAccessSpecialties.map((specialtyId) => {
                        const specialty = config.specialties.find(s => s.id === specialtyId);
                        return specialty ? (
                          <Badge key={specialtyId} variant="secondary">
                            {specialty.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Módulos e permissões:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {role.permissions.map((permission, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{permission.module}:</span>{' '}
                          <span className="text-muted-foreground">
                            {permission.actions.join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Laudos e Evoluções</CardTitle>
              <CardDescription>
                Configure templates personalizados por especialidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.specialties
                .filter(specialty => specialty.enabled)
                .map((specialty) => (
                  <div key={specialty.id} className="space-y-4">
                    <div className="flex items-center space-x-2">
                      {getSpecialtyIcon(specialty.id)}
                      <h3 className="text-lg font-semibold">{specialty.name}</h3>
                    </div>
                    
                    <div className="grid gap-4">
                      {specialty.templates.map((template) => (
                        <div key={template.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{template.name}</h4>
                            <Badge variant="outline">
                              {template.type}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Campos do template:</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {template.fields.map((field) => (
                                <div key={field.id} className="text-sm p-2 bg-muted rounded">
                                  <span className="font-medium">{field.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    ({field.type})
                                    {field.required && ' *'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Adicionar Template
                    </Button>
                    
                    <Separator />
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configurações globais da clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clinic-name">Nome da Clínica</Label>
                    <Input
                      id="clinic-name"
                      value={config.name}
                      placeholder="Nome da sua clínica"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Idioma Padrão</Label>
                    <Input
                      id="language"
                      value={config.generalSettings.defaultLanguage}
                      placeholder="pt-BR"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Input
                      id="timezone"
                      value={config.generalSettings.timezone}
                      placeholder="America/Sao_Paulo"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currency">Moeda</Label>
                    <Input
                      id="currency"
                      value={config.generalSettings.currency}
                      placeholder="BRL"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="date-format">Formato de Data</Label>
                    <Input
                      id="date-format"
                      value={config.generalSettings.dateFormat}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="multi-clinic"
                      checked={config.generalSettings.multiClinic}
                    />
                    <Label htmlFor="multi-clinic">Multi-clínica</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="multi-unit"
                      checked={config.generalSettings.multiUnit}
                    />
                    <Label htmlFor="multi-unit">Multi-unidade</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Horário de Funcionamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-time">Horário de Início</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={config.generalSettings.workingHours.start}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end-time">Horário de Término</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={config.generalSettings.workingHours.end}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Dias de Funcionamento</Label>
                  <div className="flex space-x-2 mt-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                      <Button
                        key={index}
                        variant={config.generalSettings.workingHours.days.includes(index) ? 'default' : 'outline'}
                        size="sm"
                        className="w-12"
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessSettings;
