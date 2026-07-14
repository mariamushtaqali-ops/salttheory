'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { RecipeOutput } from '@/types'
import { track } from '@/lib/track'
import SignupSlideOver from '@/components/ui/SignupSlideOver'

const OCCASIONS = ['Any', 'Weeknight', 'Weekend', 'Dinner party', 'Eid', 'Dawat', 'Tiffin', 'Iftar', 'Wedding']
const CUISINES  = ['Any cuisine', 'South Asian', 'Middle Eastern', 'Southeast Asian', 'East Asian', 'Mediterranean', 'Western', 'Fusion']
const SERVINGS  = ['1–2', '4–6', '8–10', '20+', '40+', 'Custom']
const DIETARY   = ['Halal', 'Vegetarian', 'Vegan', 'No dairy', 'Gluten free', 'Nut free', 'Low carb']

function ChipGroup({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`chip ${value === opt ? 'active' : ''}`}>
          {opt}
        </button>
      ))}
    </div>
  )
}

function downloadRecipePDF(recipe: RecipeOutput) {
  const lines: string[] = []
  lines.push(`SALT THEORY — RECIPE`)
  lines.push(`${'='.repeat(50)}`)
  lines.push(``)
  lines.push(recipe.title.toUpperCase())
  lines.push(`Serves: ${recipe.servings}  |  Cuisine: ${recipe.cuisine}  |  Occasion: ${recipe.occasion}`)
  lines.push(``)
  lines.push(`INGREDIENTS`)
  lines.push(`${'-'.repeat(40)}`)
  recipe.ingredients.forEach(ing => {
    lines.push(`  ${ing.name.padEnd(28)} ${ing.quantity}`)
  })
  lines.push(``)
  lines.push(`METHOD`)
  lines.push(`${'-'.repeat(40)}`)
  recipe.method.forEach((step, i) => {
    lines.push(`${i + 1}. ${step}`)
    lines.push(``)
  })
  if (recipe.serving_notes) {
    lines.push(`SERVING NOTES`)
    lines.push(`${'-'.repeat(40)}`)
    lines.push(recipe.serving_notes)
    lines.push(``)
  }
  if (recipe.cost_estimate) {
    lines.push(`COST ESTIMATE`)
    lines.push(`${'-'.repeat(40)}`)
    lines.push(`  Total cost:       PKR ${recipe.cost_estimate.total_cost}`)
    lines.push(`  Cost per serving: PKR ${recipe.cost_estimate.cost_per_serving}`)
    lines.push(`  Suggested price:  PKR ${recipe.cost_estimate.suggested_price}`)
    lines.push(`  Margin:           ${recipe.cost_estimate.margin_pct}%`)
    lines.push(`  * AI estimate — actual costs may vary`)
  }
  lines.push(``)
  lines.push(`salttheorylab.com`)

  const text = lines.join('\n')
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${recipe.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Recipe downloaded!')
}

export default function RecipeForm({ canGenerate, usageCount, hasCosting, isAnon = false }: {
  canGenerate: boolean; usageCount: number; hasCosting: boolean; isAnon?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading]               = useState(false)
  const [dish, setDish]                     = useState('')
  const [occasion, setOccasion]             = useState('Any')
  const [cuisine, setCuisine]               = useState('Any cuisine')
  const [servings, setServings]             = useState('4–6')
  const [customServings, setCustomServings] = useState('')
  const [dietary, setDietary]               = useState('Halal')
  const [onHand, setOnHand]                 = useState('')
  const [includeCost, setIncludeCost]       = useState(false)
  const [result, setResult]                 = useState<RecipeOutput | null>(null)
  const [firstSuccess, setFirstSuccess]     = useState(false)
  const [showSignupPanel, setShowSignupPanel] = useState(false)

  useEffect(() => {
    track('Recipe Studio opened', { anon: isAnon })
  }, [isAnon])

  const finalServings = servings === 'Custom'
    ? (customServings ? `${customServings} people` : '4–6')
    : servings

  function requestSignup(trigger: string) {
    setShowSignupPanel(true)
    track('Signup panel shown', { trigger, tool: 'recipe' })
  }

  async function handleGenerate() {
    if (!dish.trim()) { toast.error('Please enter a dish name'); return }
    if (!canGenerate) {
      if (isAnon) { requestSignup('recipe_limit_reached'); return }
      toast.error('Upgrade to continue — free limit reached'); return
    }
    if (servings === 'Custom' && !customServings) { toast.error('Please enter number of guests'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dish, occasion, cuisine, servings: finalServings, dietary, onHand, includeCost }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data.recipe)
      toast.success('Recipe generated!')
      track('Recipe completed', { anon: isAnon })
      if (isAnon) {
        requestSignup('recipe_completed')
      } else if (usageCount === 0) {
        setFirstSuccess(true)
      }
      router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleDownloadClick(recipe: RecipeOutput) {
    if (isAnon) {
      track('Export attempted', { tool: 'recipe', anon: true })
      requestSignup('download')
      return
    }
    downloadRecipePDF(recipe)
  }

  return (
    <div>
      <div className="card p-5 mb-3">
        <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Dish name</label>
        <input className="input mb-4" type="text" placeholder="e.g. Nihari, Burger, Pad Thai…"
          value={dish} onChange={e => setDish(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGenerate()} />

        <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Occasion</label>
        <ChipGroup options={OCCASIONS} value={occasion} onChange={setOccasion} />

        <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Cuisine</label>
        <ChipGroup options={CUISINES} value={cuisine} onChange={setCuisine} />

        <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Serves</label>
        <ChipGroup options={SERVINGS} value={servings}
          onChange={v => { setServings(v); if (v !== 'Custom') setCustomServings('') }} />
        {servings === 'Custom' && (
          <div className="mb-4 -mt-2">
            <input className="input" type="number" placeholder="Enter number of guests e.g. 120"
              value={customServings} onChange={e => setCustomServings(e.target.value)} autoFocus />
          </div>
        )}

        <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Dietary</label>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {DIETARY.map(opt => (
            <button key={opt} type="button" onClick={() => setDietary(opt)}
              className={`chip ${dietary === opt ? (opt === 'Halal' ? 'active-g' : 'active') : ''}`}>
              {opt}
            </button>
          ))}
        </div>

        <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">
          Ingredients on hand <span className="font-normal normal-case tracking-normal text-[#C4B8AE]">(optional)</span>
        </label>
        <input className="input" type="text" placeholder="e.g. chicken, tomatoes, ginger…"
          value={onHand} onChange={e => setOnHand(e.target.value)} />
      </div>



      <button onClick={handleGenerate} disabled={loading || !canGenerate}
        className="btn-primary w-full py-3.5 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Creating your recipe…' : '✦ Create Recipe'}
      </button>

      {!canGenerate && !isAnon && (
        <p className="text-center text-[12px] text-muted mt-3">
          You have used {usageCount} free recipes.{' '}
          <a href="/account" className="text-orange font-bold">Upgrade to Pro →</a>
        </p>
      )}

      {!canGenerate && isAnon && (
        <p className="text-center text-[12px] text-muted mt-3">
          Ready to build your restaurant operating system?{' '}
          <a href="/auth/signup" className="text-orange font-bold">Create your free account →</a>
        </p>
      )}

      {firstSuccess && result && !isAnon && (
        <div className="card p-5 mt-4 text-center bg-cream border-green/30">
          {hasCosting ? (
            <>
              <p className="font-serif text-[18px] text-ink mb-1">Excellent.</p>
              <p className="text-[13px] text-muted leading-relaxed max-w-[420px] mx-auto mb-4">
                Now you have both a documented recipe and an accurate costing. You're already building a business instead of just cooking.
              </p>
              <a href="/dashboard" className="btn-primary px-6 py-2.5 text-[13px] inline-flex">Back to Dashboard</a>
            </>
          ) : (
            <>
              <p className="font-serif text-[18px] text-ink mb-1">Nicely done.</p>
              <p className="text-[13px] text-muted leading-relaxed max-w-[420px] mx-auto mb-4">
                That's your first documented recipe. Next, find out exactly what it costs to make.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href="/plate-profit" className="btn-primary px-6 py-2.5 text-[13px]">Cost This Dish</a>
                <a href="/dashboard" className="btn-secondary px-6 py-2.5 text-[13px]">Back to Dashboard</a>
              </div>
            </>
          )}
        </div>
      )}

      {result && <RecipeResult recipe={result} onDownload={() => handleDownloadClick(result)} />}

      {isAnon && showSignupPanel && result && (
        <div className="mt-4">
          <SignupSlideOver onContinueExploring={() => {
            setShowSignupPanel(false)
            track('Continue Exploring selected', { tool: 'recipe' })
          }} />
        </div>
      )}
    </div>
  )
}

function RecipeResult({ recipe, onDownload }: { recipe: RecipeOutput; onDownload: () => void }) {
  return (
    <div className="card p-5 mt-4">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <div className="eyebrow mb-2">Recipe Studio</div>
          <h2 className="font-serif text-2xl text-ink">{recipe.title}</h2>
        </div>
        <button onClick={onDownload}
          className="flex-shrink-0 flex items-center gap-1.5 border border-border rounded-full
                     px-3 py-1.5 text-[11px] font-bold text-muted hover:border-orange hover:text-orange transition-colors">
          ↓ Download
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[recipe.cuisine, recipe.occasion, `Serves ${recipe.servings}`].filter(Boolean).map(tag => (
          <span key={tag} className="text-[10px] font-bold uppercase tracking-wide
                                     bg-cream border border-border rounded-full px-3 py-1 text-muted">
            {tag}
          </span>
        ))}
      </div>

      <div className="border-t border-border pt-4 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-3">Ingredients</p>
        <div className="space-y-0">
          {recipe.ingredients.map((ing, i) => (
            <div key={i} className="flex justify-between text-[13px] py-2 border-b border-border last:border-none">
              <span className="text-ink">{ing.name}</span>
              <span className="text-muted font-medium">{ing.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-4 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-3">Method</p>
        <ol className="space-y-3">
          {recipe.method.map((step, i) => (
            <li key={i} className="flex gap-3 text-[13px] text-ink leading-relaxed">
              <span className="font-serif text-[18px] text-orange flex-shrink-0 leading-tight">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {recipe.serving_notes && (
        <div className="bg-cream rounded-[10px] p-4 text-[13px] text-muted italic leading-relaxed">
          {recipe.serving_notes}
        </div>
      )}

      {recipe.cost_estimate && (
        <div className="border-t border-border mt-4 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-3">Cost estimate</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total cost',      value: `PKR ${recipe.cost_estimate.total_cost}` },
              { label: 'Per serving',     value: `PKR ${recipe.cost_estimate.cost_per_serving}` },
              { label: 'Suggested price', value: `PKR ${recipe.cost_estimate.suggested_price}` },
            ].map(stat => (
              <div key={stat.label} className="bg-cream rounded-[10px] p-3 text-center">
                <p className="font-serif text-[18px] text-orange">{stat.value}</p>
                <p className="text-[10px] text-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-2 text-center">* AI estimate — actual costs may vary</p>
        </div>
      )}
    </div>
  )
}
