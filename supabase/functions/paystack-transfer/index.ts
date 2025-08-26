import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PAYSTACK_SECRET_KEY = 'sk_live_80b21' // Your secret key

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { withdrawalId, action, notes } = await req.json()

    if (!withdrawalId || !action) {
      throw new Error('Missing required parameters')
    }

    // Get withdrawal request details
    const { data: withdrawal, error: fetchError } = await supabaseClient
      .from('withdrawal_requests')
      .select(`
        *,
        profiles (user_id, full_name, email)
      `)
      .eq('id', withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      throw new Error('Withdrawal request not found')
    }

    if (action === 'approve') {
      // Create transfer recipient
      const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: withdrawal.account_name,
          account_number: withdrawal.account_number,
          bank_code: withdrawal.bank_code,
          currency: 'NGN'
        }),
      })

      const recipientData = await recipientResponse.json()

      if (!recipientData.status) {
        throw new Error(recipientData.message || 'Failed to create recipient')
      }

      // Generate unique reference
      const reference = `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Initiate transfer
      const transferResponse = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: Math.round(withdrawal.net_amount * 100), // Convert to kobo
          recipient: recipientData.data.recipient_code,
          reason: `Withdrawal from Olamco Digital Hub - ${withdrawal.profiles.full_name}`,
          reference: reference
        }),
      })

      const transferData = await transferResponse.json()

      if (!transferData.status) {
        throw new Error(transferData.message || 'Failed to initiate transfer')
      }

      // Update withdrawal request
      const { error: updateError } = await supabaseClient
        .from('withdrawal_requests')
        .update({
          status: 'processing',
          reference: reference,
          admin_notes: notes || 'Transfer initiated',
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)

      if (updateError) {
        throw updateError
      }

      // Deduct amount from user wallet
      const { error: walletError } = await supabaseClient
        .from('wallets')
        .update({
          balance: withdrawal.profiles.balance - withdrawal.amount,
          total_withdrawn: withdrawal.profiles.total_withdrawn + withdrawal.amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', withdrawal.profiles.user_id)

      if (walletError) {
        console.error('Error updating wallet:', walletError)
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Transfer initiated successfully',
        reference: reference
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })

    } else if (action === 'reject') {
      // Update withdrawal request status
      const { error: updateError } = await supabaseClient
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          admin_notes: notes || 'Withdrawal rejected by admin',
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalId)

      if (updateError) {
        throw updateError
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Withdrawal request rejected'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Transfer function error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})