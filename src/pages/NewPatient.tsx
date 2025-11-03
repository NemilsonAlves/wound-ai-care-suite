import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserPlus, MapPin, Phone, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PatientService } from "@/services/patientService";
import { PatientFormData } from "@/types/patient";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateInput } from "@/components/ui/date-input";
import { cn } from "@/lib/utils";
import { createPatientSchema, formatPatientData, formatCPF, formatPhone, formatZipCode, validateCPF } from "@/lib/validations";
import { z } from "zod";
// Usando schema centralizado
const patientSchema = createPatientSchema;

export default function NewPatient() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [birthDate, setBirthDate] = useState<Date>();
  
  const [formData, setFormData] = useState<PatientFormData>({
    full_name: "",
    cpf: "",
    birth_date: "",
    gender: "masculino",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_history: "",
    current_medications: "",
    allergies: "",
    specialty: "Curativos",
    consent_data_processing: false,
    consent_whatsapp: false,
    consent_email: false
  });

  const handleInputChange = (field: keyof PatientFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    if (formatted.length <= 14) {
      handleInputChange('cpf', formatted);
    }
  };

  const handlePhoneChange = (field: 'phone' | 'emergency_contact_phone', value: string) => {
    const formatted = formatPhone(value);
    if (formatted.length <= 15) {
      handleInputChange(field, formatted);
    }
  };

  const handleZipCodeChange = (value: string) => {
    const formatted = formatZipCode(value);
    if (formatted.length <= 9) {
      handleInputChange('zip_code', formatted);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date);
    if (date) {
      handleInputChange('birth_date', format(date, 'yyyy-MM-dd'));
    }
  };

  // Componente DateInput lida com digitação e seleção

  const validateForm = (): boolean => {
    try {
      patientSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar se CPF já existe
      const cpfExists = await PatientService.checkCpfExists(formData.cpf.replace(/\D/g, ''));
      if (cpfExists) {
        setErrors({ cpf: "Já existe um paciente cadastrado com este CPF" });
        toast({
          title: "CPF já cadastrado",
          description: "Já existe um paciente com este CPF no sistema.",
          variant: "destructive",
        });
        return;
      }

      const patient = await PatientService.create(formData);
      
      toast({
        title: "Paciente cadastrado com sucesso!",
        description: `${patient.full_name} foi adicionado ao sistema.`,
      });
      
      navigate("/pacientes");
    } catch (error) {
      console.error("Erro ao cadastrar paciente:", error);
      toast({
        title: "Erro ao cadastrar paciente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/pacientes")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
          <p className="text-gray-600">Cadastre um novo paciente no sistema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Digite o nome completo"
                  className={errors.full_name ? "border-red-500" : ""}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.full_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className={errors.cpf ? "border-red-500" : ""}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cpf}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento *</Label>
                <DateInput
                  id="birth_date"
                  value={birthDate}
                  onChange={(date) => {
                    setBirthDate(date);
                    handleDateSelect(date);
                  }}
                  placeholder="dd/mm/aaaa"
                  minDate={new Date('1900-01-01')}
                  maxDate={new Date()}
                  className={errors.birth_date ? "border-red-500" : ""}
                  aria-invalid={errors.birth_date ? 'true' : undefined}
                  required
                />
                {errors.birth_date && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.birth_date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gênero *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Nome da cidade"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.city}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                  className={errors.state ? "border-red-500" : ""}
                />
                {errors.state && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.state}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP *</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleZipCodeChange(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className={errors.zip_code ? "border-red-500" : ""}
                />
                {errors.zip_code && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.zip_code}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato de Emergência */}
        <Card>
          <CardHeader>
            <CardTitle>Contato de Emergência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Nome do Contato</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  placeholder="Nome completo"
                  className={errors.emergency_contact_name ? "border-red-500" : ""}
                />
                {errors.emergency_contact_name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.emergency_contact_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Telefone do Contato</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handlePhoneChange('emergency_contact_phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className={errors.emergency_contact_phone ? "border-red-500" : ""}
                />
                {errors.emergency_contact_phone && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.emergency_contact_phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Médicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Médicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade *</Label>
              <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                <SelectTrigger className={errors.specialty ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
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
              {errors.specialty && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.specialty}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medical_history">Histórico Médico</Label>
              <Textarea
                id="medical_history"
                value={formData.medical_history}
                onChange={(e) => handleInputChange('medical_history', e.target.value)}
                placeholder="Descreva o histórico médico relevante..."
                rows={3}
                className={errors.medical_history ? "border-red-500" : ""}
              />
              {errors.medical_history && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.medical_history}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_medications">Medicamentos Atuais</Label>
              <Textarea
                id="current_medications"
                value={formData.current_medications}
                onChange={(e) => handleInputChange('current_medications', e.target.value)}
                placeholder="Liste os medicamentos em uso..."
                rows={2}
                className={errors.current_medications ? "border-red-500" : ""}
              />
              {errors.current_medications && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.current_medications}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Liste alergias conhecidas..."
                rows={2}
                className={errors.allergies ? "border-red-500" : ""}
              />
              {errors.allergies && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.allergies}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consentimentos */}
        <Card>
          <CardHeader>
            <CardTitle>Consentimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent_data_processing"
                  checked={formData.consent_data_processing}
                  onCheckedChange={(checked) => handleInputChange('consent_data_processing', checked as boolean)}
                />
                <Label htmlFor="consent_data_processing" className="text-sm">
                  Autorizo o processamento dos meus dados pessoais conforme a LGPD *
                </Label>
              </div>
              {errors.consent_data_processing && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.consent_data_processing}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent_whatsapp"
                  checked={formData.consent_whatsapp}
                  onCheckedChange={(checked) => handleInputChange('consent_whatsapp', checked as boolean)}
                />
                <Label htmlFor="consent_whatsapp" className="text-sm">
                  Autorizo receber comunicações via WhatsApp
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consent_email"
                  checked={formData.consent_email}
                  onCheckedChange={(checked) => handleInputChange('consent_email', checked as boolean)}
                />
                <Label htmlFor="consent_email" className="text-sm">
                  Autorizo receber comunicações via email
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/pacientes")}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Cadastrando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Cadastrar Paciente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
