import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import RecipeForm from '@/components/tools/RecipeForm'
import { LIMITS } from '@/types'

export default async function RecipeGenniePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tier, recipe_count')
    .eq('id', user.id)
    .single()

  const tier = (profile?.tier ?? 'free') as 'free' | 'pro'
  const recipeCount = profile?.recipe_count ?? 0
  const limit = LIMITS[tier].recipes
  const canGenerate = recipeCount < limit

  return (
    <AppShell userEmail={user.email}>
      <div className="mb-6">
        <div className="eyebrow mb-2">Recipe Studio</div>
        <h1 className="font-serif text-[28px] md:text-[32px] text-ink">What would you like to cook?</h1>
      </div>

      {tier === 'free' && (
        <div className="flex items-center justify-between bg-cream border border-border
                        rounded-[10px] px-4 py-2.5 mb-5 text-[12px]">
          <span className="text-muted">
            You have <span className="font-bold text-ink">{Math.max(limit - recipeCount, 0)}</span> free recipes remaining.
          </span>
          {!canGenerate && (
            <a href="/account" className="text-orange font-bold hover:underline">Unlock Unlimited →</a>
          )}
        </div>
      )}

      <RecipeForm canGenerate={canGenerate} usageCount={recipeCount} />
    </AppShell>
  )
}
