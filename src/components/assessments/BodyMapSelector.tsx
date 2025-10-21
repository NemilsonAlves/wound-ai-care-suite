import { useState } from "react";

interface BodyMapSelectorProps {
  onLocationSelect: (locations: string[]) => void;
  selectedLocations?: string[];
}

const frontBodyLocations = [
  { id: "head", x: 200, y: 60, label: "Cabeça" },
  { id: "face", x: 200, y: 75, label: "Face" },
  { id: "neck", x: 200, y: 95, label: "Pescoço" },
  { id: "chest", x: 200, y: 140, label: "Tórax" },
  { id: "abdomen", x: 200, y: 190, label: "Abdômen" },
  { id: "pelvis", x: 200, y: 230, label: "Pelve" },
  { id: "right-shoulder", x: 150, y: 120, label: "Ombro D" },
  { id: "left-shoulder", x: 250, y: 120, label: "Ombro E" },
  { id: "right-arm-upper", x: 120, y: 160, label: "Braço D Superior" },
  { id: "left-arm-upper", x: 280, y: 160, label: "Braço E Superior" },
  { id: "right-elbow", x: 100, y: 190, label: "Cotovelo D" },
  { id: "left-elbow", x: 300, y: 190, label: "Cotovelo E" },
  { id: "right-forearm", x: 85, y: 220, label: "Antebraço D" },
  { id: "left-forearm", x: 315, y: 220, label: "Antebraço E" },
  { id: "right-hand", x: 70, y: 250, label: "Mão D" },
  { id: "left-hand", x: 330, y: 250, label: "Mão E" },
  { id: "right-thigh", x: 175, y: 280, label: "Coxa D" },
  { id: "left-thigh", x: 225, y: 280, label: "Coxa E" },
  { id: "right-knee", x: 175, y: 330, label: "Joelho D" },
  { id: "left-knee", x: 225, y: 330, label: "Joelho E" },
  { id: "right-shin", x: 175, y: 370, label: "Perna D" },
  { id: "left-shin", x: 225, y: 370, label: "Perna E" },
  { id: "right-foot", x: 175, y: 410, label: "Pé D" },
  { id: "left-foot", x: 225, y: 410, label: "Pé E" },
];

const backBodyLocations = [
  { id: "back-head", x: 200, y: 60, label: "Cabeça (Posterior)" },
  { id: "back-neck", x: 200, y: 95, label: "Nuca" },
  { id: "upper-back", x: 200, y: 140, label: "Dorso Superior" },
  { id: "lower-back", x: 200, y: 190, label: "Dorso Inferior" },
  { id: "sacral", x: 200, y: 230, label: "Sacral" },
  { id: "coccyx", x: 200, y: 250, label: "Cóccix" },
  { id: "right-shoulder-back", x: 150, y: 120, label: "Ombro D (Posterior)" },
  { id: "left-shoulder-back", x: 250, y: 120, label: "Ombro E (Posterior)" },
  { id: "right-scapula", x: 160, y: 150, label: "Escápula D" },
  { id: "left-scapula", x: 240, y: 150, label: "Escápula E" },
  { id: "right-arm-back", x: 120, y: 160, label: "Braço D (Posterior)" },
  { id: "left-arm-back", x: 280, y: 160, label: "Braço E (Posterior)" },
  { id: "right-elbow-back", x: 100, y: 190, label: "Cotovelo D (Posterior)" },
  { id: "left-elbow-back", x: 300, y: 190, label: "Cotovelo E (Posterior)" },
  { id: "right-forearm-back", x: 85, y: 220, label: "Antebraço D (Posterior)" },
  { id: "left-forearm-back", x: 315, y: 220, label: "Antebraço E (Posterior)" },
  { id: "right-buttock", x: 175, y: 260, label: "Glúteo D" },
  { id: "left-buttock", x: 225, y: 260, label: "Glúteo E" },
  { id: "right-thigh-back", x: 175, y: 300, label: "Coxa D (Posterior)" },
  { id: "left-thigh-back", x: 225, y: 300, label: "Coxa E (Posterior)" },
  { id: "right-knee-back", x: 175, y: 330, label: "Joelho D (Posterior)" },
  { id: "left-knee-back", x: 225, y: 330, label: "Joelho E (Posterior)" },
  { id: "right-calf", x: 175, y: 370, label: "Panturrilha D" },
  { id: "left-calf", x: 225, y: 370, label: "Panturrilha E" },
  { id: "right-heel", x: 175, y: 410, label: "Calcanhar D" },
  { id: "left-heel", x: 225, y: 410, label: "Calcanhar E" },
];

export function BodyMapSelector({ onLocationSelect, selectedLocations = [] }: BodyMapSelectorProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const currentLocations = view === "front" ? frontBodyLocations : backBodyLocations;

  const handleLocationClick = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      onLocationSelect(selectedLocations.filter(id => id !== locationId));
    } else {
      onLocationSelect([...selectedLocations, locationId]);
    }
  };

  const RealisticBodyFront = () => (
    <g className="fill-blue-50 stroke-blue-200" strokeWidth="2">
      {/* Head */}
      <ellipse cx="200" cy="60" rx="25" ry="30" />
      {/* Neck */}
      <rect x="190" y="85" width="20" height="20" rx="10" />
      {/* Torso - more anatomical shape */}
      <path d="M 160 105 Q 140 120 140 160 L 140 210 Q 140 240 160 240 L 240 240 Q 260 240 260 210 L 260 160 Q 260 120 240 105 Z" />
      {/* Arms - more realistic proportions */}
      <ellipse cx="130" cy="140" rx="15" ry="45" transform="rotate(-15 130 140)" />
      <ellipse cx="270" cy="140" rx="15" ry="45" transform="rotate(15 270 140)" />
      <ellipse cx="105" cy="200" rx="12" ry="35" transform="rotate(-10 105 200)" />
      <ellipse cx="295" cy="200" rx="12" ry="35" transform="rotate(10 295 200)" />
      {/* Hands */}
      <ellipse cx="85" cy="245" rx="8" ry="15" />
      <ellipse cx="315" cy="245" rx="8" ry="15" />
      {/* Pelvis */}
      <ellipse cx="200" cy="250" rx="40" ry="20" />
      {/* Legs - thighs */}
      <ellipse cx="175" cy="300" rx="18" ry="50" />
      <ellipse cx="225" cy="300" rx="18" ry="50" />
      {/* Legs - shins */}
      <ellipse cx="175" cy="370" rx="15" ry="40" />
      <ellipse cx="225" cy="370" rx="15" ry="40" />
      {/* Feet */}
      <ellipse cx="175" cy="415" rx="12" ry="20" />
      <ellipse cx="225" cy="415" rx="12" ry="20" />
    </g>
  );

  const RealisticBodyBack = () => (
    <g className="fill-red-50 stroke-red-200" strokeWidth="2">
      {/* Head */}
      <ellipse cx="200" cy="60" rx="25" ry="30" />
      {/* Neck */}
      <rect x="190" y="85" width="20" height="20" rx="10" />
      {/* Back torso */}
      <path d="M 160 105 Q 140 120 140 160 L 140 210 Q 140 240 160 240 L 240 240 Q 260 240 260 210 L 260 160 Q 260 120 240 105 Z" />
      {/* Shoulder blades */}
      <ellipse cx="170" cy="140" rx="12" ry="25" />
      <ellipse cx="230" cy="140" rx="12" ry="25" />
      {/* Arms */}
      <ellipse cx="130" cy="140" rx="15" ry="45" transform="rotate(-15 130 140)" />
      <ellipse cx="270" cy="140" rx="15" ry="45" transform="rotate(15 270 140)" />
      <ellipse cx="105" cy="200" rx="12" ry="35" transform="rotate(-10 105 200)" />
      <ellipse cx="295" cy="200" rx="12" ry="35" transform="rotate(10 295 200)" />
      {/* Buttocks */}
      <ellipse cx="175" cy="260" rx="20" ry="25" />
      <ellipse cx="225" cy="260" rx="20" ry="25" />
      {/* Legs - thighs */}
      <ellipse cx="175" cy="310" rx="18" ry="50" />
      <ellipse cx="225" cy="310" rx="18" ry="50" />
      {/* Legs - calves */}
      <ellipse cx="175" cy="370" rx="15" ry="40" />
      <ellipse cx="225" cy="370" rx="15" ry="40" />
      {/* Heels */}
      <ellipse cx="175" cy="415" rx="12" ry="20" />
      <ellipse cx="225" cy="415" rx="12" ry="20" />
    </g>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => setView("front")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            view === "front"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          Vista Anterior
        </button>
        <button
          onClick={() => setView("back")}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            view === "back"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          Vista Posterior
        </button>
      </div>

      <div className="relative w-full max-w-[400px] mx-auto bg-white rounded-lg shadow-lg p-6">
        <svg
          viewBox="0 0 400 450"
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}
        >
          {/* Render the appropriate body view */}
          {view === "front" ? <RealisticBodyFront /> : <RealisticBodyBack />}

          {/* Clickable zones */}
          {currentLocations.map((location) => {
            const isSelected = selectedLocations.includes(location.id);
            const baseColor = view === "front" ? "blue" : "red";
            
            return (
              <g key={location.id}>
                <circle
                  cx={location.x}
                  cy={location.y}
                  r="12"
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? `fill-${baseColor}-600/90 stroke-${baseColor}-700 stroke-2`
                      : `fill-${baseColor}-500/60 stroke-${baseColor}-600 stroke-1 hover:fill-${baseColor}-500/80 hover:stroke-2`
                  }`}
                  onClick={() => handleLocationClick(location.id)}
                />
                {/* Pulse animation for selected items */}
                {isSelected && (
                  <circle
                    cx={location.x}
                    cy={location.y}
                    r="12"
                    className={`fill-none stroke-${baseColor}-400 stroke-1 animate-ping`}
                  />
                )}
              </g>
            );
          })}
        </svg>
        
        {selectedLocations.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Localizações selecionadas ({selectedLocations.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedLocations.map(id => {
                const location = [...frontBodyLocations, ...backBodyLocations].find(l => l.id === id);
                const bgColor = view === "front" ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-red-100 text-red-800 border-red-200";
                return (
                  <span 
                    key={id} 
                    className={`px-3 py-1 ${bgColor} border rounded-full text-xs font-medium`}
                  >
                    {location?.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Clique nas áreas do corpo para selecionar as localizações das lesões</p>
      </div>
    </div>
  );
}
