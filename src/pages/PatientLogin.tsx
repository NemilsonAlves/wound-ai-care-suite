import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Lock, 
  Mail, 
  ArrowLeft, 
  Shield, 
  Heart, 
  FileText,
  Calendar,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

const PatientLogin: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, resetPassword, loading } = usePatientAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset password dialog
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        navigate('/portal');
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (error) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error('Digite seu email');
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetPassword(resetEmail);
      
      if (result.success) {
        setIsResetDialogOpen(false);
        setResetEmail('');
        toast.success('Email de recuperação enviado!');
      } else {
        toast.error(result.error || 'Erro ao enviar email');
      }
    } catch (error) {
      toast.error('Erro interno. Tente novamente.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Portal do Paciente</h1>
                <p className="text-sm text-gray-600">Acesso seguro às suas informações</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Login Card */}
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Acesso do Paciente</CardTitle>
              <CardDescription>
                Entre com suas credenciais para acessar seu portal
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar no Portal
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Precisa de ajuda?
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Esqueci minha senha
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Recuperar Senha</DialogTitle>
                        <DialogDescription>
                          Digite seu email para receber as instruções de recuperação
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="seu@email.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            disabled={isResetting}
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsResetDialogOpen(false)}
                            className="flex-1"
                            disabled={isResetting}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleResetPassword}
                            className="flex-1"
                            disabled={isResetting}
                          >
                            {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="text-center text-sm text-muted-foreground">
                    Primeiro acesso?{' '}
                    <Link to="/contato" className="text-blue-600 hover:underline">
                      Entre em contato com sua clínica
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="text-center p-4">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Laudos e Exames</h3>
              <p className="text-xs text-muted-foreground">Acesse seus resultados</p>
            </Card>
            
            <Card className="text-center p-4">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Consultas</h3>
              <p className="text-xs text-muted-foreground">Histórico e agendamentos</p>
            </Card>
            
            <Card className="text-center p-4">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Segurança</h3>
              <p className="text-xs text-muted-foreground">Dados protegidos</p>
            </Card>
          </div>

          {/* Security Notice */}
          <div className="text-center text-xs text-muted-foreground bg-gray-50 p-4 rounded-lg">
            <Shield className="h-4 w-4 inline mr-1" />
            Sistema seguro com criptografia de ponta a ponta
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientLogin;