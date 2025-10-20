import { useState, useRef } from "react";
import { Camera, Upload, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BodyMapSelector } from "@/components/assessments/BodyMapSelector";
import { AIConfidence } from "@/components/assessments/AIConfidence";
import { WoundSizeVisualizer } from "@/components/assessments/WoundSizeVisualizer";
import { useToast } from "@/hooks/use-toast";

const steps = ["Paciente", "Foto", "Análise", "Prescrição"];

export default function NewAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState([0]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const aiAnalysis = {
    type: "Úlcera por Pressão - Estágio III",
    dimensions: { length: 4.2, width: 3.1, depth: 0.8 },
    area: 13.02,
    tissues: {
      granulation: 60,
      slough: 30,
      necrotic: 10,
    },
    infection: false,
    confidence: 92,
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        analyzeImage(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setCapturedImage(imageData);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = (imageData: string) => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setCurrentStep(2);
      toast({
        title: "Análise Concluída",
        description: "A IA processou a imagem com 92% de confiança",
      });
    }, 3000);
  };

  const removePhoto = () => {
    setCapturedImage(null);
    setAnalysisComplete(false);
    stopCamera();
  };

  const handleSubmit = () => {
    toast({
      title: "Avaliação Registrada",
      description: "A avaliação foi salva com sucesso",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Nova Avaliação de Ferida</h1>
        <p className="text-muted-foreground mt-1">Registro completo com análise por IA</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  index <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span className="text-sm mt-2 text-muted-foreground">{step}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 transition-colors ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        {/* Step 1: Patient Selection */}
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Paciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Maria Silva - Leito 201-A</SelectItem>
                    <SelectItem value="2">João Santos - Leito 305-B</SelectItem>
                    <SelectItem value="3">Ana Costa - Leito 102-C</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-4 block">Localização das Lesões</Label>
                <BodyMapSelector onLocationSelect={setLocations} selectedLocations={locations} />
              </div>

              <Button
                className="w-full"
                onClick={() => setCurrentStep(1)}
                disabled={!selectedPatient || locations.length === 0}
              >
                Continuar para Captura de Foto
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Photo Capture */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Captura de Foto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden relative">
                {capturedImage ? (
                  <div className="relative w-full h-full">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                    {!isAnalyzing && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={removePhoto}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                        <p className="text-foreground font-semibold mb-2">Analisando Imagem...</p>
                        <p className="text-sm text-muted-foreground">
                          Detectando bordas → Medindo → Classificando
                        </p>
                      </div>
                    )}
                  </div>
                ) : isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
                      <Button size="lg" onClick={capturePhoto} className="gap-2">
                        <Camera className="w-5 h-5" />
                        Capturar
                      </Button>
                      <Button size="lg" variant="outline" onClick={stopCamera}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Posicione a régua ao lado da ferida
                    </p>
                    <div className="flex gap-4">
                      <Button size="lg" onClick={startCamera} className="gap-2">
                        <Camera className="w-5 h-5" />
                        Abrir Câmera
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                        <Upload className="w-5 h-5" />
                        Upload
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {!isAnalyzing && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Dicas para melhor análise:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Use iluminação adequada</li>
                        <li>Posicione régua milimetrada ao lado</li>
                        <li>Mantenha câmera perpendicular à ferida</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: AI Analysis */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-status-stable" />
                  Análise Completa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <AIConfidence confidence={aiAnalysis.confidence} />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Lesão (IA)</Label>
                      <Input value={aiAnalysis.type} className="mt-1" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label>Comprimento</Label>
                        <Input value={`${aiAnalysis.dimensions.length} cm`} className="mt-1" />
                      </div>
                      <div>
                        <Label>Largura</Label>
                        <Input value={`${aiAnalysis.dimensions.width} cm`} className="mt-1" />
                      </div>
                      <div>
                        <Label>Profundidade</Label>
                        <Input value={`${aiAnalysis.dimensions.depth} cm`} className="mt-1" />
                      </div>
                    </div>

                    <div>
                      <Label>Área Total</Label>
                      <Input value={`${aiAnalysis.area} cm²`} className="mt-1" />
                    </div>

                    <div>
                      <Label>Composição do Leito</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Granulação</span>
                          <span className="font-semibold">{aiAnalysis.tissues.granulation}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-status-stable"
                            style={{ width: `${aiAnalysis.tissues.granulation}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Esfacelo</span>
                          <span className="font-semibold">{aiAnalysis.tissues.slough}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-status-warning"
                            style={{ width: `${aiAnalysis.tissues.slough}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Necrose</span>
                          <span className="font-semibold">{aiAnalysis.tissues.necrotic}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-status-critical"
                            style={{ width: `${aiAnalysis.tissues.necrotic}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-status-stable/10 border border-status-stable/20">
                      <CheckCircle2 className="w-5 h-5 text-status-stable" />
                      <span className="text-sm font-medium">Infecção: Não detectada</span>
                    </div>
                  </div>

                  <WoundSizeVisualizer
                    length={aiAnalysis.dimensions.length}
                    width={aiAnalysis.dimensions.width}
                    depth={aiAnalysis.dimensions.depth}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Exsudato</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ausente</SelectItem>
                        <SelectItem value="light">Leve</SelectItem>
                        <SelectItem value="moderate">Moderado</SelectItem>
                        <SelectItem value="heavy">Abundante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nível de Dor (0-10)</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={painLevel}
                        onValueChange={setPainLevel}
                        max={10}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold text-foreground w-8">{painLevel[0]}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Observações Adicionais</Label>
                    <Textarea
                      placeholder="Descreva sinais clínicos, odor, bordas, pele perilesional..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={() => setCurrentStep(3)} className="flex-1">
                    Continuar para Prescrição
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Prescription */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Prescrição de Tratamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-3">
                  Recomendações IA para este caso:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-stable" />
                    <span className="text-sm">Hidrofibra com Prata (92% confiança)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-stable" />
                    <span className="text-sm">Mudança de decúbito 2/2h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-status-stable" />
                    <span className="text-sm">Troca curativo a cada 48-72h</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Curativo Primário</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar material..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hidrofibra com Prata</SelectItem>
                    <SelectItem value="2">Espuma com Silicone</SelectItem>
                    <SelectItem value="3">Hidrogel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Curativo Secundário</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar material..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Filme Transparente</SelectItem>
                    <SelectItem value="2">Gaze Estéril</SelectItem>
                    <SelectItem value="3">Atadura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Frequência de Troca</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">A cada 24h</SelectItem>
                    <SelectItem value="48h">A cada 48h</SelectItem>
                    <SelectItem value="72h">A cada 72h</SelectItem>
                    <SelectItem value="prn">Conforme necessário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condutas Adicionais</Label>
                <Textarea
                  placeholder="Mudança de decúbito, suporte nutricional, interconsultas..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Finalizar Avaliação
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
