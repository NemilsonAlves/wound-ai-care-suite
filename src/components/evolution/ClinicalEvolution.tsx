import React, { useState, useRef } from 'react';
import { Camera, Upload, Calendar, User, FileText, Trash2, Eye, Download, ArrowLeftRight } from 'lucide-react';

interface Photo {
  id: string;
  file: File;
  url: string;
  type: 'before' | 'after';
  timestamp: Date;
  description?: string;
}

interface Evolution {
  id: string;
  patientId: string;
  date: Date;
  specialty: string;
  description: string;
  photos: Photo[];
  clinicalData: {
    // Campos específicos por especialidade
    curativos?: {
      area: string;
      profundidade: string;
      necrose: boolean;
      dor: number;
      sinaisInfeccao: boolean;
      observacoes: string;
    };
    dermatologia?: {
      procedimento: string;
      parametros: string;
      fototipo: string;
      manchas: string;
      acne: string;
      observacoes: string;
    };
    cirurgia?: {
      tipo: string;
      anestesia: string;
      insumos: string;
      suturas: string;
      posOperatorio: string;
      observacoes: string;
    };
  };
  createdBy: string;
}

interface ClinicalEvolutionProps {
  patientId: string;
  patientName: string;
  specialty: string;
}

const ClinicalEvolution: React.FC<ClinicalEvolutionProps> = ({
  patientId,
  patientName,
  specialty
}) => {
  const [evolutions, setEvolutions] = useState<Evolution[]>([]);
  const [currentEvolution, setCurrentEvolution] = useState<Partial<Evolution>>({
    patientId,
    specialty,
    date: new Date(),
    description: '',
    photos: [],
    clinicalData: {},
    createdBy: 'Dr. João Silva' // Mock user
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const photo: Photo = {
          id: Date.now().toString() + Math.random(),
          file,
          url: URL.createObjectURL(file),
          type,
          timestamp: new Date(),
          description: ''
        };

        setCurrentEvolution(prev => ({
          ...prev,
          photos: [...(prev.photos || []), photo]
        }));
      }
    });
  };

  const removePhoto = (photoId: string) => {
    setCurrentEvolution(prev => ({
      ...prev,
      photos: prev.photos?.filter(p => p.id !== photoId) || []
    }));
  };

  const saveEvolution = () => {
    if (!currentEvolution.description) {
      alert('Por favor, adicione uma descrição para a evolução.');
      return;
    }

    const evolution: Evolution = {
      id: Date.now().toString(),
      patientId,
      date: currentEvolution.date || new Date(),
      specialty,
      description: currentEvolution.description,
      photos: currentEvolution.photos || [],
      clinicalData: currentEvolution.clinicalData || {},
      createdBy: currentEvolution.createdBy || 'Dr. João Silva'
    };

    setEvolutions(prev => [evolution, ...prev]);
    setCurrentEvolution({
      patientId,
      specialty,
      date: new Date(),
      description: '',
      photos: [],
      clinicalData: {},
      createdBy: 'Dr. João Silva'
    });
    setShowForm(false);
  };

  const renderSpecialtyFields = () => {
    switch (specialty) {
      case 'Curativos':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área da Lesão
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.curativos?.area || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    curativos: {
                      ...prev.clinicalData?.curativos,
                      area: e.target.value
                    }
                  }
                }))}
                placeholder="Ex: 5cm x 3cm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profundidade
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.curativos?.profundidade || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    curativos: {
                      ...prev.clinicalData?.curativos,
                      profundidade: e.target.value
                    }
                  }
                }))}
              >
                <option value="">Selecione...</option>
                <option value="superficial">Superficial</option>
                <option value="parcial">Espessura Parcial</option>
                <option value="total">Espessura Total</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dor (0-10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.curativos?.dor || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    curativos: {
                      ...prev.clinicalData?.curativos,
                      dor: parseInt(e.target.value)
                    }
                  }
                }))}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={currentEvolution.clinicalData?.curativos?.necrose || false}
                  onChange={(e) => setCurrentEvolution(prev => ({
                    ...prev,
                    clinicalData: {
                      ...prev.clinicalData,
                      curativos: {
                        ...prev.clinicalData?.curativos,
                        necrose: e.target.checked
                      }
                    }
                  }))}
                />
                Presença de Necrose
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={currentEvolution.clinicalData?.curativos?.sinaisInfeccao || false}
                  onChange={(e) => setCurrentEvolution(prev => ({
                    ...prev,
                    clinicalData: {
                      ...prev.clinicalData,
                      curativos: {
                        ...prev.clinicalData?.curativos,
                        sinaisInfeccao: e.target.checked
                      }
                    }
                  }))}
                />
                Sinais de Infecção
              </label>
            </div>
          </div>
        );

      case 'Dermatologia':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Procedimento
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.dermatologia?.procedimento || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    dermatologia: {
                      ...prev.clinicalData?.dermatologia,
                      procedimento: e.target.value
                    }
                  }
                }))}
                placeholder="Ex: Laser CO2, Peeling químico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parâmetros
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.dermatologia?.parametros || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    dermatologia: {
                      ...prev.clinicalData?.dermatologia,
                      parametros: e.target.value
                    }
                  }
                }))}
                placeholder="Ex: 30W, 2 passes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fototipo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.dermatologia?.fototipo || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    dermatologia: {
                      ...prev.clinicalData?.dermatologia,
                      fototipo: e.target.value
                    }
                  }
                }))}
              >
                <option value="">Selecione...</option>
                <option value="I">I - Muito clara</option>
                <option value="II">II - Clara</option>
                <option value="III">III - Morena clara</option>
                <option value="IV">IV - Morena</option>
                <option value="V">V - Morena escura</option>
                <option value="VI">VI - Negra</option>
              </select>
            </div>
          </div>
        );

      case 'Cirurgia Plástica':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cirurgia
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.cirurgia?.tipo || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    cirurgia: {
                      ...prev.clinicalData?.cirurgia,
                      tipo: e.target.value
                    }
                  }
                }))}
                placeholder="Ex: Rinoplastia, Abdominoplastia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anestesia
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.cirurgia?.anestesia || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    cirurgia: {
                      ...prev.clinicalData?.cirurgia,
                      anestesia: e.target.value
                    }
                  }
                }))}
              >
                <option value="">Selecione...</option>
                <option value="local">Local</option>
                <option value="sedacao">Sedação</option>
                <option value="geral">Geral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suturas
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.clinicalData?.cirurgia?.suturas || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  clinicalData: {
                    ...prev.clinicalData,
                    cirurgia: {
                      ...prev.clinicalData?.cirurgia,
                      suturas: e.target.value
                    }
                  }
                }))}
                placeholder="Ex: Nylon 5-0, Vicryl 4-0"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const PhotoComparison = () => {
    const beforePhotos = selectedPhotos.filter(p => p.type === 'before');
    const afterPhotos = selectedPhotos.filter(p => p.type === 'after');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-6xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Comparação de Fotos</h3>
            <button
              onClick={() => setShowComparison(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-center">Antes</h4>
              <div className="grid gap-3">
                {beforePhotos.map(photo => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt="Antes"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {photo.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3 text-center">Depois</h4>
              <div className="grid gap-3">
                {afterPhotos.map(photo => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt="Depois"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {photo.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evolução Clínica</h2>
          <p className="text-gray-600">Paciente: {patientName} | Especialidade: {specialty}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Nova Evolução
        </button>
      </div>

      {/* Formulário de Nova Evolução */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Nova Evolução Clínica</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data da Evolução
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={currentEvolution.date?.toISOString().split('T')[0] || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  date: new Date(e.target.value)
                }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Evolução
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                value={currentEvolution.description || ''}
                onChange={(e) => setCurrentEvolution(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Descreva a evolução do paciente..."
              />
            </div>

            {/* Campos específicos por especialidade */}
            {renderSpecialtyFields()}

            {/* Upload de Fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos da Evolução
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Fotos "Antes"</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'before')}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors"
                  >
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Adicionar fotos "Antes"</span>
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Fotos "Depois"</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'after')}
                    className="hidden"
                  />
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = 'image/*';
                      input.onchange = (e) => handlePhotoUpload(e as any, 'after');
                      input.click();
                    }}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors"
                  >
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <span className="text-sm text-gray-600">Adicionar fotos "Depois"</span>
                  </button>
                </div>
              </div>

              {/* Preview das fotos */}
              {currentEvolution.photos && currentEvolution.photos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fotos Adicionadas:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {currentEvolution.photos.map(photo => (
                      <div key={photo.id} className="relative">
                        <img
                          src={photo.url}
                          alt={photo.type}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <div className="absolute top-1 right-1">
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-75 text-white px-1 py-0.5 rounded text-xs">
                          {photo.type === 'before' ? 'Antes' : 'Depois'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveEvolution}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar Evolução
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Evoluções */}
      <div className="space-y-4">
        {evolutions.map(evolution => (
          <div key={evolution.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {evolution.date.toLocaleDateString('pt-BR')}
                  </span>
                  <User className="w-4 h-4 text-gray-500 ml-4" />
                  <span className="text-sm text-gray-600">{evolution.createdBy}</span>
                </div>
                <p className="text-gray-800">{evolution.description}</p>
              </div>
              
              {evolution.photos.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedPhotos(evolution.photos);
                    setShowComparison(true);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Comparar Fotos
                </button>
              )}
            </div>

            {evolution.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
                {evolution.photos.slice(0, 6).map(photo => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={photo.type}
                      className="w-full h-16 object-cover rounded"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-b">
                      {photo.type === 'before' ? 'Antes' : 'Depois'}
                    </div>
                  </div>
                ))}
                {evolution.photos.length > 6 && (
                  <div className="flex items-center justify-center bg-gray-100 rounded h-16 text-sm text-gray-600">
                    +{evolution.photos.length - 6} fotos
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {evolutions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma evolução clínica registrada ainda.</p>
            <p className="text-sm">Clique em "Nova Evolução" para começar.</p>
          </div>
        )}
      </div>

      {/* Modal de Comparação */}
      {showComparison && <PhotoComparison />}
    </div>
  );
};

export default ClinicalEvolution;