'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, getStatusColor, getPriorityColor } from '@/lib/utils'
import { Check, X, Eye, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Purchase {
  id: string
  description: string
  supplier: string | null
  amount: number
  purchase_date: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  receipt_url: string | null
  notes: string | null
  budget_categories: { name: string }
  user_profiles: { first_name: string; last_name: string }
  created_at: string
}

interface PurchaseListProps {
  projectId: string
  canApprove?: boolean
  onPurchaseUpdate?: () => void
}

export function PurchaseList({ projectId, canApprove = false, onPurchaseUpdate }: PurchaseListProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const supabase = createClient()

  useEffect(() => {
    fetchPurchases()
  }, [projectId, filter])

  const fetchPurchases = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('purchases')
        .select(`
          *,
          budget_categories(name),
          user_profiles(first_name, last_name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setPurchases(data || [])
    } catch (error) {
      console.error('Error fetching purchases:', error)
      toast.error('Erro ao carregar compras')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (purchaseId: string, action: 'approve' | 'reject', comments?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Utilizador não autenticado')
        return
      }

      // Update purchase status
      const newStatus = action === 'approve' ? 'approved' : 'rejected'
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: newStatus,
          approved_by: action === 'approve' ? user.id : null,
          approved_at: action === 'approve' ? new Date().toISOString() : null,
          rejection_reason: action === 'reject' ? comments : null
        })
        .eq('id', purchaseId)

      if (updateError) {
        throw updateError
      }

      // Record approval action
      const { error: approvalError } = await supabase
        .from('purchase_approvals')
        .insert({
          purchase_id: purchaseId,
          approver_id: user.id,
          action: action === 'approve' ? 'approved' : 'rejected',
          comments
        })

      if (approvalError) {
        console.error('Failed to record approval:', approvalError)
      }

      toast.success(`Compra ${action === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`)
      
      // Refresh the list
      fetchPurchases()
      onPurchaseUpdate?.()
      
    } catch (error: any) {
      console.error('Error processing approval:', error)
      toast.error(error.message || 'Erro ao processar aprovação')
    }
  }

  const getStatusBadge = (status: string) => {
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovada',
      rejected: 'Rejeitada',
      paid: 'Paga'
    }

    return (
      <Badge className={getStatusColor(status)}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const labels = {
      low: 'Baixa',
      normal: 'Normal',
      high: 'Alta',
      urgent: 'Urgente'
    }

    return (
      <Badge variant="outline" className={getPriorityColor(priority)}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">A carregar compras...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'approved', label: 'Aprovadas' },
          { key: 'rejected', label: 'Rejeitadas' }
        ].map((filterOption) => (
          <Button
            key={filterOption.key}
            variant={filter === filterOption.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption.key as any)}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {/* Purchase cards */}
      <div className="space-y-4">
        {purchases.map((purchase) => (
          <Card key={purchase.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{purchase.description}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {purchase.budget_categories.name} • {purchase.supplier || 'Sem fornecedor'}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xl font-bold">
                    {formatCurrency(purchase.amount)}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 justify-end">
                    {getStatusBadge(purchase.status)}
                    {getPriorityBadge(purchase.priority)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Data:</span>
                  <br />
                  {formatDate(purchase.purchase_date)}
                </div>
                <div>
                  <span className="font-medium">Solicitado por:</span>
                  <br />
                  {purchase.user_profiles.first_name} {purchase.user_profiles.last_name}
                </div>
                <div>
                  <span className="font-medium">Criado em:</span>
                  <br />
                  {formatDate(purchase.created_at)}
                </div>
              </div>

              {purchase.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <span className="font-medium text-sm">Notas:</span>
                  <p className="text-sm mt-1">{purchase.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center">
                {purchase.receipt_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={purchase.receipt_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-1" />
                      Ver Recibo
                    </a>
                  </Button>
                )}

                {canApprove && purchase.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApproval(purchase.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproval(purchase.id, 'reject', 'Rejeitada pelo aprovador')}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {purchases.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma compra encontrada.</p>
          {filter !== 'all' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFilter('all')}
              className="mt-2"
            >
              Ver todas as compras
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

