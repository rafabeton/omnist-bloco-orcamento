'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.user && data.session) {
        toast.success('Login realizado com sucesso!')
        
        // Aguardar um momento e redirecionar
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      }
    } catch (error: any) {
      toast.error('Erro ao fazer login')
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('Por favor, preencha email e password')
      return
    }

    if (password.length < 6) {
      toast.error('Password deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Criar perfil do usuário
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: email,
            first_name: 'Novo',
            last_name: 'Utilizador'
          })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }

        toast.success('Conta criada com sucesso!')
        
        // Se o utilizador foi criado e confirmado automaticamente
        if (data.session) {
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1500)
        } else {
          toast.info('Verifique o seu email para confirmar a conta')
          setLoading(false)
        }
      }
    } catch (error: any) {
      toast.error('Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Omnist Bloco de Orçamento
          </CardTitle>
          <CardDescription>
            Faça login na sua conta ou crie uma nova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'A entrar...' : 'Entrar'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleSignUp}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'A criar conta...' : 'Criar Nova Conta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

