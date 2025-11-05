import { Home, Users, ClipboardCheck, BookOpen, Package, BarChart3, UsersRound, Building2, Settings, ChevronLeft, CreditCard, MessageCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Users, label: "Pacientes", path: "/pacientes" },
  { icon: ClipboardCheck, label: "Avaliações", path: "/avaliacoes" },
  { icon: BookOpen, label: "Protocolos", path: "/protocolos" },
  { icon: Package, label: "Materiais", path: "/materiais" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: UsersRound, label: "Equipe", path: "/equipe" },
  { icon: Building2, label: "Setores", path: "/setores" },
  
  { icon: Users, label: "Usuários", path: "/gerenciar-usuarios" },
  { icon: Briefcase, label: "Config. Negócio", path: "/configuracoes-negocio" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "relative h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[280px]"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
<span className="font-semibold text-sidebar-foreground">Central de Pele AI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                "hover:bg-sidebar-accent text-sidebar-foreground",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground font-medium",
                collapsed && "justify-center"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" strokeWidth={2} />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">EN</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Enfermeiro</p>
              <p className="text-xs text-muted-foreground truncate">enfermeiro@hospital.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
