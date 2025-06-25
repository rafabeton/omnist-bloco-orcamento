'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    console.log('Tentando login com:', { email, password: password ? '***' : 'VAZIO' })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(`Erro: ${error.message}`)
        setLoading(false)
        return
      }

      if (data.user && data.session) {
        setMessage('Login realizado com sucesso! Redirecionando...')
        
        // Aguardar um momento e redirecionar
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setMessage('Por favor, preencha email e password')
      return
    }

    if (password.length < 6) {
      setMessage('Password deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(`Erro: ${error.message}`)
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

        setMessage('Conta criada com sucesso!')
        
        // Se o utilizador foi criado e confirmado automaticamente
        if (data.session) {
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else {
          setMessage('Conta criada! Verifique o seu email para confirmar.')
          setLoading(false)
        }
      }
    } catch (error: any) {
      setMessage(`Erro: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '8px'
          }}>
            Omnist Bloco de Orçamento
          </h1>
          <p style={{ color: '#6b7280' }}>
            Faça login na sua conta ou crie uma nova
          </p>
        </div>

        {message && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            backgroundColor: message.includes('Erro') ? '#fef2f2' : '#f0fdf4',
            color: message.includes('Erro') ? '#dc2626' : '#16a34a',
            borderRadius: '6px',
            border: `1px solid ${message.includes('Erro') ? '#fecaca' : '#bbf7d0'}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: loading ? '#f9fafb' : 'white'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: loading ? '#f9fafb' : 'white'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '12px'
            }}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
          
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'A criar conta...' : 'Criar Nova Conta'}
          </button>
        </form>

        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          textAlign: 'center',
          marginTop: '20px'
        }}>
          Debug: Email={email ? 'OK' : 'VAZIO'}, Password={password ? 'OK' : 'VAZIO'}
        </div>
      </div>
    </div>
  )
}

