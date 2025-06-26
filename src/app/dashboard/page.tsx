'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  role: string
  company: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        window.location.href = '/login'
        return
      }

      setUser(session.user)

      // Buscar perfil do usuário
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)
      setLoading(false)
    }

    checkUser()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (showCalculator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Calculadora de Orçamento
              </h1>
              <button
                onClick={() => setShowCalculator(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Voltar ao Dashboard
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Etapa 1: Escolha o tipo de projeto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Cozinha', price: '€200/m²', duration: '2-4 semanas', icon: '🍳' },
                    { name: 'Casa de Banho', price: '€180/m²', duration: '1-3 semanas', icon: '🚿' },
                    { name: 'Sala de Estar', price: '€120/m²', duration: '1-2 semanas', icon: '🛋️' },
                    { name: 'Quarto', price: '€100/m²', duration: '1-2 semanas', icon: '🛏️' },
                    { name: 'Escritório', price: '€90/m²', duration: '1 semana', icon: '💼' },
                    { name: 'Varanda', price: '€80/m²', duration: '1 semana', icon: '🌿' }
                  ].map((project) => (
                    <div
                      key={project.name}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                    >
                      <div className="text-2xl mb-2">{project.icon}</div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-600">A partir de {project.price}</p>
                      <p className="text-xs text-gray-500">{project.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Omnist Bloco de Orçamento
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {profile?.first_name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Bem-vindo, {profile?.first_name || 'Utilizador'}! 👋
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Calculadora de Orçamento
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Calcule rapidamente o orçamento para o seu projeto de renovação.
                  </p>
                  <button
                    onClick={() => setShowCalculator(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Começar Agora
                  </button>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Meus Projetos
                  </h3>
                  <p className="text-green-700 mb-4">
                    Gerir os seus projetos de orçamento e acompanhar o progresso.
                  </p>
                  <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium">
                    Ver Projetos
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Conta</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-600">{user?.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Tipo de Conta:</span>
                      <span className="ml-2 text-gray-600">{profile?.role || 'Usuário Comum'}</span>
                    </div>
                    {profile?.company && (
                      <div>
                        <span className="font-medium text-gray-700">Empresa:</span>
                        <span className="ml-2 text-gray-600">{profile.company}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div>
                        <span className="font-medium text-gray-700">Telefone:</span>
                        <span className="ml-2 text-gray-600">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

