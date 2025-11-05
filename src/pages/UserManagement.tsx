import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useClinicConfig } from '@/contexts/ClinicConfigContextBase';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { Users, UserPlus, Shield, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  specialties: string[];
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Mock data para demonstração
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    email: 'joao.silva@clinica.com',
    role: 'profissional',
    specialties: ['curativos', 'dermatologia'],
    active: true,
    createdAt: '2024-01-15',
    lastLogin: '2024-01-20'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@clinica.com',
    role: 'gestor',
    specialties: ['curativos', 'dermatologia', 'cirurgias'],
    active: true,
    createdAt: '2024-01-10',
    lastLogin: '2024-01-20'
  },
  {
    id: '3',
    name: 'Carlos Financeiro',
    email: 'carlos.financeiro@clinica.com',
    role: 'financeiro',
    specialties: [],
    active: true,
    createdAt: '2024-01-12',
    lastLogin: '2024-01-19'
  }
];

const UserManagement: React.FC = () => {
  const { config } = useClinicConfig();
  const enableMockData = (import.meta.env.VITE_ENABLE_MOCK_DATA ?? (import.meta.env.DEV ? 'true' : 'false')) === 'true';
  const [users, setUsers] = useState<User[]>(enableMockData ? mockUsers : []);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoleName = (roleId: string) => {
    const role = config.userRoles.find(r => r.id === roleId);
    return role?.name || roleId;
  };

  const getSpecialtyName = (specialtyId: string) => {
    const specialty = config.specialties.find(s => s.id === specialtyId);
    return specialty?.name || specialtyId;
  };

  const handleCreateUser = () => {
    setSelectedUser({
      id: '',
      name: '',
      email: '',
      role: 'profissional',
      specialties: [],
      active: true,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    if (selectedUser.id) {
      // Atualizar usuário existente
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
      toast.success('Usuário atualizado com sucesso!');
    } else {
      // Criar novo usuário
      const newUser = { ...selectedUser, id: Date.now().toString() };
      setUsers([...users, newUser]);
      toast.success('Usuário criado com sucesso!');
    }

    setSelectedUser(null);
    setIsEditing(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success('Usuário removido com sucesso!');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, active: !u.active } : u
    ));
    toast.success('Status do usuário atualizado!');
  };

  return (
    <PermissionGuard module="team" action="read">
      <div className="container mx-auto p-6 space-y-6">
        {!enableMockData && (
          <Alert>
            <AlertTitle>Dados de demonstração desativados</AlertTitle>
            <AlertDescription>
              Ative `VITE_ENABLE_MOCK_DATA` para visualizar usuários de exemplo.
            </AlertDescription>
          </Alert>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          </div>
          <PermissionGuard module="team" action="create">
            <Button onClick={handleCreateUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </PermissionGuard>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="roles">Perfis</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                  Gerencie os usuários da clínica e suas permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{getRoleName(user.role)}</Badge>
                            <Badge variant={user.active ? 'default' : 'secondary'}>
                              {user.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <PermissionGuard module="team" action="update">
                          <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard module="team" action="delete">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Perfis de Usuário</CardTitle>
                <CardDescription>
                  Visualize os perfis disponíveis e suas permissões
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.userRoles.map((role) => (
                  <div key={role.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <h3 className="font-medium">{role.name}</h3>
                      </div>
                      <Badge variant="outline">
                        {role.permissions.length} permissões
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Especialidades com acesso:</Label>
                      <div className="flex flex-wrap gap-2">
                        {role.canAccessSpecialties.length > 0 ? (
                          role.canAccessSpecialties.map((specialtyId) => (
                            <Badge key={specialtyId} variant="secondary">
                              {getSpecialtyName(specialtyId)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">Nenhuma especialidade</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Módulos e permissões:</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {role.permissions.map((permission, index) => (
                          <div key={index} className="text-sm p-2 bg-muted rounded">
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
        </Tabs>

        {/* Modal de Edição/Criação de Usuário */}
        {isEditing && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {selectedUser.id ? 'Editar Usuário' : 'Novo Usuário'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={selectedUser.name}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        name: e.target.value
                      })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({
                        ...selectedUser,
                        email: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="role">Perfil</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => setSelectedUser({
                      ...selectedUser,
                      role: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.userRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Especialidades</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {config.specialties.map((specialty) => (
                      <div key={specialty.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty.id}
                          checked={selectedUser.specialties.includes(specialty.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUser({
                                ...selectedUser,
                                specialties: [...selectedUser.specialties, specialty.id]
                              });
                            } else {
                              setSelectedUser({
                                ...selectedUser,
                                specialties: selectedUser.specialties.filter(s => s !== specialty.id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={specialty.id}>{specialty.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={selectedUser.active}
                    onCheckedChange={(checked) => setSelectedUser({
                      ...selectedUser,
                      active: checked as boolean
                    })}
                  />
                  <Label htmlFor="active">Usuário ativo</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => {
                    setSelectedUser(null);
                    setIsEditing(false);
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveUser}>
                    {selectedUser.id ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
};

export default UserManagement;
