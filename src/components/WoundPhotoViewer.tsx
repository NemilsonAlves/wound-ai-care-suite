import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Camera, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Share2, 
  Calendar, 
  Ruler,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid,
  Maximize2,
  ArrowLeftRight
} from 'lucide-react';
import { formatDate } from '../lib/utils';

interface WoundPhoto {
  id: string;
  url: string;
  date: string;
  location: string;
  stage: string;
  size: string;
  notes: string;
  measurements?: {
    length: number;
    width: number;
    depth?: number;
    area: number;
  };
  metadata?: {
    camera: string;
    resolution: string;
    lighting: string;
  };
}

interface WoundPhotoViewerProps {
  photos: WoundPhoto[];
  initialPhotoIndex?: number;
  onClose: () => void;
}

const WoundPhotoViewer: React.FC<WoundPhotoViewerProps> = ({ 
  photos, 
  initialPhotoIndex = 0, 
  onClose 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialPhotoIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'comparison' | 'grid'>('single');
  const [comparisonIndex, setComparisonIndex] = useState<number | null>(null);

  const currentPhoto = photos[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setZoom(1);
    setRotation(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleComparison = () => {
    if (viewMode === 'comparison') {
      setViewMode('single');
      setComparisonIndex(null);
    } else {
      setViewMode('comparison');
      setComparisonIndex(currentIndex > 0 ? currentIndex - 1 : photos.length - 1);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'estágio i': return 'bg-green-100 text-green-800';
      case 'estágio ii': return 'bg-yellow-100 text-yellow-800';
      case 'estágio iii': return 'bg-orange-100 text-orange-800';
      case 'estágio iv': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSingleView = () => (
    <div className="flex-1 flex items-center justify-center bg-black relative">
      <img
        src={currentPhoto.url || '/api/placeholder/600/400'}
        alt={`Ferida ${currentPhoto.location} - ${formatDate(currentPhoto.date)}`}
        className="max-w-full max-h-full object-contain transition-transform duration-200"
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
        }}
      />
      
      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Photo Counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} de {photos.length}
      </div>
    </div>
  );

  const renderComparisonView = () => (
    <div className="flex-1 flex bg-black">
      <div className="flex-1 flex items-center justify-center border-r border-gray-600">
        <div className="text-center">
          <img
            src={photos[comparisonIndex!]?.url || '/api/placeholder/400/300'}
            alt={`Comparação - ${formatDate(photos[comparisonIndex!]?.date)}`}
            className="max-w-full max-h-full object-contain"
          />
          <div className="mt-2 text-white text-sm">
            {formatDate(photos[comparisonIndex!]?.date)}
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <img
            src={currentPhoto.url || '/api/placeholder/400/300'}
            alt={`Atual - ${formatDate(currentPhoto.date)}`}
            className="max-w-full max-h-full object-contain"
          />
          <div className="mt-2 text-white text-sm">
            {formatDate(currentPhoto.date)}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="flex-1 bg-gray-100 p-4 overflow-y-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
              index === currentIndex ? 'border-blue-500' : 'border-gray-300'
            }`}
            onClick={() => {
              setCurrentIndex(index);
              setViewMode('single');
            }}
          >
            <img
              src={photo.url || '/api/placeholder/200/150'}
              alt={`${photo.location} - ${formatDate(photo.date)}`}
              className="w-full h-32 object-cover"
            />
            <div className="p-2 bg-white">
              <p className="text-xs font-medium truncate">{photo.location}</p>
              <p className="text-xs text-gray-500">{formatDate(photo.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Camera className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-bold">Visualização de Fotos</h2>
              <p className="text-sm text-gray-600">
                {currentPhoto.location} - {formatDate(currentPhoto.date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Buttons */}
            <Button
              variant={viewMode === 'single' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('single')}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'default' : 'outline'}
              size="sm"
              onClick={toggleComparison}
              disabled={photos.length < 2}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>

            {/* Zoom Controls */}
            {viewMode === 'single' && (
              <>
                <Button variant="outline" size="sm" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Image Viewer */}
        <div className="flex-1 flex flex-col">
          {viewMode === 'single' && renderSingleView()}
          {viewMode === 'comparison' && renderComparisonView()}
          {viewMode === 'grid' && renderGridView()}
        </div>

        {/* Sidebar */}
        {viewMode !== 'grid' && (
          <div className="w-80 bg-white border-l overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Photo Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Informações da Foto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Localização</p>
                    <p className="text-sm">{currentPhoto.location}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Data</p>
                    <p className="text-sm">{formatDate(currentPhoto.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Estágio</p>
                    <Badge className={getStageColor(currentPhoto.stage)}>
                      {currentPhoto.stage}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Tamanho</p>
                    <p className="text-sm">{currentPhoto.size}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Measurements */}
              {currentPhoto.measurements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Ruler className="h-4 w-4" />
                      <span>Medições</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="font-medium text-gray-600">Comprimento</p>
                        <p>{currentPhoto.measurements.length} cm</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Largura</p>
                        <p>{currentPhoto.measurements.width} cm</p>
                      </div>
                      {currentPhoto.measurements.depth && (
                        <div>
                          <p className="font-medium text-gray-600">Profundidade</p>
                          <p>{currentPhoto.measurements.depth} cm</p>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-600">Área</p>
                        <p>{currentPhoto.measurements.area} cm²</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {currentPhoto.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{currentPhoto.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Tela Cheia
                </Button>
              </div>

              {/* Comparison Selection */}
              {viewMode === 'comparison' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Selecionar para Comparação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {photos.map((photo, index) => (
                        <div
                          key={photo.id}
                          className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                            index === comparisonIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setComparisonIndex(index)}
                        >
                          <img
                            src={photo.url || '/api/placeholder/40/30'}
                            alt=""
                            className="w-10 h-8 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{photo.location}</p>
                            <p className="text-xs text-gray-500">{formatDate(photo.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WoundPhotoViewer;