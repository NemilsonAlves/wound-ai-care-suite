import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  date?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  className?: string;
  columns?: number;
}

export function ImageGallery({ 
  images, 
  className, 
  columns = 3 
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const openImage = (index: number) => {
    setSelectedIndex(index);
    setZoom(1);
    setRotation(0);
  };

  const closeImage = () => {
    setSelectedIndex(null);
    setZoom(1);
    setRotation(0);
  };

  const nextImage = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const prevImage = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
      setZoom(1);
      setRotation(0);
    }
  };

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma imagem disponível
      </div>
    );
  }

  return (
    <>
      <div 
        className={cn(
          "grid gap-4",
          `grid-cols-${columns}`,
          className
        )}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => openImage(index)}
          >
            <img
              src={image.url}
              alt={image.alt || `Imagem ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs">
                {image.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <Dialog open={true} onOpenChange={closeImage}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
            <div className="relative w-full h-full bg-black">
              {/* Controls */}
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={zoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={zoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={rotate}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={closeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
                    onClick={prevImage}
                    disabled={selectedIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
                    onClick={nextImage}
                    disabled={selectedIndex === images.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Image */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={images[selectedIndex].url}
                  alt={images[selectedIndex].alt || `Imagem ${selectedIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  }}
                />
              </div>

              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    {images[selectedIndex].caption && (
                      <p className="font-medium">{images[selectedIndex].caption}</p>
                    )}
                    {images[selectedIndex].date && (
                      <p className="text-sm text-gray-300">{images[selectedIndex].date}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-300">
                    {selectedIndex + 1} de {images.length}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}