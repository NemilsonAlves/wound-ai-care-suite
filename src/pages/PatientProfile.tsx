import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { PatientService } from "@/services/patientService";
import { Patient } from "@/types/patient";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import ClinicalEvolution from "@/components/evolution/ClinicalEvolution";
import PatientTimeline from "@/components/timeline/PatientTimeline";
import { supabase } from "@/lib/supabase";

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  type AuditLogEntry = {
  id: string;
  action: string;
  details?: unknown;
  created_at: string;
};
const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    const loadPatient = async () => {
      if (!id) {
        setError("ID do paciente nÃ£o fornecido");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const patientData = await PatientService.getById(id);
        setPatient(patientData);
      } catch (err) {
        console.error("Erro ao carregar paciente:", err);
        setError("Erro ao carregar dados do paciente");
        toast({
          title: "Erro",
          description: "NÃ£o foi possÃ­vel carregar os dados do paciente",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, toast]);

  useEffect(() => {
    const loadAuditLogs = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id, action, details, created_at')
          .eq('patient_id', id)
          .order('created_at', { ascending: false });
        if (!error) {
          setAuditLogs((data || []) as AuditLogEntry[]);
        }
      } catch (e) {
        console.warn('Erro ao carregar audit logs:', e);
      }
    };
    loadAuditLogs();
  }, [id]);

  const handleEditPatient = () => {
    navigate(`/pacientes/${id}/editar`);
  };

  const calculateAge = (birthDate: string): number => {
    const birth = parseISO(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando dados do paciente...</span>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Erro ao carregar paciente</h2>
          <p className="text-muted-foreground">{error || "Paciente nÃ£o encontrado"}</p>
        </div>
        <Button onClick={() => navigate("/pacientes")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {patient.full_name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{patient.full_name}</h1>
                  <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                    <span>{calculateAge(patient.birth_date)} anos</span>
                    <span>â€¢</span>
                    <span className="capitalize">{patient.gender}</span>
                    <span>â€¢</span>
                    <span>{patient.phone}</span>
                    {patient.email && (
                      <>
                        <span>â€¢</span>
                        <span>{patient.email}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="gap-1">
                      <span className="capitalize">{patient.specialty}</span>
                    </Badge>
                    {patient.allergies && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Alergias: {patient.allergies}
                      </Badge>
                    )}
                    {patient.medical_history && (
                      <Badge variant="secondary">
                        HistÃ³rico MÃ©dico
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleEditPatient} variant="outline" className="gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">InformaÃ§Ãµes Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">CPF</p>
                <p className="font-semibold text-foreground">{patient.cpf}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Data de Nascimento</p>
                <p className="font-semibold text-foreground">{formatDate(patient.birth_date)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">EndereÃ§o</p>
                <p className="font-semibold text-foreground">
                  {patient.address}, {patient.city} - {patient.state}
                </p>
                <p className="text-muted-foreground">{patient.zip_code}</p>
              </div>
              {patient.emergency_contact_name && (
                <div>
                  <p className="text-muted-foreground">Contato de EmergÃªncia</p>
                  <p className="font-semibold text-foreground">{patient.emergency_contact_name}</p>
                  {patient.emergency_contact_phone && (
                    <p className="text-muted-foreground">{patient.emergency_contact_phone}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">InformaÃ§Ãµes MÃ©dicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {patient.medical_history && (
                <div>
                  <p className="text-muted-foreground">HistÃ³rico MÃ©dico</p>
                  <p className="font-semibold text-foreground">{patient.medical_history}</p>
                </div>
              )}
              {patient.current_medications && (
                <div>
                  <p className="text-muted-foreground">Medicamentos Atuais</p>
                  <p className="font-semibold text-foreground">{patient.current_medications}</p>
                </div>
              )}
              {patient.allergies && (
                <div>
                  <p className="text-muted-foreground">Alergias</p>
                  <p className="font-semibold text-foreground">{patient.allergies}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consentimentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Processamento de Dados</span>
                <Badge variant={patient.consent_data_processing ? "default" : "secondary"}>
                  {patient.consent_data_processing ? "Autorizado" : "NÃ£o autorizado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">WhatsApp</span>
                <Badge variant={patient.consent_whatsapp ? "default" : "secondary"}>
                  {patient.consent_whatsapp ? "Autorizado" : "NÃ£o autorizado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Email</span>
                <Badge variant={patient.consent_email ? "default" : "secondary"}>
                  {patient.consent_email ? "Autorizado" : "NÃ£o autorizado"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">VisÃ£o Geral</TabsTrigger>
              <TabsTrigger value="evolution">EvoluÃ§Ã£o ClÃ­nica</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="history">HistÃ³rico</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Paciente</CardTitle>
                  <CardDescription>
                    InformaÃ§Ãµes gerais sobre o paciente e seu acompanhamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Dados Pessoais</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Nome:</span> {patient.full_name}</p>
                        <p><span className="text-muted-foreground">Idade:</span> {calculateAge(patient.birth_date)} anos</p>
                        <p><span className="text-muted-foreground">GÃªnero:</span> {patient.gender}</p>
                        <p><span className="text-muted-foreground">Telefone:</span> {patient.phone}</p>
                        <p><span className="text-muted-foreground">Email:</span> {patient.email}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">InformaÃ§Ãµes MÃ©dicas</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Especialidade:</span> {patient.specialty}</p>
                        {patient.medical_history && (
                          <p><span className="text-muted-foreground">HistÃ³rico:</span> {patient.medical_history}</p>
                        )}
                        {patient.allergies && (
                          <p><span className="text-muted-foreground">Alergias:</span> {patient.allergies}</p>
                        )}
                        {patient.current_medications && (
                          <p><span className="text-muted-foreground">Medicamentos:</span> {patient.current_medications}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Status do Cadastro</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={patient.consent_data_processing ? "default" : "secondary"}>
                        Processamento de Dados: {patient.consent_data_processing ? "Autorizado" : "NÃ£o autorizado"}
                      </Badge>
                      <Badge variant={patient.consent_whatsapp ? "default" : "secondary"}>
                        WhatsApp: {patient.consent_whatsapp ? "Autorizado" : "NÃ£o autorizado"}
                      </Badge>
                      <Badge variant={patient.consent_email ? "default" : "secondary"}>
                        Email: {patient.consent_email ? "Autorizado" : "NÃ£o autorizado"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evolution">
              <ClinicalEvolution 
                patientId={patient.id}
                patientName={patient.full_name}
                specialty={patient.specialty}
              />
            </TabsContent>

            <TabsContent value="timeline">
              <PatientTimeline 
                patientId={patient.id}
                patientName={patient.full_name}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>HistÃ³rico de alteraÃ§Ãµes</CardTitle>
                  <CardDescription>Eventos registrados para este paciente</CardDescription>
                </CardHeader>
                <CardContent>
                  {auditLogs.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Nenhum evento registrado.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left">
                            <th className="py-2 pr-4">AÃ§Ã£o</th>
                            <th className="py-2 pr-4">Data</th>
                            <th className="py-2">Detalhes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="border-t">
                              <td className="py-2 pr-4">{log.action}</td>
                              <td className="py-2 pr-4">{formatDate(log.created_at)}</td>
                              <td className="py-2">
                                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-40">
                                  {JSON.stringify(log.details || {}, null, 2)}
                                </pre>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

