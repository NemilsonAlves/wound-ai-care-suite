import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Upload, X, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { CreateEvolutionData, EvolutionService } from '../../services/evolutionService';

const evolutionSchema = z.object({
  patient_id: z.string().min(1, 'Paciente é obrigatório'),
  wound_type: z.enum(['ulcera_venosa', 'ulcera_arterial', 'ulcera_diabetica', 'lesao_pressao', 'queimadura', 'trauma', 'cirurgica', 'outras']),
  wound_location: z.string().min(1, 'Localização da lesão é obrigatória'),
  wound_size_length: z.number().min(0.1, 'Comprimento deve ser maior que 0'),
  wound_size_width: z.number().min(0.1, 'Largura deve ser maior que 0'),
  wound_size_depth: z.number().optional(),
  wound_stage: z.enum(['1', '2', '3', '4', 'nao_classificavel']),
  exudate_amount: z.enum(['ausente', 'escasso', 'moderado', 'abundante']),
  exudate_type: z.enum(['seroso', 'sanguinolento', 'purulento', 'fibrinoso']),
  wound_bed: z.enum(['granulacao', 'fibrina', 'necrose', 'epitelizacao', 'misto']),
  wound_edges: z.enum(['aderidas', 'nao_aderidas', 'maceradas', 'hiperqueratosicas']),
  periwound_skin: z.enum(['integra', 'macerada', 'ressecada', 'hiperemiada', 'descamativa']),
  pain_scale: z.number().min(0).max(10),
  odor: z.enum(['ausente', 'leve', 'moderado', 'forte']),
  infection_signs: z.array(z.string()),
  treatment_performed: z.string().min(1, 'Tratamento realizado é obrigatório'),
  dressing_used: z.string().min(1, 'Curativo utilizado é obrigatório'),
  observations: z.string(),
  next_evaluation_date: z.date().optional()
});

type EvolutionFormData = z.infer<typeof evolutionSchema>;

interface EvolutionFormProps {
  patientId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EvolutionForm({ patientId, onSuccess, onCancel }: EvolutionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const [painScale, setPainScale] = useState([0]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EvolutionFormData>({
    resolver: zodResolver(evolutionSchema),
    defaultValues: {
      patient_id: patientId || '',
      pain_scale: 0,
      infection_signs: []
    }
  });

  const watchedInfectionSigns = watch('infection_signs') || [];
  const nextEvaluationDate = watch('next_evaluation_date');

  const infectionSignsOptions = [
    'Eritema',
    'Edema',
    'Calor local',
    'Dor aumentada',
    'Exudato purulento',
    'Odor fétido',
    'Febre',
    'Linfangite',
    'Linfadenopatia'
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleInfectionSignChange = (sign: string, checked: boolean) => {
    const currentSigns = watchedInfectionSigns;
    if (checked) {
      setValue('infection_signs', [...currentSigns, sign]);
    } else {
      setValue('infection_signs', currentSigns.filter(s => s !== sign));
    }
  };

  const onSubmit = async (data: EvolutionFormData) => {
    try {
      setIsSubmitting(true);
      
      const evolutionData: CreateEvolutionData = {
        patient_id: data.patient_id!,
        wound_type: data.wound_type!,
        wound_location: data.wound_location!,
        wound_size_length: data.wound_size_length!,
        wound_size_width: data.wound_size_width!,
        wound_size_depth: data.wound_size_depth,
        wound_stage: data.wound_stage!,
        exudate_amount: data.exudate_amount!,
        exudate_type: data.exudate_type!,
        wound_bed: data.wound_bed!,
        wound_edges: data.wound_edges!,
        periwound_skin: data.periwound_skin!,
        pain_scale: painScale[0],
        odor: data.odor!,
        infection_signs: data.infection_signs!,
        treatment_performed: data.treatment_performed!,
        dressing_used: data.dressing_used!,
        observations: data.observations!,
        next_evaluation_date: data.next_evaluation_date?.toISOString()
      };

      const evolution = await EvolutionService.createEvolution(evolutionData);

      // Upload photos if any
      for (const photo of photos) {
        await EvolutionService.uploadPhoto(evolution.id, photo);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Erro ao criar evolução:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo e Localização da Lesão */}
        <Card>
          <CardHeader>
            <CardTitle>Características da Lesão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wound_type">Tipo de Lesão</Label>
              <Select onValueChange={(value) => setValue('wound_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ulcera_venosa">Úlcera Venosa</SelectItem>
                  <SelectItem value="ulcera_arterial">Úlcera Arterial</SelectItem>
                  <SelectItem value="ulcera_diabetica">Úlcera Diabética</SelectItem>
                  <SelectItem value="lesao_pressao">Lesão por Pressão</SelectItem>
                  <SelectItem value="queimadura">Queimadura</SelectItem>
                  <SelectItem value="trauma">Trauma</SelectItem>
                  <SelectItem value="cirurgica">Cirúrgica</SelectItem>
                  <SelectItem value="outras">Outras</SelectItem>
                </SelectContent>
              </Select>
              {errors.wound_type && (
                <p className="text-sm text-red-500">{errors.wound_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="wound_location">Localização</Label>
              <Input
                id="wound_location"
                {...register('wound_location')}
                placeholder="Ex: Maléolo medial direito"
              />
              {errors.wound_location && (
                <p className="text-sm text-red-500">{errors.wound_location.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="wound_stage">Estágio</Label>
              <Select onValueChange={(value) => setValue('wound_stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Estágio I</SelectItem>
                  <SelectItem value="2">Estágio II</SelectItem>
                  <SelectItem value="3">Estágio III</SelectItem>
                  <SelectItem value="4">Estágio IV</SelectItem>
                  <SelectItem value="nao_classificavel">Não Classificável</SelectItem>
                </SelectContent>
              </Select>
              {errors.wound_stage && (
                <p className="text-sm text-red-500">{errors.wound_stage.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dimensões */}
        <Card>
          <CardHeader>
            <CardTitle>Dimensões (cm)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wound_size_length">Comprimento</Label>
                <Input
                  id="wound_size_length"
                  type="number"
                  step="0.1"
                  {...register('wound_size_length', { valueAsNumber: true })}
                />
                {errors.wound_size_length && (
                  <p className="text-sm text-red-500">{errors.wound_size_length.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="wound_size_width">Largura</Label>
                <Input
                  id="wound_size_width"
                  type="number"
                  step="0.1"
                  {...register('wound_size_width', { valueAsNumber: true })}
                />
                {errors.wound_size_width && (
                  <p className="text-sm text-red-500">{errors.wound_size_width.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="wound_size_depth">Profundidade (opcional)</Label>
              <Input
                id="wound_size_depth"
                type="number"
                step="0.1"
                {...register('wound_size_depth', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Exsudato */}
        <Card>
          <CardHeader>
            <CardTitle>Exsudato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Quantidade</Label>
              <Select onValueChange={(value) => setValue('exudate_amount', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a quantidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="escasso">Escasso</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="abundante">Abundante</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo</Label>
              <Select onValueChange={(value) => setValue('exudate_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seroso">Seroso</SelectItem>
                  <SelectItem value="sanguinolento">Sanguinolento</SelectItem>
                  <SelectItem value="purulento">Purulento</SelectItem>
                  <SelectItem value="fibrinoso">Fibrinoso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leito da Ferida */}
        <Card>
          <CardHeader>
            <CardTitle>Características do Leito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Leito da Ferida</Label>
              <Select onValueChange={(value) => setValue('wound_bed', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de leito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="granulacao">Granulação</SelectItem>
                  <SelectItem value="fibrina">Fibrina</SelectItem>
                  <SelectItem value="necrose">Necrose</SelectItem>
                  <SelectItem value="epitelizacao">Epitelização</SelectItem>
                  <SelectItem value="misto">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bordas</Label>
              <Select onValueChange={(value) => setValue('wound_edges', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de bordas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aderidas">Aderidas</SelectItem>
                  <SelectItem value="nao_aderidas">Não Aderidas</SelectItem>
                  <SelectItem value="maceradas">Maceradas</SelectItem>
                  <SelectItem value="hiperqueratosicas">Hiperqueratósicas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Pele Perilesional</Label>
              <Select onValueChange={(value) => setValue('periwound_skin', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado da pele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="integra">Íntegra</SelectItem>
                  <SelectItem value="macerada">Macerada</SelectItem>
                  <SelectItem value="ressecada">Ressecada</SelectItem>
                  <SelectItem value="hiperemiada">Hiperemiada</SelectItem>
                  <SelectItem value="descamativa">Descamativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dor e Odor */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliação de Dor e Odor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Escala de Dor (0-10): {painScale[0]}</Label>
            <Slider
              value={painScale}
              onValueChange={setPainScale}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Odor</Label>
            <Select onValueChange={(value) => setValue('odor', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a intensidade do odor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ausente">Ausente</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="forte">Forte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sinais de Infecção */}
      <Card>
        <CardHeader>
          <CardTitle>Sinais de Infecção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {infectionSignsOptions.map((sign) => (
              <div key={sign} className="flex items-center space-x-2">
                <Checkbox
                  id={sign}
                  checked={watchedInfectionSigns.includes(sign)}
                  onCheckedChange={(checked) => handleInfectionSignChange(sign, checked as boolean)}
                />
                <Label htmlFor={sign} className="text-sm">{sign}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tratamento */}
      <Card>
        <CardHeader>
          <CardTitle>Tratamento e Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="treatment_performed">Tratamento Realizado</Label>
            <Textarea
              id="treatment_performed"
              {...register('treatment_performed')}
              placeholder="Descreva o tratamento realizado..."
            />
            {errors.treatment_performed && (
              <p className="text-sm text-red-500">{errors.treatment_performed.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dressing_used">Curativo Utilizado</Label>
            <Input
              id="dressing_used"
              {...register('dressing_used')}
              placeholder="Ex: Hidrogel + gaze estéril"
            />
            {errors.dressing_used && (
              <p className="text-sm text-red-500">{errors.dressing_used.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              {...register('observations')}
              placeholder="Observações adicionais..."
            />
          </div>

          <div>
            <Label>Próxima Avaliação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !nextEvaluationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextEvaluationDate ? (
                    format(nextEvaluationDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={nextEvaluationDate}
                  onSelect={(date) => setValue('next_evaluation_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Upload de Fotos */}
      <Card>
        <CardHeader>
          <CardTitle>Fotos da Lesão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photos">Adicionar Fotos</Label>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="cursor-pointer"
              />
            </div>

            {photoPreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photoPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar Evolução'}
        </Button>
      </div>
    </form>
  );
}
