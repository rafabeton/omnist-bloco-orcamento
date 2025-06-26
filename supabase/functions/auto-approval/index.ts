import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface AutoApprovalRequest {
  purchaseId: string;
  projectId: string;
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

    const { purchaseId, projectId }: AutoApprovalRequest = await req.json()

    if (!purchaseId || !projectId) {
      return createErrorResponse('purchaseId and projectId are required');
    }

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        *,
        budget_categories(*)
      `)
      .eq('id', purchaseId)
      .single()

    if (purchaseError) {
      throw new Error(`Failed to fetch purchase: ${purchaseError.message}`);
    }

    // Get project budget settings
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('auto_approval_limit, budget_total')
      .eq('id', projectId)
      .single()

    if (projectError) {
      throw new Error(`Failed to fetch project: ${projectError.message}`);
    }

    // Check if purchase qualifies for auto-approval
    const autoApprovalLimit = project.auto_approval_limit || 0
    const shouldAutoApprove = purchase.amount <= autoApprovalLimit

    if (shouldAutoApprove) {
      // Auto-approve the purchase
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'system',
          approval_notes: 'Auto-approved based on project settings'
        })
        .eq('id', purchaseId)

      if (updateError) {
        throw new Error(`Failed to auto-approve purchase: ${updateError.message}`);
      }

      return createSuccessResponse({
        approved: true,
        message: 'Purchase auto-approved successfully'
      });
    } else {
      // Mark for manual approval
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          status: 'pending_approval',
          requires_manual_approval: true
        })
        .eq('id', purchaseId)

      if (updateError) {
        throw new Error(`Failed to update purchase status: ${updateError.message}`);
      }

      return createSuccessResponse({
        approved: false,
        message: 'Purchase requires manual approval'
      });
    }

  } catch (error: any) {
    console.error('Auto-approval error:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
})

