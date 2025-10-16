import { Users, UserPlus, Mail, Phone, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const teamMembers = [
  {
    id: 1,
    name: "Ana Santos",
    role: "Enfermeira Especialista",
    initials: "AS",
    email: "ana.santos@hospital.com",
    phone: "(11) 98765-4321",
    assessments: 142,
    patients: 28,
    rating: 4.9,
    specialties: ["Úlcera Pressão", "Queimaduras"],
    status: "online"
  },
  {
    id: 2,
    name: "Carlos Lima",
    role: "Enfermeiro",
    initials: "CL",
    email: "carlos.lima@hospital.com",
    phone: "(11) 98765-4322",
    assessments: 98,
    patients: 22,
    rating: 4.7,
    specialties: ["Úlcera Venosa", "Diabética"],
    status: "online"
  },
  {
    id: 3,
    name: "Maria Oliveira",
    role: "Enfermeira Coordenadora",
    initials: "MO",
    email: "maria.oliveira@hospital.com",
    phone: "(11) 98765-4323",
    assessments: 215,
    patients: 35,
    rating: 5.0,
    specialties: ["Gestão", "Protocolos"],
    status: "away"
  },
  {
    id: 4,
    name: "Pedro Costa",
    role: "Técnico de Enfermagem",
    initials: "PC",
    email: "pedro.costa@hospital.com",
    phone: "(11) 98765-4324",
    assessments: 67,
    patients: 18,
    rating: 4.6,
    specialties: ["Curativos Básicos"],
    status: "offline"
  }
];

export default function Team() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground mt-1">Gestão da equipe e performance</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-5 h-5" />
          Adicionar Membro
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Equipe</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online Agora</p>
                <p className="text-2xl font-bold text-status-stable">
                  {teamMembers.filter(m => m.status === "online").length}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-status-stable/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-status-stable" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliações Mês</p>
                <p className="text-2xl font-bold">522</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
              <Award className="w-8 h-8 text-status-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input placeholder="Buscar membro da equipe..." className="flex-1" />
        <Button variant="outline">Filtrar</Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="specialists">Especialistas</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                          member.status === "online" ? "bg-status-stable" :
                          member.status === "away" ? "bg-status-warning" :
                          "bg-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-status-warning">
                      <Award className="w-4 h-4" />
                      <span className="text-sm font-semibold">{member.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {member.phone}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {member.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Avaliações</p>
                      <p className="text-lg font-semibold">{member.assessments}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pacientes</p>
                      <p className="text-lg font-semibold">{member.patients}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Mensagem</Button>
                    <Button size="sm" className="flex-1">Ver Perfil</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.filter(m => m.status === "online").map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background bg-status-stable" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Disponível para consultas e avaliações
                  </p>
                  <Button className="w-full mt-4">Atribuir Paciente</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="specialists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.filter(m => m.role.includes("Especialista") || m.role.includes("Coordenadora")).map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {member.name}
                          <Award className="w-4 h-4 text-status-warning" />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {member.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="secondary">{specialty}</Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Avaliações</p>
                      <p className="text-lg font-semibold">{member.assessments}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="text-lg font-semibold">{member.rating} ⭐</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Solicitar Interconsulta</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
