import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BudgetAlert {
  categoryId: string
  categoryName: string
  projectId: string
  projectName: string
  budgetedAmount: number
  spentAmount: number
  percentage: number
  threshold: number
  alertType: 'warning' | 'over_budget'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { projectId } = await req.json()

    // Get all budget categories for the project
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('budget_categories')
      .select(`
        *,
        projects(id, name)
      `)
      .eq('project_id', projectId || '')
      .eq('is_active', true)

    if (categoriesError) {
      throw new Error('Failed to fetch budget categories')
    }

    const alerts: BudgetAlert[] = []

    // Check each category for alerts
    for (const category of categories || []) {
      const percentage = category.budgeted_amount > 0 
        ? (category.spent_amount / category.budgeted_amount) * 100 
        : 0

      // Over budget alert
      if (category.spent_amount > category.budgeted_amount) {
        alerts.push({
          categoryId: category.id,
          categoryName: category.name,
          projectId: category.project_id,
          projectName: category.projects.name,
          budgetedAmount: category.budgeted_amount,
          spentAmount: category.spent_amount,
          percentage,
          threshold: category.alert_threshold,
          alertType: 'over_budget'
        })
      }
      // Warning alert (approaching threshold)
      else if (percentage >= category.alert_threshold) {
        alerts.push({
          categoryId: category.id,
          categoryName: category.name,
          projectId: category.project_id,
          projectName: category.projects.name,
          budgetedAmount: category.budgeted_amount,
          spentAmount: category.spent_amount,
          percentage,
          threshold: category.alert_threshold,
          alertType: 'warning'
        })
      }
    }

    // If no specific project requested, check all active projects
    if (!projectId) {
      const { data: allCategories, error: allCategoriesError } = await supabaseClient
        .from('budget_categories')
        .select(`
          *,
          projects!inner(id, name, status)
        `)
        .eq('is_active', true)
        .eq('projects.status', 'active')

      if (!allCategoriesError && allCategories) {
        for (const category of allCategories) {
          const percentage = category.budgeted_amount > 0 
            ? (category.spent_amount / category.budgeted_amount) * 100 
            : 0

          if (category.spent_amount > category.budgeted_amount) {
            alerts.push({
              categoryId: category.id,
              categoryName: category.name,
              projectId: category.project_id,
              projectName: category.projects.name,
              budgetedAmount: category.budgeted_amount,
              spentAmount: category.spent_amount,
              percentage,
              threshold: category.alert_threshold,
              alertType: 'over_budget'
            })
          } else if (percentage >= category.alert_threshold) {
            alerts.push({
              categoryId: category.id,
              categoryName: category.name,
              projectId: category.project_id,
              projectName: category.projects.name,
              budgetedAmount: category.budgeted_amount,
              spentAmount: category.spent_amount,
              percentage,
              threshold: category.alert_threshold,
              alertType: 'warning'
            })
          }
        }
      }
    }

    // Send email notifications if there are critical alerts
    const criticalAlerts = alerts.filter(alert => alert.alertType === 'over_budget')
    
    if (criticalAlerts.length > 0 && Deno.env.get('RESEND_API_KEY')) {
      // Get project managers for notification
      const projectIds = [...new Set(criticalAlerts.map(alert => alert.projectId))]
      
      const { data: managers, error: managersError } = await supabaseClient
        .from('project_members')
        .select(`
          user_id,
          project_id,
          user_profiles!inner(id, first_name, last_name),
          projects!inner(id, name)
        `)
        .in('project_id', projectIds)
        .eq('role', 'manager')

      if (!managersError && managers) {
        // Group alerts by project and send notifications
        const alertsByProject = criticalAlerts.reduce((acc, alert) => {
          if (!acc[alert.projectId]) {
            acc[alert.projectId] = []
          }
          acc[alert.projectId].push(alert)
          return acc
        }, {} as Record<string, BudgetAlert[]>)

        // Here you would integrate with Resend API to send emails
        // For now, we'll just log the notifications
        console.log('Budget alerts to send:', alertsByProject)
      }
    }

    return new Response(
      JSON.stringify({ 
        alerts,
        summary: {
          total: alerts.length,
          warnings: alerts.filter(a => a.alertType === 'warning').length,
          overBudget: alerts.filter(a => a.alertType === 'over_budget').length
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in budget alerts function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        alerts: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

