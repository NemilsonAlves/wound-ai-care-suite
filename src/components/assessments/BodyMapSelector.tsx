import { useState } from "react";

interface BodyMapSelectorProps {
  onLocationSelect: (locations: string[]) => void;
  selectedLocations?: string[];
}

const bodyLocations = [
  { id: "head", x: 150, y: 30, label: "Cabeça" },
  { id: "chest", x: 150, y: 100, label: "Tórax" },
  { id: "abdomen", x: 150, y: 150, label: "Abdômen" },
  { id: "sacral", x: 150, y: 200, label: "Sacral" },
  { id: "right-shoulder", x: 100, y: 80, label: "Ombro D" },
  { id: "left-shoulder", x: 200, y: 80, label: "Ombro E" },
  { id: "right-elbow", x: 70, y: 130, label: "Cotovelo D" },
  { id: "left-elbow", x: 230, y: 130, label: "Cotovelo E" },
  { id: "right-hand", x: 50, y: 180, label: "Mão D" },
  { id: "left-hand", x: 250, y: 180, label: "Mão E" },
  { id: "right-hip", x: 120, y: 210, label: "Quadril D" },
  { id: "left-hip", x: 180, y: 210, label: "Quadril E" },
  { id: "right-knee", x: 120, y: 280, label: "Joelho D" },
  { id: "left-knee", x: 180, y: 280, label: "Joelho E" },
  { id: "right-heel", x: 120, y: 350, label: "Calcanhar D" },
  { id: "left-heel", x: 180, y: 350, label: "Calcanhar E" },
];

export function BodyMapSelector({ onLocationSelect, selectedLocations = [] }: BodyMapSelectorProps) {
  const [view, setView] = useState<"front" | "back">("front");

  const handleLocationClick = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      onLocationSelect(selectedLocations.filter(id => id !== locationId));
    } else {
      onLocationSelect([...selectedLocations, locationId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setView("front")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === "front"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Frente
        </button>
        <button
          onClick={() => setView("back")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            view === "back"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Costas
        </button>
      </div>

      <div className="relative w-full max-w-[320px] mx-auto">
        <svg
          viewBox="0 0 300 400"
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" }}
        >
          {/* Body outline */}
          <g className={view === "front" ? "fill-muted stroke-border" : "fill-muted/60 stroke-border"} strokeWidth="2">
            {/* Head */}
            <circle cx="150" cy="30" r="20" />
            {/* Neck */}
            <rect x="145" y="50" width="10" height="15" />
            {/* Torso */}
            <rect x="110" y="65" width="80" height="100" rx="10" />
            {/* Arms */}
            <rect x="60" y="70" width="50" height="15" rx="7" />
            <rect x="190" y="70" width="50" height="15" rx="7" />
            <rect x="50" y="85" width="15" height="80" rx="7" />
            <rect x="235" y="85" width="15" height="80" rx="7" />
            {/* Legs */}
            <rect x="115" y="165" width="30" height="130" rx="10" />
            <rect x="155" y="165" width="30" height="130" rx="10" />
            {/* Feet */}
            <ellipse cx="130" cy="310" rx="15" ry="30" />
            <ellipse cx="170" cy="310" rx="15" ry="30" />
          </g>

          {/* Clickable zones */}
          {bodyLocations.map((location) => (
            <circle
              key={location.id}
              cx={location.x}
              cy={location.y}
              r="15"
              className={`cursor-pointer transition-all ${
                selectedLocations.includes(location.id)
                  ? "fill-status-critical/80 stroke-status-critical"
                  : "fill-primary/20 stroke-primary hover:fill-primary/40"
              }`}
              strokeWidth="2"
              onClick={() => handleLocationClick(location.id)}
            >
              <title>{location.label}</title>
            </circle>
          ))}
        </svg>
        
        {selectedLocations.length > 0 && (
          <div className="text-center mt-2 text-sm text-muted-foreground">
            <p className="mb-1">Localizações selecionadas ({selectedLocations.length}):</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {selectedLocations.map(id => {
                const location = bodyLocations.find(l => l.id === id);
                return (
                  <span key={id} className="px-2 py-1 bg-status-critical/10 text-status-critical rounded-md font-medium">
                    {location?.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
