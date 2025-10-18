import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const teamMemberSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("Email inválido").max(255, "Email muito longo"),
  phone: z.string().trim().max(20).optional(),
  role: z.enum(["Enfermeiro", "Médico", "Técnico de Enfermagem", "Fisioterapeuta", "Nutricionista", "Coordenador"]),
  specialty: z.string().max(100).optional(),
  license: z.string().trim().min(1, "Registro profissional obrigatório").max(50),
  shift: z.enum(["Manhã", "Tarde", "Noite", "Integral"]),
});

export default function NewTeamMember() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    specialty: "",
    license: "",
    shift: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = teamMemberSchema.parse(formData);

      // Aqui você integraria com o backend (Supabase)
      console.log("Dados validados:", validatedData);

      toast({
        title: "Membro Adicionado",
        description: "O profissional foi adicionado à equipe com sucesso",
      });

      setTimeout(() => navigate("/equipe"), 1000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de Validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/equipe")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Novo Membro da Equipe</h1>
            <p className="text-muted-foreground mt-1">Adicione um profissional à Comissão de Pele</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome completo"
                required
                maxLength={100}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@hospital.com"
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  maxLength={20}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Profissionais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Profissionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Função *</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enfermeiro">Enfermeiro</SelectItem>
                    <SelectItem value="Médico">Médico</SelectItem>
                    <SelectItem value="Técnico de Enfermagem">Técnico de Enfermagem</SelectItem>
                    <SelectItem value="Fisioterapeuta">Fisioterapeuta</SelectItem>
                    <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                    <SelectItem value="Coordenador">Coordenador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  placeholder="Ex: Estomaterapia, Dermatologia"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="license">Registro Profissional *</Label>
                <Input
                  id="license"
                  value={formData.license}
                  onChange={(e) => setFormData({ ...formData, license: e.target.value })}
                  placeholder="Ex: COREN 123456"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="shift">Turno de Trabalho *</Label>
                <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã (07h - 13h)</SelectItem>
                    <SelectItem value="Tarde">Tarde (13h - 19h)</SelectItem>
                    <SelectItem value="Noite">Noite (19h - 07h)</SelectItem>
                    <SelectItem value="Integral">Integral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-1 h-full bg-primary rounded-full" />
              <div>
                <p className="font-medium text-foreground mb-2">Acesso ao Sistema</p>
                <p className="text-muted-foreground">
                  Um convite será enviado para o email cadastrado com instruções para criar a senha e acessar o sistema WoundCare AI.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/equipe")} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Adicionar Membro"}
          </Button>
        </div>
      </form>
    </div>
  );
}
