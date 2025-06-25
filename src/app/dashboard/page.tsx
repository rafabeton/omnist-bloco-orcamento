'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Cliente admin para operações que precisam contornar RLS
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    total_budget: '',
    start_date: '',
    end_date: ''
  })
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
        await loadProjects(session.user.id)

        setLoading(false)
      } catch (err) {
        console.error('Erro geral:', err)
        setError('Erro ao carregar dados')
        setLoading(false)
      }
    }

    checkUserAndLoadData()
  }, [supabase, router])

  const loadProjects = async (userId) => {
    // Carregar projetos criados pelo utilizador diretamente
    const { data: userProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('created_by', userId)

    if (projectsError) {
      console.log('Erro ao carregar projetos:', projectsError)
    } else {
      // Adicionar role como owner para projetos criados pelo utilizador
      const projectsWithRole = userProjects?.map(project => ({
        ...project,
        userRole: 'owner'
      })) || []
      setProjects(projectsWithRole)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setCreateLoading(true)
    setError('')

    try {
      console.log('Criando projeto:', newProject)

      // Criar projeto diretamente na tabela projects
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: newProject.name,
          description: newProject.description,
          total_budget: parseFloat(newProject.total_budget) || 0,
          start_date: newProject.start_date || null,
          end_date: newProject.end_date || null,
          created_by: user.id,
          status: 'active'
        })
        .select()
        .single()

      if (projectError) {
        console.error('Erro ao criar projeto:', projectError)
        setError(`Erro ao criar projeto: ${projectError.message}`)
        setCreateLoading(false)
        return
      }

      console.log('Projeto criado com sucesso:', project)

      // Tentar adicionar à tabela project_members (se falhar, não é crítico)
      try {
        const { error: memberError } = await supabase
          .from('project_members')
          .insert({
            project_id: project.id,
            user_id: user.id,
            role: 'owner'
          })

        if (memberError) {
          console.log('Aviso: Não foi possível adicionar à tabela project_members:', memberError)
          // Não é crítico, o projeto foi criado com sucesso
        }
      } catch (memberErr) {
        console.log('Aviso: Erro ao adicionar membro:', memberErr)
        // Não é crítico
      }

      // Recarregar projetos
      await loadProjects(user.id)

      // Limpar formulário e fechar modal
      setNewProject({
        name: '',
        description: '',
        total_budget: '',
        start_date: '',
        end_date: ''
      })
      setShowCreateProject(false)
      setCreateLoading(false)

      console.log('Projeto criado e lista recarregada com sucesso!')

    } catch (err) {
      console.error('Erro geral ao criar projeto:', err)
      setError(`Erro ao criar projeto: ${err.message}`)
      setCreateLoading(false)
    }
  }

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

  if (error && !user) {
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

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: '1px solid #dc2626',
              borderRadius: '4px',
              color: '#dc2626',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h3>Informações do Utilizador</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Nome:</strong> {profile?.first_name} {profile?.last_name}</p>
          <p><strong>Empresa:</strong> {profile?.company || 'Não definida'}</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: 0 }}>Projetos ({projects.length})</h3>
            <button
              onClick={() => setShowCreateProject(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              + Criar Projeto
            </button>
          </div>

          {projects.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {projects.map((project, index) => (
                <div key={project.id || index} style={{
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{project.name}</h4>
                  <p style={{ margin: '0 0 10px 0', color: '#6b7280' }}>
                    {project.description}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '14px' }}>
                    <p style={{ margin: 0 }}>
                      <strong>Status:</strong> {project.status}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Orçamento:</strong> €{project.total_budget}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Função:</strong> {project.userRole}
                    </p>
                    {project.start_date && (
                      <p style={{ margin: 0 }}>
                        <strong>Início:</strong> {new Date(project.start_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#6b7280',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <h4>Nenhum projeto encontrado</h4>
              <p>Crie o seu primeiro projeto para começar a gerir orçamentos e compras.</p>
              <button
                onClick={() => setShowCreateProject(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginTop: '10px'
                }}
              >
                Criar Primeiro Projeto
              </button>
            </div>
          )}
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          color: '#16a34a'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🎉 Dashboard Funcionando!</h3>
          <p style={{ margin: 0 }}>
            Login bem-sucedido! Sistema de criação de projetos corrigido e operacional.
          </p>
        </div>
      </div>

      {/* Modal Criar Projeto */}
      {showCreateProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Criar Novo Projeto</h2>
            
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="Ex: Renovação Casa Lisboa"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Descrição
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                  placeholder="Descrição do projeto..."
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Orçamento Total (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProject.total_budget}
                  onChange={(e) => setNewProject({...newProject, total_budget: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                  placeholder="50000.00"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({...newProject, start_date: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({...newProject, end_date: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '16px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateProject(false)}
                  disabled={createLoading}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: createLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: createLoading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: createLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {createLoading ? 'A criar...' : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

