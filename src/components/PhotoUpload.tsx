import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Upload, 
  Camera, 
  X, 
  Eye, 
  Download, 
  Trash2,
  ImageIcon,
  FileImage,
  ZoomIn,
  RotateCw,
  Maximize2
} from 'lucide-react';

interface PhotoData {
  id: string;
  file: File;
  url: string;
  date: string;
  location: string;
  stage: string;
  size: string;
  notes: string;
  measurements: {
    length: number;
    width: number;
    depth: number;
    area: number;
  };
}

interface PhotoUploadProps {
  onPhotosChange?: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  acceptedFormats?: string[];
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
}) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const createPhotoData = (file: File): PhotoData => {
    return {
      id: generateId(),
      file,
      url: URL.createObjectURL(file),
      date: new Date().toISOString(),
      location: '',
      stage: '',
      size: '',
      notes: '',
      measurements: {
        length: 0,
        width: 0,
        depth: 0,
        area: 0
      }
    };
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter(file => {
      if (!acceptedFormats.includes(file.type)) {
        alert(`Formato não suportado: ${file.type}`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`Arquivo muito grande: ${file.name}`);
        return false;
      }
      return true;
    });

    if (photos.length + validFiles.length > maxPhotos) {
      alert(`Máximo de ${maxPhotos} fotos permitidas`);
      return;
    }

    const newPhotos = validFiles.map(createPhotoData);
    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onPhotosChange?.(updatedPhotos);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => {
      if (photo.id === photoId) {
        URL.revokeObjectURL(photo.url);
        return false;
      }
      return true;
    });
    setPhotos(updatedPhotos);
    onPhotosChange?.(updatedPhotos);
  };

  const updatePhotoData = (photoId: string, updates: Partial<PhotoData>) => {
    const updatedPhotos = photos.map(photo =>
      photo.id === photoId ? { ...photo, ...updates } : photo
    );
    setPhotos(updatedPhotos);
    onPhotosChange?.(updatedPhotos);
  };

  const openViewer = (photo: PhotoData) => {
    setSelectedPhoto(photo);
    setIsViewerOpen(true);
  };

  const downloadPhoto = (photo: PhotoData) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `ferida_${photo.date}_${photo.id}.${photo.file.name.split('.').pop()}`;
    link.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Upload de Fotos das Feridas
          </CardTitle>
          <CardDescription>
            Adicione fotos das feridas para acompanhamento da evolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-4">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Arraste fotos aqui ou clique para selecionar
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Formatos suportados: JPEG, PNG, WebP (máx. 10MB cada)
                </p>
                <p className="text-xs text-muted-foreground">
                  {photos.length} de {maxPhotos} fotos adicionadas
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Selecionar Arquivos
                </Button>
                
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Usar Câmera
                </Button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fotos Adicionadas ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border rounded-lg overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={photo.url}
                      alt={`Ferida ${photo.id}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openViewer(photo)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadPhoto(photo)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removePhoto(photo.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {formatFileSize(photo.file.size)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(photo.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor={`location-${photo.id}`} className="text-xs">
                          Localização
                        </Label>
                        <Input
                          id={`location-${photo.id}`}
                          placeholder="Ex: Perna direita"
                          value={photo.location}
                          onChange={(e) => updatePhotoData(photo.id, { location: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`stage-${photo.id}`} className="text-xs">
                          Estágio
                        </Label>
                        <Input
                          id={`stage-${photo.id}`}
                          placeholder="Ex: Estágio II"
                          value={photo.stage}
                          onChange={(e) => updatePhotoData(photo.id, { stage: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`notes-${photo.id}`} className="text-xs">
                          Observações
                        </Label>
                        <Textarea
                          id={`notes-${photo.id}`}
                          placeholder="Observações sobre a ferida..."
                          value={photo.notes}
                          onChange={(e) => updatePhotoData(photo.id, { notes: e.target.value })}
                          className="text-xs"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Viewer Modal */}
      {isViewerOpen && selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                Visualizar Foto - {selectedPhoto.location || 'Sem localização'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <img
                  src={selectedPhoto.url}
                  alt="Ferida"
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Data:</strong> {new Date(selectedPhoto.date).toLocaleString()}
                </div>
                <div>
                  <strong>Tamanho:</strong> {formatFileSize(selectedPhoto.file.size)}
                </div>
                <div>
                  <strong>Localização:</strong> {selectedPhoto.location || 'Não informado'}
                </div>
                <div>
                  <strong>Estágio:</strong> {selectedPhoto.stage || 'Não informado'}
                </div>
                {selectedPhoto.notes && (
                  <div className="col-span-2">
                    <strong>Observações:</strong> {selectedPhoto.notes}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => downloadPhoto(selectedPhoto)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    removePhoto(selectedPhoto.id);
                    setIsViewerOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;