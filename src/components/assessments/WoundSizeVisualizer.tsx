interface WoundSizeVisualizerProps {
  length: number; // cm
  width: number; // cm
  depth?: number; // cm
}

export function WoundSizeVisualizer({ length, width, depth }: WoundSizeVisualizerProps) {
  const area = (length * width).toFixed(2);
  const scale = 20; // pixels per cm for visualization

  return (
    <div className="space-y-4 p-6 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground">Visualização da Lesão (1:1)</h4>
        <span className="text-sm text-muted-foreground">Escala real</span>
      </div>

      <div className="flex items-center justify-center min-h-[200px] bg-muted/30 rounded-lg p-8">
        <div className="relative">
          {/* Wound visualization */}
          <div
            className="bg-status-critical/60 border-2 border-status-critical rounded-full"
            style={{
              width: `${width * scale}px`,
              height: `${length * scale}px`,
            }}
          />
          
          {/* Measurements */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-foreground">
            {width} cm
          </div>
          <div className="absolute top-1/2 -left-12 -translate-y-1/2 text-xs font-medium text-foreground -rotate-90">
            {length} cm
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Comprimento</p>
          <p className="font-semibold text-foreground">{length} cm</p>
        </div>
        <div>
          <p className="text-muted-foreground">Largura</p>
          <p className="font-semibold text-foreground">{width} cm</p>
        </div>
        <div>
          <p className="text-muted-foreground">Área</p>
          <p className="font-semibold text-foreground">{area} cm²</p>
        </div>
        {depth && (
          <div>
            <p className="text-muted-foreground">Profundidade</p>
            <p className="font-semibold text-foreground">{depth} cm</p>
          </div>
        )}
      </div>
    </div>
  );
}
