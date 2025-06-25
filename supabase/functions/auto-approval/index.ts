import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { purchaseId } = await req.json()

    if (!purchaseId) {
      throw new Error('Purchase ID is required')
    }

    // Get purchase details
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('purchases')
      .select(`
        *,
        budget_categories(project_id)
      `)
      .eq('id', purchaseId)
      .single()

    if (purchaseError || !purchase) {
      throw new Error('Purchase not found')
    }

    // Get approval rules for this project and category
    const { data: rules, error: rulesError } = await supabaseClient
      .from('approval_rules')
      .select('*')
      .eq('project_id', purchase.budget_categories.project_id)
      .eq('is_active', true)
      .or(`category_id.eq.${purchase.category_id},category_id.is.null`)
      .order('min_amount', { ascending: false })

    if (rulesError) {
      throw new Error('Failed to fetch approval rules')
    }

    // Find applicable rule
    const applicableRule = rules?.find(rule => 
      purchase.amount >= rule.min_amount && 
      (rule.max_amount === null || purchase.amount <= rule.max_amount)
    )

    if (!applicableRule) {
      return new Response(
        JSON.stringify({ 
          autoApproved: false, 
          reason: 'No applicable approval rule found' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Check if auto-approval applies
    if (purchase.amount <= applicableRule.auto_approve_below) {
      // Auto-approve the purchase
      const { error: updateError } = await supabaseClient
        .from('purchases')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: null // System approval
        })
        .eq('id', purchaseId)

      if (updateError) {
        throw updateError
      }

      // Record the approval
      const { error: approvalError } = await supabaseClient
        .from('purchase_approvals')
        .insert({
          purchase_id: purchaseId,
          approver_id: purchase.requested_by, // Self-approval for auto-approved
          action: 'approved',
          comments: 'Auto-approved by system based on approval rules'
        })

      if (approvalError) {
        console.error('Failed to record approval:', approvalError)
      }

      return new Response(
        JSON.stringify({ 
          autoApproved: true, 
          reason: 'Amount below auto-approval threshold',
          threshold: applicableRule.auto_approve_below
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Return required approvers
    return new Response(
      JSON.stringify({ 
        autoApproved: false,
        requiredApprovers: applicableRule.approver_ids,
        requiresSequential: applicableRule.requires_sequential,
        rule: {
          minAmount: applicableRule.min_amount,
          maxAmount: applicableRule.max_amount,
          autoApproveBelow: applicableRule.auto_approve_below
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in auto-approval function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        autoApproved: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

