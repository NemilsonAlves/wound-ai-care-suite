import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/pacientes" element={<MainLayout><Patients /></MainLayout>} />
          <Route path="/avaliacoes" element={<MainLayout><div className="text-center py-12"><h2 className="text-2xl font-semibold">Avaliações - Em Desenvolvimento</h2></div></MainLayout>} />
          <Route path="/protocolos" element={<MainLayout><div className="text-center py-12"><h2 className="text-2xl font-semibold">Protocolos - Em Desenvolvimento</h2></div></MainLayout>} />
          <Route path="/materiais" element={<MainLayout><div className="text-center py-12"><h2 className="text-2xl font-semibold">Materiais - Em Desenvolvimento</h2></div></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><div className="text-center py-12"><h2 className="text-2xl font-semibold">Analytics - Em Desenvolvimento</h2></div></MainLayout>} />
          <Route path="/equipe" element={<MainLayout><div className="text-center py-12"><h2 className="text-2xl font-semibold">Equipe - Em Desenvolvimento</h2></div></MainLayout>} />
          <Route path="/configuracoes" element={<MainLayout><div className="text-center py-12"><h2 className="text-2xl font-semibold">Configurações - Em Desenvolvimento</h2></div></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
