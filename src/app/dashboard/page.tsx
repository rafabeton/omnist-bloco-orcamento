'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      try {
        // Verificar sessão atual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          console.log('Sem sessão, redirecionando para login')
          router.push('/login')
          return
        }

        console.log('Sessão encontrada:', session.user.email)
        setUser(session.user)

        // Carregar perfil do utilizador
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.log('Erro ao carregar perfil:', profileError)
        } else {
          setProfile(profileData)
        }

        // Carregar projetos do utilizador
        const { data: projectMembers, error: projectsError } = await supabase
          .from('project_members')
          .select(`
            project_id,
            role,
            projects (
              id,
              name,
              description,
              status,
              total_budget
            )
          `)
          .eq('user_id', session.user.id)

        if (projectsError) {
          console.log('Erro ao carregar projetos:', projectsError)
        } else {
          const userProjects = projectMembers?.map(pm => ({
            ...pm.projects,
            userRole: pm.role
          })) || []
          setProjects(userProjects)
        }

        setLoading(false)
      } catch (err) {
        console.error('Erro geral:', err)
        setError('Erro ao carregar dados')
        setLoading(false)
      }
    }

    checkUserAndLoadData()
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>A carregar dashboard...</h2>
          <p>Por favor aguarde</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Erro</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/login')}>
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
            Omnist Bloco de Orçamento
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
            Bem-vindo, {profile?.first_name || user?.email}!
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Dashboard Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>Dashboard Principal</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3>Informações do Utilizador</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Nome:</strong> {profile?.first_name} {profile?.last_name}</p>
          <p><strong>Empresa:</strong> {profile?.company || 'Não definida'}</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>Projetos ({projects.length})</h3>
          {projects.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {projects.map((project, index) => (
                <div key={project.id || index} style={{
                  padding: '15px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h4 style={{ margin: '0 0 10px 0' }}>{project.name}</h4>
                  <p style={{ margin: '0 0 5px 0', color: '#6b7280' }}>
                    {project.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px' }}>
                    <strong>Status:</strong> {project.status} | 
                    <strong> Orçamento:</strong> €{project.total_budget} | 
                    <strong> Função:</strong> {project.userRole}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>
              Nenhum projeto encontrado. Crie um novo projeto para começar.
            </p>
          )}
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          color: '#16a34a'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🎉 Login Bem-Sucedido!</h3>
          <p style={{ margin: 0 }}>
            A aplicação está funcionando corretamente. Todas as funcionalidades de autenticação, 
            base de dados e interface estão operacionais.
          </p>
        </div>
      </div>
    </div>
  )
}

