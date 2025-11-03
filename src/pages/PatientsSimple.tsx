import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PatientService } from '../services/patientService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, RefreshCw, AlertCircle, CheckCircle, Clock, Wifi, WifiOff, Database, Plus } from 'lucide-react';

export default function PatientsSimple() {
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Testar conexão detalhada
  const testConnectionDetailed = async () => {
    try {
      console.log('🔗 Testando conexão detalhada...');
      setConnectionStatus('checking');
      
      const result = await PatientService.testConnectionDetailed();
      console.log('📡 Resultado da conexão detalhada:', result);
      
      setConnectionDetails(result);
      setConnectionStatus(result.success ? 'connected' : 'error');
      
      return result.success;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      setConnectionStatus('error');
      setConnectionDetails({
        success: false,
        message: 'Erro durante teste de conexão',
        timestamp: new Date().toISOString(),
        details: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
      });
      return false;
    }
  };

  // Testar conexão inicial
  useEffect(() => {
    testConnectionDetailed();
  }, []);

  // Query para buscar pacientes
  const {
    data: patients = [],
    isLoading,
    isRefetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['patients-simple'],
    queryFn: async () => {
      console.log('📊 Buscando pacientes...');
      try {
        const result = await PatientService.getAll();
        console.log('✅ Pacientes carregados:', result.length);
        return result;
      } catch (error) {
        console.error('❌ Erro ao buscar pacientes:', error);
        throw error;
      }
    },
    enabled: connectionStatus === 'connected',
    retry: (failureCount, error) => {
      console.log(`🔄 Tentativa ${failureCount + 1} de buscar pacientes`);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Função para tentar novamente
  const handleRetry = async () => {
    setConnectionStatus('checking');
    setRetryCount(prev => prev + 1);
    
    try {
      // Primeiro, tenta recuperação automática
      console.log('🔄 Iniciando tentativa de recuperação...');
      const recoveryResult = await PatientService.attemptRecovery();
      
      if (recoveryResult.success) {
        console.log('✅ Recuperação bem-sucedida:', recoveryResult.message);
        setConnectionStatus('connected');
        setConnectionDetails({
          success: true,
          message: `Conexão recuperada! ${recoveryResult.message}`,
          timestamp: new Date().toISOString(),
          details: {
            recoveryStrategy: recoveryResult.strategy,
            recoveryMessage: recoveryResult.message
          }
        });
        refetch();
        return;
      }
      
      // Se a recuperação falhar, faz diagnóstico detalhado
      console.log('⚠️ Recuperação falhou, fazendo diagnóstico...');
      const networkDiagnosis = await PatientService.diagnoseNetworkIssue();
      
      // Tenta conexão detalhada
      const result = await PatientService.testConnectionDetailed();
      
      if (result.success) {
        setConnectionStatus('connected');
        setConnectionDetails(result);
        refetch();
      } else {
        setConnectionStatus('error');
        const enhancedResult = {
          ...result,
          details: {
            ...result.details,
            networkDiagnosis,
            retryAttempt: retryCount + 1,
            recoveryAttempted: true,
            recoveryResult: recoveryResult.message
          }
        };
        setConnectionDetails(enhancedResult);
      }
    } catch (error: any) {
      console.error('❌ Erro durante retry:', error);
      setConnectionStatus('error');
      setConnectionDetails({
        success: false,
        message: 'Erro durante tentativa de reconexão',
        details: { 
          error: error.message,
          retryFailed: true
        },
        timestamp: new Date().toISOString()
      });
    }
  };

  // Log do estado atual para debug
  console.log('🔍 Estado atual:', {
    connectionStatus,
    connectionDetails,
    retryCount,
    patientsCount: patients?.length || 0,
    isLoading,
    error: error?.message
  });

  // Estado de verificação de conexão
  if (connectionStatus === 'checking') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 animate-pulse" />
              Pacientes - Teste Simples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Verificando Conexão</h3>
                <p className="text-gray-600">Testando conectividade com o banco de dados...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de erro de conexão
  if (connectionStatus === 'error') {
    return (
      <div className="p-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <WifiOff className="h-5 w-5" />
              Erro de Conexão com o Banco de Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 mb-1">
                      Falha na Conexão
                    </h4>
                    <p className="text-red-700 mb-2">
                      Erro de conexão: {connectionDetails?.message || 'Não foi possível conectar ao banco de dados'}
                    </p>
                    {connectionDetails?.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
                          Ver detalhes técnicos
                        </summary>
                        <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                          {JSON.stringify(connectionDetails.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Possíveis Soluções:</h4>
                <ul className="text-blue-700 space-y-1 text-sm">
                  {connectionDetails?.details?.solutions ? (
                    connectionDetails.details.solutions.map((solution: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {solution}
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Verifique sua conexão com a internet
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Confirme se as credenciais do Supabase estão corretas
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Verifique se o serviço do Supabase está funcionando
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        Tente novamente em alguns instantes
                      </li>
                    </>
                  )}
                </ul>
                
                {/* Mostrar diagnóstico de rede se disponível */}
                {connectionDetails?.details?.networkDiagnosis && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">Diagnóstico de Rede:</h5>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>Status da rede: <span className="font-medium">
                        {connectionDetails.details.networkDiagnosis.networkStatus === 'connected' ? '✅ Conectado' : '❌ Desconectado'}
                      </span></p>
                      <p>Supabase acessível: <span className="font-medium">
                        {connectionDetails.details.networkDiagnosis.supabaseReachable ? '✅ Sim' : '❌ Não'}
                      </span></p>
                      {connectionDetails.details.networkDiagnosis.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Sugestões específicas:</p>
                          <ul className="ml-4 space-y-1">
                            {connectionDetails.details.networkDiagnosis.suggestions.map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-500 mt-1">→</span>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Mostrar possíveis causas se disponível */}
                {connectionDetails?.details?.possibleCauses && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">Possíveis Causas:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {connectionDetails.details.possibleCauses.map((cause: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleRetry}
                  className="flex items-center gap-2"
                  disabled={connectionStatus === 'checking'}
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                  {retryCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {retryCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {connectionDetails?.timestamp && (
                <p className="text-xs text-gray-500">
                  Último teste: {new Date(connectionDetails.timestamp).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de carregamento
  if (isLoading || isRefetching) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Pacientes - Teste Simples
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Carregando Pacientes</h3>
                <p className="text-gray-600">Buscando dados dos pacientes...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de erro na query
  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">
                  {error instanceof Error ? error.message : 'Erro desconhecido ao carregar pacientes'}
                </p>
              </div>
              <Button onClick={() => refetch()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado de sucesso - mostrar dados
  return (
    <div className="p-8">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Pacientes - Teste Simples
            <Badge variant="secondary" className="ml-2">
              {patients.length} pacientes
            </Badge>
          </CardTitle>
          <Button onClick={() => navigate('/pacientes/novo')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Status de conexão */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-semibold text-green-800">Conexão Estabelecida</h4>
                  {connectionDetails?.message && (
                    <p className="text-green-700 text-sm">{connectionDetails.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de pacientes */}
            {patients.length > 0 ? (
              <div className="grid gap-4">
                {patients.map((patient: any, index: number) => (
                  <div key={patient.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {patient.full_name || patient.name || `Paciente ${index + 1}`}
                        </h3>
                        {patient.email && (
                          <p className="text-sm text-gray-600">{patient.email}</p>
                        )}
                        {patient.phone && (
                          <p className="text-sm text-gray-600">{patient.phone}</p>
                        )}
                        {patient.birth_date && (
                          <p className="text-sm text-gray-500">
                            Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {patient.created_at && (
                          <p className="text-xs text-gray-500">
                            Cadastrado: {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {patient.specialty && (
                          <Badge variant="outline" className="mt-1">
                            {patient.specialty}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum paciente encontrado</p>
              </div>
            )}

            {/* Informações de debug */}
            {connectionDetails?.timestamp && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Última verificação: {new Date(connectionDetails.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
