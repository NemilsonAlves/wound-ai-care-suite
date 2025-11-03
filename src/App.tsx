import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./contexts/AuthContext";
import { ClinicConfigProvider } from "./contexts/ClinicConfigContext";
import { SuperAdminGuard } from "./components/common/SuperAdminGuard";
import { Loader2 } from "lucide-react";
import { MainLayout } from "./components/layout/MainLayout";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { lazy, Suspense } from "react";
import PatientAuthProvider from './contexts/PatientAuthContext';
import PatientRoute from './components/common/PatientRoute';

// Lazy loading das páginas principais
const Login = lazy(() => import("./pages/Login"));
const DemoLogin = lazy(() => import("./pages/DemoLogin"));
const PatientPortal = lazy(() => import("./pages/PatientPortal"));
const Payment = lazy(() => import("./pages/Payment"));
const WhatsAppIntegration = lazy(() => import("./pages/WhatsAppIntegration"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Patients = lazy(() => import("./pages/Patients"));
const PatientsSimple = lazy(() => import("./pages/PatientsSimple"));
const PatientRegister = lazy(() => import("./pages/PatientRegister"));
const PatientProfile = lazy(() => import("./pages/PatientProfile"));
const Appointments = lazy(() => import("./pages/Appointments"));
const Evolutions = lazy(() => import("./pages/Evolutions"));
const AIAnalysis = lazy(() => import("./pages/AIAnalysis"));
const NewPatient = lazy(() => import("./pages/NewPatient"));
const EditPatient = lazy(() => import("./pages/EditPatient"));
const Assessments = lazy(() => import("./pages/Assessments"));
const NewAssessment = lazy(() => import("./pages/NewAssessment"));
const Protocols = lazy(() => import("./pages/Protocols"));
const BradenProtocol = lazy(() => import("./pages/BradenProtocol"));
const PushProtocol = lazy(() => import("./pages/PushProtocol"));
const TimeProtocol = lazy(() => import("./pages/TimeProtocol"));
const WagnerProtocol = lazy(() => import("./pages/WagnerProtocol"));
const NewProtocol = lazy(() => import("./pages/NewProtocol"));
const Materials = lazy(() => import("./pages/Materials"));
const Inventory = lazy(() => import('@/pages/Inventory'));
const NewMaterialRequest = lazy(() => import("./pages/NewMaterialRequest"));
const MaterialCategories = lazy(() => import("./pages/MaterialCategories"));
const MaterialSuppliers = lazy(() => import("./pages/MaterialSuppliers"));
const MaterialHistory = lazy(() => import("./pages/MaterialHistory"));
const TeamSchedule = lazy(() => import("./pages/TeamSchedule"));
const TeamPerformance = lazy(() => import("./pages/TeamPerformance"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Team = lazy(() => import("./pages/Team"));
const NewTeamMember = lazy(() => import("./pages/NewTeamMember"));
const Settings = lazy(() => import("./pages/Settings"));
const PatientLogin = lazy(() => import('./pages/PatientLogin'));
const BusinessSettings = lazy(() => import('./pages/BusinessSettings'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const Sectors = lazy(() => import("./pages/Sectors"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Componentes que não precisam de lazy loading (são pequenos ou críticos)
import ClinicalEvolution from "./components/evolution/ClinicalEvolution";
import PatientTimeline from "./components/timeline/PatientTimeline";
import WhatsAppIntegrationComponent from "./components/whatsapp/WhatsAppIntegration";

// Componente de loading para Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 30000,
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: 'online'
    },
    mutations: {
      retry: 2,
      networkMode: 'online'
    }
  }
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClinicConfigProvider>
          <PatientAuthProvider>
            <TooltipProvider>
              <Toaster />
              {import.meta.env.DEV && <Sonner />}
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
              <Suspense fallback={<PageLoader />}>
                <Routes>
              {/* Public routes */}
              <Route path="/demo" element={<DemoLogin />} />
              <Route path="/portal/login" element={<PatientLogin />} />
              <Route path="/portal" element={
                <PatientRoute>
                  <PatientPortal />
                </PatientRoute>
              } />
              <Route path="/payment" element={<Payment />} />
              <Route path="/whatsapp" element={<WhatsAppIntegration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            
            {/* Protected professional routes */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <Navigate to="/demo" replace />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/pacientes" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><Patients /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/pacientes/novo" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><NewPatient /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/patients/register" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <Navigate to="/pacientes/novo" replace />
              </ProtectedRoute>
            } />
            <Route path="/pacientes/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><PatientProfile /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/pacientes/:id/editar" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><EditPatient /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout>
                  <Appointments />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/evolutions" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout>
                  <Evolutions />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/clinical-evolution/:patientId" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout>
                  <ClinicalEvolution patientId="1" patientName="Maria Santos" specialty="Curativos" />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/patient-timeline/:patientId" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout>
                  <PatientTimeline patientId="1" patientName="Maria Santos" />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/whatsapp-business" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout>
                  <WhatsAppIntegrationComponent />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-analysis" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout>
                  <AIAnalysis />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/avaliacoes" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><Assessments /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/avaliacoes/nova" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><NewAssessment /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/protocolos" element={
              <ProtectedRoute allowedRoles={['admin', 'professional']}>
                <MainLayout><Protocols /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/protocolos/braden" element={
            <ProtectedRoute allowedRoles={['admin', 'professional']}>
              <MainLayout><BradenProtocol /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/protocolos/push" element={<MainLayout><PushProtocol /></MainLayout>} />
          <Route path="/protocolos/time" element={<MainLayout><TimeProtocol /></MainLayout>} />
          <Route path="/protocolos/wagner" element={<MainLayout><WagnerProtocol /></MainLayout>} />
          <Route path="/protocolos/novo" element={<MainLayout><NewProtocol /></MainLayout>} />
          <Route path="/materiais" element={<MainLayout><Materials /></MainLayout>} />
          <Route path="/materiais/requisicao" element={<MainLayout><NewMaterialRequest /></MainLayout>} />
          <Route path="/materiais/categorias" element={<MainLayout><MaterialCategories /></MainLayout>} />
          <Route path="/materiais/fornecedores" element={<MainLayout><MaterialSuppliers /></MainLayout>} />
          <Route path="/materiais/historico" element={<MainLayout><MaterialHistory /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><Analytics /></MainLayout>} />
          <Route path="/equipe" element={<MainLayout><Team /></MainLayout>} />
          <Route path="/equipe/novo" element={<MainLayout><NewTeamMember /></MainLayout>} />
          <Route path="/equipe/escalas" element={<MainLayout><TeamSchedule /></MainLayout>} />
          <Route path="/equipe/performance" element={<MainLayout><TeamPerformance /></MainLayout>} />
          <Route path="/setores" element={<MainLayout><Sectors /></MainLayout>} />
          <Route path="/configuracoes" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="/configuracoes-sistema" element={<MainLayout><SystemSettings /></MainLayout>} />
          <Route path="/configuracoes-negocio" element={
            <SuperAdminGuard module="business.config">
              <MainLayout><BusinessSettings /></MainLayout>
            </SuperAdminGuard>
          } />
          <Route path="/gerenciar-usuarios" element={
            <SuperAdminGuard module="users.management">
              <MainLayout><UserManagement /></MainLayout>
            </SuperAdminGuard>
          } />
          <Route path="/meu-perfil" element={<MainLayout><MyProfile /></MainLayout>} />
          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['admin', 'professional']}>
              <MainLayout><Inventory /></MainLayout>
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
                 </Routes>
               </Suspense>
             </BrowserRouter>
             {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
           </TooltipProvider>
         </PatientAuthProvider>
       </ClinicConfigProvider>
     </AuthProvider>
   </QueryClientProvider>
 </ErrorBoundary>
);

export default App;
