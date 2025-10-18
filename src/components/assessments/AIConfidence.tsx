interface AIConfidenceProps {
  confidence: number;
  label?: string;
}

export function AIConfidence({ confidence, label = "Confiança IA" }: AIConfidenceProps) {
  const getColor = () => {
    if (confidence >= 80) return "bg-status-stable";
    if (confidence >= 60) return "bg-status-warning";
    return "bg-status-critical";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${
          confidence >= 80 ? "text-status-stable" : 
          confidence >= 60 ? "text-status-warning" : 
          "text-status-critical"
        }`}>
          {confidence}%
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}
