import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const patientSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  age: z.number().min(0, "Idade inválida").max(150, "Idade inválida"),
  gender: z.enum(["Masculino", "Feminino", "Outro"]),
  room: z.string().trim().min(1, "Leito é obrigatório").max(20),
  record: z.string().trim().min(1, "Prontuário é obrigatório").max(50),
  sector: z.string().trim().min(1, "Setor é obrigatório"),
  phone: z.string().trim().max(20).optional(),
  allergies: z.string().max(500).optional(),
  comorbidities: z.string().max(1000).optional(),
  observations: z.string().max(2000).optional(),
});

export default function NewPatient() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    room: "",
    record: "",
    sector: "",
    phone: "",
    allergies: "",
    comorbidities: "",
    observations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = patientSchema.parse({
        ...formData,
        age: parseInt(formData.age),
      });

      // Aqui você integraria com o backend (Supabase)
      console.log("Dados validados:", validatedData);

      toast({
        title: "Paciente Cadastrado",
        description: "O paciente foi adicionado com sucesso ao sistema",
      });

      setTimeout(() => navigate("/pacientes"), 1000);
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/pacientes")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Novo Paciente</h1>
            <p className="text-muted-foreground mt-1">Cadastre um novo paciente no sistema</p>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome completo do paciente"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="age">Idade *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Idade"
                  required
                  min="0"
                  max="150"
                />
              </div>

              <div>
                <Label htmlFor="gender">Sexo *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Telefone de Contato</Label>
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

        {/* Dados Hospitalares */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Hospitalares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="record">Prontuário *</Label>
                <Input
                  id="record"
                  value={formData.record}
                  onChange={(e) => setFormData({ ...formData, record: e.target.value })}
                  placeholder="Número do prontuário"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="room">Leito *</Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  placeholder="Ex: 201-A"
                  required
                  maxLength={20}
                />
              </div>

              <div>
                <Label htmlFor="sector">Setor *</Label>
                <Select value={formData.sector} onValueChange={(value) => setFormData({ ...formData, sector: value })}>
                  <SelectTrigger id="sector">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTI">UTI</SelectItem>
                    <SelectItem value="Clínica Médica">Clínica Médica</SelectItem>
                    <SelectItem value="Cirurgia Geral">Cirurgia Geral</SelectItem>
                    <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                    <SelectItem value="Neurologia">Neurologia</SelectItem>
                    <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Clínicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Clínicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Ex: Penicilina, Látex (separados por vírgula)"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">Separe múltiplas alergias por vírgula</p>
            </div>

            <div>
              <Label htmlFor="comorbidities">Comorbidades</Label>
              <Textarea
                id="comorbidities"
                value={formData.comorbidities}
                onChange={(e) => setFormData({ ...formData, comorbidities: e.target.value })}
                placeholder="Ex: Diabetes Mellitus tipo 2, Hipertensão Arterial, Obesidade"
                className="min-h-[80px]"
                maxLength={1000}
              />
            </div>

            <div>
              <Label htmlFor="observations">Observações Gerais</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Informações adicionais relevantes sobre o paciente..."
                className="min-h-[100px]"
                maxLength={2000}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/pacientes")} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Salvando..." : "Cadastrar Paciente"}
          </Button>
        </div>
      </form>
    </div>
  );
}
