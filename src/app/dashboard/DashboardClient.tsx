'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PurchaseForm } from '@/components/purchases/PurchaseForm'
import { PurchaseList } from '@/components/purchases/PurchaseList'
import { BudgetDashboard } from '@/components/budget/BudgetDashboard'
import { formatCurrency } from '@/lib/utils'
import { LogOut, Plus, Building, Users, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  total_budget: number
  userRole: string
}

interface DashboardClientProps {
  user: any
  profile: any
  projects: Project[]
}

export default function DashboardClient({ user, profile, projects }: DashboardClientProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'budget'>('overview')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0])
    }
  }, [projects, selectedProject])

  useEffect(() => {
    if (selectedProject) {
      fetchCategories()
    }
  }, [selectedProject])

  const fetchCategories = async () => {
    if (!selectedProject) return

    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('project_id', selectedProject.id)
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw error
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  const createSampleData = async () => {
    if (!selectedProject) return

    try {
      // Create sample categories
      const sampleCategories = [
        { name: 'Materiais', budgeted_amount: 5000, description: 'Materiais de construção' },
        { name: 'Mão de Obra', budgeted_amount: 8000, description: 'Custos com pessoal' },
        { name: 'Equipamentos', budgeted_amount: 3000, description: 'Aluguer de equipamentos' },
        { name: 'Outros', budgeted_amount: 1000, description: 'Despesas diversas' }
      ]

      for (const category of sampleCategories) {
        await supabase
          .from('budget_categories')
          .insert({
            project_id: selectedProject.id,
            ...category
          })
      }

      toast.success('Dados de exemplo criados!')
      fetchCategories()
    } catch (error) {
      console.error('Error creating sample data:', error)
      toast.error('Erro ao criar dados de exemplo')
    }
  }

  const canApprove = selectedProject?.userRole === 'manager' || selectedProject?.userRole === 'approver'

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">A configurar perfil...</h2>
          <p className="text-gray-600">Por favor, aguarde enquanto configuramos a sua conta.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Omnist Bloco de Orçamento
              </h1>
              <p className="text-sm text-gray-600">
                Bem-vindo, {profile.first_name} {profile.last_name}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum projeto encontrado
            </h2>
            <p className="text-gray-600 mb-6">
              Você ainda não está associado a nenhum projeto. Entre em contacto com o administrador.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Projetos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProject?.id === project.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <h3 className="font-medium">{project.name}</h3>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline">{project.status}</Badge>
                        <span className="text-sm font-medium">
                          {formatCurrency(project.total_budget)}
                        </span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {project.userRole}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedProject && (
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { key: 'overview', label: 'Visão Geral', icon: TrendingUp },
                      { key: 'purchases', label: 'Compras', icon: Plus },
                      { key: 'budget', label: 'Orçamento', icon: TrendingUp }
                    ].map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key as any)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                            activeTab === tab.key
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          {tab.label}
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Projeto: {selectedProject.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900">Status</h4>
                              <Badge variant="outline" className="mt-1">
                                {selectedProject.status}
                              </Badge>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Orçamento Total</h4>
                              <p className="text-lg font-semibold mt-1">
                                {formatCurrency(selectedProject.total_budget)}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Seu Papel</h4>
                              <Badge variant="secondary" className="mt-1">
                                {selectedProject.userRole}
                              </Badge>
                            </div>
                          </div>
                          {categories.length === 0 && (
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <p className="text-sm text-yellow-800">
                                Este projeto ainda não tem categorias de orçamento configuradas.
                              </p>
                              <Button 
                                size="sm" 
                                onClick={createSampleData}
                                className="mt-2"
                              >
                                Criar Dados de Exemplo
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      {categories.length > 0 && (
                        <BudgetDashboard projectId={selectedProject.id} />
                      )}
                    </div>
                  )}

                  {activeTab === 'purchases' && (
                    <div className="space-y-6">
                      {categories.length === 0 ? (
                        <Card>
                          <CardContent className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                              Crie categorias de orçamento antes de adicionar compras.
                            </p>
                            <Button onClick={createSampleData}>
                              Criar Dados de Exemplo
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Gestão de Compras</h2>
                            <Button onClick={() => setShowPurchaseForm(!showPurchaseForm)}>
                              <Plus className="w-4 h-4 mr-2" />
                              {showPurchaseForm ? 'Cancelar' : 'Nova Compra'}
                            </Button>
                          </div>

                          {showPurchaseForm && (
                            <PurchaseForm
                              projectId={selectedProject.id}
                              categories={categories}
                              onSuccess={() => {
                                setShowPurchaseForm(false)
                                // Refresh will happen automatically via PurchaseList
                              }}
                              onCancel={() => setShowPurchaseForm(false)}
                            />
                          )}

                          <PurchaseList
                            projectId={selectedProject.id}
                            canApprove={canApprove}
                            onPurchaseUpdate={fetchCategories}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'budget' && (
                    <div className="space-y-6">
                      {categories.length === 0 ? (
                        <Card>
                          <CardContent className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                              Nenhuma categoria de orçamento encontrada.
                            </p>
                            <Button onClick={createSampleData}>
                              Criar Dados de Exemplo
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <BudgetDashboard projectId={selectedProject.id} />
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

