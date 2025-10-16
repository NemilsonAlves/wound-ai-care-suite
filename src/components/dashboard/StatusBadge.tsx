import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

export type StatusType = "critical" | "warning" | "stable" | "improving";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  critical: {
    icon: AlertCircle,
    label: "Crítico",
    className: "bg-status-critical/10 text-status-critical border-status-critical/20",
  },
  warning: {
    icon: AlertTriangle,
    label: "Atenção",
    className: "bg-status-warning/10 text-status-warning border-status-warning/20",
  },
  stable: {
    icon: CheckCircle,
    label: "Estável",
    className: "bg-status-stable/10 text-status-stable border-status-stable/20",
  },
  improving: {
    icon: TrendingUp,
    label: "Melhorando",
    className: "bg-status-improving/10 text-status-improving border-status-improving/20",
  },
};

const sizeConfig = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

export function StatusBadge({ status, label, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        config.className,
        sizeConfig[size]
      )}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5")} />
      {label || config.label}
    </span>
  );
}
