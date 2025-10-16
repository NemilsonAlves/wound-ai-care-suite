import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  iconBgClass?: string;
}

export function KPICard({ icon: Icon, label, value, change, changeLabel, iconBgClass = "bg-primary/10" }: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
          
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {isPositive && <TrendingUp className="w-4 h-4 text-status-improving" />}
              {isNegative && <TrendingDown className="w-4 h-4 text-status-critical" />}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-status-improving",
                  isNegative && "text-status-critical",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}
              >
                {change > 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && <span className="text-sm text-muted-foreground ml-1">{changeLabel}</span>}
            </div>
          )}
        </div>

        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBgClass)}>
          <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}
