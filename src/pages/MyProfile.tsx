import { User, Mail, Phone, Award, Calendar, Camera, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function MyProfile() {
  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground mt-1">Informações pessoais e estatísticas</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                  EN
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Enf. Ana Santos</h2>
                  <p className="text-muted-foreground mt-1">Enfermeira Especialista</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Award className="w-4 h-4 text-status-warning" />
                    <span className="text-sm font-semibold">Avaliação: 4.9 ⭐</span>
                  </div>
                </div>
                <Button className="gap-2">
                  <Edit className="w-4 h-4" />
                  Editar Perfil
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>ana.santos@hospital.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>(11) 98765-4321</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>CRE: 123456-SP</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Desde: Janeiro 2020</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Badge variant="secondary">Úlcera Pressão</Badge>
                <Badge variant="secondary">Queimaduras</Badge>
                <Badge variant="secondary">Curativos Complexos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avaliações</p>
            <p className="text-3xl font-bold mt-1">142</p>
            <p className="text-xs text-status-improving mt-1">+12 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
            <p className="text-3xl font-bold mt-1">28</p>
            <p className="text-xs text-muted-foreground mt-1">Em acompanhamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
            <p className="text-3xl font-bold mt-1">89%</p>
            <p className="text-xs text-status-improving mt-1">Acima da média</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
            <p className="text-3xl font-bold mt-1">168</p>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-status-stable mt-2 shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  Registrou evolução positiva para <span className="font-medium">Maria Silva</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Hoje às 14:30</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  Nova avaliação de ferida cadastrada
                </p>
                <p className="text-xs text-muted-foreground mt-1">Hoje às 11:20</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-status-warning mt-2 shrink-0" />
              <div>
                <p className="text-sm text-foreground">
                  Solicitação de material aprovada
                </p>
                <p className="text-xs text-muted-foreground mt-1">Ontem às 16:45</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
