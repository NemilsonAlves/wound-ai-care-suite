import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import NewPatient from "./pages/NewPatient";
import Assessments from "./pages/Assessments";
import NewAssessment from "./pages/NewAssessment";
import Protocols from "./pages/Protocols";
import NewProtocol from "./pages/NewProtocol";
import Materials from "./pages/Materials";
import NewMaterialRequest from "./pages/NewMaterialRequest";
import Analytics from "./pages/Analytics";
import Team from "./pages/Team";
import NewTeamMember from "./pages/NewTeamMember";
import Settings from "./pages/Settings";
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
          <Route path="/pacientes/novo" element={<MainLayout><NewPatient /></MainLayout>} />
          <Route path="/pacientes/:id" element={<MainLayout><PatientProfile /></MainLayout>} />
          <Route path="/avaliacoes" element={<MainLayout><Assessments /></MainLayout>} />
          <Route path="/avaliacoes/nova" element={<MainLayout><NewAssessment /></MainLayout>} />
          <Route path="/protocolos" element={<MainLayout><Protocols /></MainLayout>} />
          <Route path="/protocolos/novo" element={<MainLayout><NewProtocol /></MainLayout>} />
          <Route path="/materiais" element={<MainLayout><Materials /></MainLayout>} />
          <Route path="/materiais/requisicao" element={<MainLayout><NewMaterialRequest /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
          <Route path="/equipe" element={<MainLayout><Team /></MainLayout>} />
          <Route path="/equipe/novo" element={<MainLayout><NewTeamMember /></MainLayout>} />
          <Route path="/configuracoes" element={<MainLayout><Settings /></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
