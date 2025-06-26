'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const purchaseSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  supplier: z.string().optional(),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  categoryId: z.string().uuid('Categoria é obrigatória'),
  purchaseDate: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent'])
})

type PurchaseFormData = z.infer<typeof purchaseSchema>

interface Category {
  id: string
  name: string
  budgeted_amount: number
  spent_amount: number
}

interface PurchaseFormProps {
  projectId: string
  categories: Category[]
  onSuccess?: (purchase: any) => void
  onCancel?: () => void
}

export default function PurchaseForm({ 
  projectId, 
  categories, 
  onSuccess, 
  onCancel 
}: PurchaseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const supabase = createClient()

  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      description: '',
      supplier: '',
      amount: 0,
      categoryId: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
      priority: 'normal'
    }
  })

  const onSubmit = async (data: PurchaseFormData) => {
    setIsSubmitting(true)
    
    try {
      // Upload receipt if provided
      let receiptUrl = null
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop()
        const fileName = `${projectId}/${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(fileName, receiptFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          // Continue without receipt if upload fails
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName)
          
          receiptUrl = publicUrl
        }
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Utilizador não autenticado')
      }

      // Create purchase
      const { data: purchase, error } = await supabase
        .from('purchases')
        .insert({
          project_id: projectId,
          category_id: data.categoryId,
          description: data.description,
          supplier: data.supplier || null,
          amount: data.amount,
          purchase_date: data.purchaseDate,
          receipt_url: receiptUrl,
          notes: data.notes || null,
          priority: data.priority,
          requested_by: user?.id
        })
        .select(`
          *,
          budget_categories(name),
          user_profiles(first_name, last_name)
        `)
        .single()

      if (error) {
        throw error
      }

      console.log('Compra criada com sucesso!')
      form.reset()
      setReceiptFile(null)
      onSuccess?.(purchase)

    } catch (error: any) {
      console.error('Error creating purchase:', error)
      console.error(error.message || 'Erro ao criar compra')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Compra</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Descrição *
              </label>
              <Textarea
                {...form.register('description')}
                placeholder="Descreva a compra..."
                className="w-full"
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Fornecedor
              </label>
              <Input
                {...form.register('supplier')}
                placeholder="Nome do fornecedor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Valor (€) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...form.register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {form.formState.errors.amount && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Categoria *
              </label>
              <Select onValueChange={(value) => form.setValue('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatCurrency(category.spent_amount)} / {formatCurrency(category.budgeted_amount)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Data da Compra *
              </label>
              <Input
                type="date"
                {...form.register('purchaseDate')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Prioridade
              </label>
              <Select 
                defaultValue="normal"
                onValueChange={(value) => form.setValue('priority', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Recibo/Fatura
              </label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Notas
              </label>
              <Textarea
                {...form.register('notes')}
                placeholder="Notas adicionais..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'A criar...' : 'Criar Compra'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

