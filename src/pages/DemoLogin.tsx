import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContextBase'
import { useNavigate } from 'react-router-dom'
import { MockAuthService } from '@/services/mockAuthService'
import { Stethoscope, User, Shield, UserCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const DemoLogin = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleDemoLogin = async (email: string, role: string) => {
    const { error } = await signIn(email, 'demo123')

    if (error) {
      toast({
        title: 'Erro no login',
        description: 'Não foi possível fazer login. Tente novamente.',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo ao sistema como ${role}!`,
      })
      
      if (role === 'Paciente') {
        navigate('/portal')
      } else {
        navigate('/dashboard')
      }
    }
  }

  const demoUsers = MockAuthService.getUsers()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Sistema de Demonstração</CardTitle>
          <CardDescription>
            Escolha um usuário para testar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {demoUsers.map((user) => (
              <Card key={user.id} className="border-2 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {user.role === 'admin' && <Shield className="h-5 w-5 text-red-600" />}
                        {user.role === 'professional' && <UserCheck className="h-5 w-5 text-blue-600" />}
                        {user.role === 'patient' && <User className="h-5 w-5 text-green-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.specialty && (
                          <p className="text-xs text-gray-500">{user.specialty}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          user.role === 'admin' ? 'destructive' : 
                          user.role === 'professional' ? 'default' : 
                          'secondary'
                        }
                      >
                        {user.role === 'admin' ? 'Administrador' :
                         user.role === 'professional' ? 'Profissional' :
                         'Paciente'}
                      </Badge>
                      <Button 
                        onClick={() => handleDemoLogin(user.email, 
                          user.role === 'admin' ? 'Administrador' :
                          user.role === 'professional' ? 'Profissional' :
                          'Paciente'
                        )}
                        size="sm"
                      >
                        Entrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Este é um sistema de demonstração com dados fictícios
            </p>
            <p className="text-xs text-gray-500">
              Todos os usuários usam a senha: <code className="bg-gray-100 px-1 rounded">demo123</code>
            </p>
          </div>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Ir para Login Tradicional
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DemoLogin
