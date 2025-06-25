'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, calculatePercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'

interface BudgetCategory {
  id: string
  name: string
  description: string | null
  budgeted_amount: number
  spent_amount: number
  alert_threshold: number
  is_active: boolean
}

interface BudgetStats {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  categoriesOverBudget: number
  categoriesNearLimit: number
}

interface BudgetDashboardProps {
  projectId: string
}

export function BudgetDashboard({ projectId }: BudgetDashboardProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [stats, setStats] = useState<BudgetStats>({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    categoriesOverBudget: 0,
    categoriesNearLimit: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchBudgetData()
  }, [projectId])

  const fetchBudgetData = async () => {
    setLoading(true)
    
    try {
      const { data: categoriesData, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('name')

      if (error) {
        throw error
      }

      const categories = categoriesData || []
      setCategories(categories)

      // Calculate stats
      const totalBudget = categories.reduce((sum, cat) => sum + cat.budgeted_amount, 0)
      const totalSpent = categories.reduce((sum, cat) => sum + cat.spent_amount, 0)
      const totalRemaining = totalBudget - totalSpent

      const categoriesOverBudget = categories.filter(cat => cat.spent_amount > cat.budgeted_amount).length
      const categoriesNearLimit = categories.filter(cat => {
        const percentage = calculatePercentage(cat.spent_amount, cat.budgeted_amount)
        return percentage >= cat.alert_threshold && cat.spent_amount <= cat.budgeted_amount
      }).length

      setStats({
        totalBudget,
        totalSpent,
        totalRemaining,
        categoriesOverBudget,
        categoriesNearLimit
      })

    } catch (error) {
      console.error('Error fetching budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryStatus = (category: BudgetCategory) => {
    const percentage = calculatePercentage(category.spent_amount, category.budgeted_amount)
    
    if (category.spent_amount > category.budgeted_amount) {
      return { status: 'over', color: 'bg-red-100 text-red-800', icon: TrendingUp }
    } else if (percentage >= category.alert_threshold) {
      return { status: 'warning', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    }
  }

  const getProgressBarColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">A carregar dados do orçamento...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Orçamento Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            <div className="text-sm text-gray-500">
              {calculatePercentage(stats.totalSpent, stats.totalBudget)}% do orçamento
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRemaining)}</div>
            <div className={`text-sm ${stats.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalRemaining >= 0 ? 'Dentro do orçamento' : 'Acima do orçamento'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {stats.categoriesOverBudget > 0 && (
                <div className="text-sm text-red-600">
                  {stats.categoriesOverBudget} categoria(s) acima do orçamento
                </div>
              )}
              {stats.categoriesNearLimit > 0 && (
                <div className="text-sm text-yellow-600">
                  {stats.categoriesNearLimit} categoria(s) próximas do limite
                </div>
              )}
              {stats.categoriesOverBudget === 0 && stats.categoriesNearLimit === 0 && (
                <div className="text-sm text-green-600">
                  Todas as categorias dentro do orçamento
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const percentage = calculatePercentage(category.spent_amount, category.budgeted_amount)
              const isOverBudget = category.spent_amount > category.budgeted_amount
              const status = getCategoryStatus(category)
              const StatusIcon = status.icon

              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {percentage}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gasto: {formatCurrency(category.spent_amount)}</span>
                      <span>Orçado: {formatCurrency(category.budgeted_amount)}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentage, isOverBudget)}`}
                        style={{ 
                          width: `${Math.min(percentage, 100)}%` 
                        }}
                      />
                      {isOverBudget && (
                        <div
                          className="h-2 bg-red-500 opacity-50 rounded-full -mt-2"
                          style={{ 
                            width: `${Math.min(percentage - 100, 100)}%`,
                            marginLeft: '100%'
                          }}
                        />
                      )}
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        Restante: {formatCurrency(category.budgeted_amount - category.spent_amount)}
                      </span>
                      <span>
                        Limite de alerta: {category.alert_threshold}%
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma categoria de orçamento encontrada.</p>
              <p className="text-sm">Crie categorias para começar a gerir o orçamento.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

