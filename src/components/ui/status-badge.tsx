import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export type StatusType = 
  | "active" 
  | "inactive" 
  | "pending" 
  | "completed" 
  | "cancelled" 
  | "scheduled" 
  | "in_progress" 
  | "success" 
  | "error" 
  | "warning";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: string; className: string }> = {
  active: {
    label: "Ativo",
    variant: "default",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  inactive: {
    label: "Inativo",
    variant: "secondary",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  pending: {
    label: "Pendente",
    variant: "outline",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100",
  },
  completed: {
    label: "Concluído",
    variant: "default",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  scheduled: {
    label: "Agendado",
    variant: "outline",
    className: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100",
  },
  in_progress: {
    label: "Em Andamento",
    variant: "default",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  success: {
    label: "Sucesso",
    variant: "default",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  error: {
    label: "Erro",
    variant: "destructive",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  warning: {
    label: "Atenção",
    variant: "outline",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100",
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <Badge
      variant={config.variant as any}
      className={cn(config.className, className)}
    >
      {displayLabel}
    </Badge>
  );
}