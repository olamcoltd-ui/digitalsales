import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    
    // In production, verify webhook signature
    // const secretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    // const hash = await crypto.subtle.digest('SHA-512', 
    //   new TextEncoder().encode(secretKey + body)
    // )
    // if (btoa(String.fromCharCode(...new Uint8Array(hash))) !== signature) {
    //   return new Response('Unauthorized', { status: 401 })
    // }

    const event = JSON.parse(body)
    console.log('Webhook event received:', event.event)

    if (event.event === 'charge.success') {
      const { data } = event
      const metadata = data.metadata

      console.log('Processing charge success:', metadata)

      if (metadata.type === 'product_purchase') {
        await handleProductPurchase(supabaseClient, data, metadata)
      } else if (metadata.type === 'subscription') {
        await handleSubscriptionPayment(supabaseClient, data, metadata)
      }
    } else if (event.event === 'transfer.success') {
      await handleWithdrawalSuccess(supabaseClient, event.data)
    } else if (event.event === 'transfer.failed') {
      await handleWithdrawalFailed(supabaseClient, event.data)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function handleProductPurchase(supabase: any, paymentData: any, metadata: any) {
  try {
    console.log('Handling product purchase for user:', metadata.user_id)

    // Get user's current subscription to calculate commission
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (commission_rate)
      `)
      .eq('user_id', metadata.user_id)
      .eq('status', 'active')
      .single()

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', metadata.product_id)
      .single()

    if (!product) {
      console.error('Product not found:', metadata.product_id)
      return
    }

    const commissionRate = subscription?.subscription_plans?.commission_rate || 0.20
    const saleAmount = paymentData.amount / 100 // Convert from kobo
    const commissionAmount = saleAmount * commissionRate
    const adminAmount = saleAmount - commissionAmount

    console.log('Commission calculation:', {
      saleAmount,
      commissionRate,
      commissionAmount,
      adminAmount
    })

    // Record the sale
    const { error: saleError } = await supabase
      .from('sales')
      .insert([{
        product_id: metadata.product_id,
        seller_id: metadata.user_id,
        buyer_email: paymentData.customer.email,
        sale_amount: saleAmount,
        commission_amount: commissionAmount,
        admin_amount: adminAmount,
        status: 'completed',
        transaction_id: paymentData.reference
      }])

    if (saleError) {
      console.error('Error recording sale:', saleError)
      throw saleError
    }

    // Update user wallet
    const { error: walletError } = await supabase
      .rpc('update_user_wallet', {
        user_id: metadata.user_id,
        amount: commissionAmount
      })

    if (walletError) {
      console.error('Error updating wallet:', walletError)
      throw walletError
    }

    // Update product download count
    await supabase
      .from('products')
      .update({ 
        download_count: (product.download_count || 0) + 1 
      })
      .eq('id', metadata.product_id)

    // Handle referral commission if applicable
    await handleReferralCommission(supabase, metadata.user_id, commissionAmount)

    console.log('Product purchase processed successfully')

  } catch (error) {
    console.error('Error handling product purchase:', error)
    throw error
  }
}

async function handleSubscriptionPayment(supabase: any, paymentData: any, metadata: any) {
  try {
    console.log('Handling subscription payment for user:', metadata.user_id)

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', metadata.plan_id)
      .single()

    if (!plan) {
      console.error('Subscription plan not found:', metadata.plan_id)
      return
    }

    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + plan.duration_months)

    // Deactivate current subscription
    await supabase
      .from('user_subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', metadata.user_id)
      .eq('status', 'active')

    // Create new subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .insert([{
        user_id: metadata.user_id,
        plan_id: metadata.plan_id,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString()
      }])

    if (error) {
      console.error('Error creating subscription:', error)
      throw error
    }

    // Handle referral commission (25% of subscription revenue)
    const subscriptionAmount = paymentData.amount / 100
    await handleReferralSubscriptionCommission(supabase, metadata.user_id, subscriptionAmount)

    console.log('Subscription payment processed successfully')

  } catch (error) {
    console.error('Error handling subscription payment:', error)
    throw error
  }
}

async function handleWithdrawalSuccess(supabase: any, transferData: any) {
  try {
    console.log('Handling withdrawal success:', transferData.reference)

    // Update withdrawal request status
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('reference', transferData.reference)

    if (error) {
      console.error('Error updating withdrawal status:', error)
      throw error
    }

    console.log('Withdrawal success processed')

  } catch (error) {
    console.error('Error handling withdrawal success:', error)
    throw error
  }
}

async function handleWithdrawalFailed(supabase: any, transferData: any) {
  try {
    console.log('Handling withdrawal failure:', transferData.reference)

    // Update withdrawal request status and refund balance
    const { data: withdrawal } = await supabase
      .from('withdrawal_requests')
      .select('user_id, amount')
      .eq('reference', transferData.reference)
      .single()

    if (withdrawal) {
      // Update withdrawal status
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'failed',
          processed_at: new Date().toISOString(),
          admin_notes: 'Transfer failed - balance refunded'
        })
        .eq('reference', transferData.reference)

      // Refund the amount to user wallet
      await supabase
        .rpc('update_user_wallet', {
          user_id: withdrawal.user_id,
          amount: withdrawal.amount
        })
    }

    console.log('Withdrawal failure processed')

  } catch (error) {
    console.error('Error handling withdrawal failure:', error)
    throw error
  }
}

async function handleReferralCommission(supabase: any, userId: string, saleAmount: number) {
  try {
    // Get referrer information
    const { data: profile } = await supabase
      .from('profiles')
      .select('referred_by_code')
      .eq('user_id', userId)
      .single()

    if (!profile?.referred_by_code) return

    // Find referrer by referral code
    const { data: referrer } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('referral_code', profile.referred_by_code)
      .single()

    if (!referrer) return

    const referralCommission = saleAmount * 0.15 // 15% referral commission

    console.log('Processing referral commission:', {
      referrerId: referrer.user_id,
      commission: referralCommission
    })

    // Update referrer's wallet
    await supabase
      .rpc('update_user_wallet', {
        user_id: referrer.user_id,
        amount: referralCommission
      })

    // Record referral commission
    await supabase
      .from('referral_commissions')
      .insert([{
        referrer_id: referrer.user_id,
        referred_user_id: userId,
        commission_amount: referralCommission,
        commission_rate: 0.15,
        status: 'completed'
      }])

    console.log('Referral commission processed successfully')

  } catch (error) {
    console.error('Error handling referral commission:', error)
  }
}

async function handleReferralSubscriptionCommission(supabase: any, userId: string, subscriptionAmount: number) {
  try {
    // Get referrer information
    const { data: profile } = await supabase
      .from('profiles')
      .select('referred_by_code')
      .eq('user_id', userId)
      .single()

    if (!profile?.referred_by_code) return

    // Find referrer by referral code
    const { data: referrer } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('referral_code', profile.referred_by_code)
      .single()

    if (!referrer) return

    const referralCommission = subscriptionAmount * 0.25 // 25% of subscription revenue

    console.log('Processing referral subscription commission:', {
      referrerId: referrer.user_id,
      commission: referralCommission
    })

    // Update referrer's wallet
    await supabase
      .rpc('update_user_wallet', {
        user_id: referrer.user_id,
        amount: referralCommission
      })

    console.log('Referral subscription commission processed successfully')

  } catch (error) {
    console.error('Error handling referral subscription commission:', error)
  }
}