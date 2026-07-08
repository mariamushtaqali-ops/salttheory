import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LIMITS } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('tier, costing_count')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const limit = LIMITS[profile.tier as 'free' | 'pro'].costings
    if (profile.costing_count >= limit) {
      return NextResponse.json({ error: 'Usage limit reached' }, { status: 403 })
    }

    const { dishName, ingredients, sellingPrice, totalCost, profit, marginPct, packaging } = await req.json()

    if (!dishName) {
      return NextResponse.json({ error: 'dishName required' }, { status: 400 })
    }

    const { error: insertError } = await supabase.from('costings').insert({
      user_id: user.id,
      dish_name: dishName,
      ingredients: ingredients || [],
      packaging_cost: packaging || 0,
      selling_price: sellingPrice || 0,
      total_cost: totalCost || 0,
      profit: profit || 0,
      margin_pct: marginPct || 0,
    })

    if (insertError) {
      console.error('Costing insert error:', insertError)
      return NextResponse.json({ error: 'Could not save costing' }, { status: 500 })
    }

    await supabase
      .from('profiles')
      .update({ costing_count: profile.costing_count + 1 })
      .eq('id', user.id)

    return NextResponse.json({ success: true })

  } catch (e: any) {
    console.error('Costing save error:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Save failed' }, { status: 500 })
  }
}
