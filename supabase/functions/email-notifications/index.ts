import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface EmailNotificationRequest {
  type: 'purchase_approval' | 'budget_alert' | 'project_update';
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  data: any;
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

    const { type, recipient_email, recipient_name, subject, data }: EmailNotificationRequest = await req.json()

    if (!type || !recipient_email || !subject) {
      return createErrorResponse('type, recipient_email, and subject are required');
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return createErrorResponse('Email service not configured', 503);
    }

    let htmlContent = ''

    // Generate email content based on type
    switch (type) {
      case 'purchase_approval':
        htmlContent = `
          <h2>Purchase Approval Required</h2>
          <p>Hello ${recipient_name || 'User'},</p>
          <p>A new purchase requires your approval:</p>
          <ul>
            <li><strong>Description:</strong> ${data.description}</li>
            <li><strong>Amount:</strong> €${data.amount}</li>
            <li><strong>Supplier:</strong> ${data.supplier || 'N/A'}</li>
            <li><strong>Category:</strong> ${data.category}</li>
          </ul>
          <p>Please review and approve or reject this purchase in your dashboard.</p>
          <p>Best regards,<br>Omnist Team</p>
        `
        break

      case 'budget_alert':
        htmlContent = `
          <h2>Budget Alert</h2>
          <p>Hello ${recipient_name || 'User'},</p>
          <p>We detected budget issues in your project "${data.project_name}":</p>
          <ul>
            ${data.alerts?.map((alert: any) => `<li>${alert.message}</li>`).join('') || ''}
          </ul>
          <p>Please review your budget and take appropriate action.</p>
          <p>Best regards,<br>Omnist Team</p>
        `
        break

      case 'project_update':
        htmlContent = `
          <h2>Project Update</h2>
          <p>Hello ${recipient_name || 'User'},</p>
          <p>Your project "${data.project_name}" has been updated:</p>
          <p>${data.message}</p>
          <p>Best regards,<br>Omnist Team</p>
        `
        break

      default:
        return createErrorResponse('Invalid notification type');
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notifications@omnist.com',
        to: [recipient_email],
        subject,
        html: htmlContent
      })
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const emailResult = await emailResponse.json()

    // Log notification in database
    const { error: logError } = await supabase
      .from('email_notifications')
      .insert({
        type,
        recipient_email,
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
        external_id: emailResult.id
      })

    if (logError) {
      console.error('Failed to log notification:', logError);
    }

    return createSuccessResponse({
      email_id: emailResult.id,
      status: 'sent'
    }, 'Email sent successfully');

  } catch (error: any) {
    console.error('Email notification error:', error);
    
    // Log failed notification
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase
        .from('email_notifications')
        .insert({
          type: 'unknown',
          recipient_email: 'unknown',
          subject: 'Failed notification',
          status: 'failed',
          error_message: error.message,
          sent_at: new Date().toISOString()
        })
    } catch (logError: any) {
      console.error('Failed to log error:', logError);
    }

    return createErrorResponse(error.message || 'Internal server error', 500);
  }
})

