import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContextBase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Stethoscope, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('professional')
  
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signIn(email, password)

    if (error) {
      setError('Email ou senha incorretos')
      toast({
        title: 'Erro no login',
        description: 'Verifique suas credenciais e tente novamente.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Login realizado com sucesso',
        description: 'Bem-vindo ao sistema!',
      })
      
      // Redirect based on user type
      if (activeTab === 'professional') {
        navigate('/dashboard')
      } else {
        navigate('/portal')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Sistema Clínico</CardTitle>
          <CardDescription className="text-center">
            Curativos, Dermatologia e Pequenas Cirurgias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Profissional
              </TabsTrigger>
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Paciente
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="professional" className="space-y-4 mt-6">
              <div className="text-center text-sm text-muted-foreground">
                Acesso para médicos e profissionais de saúde
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar como Profissional
                </Button>
              </form>
              
              <div className="text-center text-sm">
                <Link to="/register" className="text-blue-600 hover:underline">
                  Cadastrar novo profissional
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="patient" className="space-y-4 mt-6">
              <div className="text-center text-sm text-muted-foreground">
                Portal do paciente - Acesse seus dados e evolução
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="patient-email">Email</Label>
                  <Input
                    id="patient-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patient-password">Senha</Label>
                  <Input
                    id="patient-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Acessar Portal do Paciente
                </Button>
              </form>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Primeiro acesso? Entre em contato com sua clínica
                </span>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Sistema seguro com criptografia de ponta a ponta</p>
            <p className="mt-1">© 2024 Sistema Clínico - Todos os direitos reservados</p>
            <div className="mt-2">
              <Link to="/demo" className="text-blue-600 hover:underline">
                Acessar versão de demonstração
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
