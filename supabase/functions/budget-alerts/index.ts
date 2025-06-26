import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface BudgetAlert {
  id: string;
  project_id: string;
  category_id: string;
  alert_type: 'warning' | 'critical' | 'exceeded';
  threshold_percentage: number;
  current_percentage: number;
  message: string;
}

function createErrorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

function createSuccessResponse<T>(data: T, message?: string): Response {
  return new Response(
    JSON.stringify({ success: true, data, message }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { projectId } = await req.json()

    if (!projectId) {
      return createErrorResponse('projectId is required');
    }

    // Get all budget categories for the project
    const { data: categories, error: categoriesError } = await supabase
      .from('budget_categories')
      .select(`
        *,
        purchases(amount, status)
      `)
      .eq('project_id', projectId)

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    const alerts: BudgetAlert[] = []

    // Check each category for budget alerts
    for (const category of categories) {
      const budgetedAmount = category.budgeted_amount || 0
      const spentAmount = category.purchases
        ?.filter((p: any) => p.status === 'approved')
        ?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0

      const percentage = budgetedAmount > 0 ? (spentAmount / budgetedAmount) * 100 : 0

      let alertType: 'warning' | 'critical' | 'exceeded' | null = null
      let message = ''

      if (percentage >= 100) {
        alertType = 'exceeded'
        message = `Budget exceeded by ${(percentage - 100).toFixed(1)}%`
      } else if (percentage >= 90) {
        alertType = 'critical'
        message = `Budget at ${percentage.toFixed(1)}% - Critical level`
      } else if (percentage >= 75) {
        alertType = 'warning'
        message = `Budget at ${percentage.toFixed(1)}% - Warning level`
      }

      if (alertType) {
        alerts.push({
          id: `${category.id}-${alertType}`,
          project_id: projectId,
          category_id: category.id,
          alert_type: alertType,
          threshold_percentage: alertType === 'exceeded' ? 100 : alertType === 'critical' ? 90 : 75,
          current_percentage: percentage,
          message
        })
      }
    }

    // Store alerts in database
    if (alerts.length > 0) {
      const { error: alertsError } = await supabase
        .from('budget_alerts')
        .upsert(alerts, { onConflict: 'project_id,category_id,alert_type' })

      if (alertsError) {
        console.error('Failed to store alerts:', alertsError);
      }
    }

    // Send email notifications for critical alerts
    const criticalAlerts = alerts.filter(a => a.alert_type === 'critical' || a.alert_type === 'exceeded')
    
    if (criticalAlerts.length > 0 && Deno.env.get('RESEND_API_KEY')) {
      // Get project owner email
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          user_profiles(email, first_name)
        `)
        .eq('id', projectId)
        .single()

      if (!projectError && project?.user_profiles?.email) {
        try {
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'alerts@omnist.com',
              to: [project.user_profiles.email],
              subject: `Budget Alert - ${project.name}`,
              html: `
                <h2>Budget Alert for ${project.name}</h2>
                <p>Hello ${project.user_profiles.first_name},</p>
                <p>We detected budget issues in your project:</p>
                <ul>
                  ${criticalAlerts.map(alert => `<li>${alert.message}</li>`).join('')}
                </ul>
                <p>Please review your budget and take appropriate action.</p>
                <p>Best regards,<br>Omnist Team</p>
              `
            })
          })

          if (!emailResponse.ok) {
            console.error('Failed to send email notification');
          }
        } catch (emailError: any) {
          console.error('Email notification error:', emailError);
        }
      }
    }

    return createSuccessResponse({
      alerts,
      summary: {
        total: alerts.length,
        warning: alerts.filter(a => a.alert_type === 'warning').length,
        critical: alerts.filter(a => a.alert_type === 'critical').length,
        exceeded: alerts.filter(a => a.alert_type === 'exceeded').length
      }
    });

  } catch (error: any) {
    console.error('Budget alerts error:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
})

