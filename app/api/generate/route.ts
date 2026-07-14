import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { LIMITS } from '@/types'
import { getAnonId, getAnonUsage, markAnonUsed } from '@/lib/anon'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let anonId: string | null = null
    if (!user) {
      anonId = getAnonId()
      const usage = await getAnonUsage(anonId)
      if (usage.recipe_used) {
        return NextResponse.json({ error: 'Free recipe already used — create a free account to continue' }, { status: 403 })
      }
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier, recipe_count')
        .eq('id', user.id)
        .single()

      if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

      const limit = LIMITS[profile.tier as 'free' | 'pro'].recipes
      if (profile.recipe_count >= limit) {
        return NextResponse.json({ error: 'Usage limit reached' }, { status: 403 })
      }
    }

    const { dish, occasion, cuisine, servings, dietary, onHand, includeCost } = await req.json()

    const prompt = `You are a professional chef. Generate a complete recipe. Keep ingredient list to max 12 items and method to max 8 steps to stay concise.

Dish: ${dish}
${occasion && occasion !== 'Any' ? `Occasion: ${occasion}` : ''}
${cuisine && cuisine !== 'Any cuisine' ? `Cuisine: ${cuisine}` : ''}
Serves: ${servings}
Dietary: ${dietary}
${onHand ? `Ingredients on hand: ${onHand}` : ''}

Return ONLY valid JSON, no markdown, no extra text:
{"title":"Recipe name","servings":"${servings}","cuisine":"Cuisine type","occasion":"${occasion || 'General'}","ingredients":[{"name":"ingredient","quantity":"amount"}],"method":["Step 1","Step 2"],"serving_notes":"How to serve"${includeCost ? `,"cost_estimate":{"type":"ai","total_cost":0,"cost_per_serving":0,"suggested_price":0,"margin_pct":0}` : ''}}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'API error' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')

    const cleaned = text.replace(/```json|```/g, '').trim()
    const recipe = JSON.parse(cleaned)

    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('recipe_count').eq('id', user.id).single()

      await supabase.from('recipes').insert({
        user_id: user.id,
        dish_name: dish,
        occasion: occasion || '',
        cuisine: cuisine || '',
        servings,
        dietary: [dietary],
        ingredients_on_hand: onHand || null,
        output: recipe,
      })

      await supabase
        .from('profiles')
        .update({ recipe_count: (profile?.recipe_count ?? 0) + 1 })
        .eq('id', user.id)
    } else if (anonId) {
      // Anonymous — no account to attach this to yet, so we don't persist
      // it to `recipes`. Just mark the one free use as spent.
      await markAnonUsed(anonId, 'recipe_used')
    }

    return NextResponse.json({ recipe })

  } catch (e: any) {
    console.error('Recipe generation error:', e?.message || e)
    return NextResponse.json({ error: e?.message || 'Generation failed' }, { status: 500 })
  }
}
