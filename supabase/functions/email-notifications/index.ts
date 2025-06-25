import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailNotification {
  type: 'purchase_created' | 'purchase_approved' | 'purchase_rejected' | 'budget_alert'
  recipientEmail: string
  recipientName: string
  data: any
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

    const { type, recipientEmail, recipientName, data } = await req.json() as EmailNotification

    if (!type || !recipientEmail || !data) {
      throw new Error('Missing required fields: type, recipientEmail, data')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    let subject = ''
    let htmlContent = ''

    switch (type) {
      case 'purchase_created':
        subject = `Nova compra criada - ${data.projectName}`
        htmlContent = `
          <h2>Nova Compra Criada</h2>
          <p>Olá ${recipientName},</p>
          <p>Uma nova compra foi criada no projeto <strong>${data.projectName}</strong>:</p>
          <ul>
            <li><strong>Descrição:</strong> ${data.description}</li>
            <li><strong>Valor:</strong> €${data.amount.toFixed(2)}</li>
            <li><strong>Categoria:</strong> ${data.categoryName}</li>
            <li><strong>Solicitado por:</strong> ${data.requestedBy}</li>
          </ul>
          <p>Acesse o sistema para revisar e aprovar esta compra.</p>
        `
        break

      case 'purchase_approved':
        subject = `Compra aprovada - ${data.projectName}`
        htmlContent = `
          <h2>Compra Aprovada</h2>
          <p>Olá ${recipientName},</p>
          <p>A sua compra foi aprovada:</p>
          <ul>
            <li><strong>Descrição:</strong> ${data.description}</li>
            <li><strong>Valor:</strong> €${data.amount.toFixed(2)}</li>
            <li><strong>Aprovado por:</strong> ${data.approvedBy}</li>
          </ul>
          <p>Pode proceder com a compra.</p>
        `
        break

      case 'purchase_rejected':
        subject = `Compra rejeitada - ${data.projectName}`
        htmlContent = `
          <h2>Compra Rejeitada</h2>
          <p>Olá ${recipientName},</p>
          <p>A sua compra foi rejeitada:</p>
          <ul>
            <li><strong>Descrição:</strong> ${data.description}</li>
            <li><strong>Valor:</strong> €${data.amount.toFixed(2)}</li>
            <li><strong>Motivo:</strong> ${data.rejectionReason || 'Não especificado'}</li>
          </ul>
          <p>Entre em contacto com o gestor do projeto para mais informações.</p>
        `
        break

      case 'budget_alert':
        subject = `Alerta de Orçamento - ${data.projectName}`
        htmlContent = `
          <h2>Alerta de Orçamento</h2>
          <p>Olá ${recipientName},</p>
          <p>A categoria <strong>${data.categoryName}</strong> no projeto <strong>${data.projectName}</strong> ${data.alertType === 'over_budget' ? 'excedeu o orçamento' : 'está próxima do limite'}:</p>
          <ul>
            <li><strong>Orçamento:</strong> €${data.budgetedAmount.toFixed(2)}</li>
            <li><strong>Gasto:</strong> €${data.spentAmount.toFixed(2)}</li>
            <li><strong>Percentagem:</strong> ${data.percentage.toFixed(1)}%</li>
          </ul>
          <p>Revise os gastos desta categoria no sistema.</p>
        `
        break

      default:
        throw new Error(`Unknown notification type: ${type}`)
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Omnist <noreply@omnist.app>',
        to: [recipientEmail],
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h1 style="color: #2563eb; margin: 0;">Omnist Bloco de Orçamento</h1>
            </div>
            ${htmlContent}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p>Esta é uma notificação automática do sistema Omnist Bloco de Orçamento.</p>
              <p>Se não pretende receber estas notificações, entre em contacto com o administrador do sistema.</p>
            </div>
          </body>
          </html>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorData}`)
    }

    const emailResult = await emailResponse.json()

    return new Response(
      JSON.stringify({ 
        success: true,
        emailId: emailResult.id,
        message: 'Email sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in email notification function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

