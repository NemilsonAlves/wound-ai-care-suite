import React from 'react';
import { useClinicConfig } from '@/contexts/ClinicConfigContextBase';
import CurativosFields from './CurativosFields';
import DermatologiaFields from './DermatologiaFields';
import CirurgiasFields from './CirurgiasFields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Heart, Sparkles, Scissors, AlertCircle } from 'lucide-react';

interface SpecialtyData {
  curativos?: Record<string, unknown>;
  dermatologia?: Record<string, unknown>;
  cirurgias?: Record<string, unknown>;
}

interface SpecialtyFieldsManagerProps {
  data: SpecialtyData;
  onChange: (data: SpecialtyData) => void;
  readOnly?: boolean;
  selectedSpecialties?: string[];
}

const SpecialtyFieldsManager: React.FC<SpecialtyFieldsManagerProps> = ({
  data,
  onChange,
  readOnly = false,
  selectedSpecialties = []
}) => {
  const { config } = useClinicConfig();

  const handleSpecialtyChange = (specialty: string, specialtyData: Record<string, unknown>) => {
    onChange({
      ...data,
      [specialty]: specialtyData
    });
  };

  const getActiveSpecialties = () => {
    const activeSpecialties = [];
    
    if (config.specialties.curativos.enabled && 
        (selectedSpecialties.length === 0 || selectedSpecialties.includes('curativos'))) {
      activeSpecialties.push({
        key: 'curativos',
        name: 'Curativos Avançados',
        icon: Heart,
        color: 'bg-blue-500'
      });
    }
    
    if (config.specialties.dermatologia.enabled && 
        (selectedSpecialties.length === 0 || selectedSpecialties.includes('dermatologia'))) {
      activeSpecialties.push({
        key: 'dermatologia',
        name: 'Dermatologia Estética',
        icon: Sparkles,
        color: 'bg-purple-500'
      });
    }
    
    if (config.specialties.cirurgias.enabled && 
        (selectedSpecialties.length === 0 || selectedSpecialties.includes('cirurgias'))) {
      activeSpecialties.push({
        key: 'cirurgias',
        name: 'Pequenas Cirurgias',
        icon: Scissors,
        color: 'bg-green-500'
      });
    }
    
    return activeSpecialties;
  };

  const activeSpecialties = getActiveSpecialties();

  if (activeSpecialties.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma especialidade ativa</h3>
          <p className="text-muted-foreground text-center">
            Configure as especialidades nas configurações do negócio para visualizar os campos específicos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (activeSpecialties.length === 1) {
    const specialty = activeSpecialties[0];
    const IconComponent = specialty.icon;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5" />
            <span>{specialty.name}</span>
            <Badge variant="secondary" className={`${specialty.color} text-white`}>
              Ativo
            </Badge>
          </CardTitle>
          <CardDescription>
            Campos específicos para {specialty.name.toLowerCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {specialty.key === 'curativos' && (
            <CurativosFields
              data={data.curativos || {}}
              onChange={(curativosData) => handleSpecialtyChange('curativos', curativosData)}
              readOnly={readOnly}
            />
          )}
          {specialty.key === 'dermatologia' && (
            <DermatologiaFields
              data={data.dermatologia || {}}
              onChange={(dermatologiaData) => handleSpecialtyChange('dermatologia', dermatologiaData)}
              readOnly={readOnly}
            />
          )}
          {specialty.key === 'cirurgias' && (
            <CirurgiasFields
              data={data.cirurgias || {}}
              onChange={(cirurgiasData) => handleSpecialtyChange('cirurgias', cirurgiasData)}
              readOnly={readOnly}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Campos por Especialidade</span>
          <div className="flex space-x-2">
            {activeSpecialties.map((specialty) => (
              <Badge key={specialty.key} variant="secondary" className={`${specialty.color} text-white`}>
                {specialty.name}
              </Badge>
            ))}
          </div>
        </CardTitle>
        <CardDescription>
          Selecione a aba da especialidade para preencher os campos específicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeSpecialties[0]?.key} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {activeSpecialties.map((specialty) => {
              const IconComponent = specialty.icon;
              return (
                <TabsTrigger key={specialty.key} value={specialty.key} className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{specialty.name}</span>
                  <span className="sm:hidden">{specialty.key}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {activeSpecialties.map((specialty) => (
            <TabsContent key={specialty.key} value={specialty.key} className="mt-6">
              {specialty.key === 'curativos' && (
                <CurativosFields
                  data={data.curativos || {}}
                  onChange={(curativosData) => handleSpecialtyChange('curativos', curativosData)}
                  readOnly={readOnly}
                />
              )}
              {specialty.key === 'dermatologia' && (
                <DermatologiaFields
                  data={data.dermatologia || {}}
                  onChange={(dermatologiaData) => handleSpecialtyChange('dermatologia', dermatologiaData)}
                  readOnly={readOnly}
                />
              )}
              {specialty.key === 'cirurgias' && (
                <CirurgiasFields
                  data={data.cirurgias || {}}
                  onChange={(cirurgiasData) => handleSpecialtyChange('cirurgias', cirurgiasData)}
                  readOnly={readOnly}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SpecialtyFieldsManager;
