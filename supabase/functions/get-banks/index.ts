import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const PAYSTACK_SECRET_KEY = 'sk_live_80b21' // Your secret key

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get list of banks from Paystack
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!data.status) {
      throw new Error(data.message || 'Failed to fetch banks')
    }

    // Filter Nigerian banks
    const nigerianBanks = data.data.filter((bank: any) => 
      bank.country === 'Nigeria' && bank.active === true
    ).map((bank: any) => ({
      name: bank.name,
      code: bank.code,
      slug: bank.slug
    }))

    return new Response(JSON.stringify({
      success: true,
      data: nigerianBanks
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Get banks error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})