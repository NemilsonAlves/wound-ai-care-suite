import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusType } from "./StatusBadge";

interface Alert {
  id: string;
  patientName: string;
  room: string;
  message: string;
  status: StatusType;
  time: string;
}

interface AlertCardProps {
  alerts: Alert[];
}

export function AlertCard({ alerts }: AlertCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-lg bg-status-critical/10 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-status-critical" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Alertas Críticos</h3>
          <p className="text-sm text-muted-foreground">{alerts.length} pacientes requerem atenção</p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 rounded-lg bg-status-critical/5 border border-status-critical/20 hover:bg-status-critical/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-foreground">{alert.patientName}</p>
                <p className="text-sm text-muted-foreground">Leito {alert.room}</p>
              </div>
              <StatusBadge status={alert.status} size="sm" />
            </div>
            <p className="text-sm text-foreground mb-2">{alert.message}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{alert.time}</span>
              <Button size="sm" className="h-8">
                Ver Detalhes
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
