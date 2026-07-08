'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const SPOON_G: Record<string,number> = { tsp: 4, tbsp: 12, cup: 200 }

function convert(qty: number, useUnit: string, buyUnit: string, price: number, wastage: number): number {
  const usable = wastage > 0 ? qty / (1 - wastage / 100) : qty
  if (useUnit === 'g') {
    if (buyUnit === 'per kg')    return (usable / 1000) * price
    if (buyUnit === 'per 500g')  return (usable / 500)  * price
    if (buyUnit === 'per 200g')  return (usable / 200)  * price
    if (buyUnit === 'per 100g')  return (usable / 100)  * price
    if (buyUnit === 'per 50g')   return (usable / 50)   * price
    if (buyUnit === 'per piece') return usable * price
    if (buyUnit === 'per pack')  return usable * price
  }
  if (useUnit === 'kg') {
    if (buyUnit === 'per kg')   return usable * price
    if (buyUnit === 'per 500g') return (usable / 0.5) * price
  }
  if (useUnit === 'ml') {
    if (buyUnit === 'per litre') return (usable / 1000) * price
    if (buyUnit === 'per 500ml') return (usable / 500)  * price
    if (buyUnit === 'per 200ml') return (usable / 200)  * price
  }
  if (useUnit === 'litre') {
    if (buyUnit === 'per litre') return usable * price
  }
  if (['tsp','tbsp','cup'].includes(useUnit)) {
    const grams = usable * (SPOON_G[useUnit] || 10)
    if (buyUnit === 'per kg')     return (grams / 1000) * price
    if (buyUnit === 'per 500g')   return (grams / 500)  * price
    if (buyUnit === 'per 200g')   return (grams / 200)  * price
    if (buyUnit === 'per 100g')   return (grams / 100)  * price
    if (buyUnit === 'per 50g')    return (grams / 50)   * price
    if (buyUnit === 'per packet') return (grams / 100)  * price
    if (buyUnit === 'per pack')   return (grams / 100)  * price
  }
  if (useUnit === 'piece' || useUnit === 'pcs') {
    if (buyUnit === 'per dozen') return (usable / 12) * price
    if (buyUnit === 'per piece') return usable * price
    if (buyUnit === 'per pack')  return usable * price
    if (buyUnit === 'per pcs')   return usable * price
  }
  return usable * price
}

type IngMode = 'weight' | 'spoon' | 'fixed'
type Currency = 'PKR' | 'GBP' | 'AED' | 'USD' | 'CAD'

const CURRENCY_SYMBOLS: Record<Currency,string> = {
  PKR: 'Rs', GBP: '£', AED: 'AED', USD: '$', CAD: 'CA$'
}

const USE_UNITS_WEIGHT = ['g','kg','ml','litre','cup','piece','pcs']
const BUY_UNITS_WEIGHT = ['per kg','per litre','per 500g','per 200g','per 100g','per 50g','per piece','per pcs','per pack','per dozen','per bunch','per packet']
const USE_UNITS_SPOON  = ['tsp','tbsp']
const BUY_UNITS_SPOON  = ['per 50g','per 100g','per 200g','per 500g','per kg','per packet','per pack']

interface Ingredient {
  id: number; name: string; mode: IngMode
  qty: string; useUnit: string; buyUnit: string; price: string; wastage: string
  fixedCost: string; cost: number
}

interface Platform {
  id: number; label: string; custom: string; price: string
}

interface OpCosts {
  labour: string; utilities: string; transport: string
  marketing: string; packaging: string; commission: string; other: string
}

const OP_ITEMS = [
  { key: 'labour',     label: 'Labour',                     hint: 'Cook, helper, delivery staff per dish' },
  { key: 'utilities',  label: 'Utilities',                  hint: 'Gas, electricity, water per dish' },
  { key: 'transport',  label: 'Transport',                  hint: 'Delivery, fuel, rider fee per dish' },
  { key: 'marketing',  label: 'Marketing',                  hint: 'Ads, printing, promotions per dish' },
  { key: 'packaging',  label: 'Packaging',                  hint: 'Boxes, bags, containers, labels' },
  { key: 'commission', label: 'Delivery partner commission', hint: 'Commission charged by delivery partner' },
  { key: 'other',      label: 'Other',                      hint: 'Anything else not listed' },
]

const DEFAULT_PLATFORMS: Platform[] = [
  { id: 1, label: 'WhatsApp / Home orders', custom: '', price: '' },
  { id: 2, label: 'Delivery app',           custom: '', price: '' },
  { id: 3, label: 'Dine-in',               custom: '', price: '' },
  { id: 4, label: 'Wholesale / Bulk',       custom: '', price: '' },
]

let nextId = 10

function Lbl({ children }: { children?: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">{children}</p>
}

// Currency input — clean, no overflow issues
function CurrencyInput({ sym, value, onChange, placeholder = '0' }: {
  sym: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="flex rounded-[10px] border border-border bg-white overflow-hidden
                    focus-within:border-orange focus-within:shadow-[0_0_0_3px_rgba(233,107,60,0.1)]">
      <span className="flex items-center px-2.5 text-[11px] font-semibold text-muted
                       bg-light border-r border-border whitespace-nowrap select-none">
        {sym}
      </span>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 w-0 min-w-0 text-[13px] py-2.5 px-2 outline-none bg-white"
      />
    </div>
  )
}

// ── Loading screen shown briefly after "Calculate margin" ──
const ANALYZING_STEPS = [
  'Calculating ingredient costs',
  'Reviewing operating costs',
  'Comparing margins',
  'Looking for profit leaks',
  'Preparing recommendations',
]

function AnalyzingScreen() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const delays = [300, 700, 1150, 1600, 2050]
    const timers = delays.map((t, i) => setTimeout(() => setStep(i + 1), t))
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <div className="card p-8 text-center">
      <h3 className="font-serif text-[20px] text-ink mb-6">Analyzing your business…</h3>
      <div className="space-y-3 max-w-[280px] mx-auto text-left">
        {ANALYZING_STEPS.map((label, i) => (
          <div key={label}
            className={`flex items-center gap-2.5 transition-opacity duration-300 ${i < step ? 'opacity-100' : 'opacity-30'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors duration-300
              ${i < step ? 'bg-green border-green' : 'border-border'}`}>
              {i < step && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="text-[12px] text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Small count-up number, used for the Business Score ──
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    setDisplay(0)
    const duration = 700
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3)))) // ease-out cubic
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <span className={className}>{display}</span>
}

// ── Pure, deterministic business-intelligence helpers ──
// No AI — everything here is a formula derived from the same `results`
// object and `opCosts` state that the existing engine already produces.

function computeHealthScores(results: any, opCosts: OpCosts) {
  const margin = results.platResults[0]?.margin ?? 0
  const foodCostOfTotal = results.totalCost > 0 ? (results.ingCost / results.totalCost) * 100 : 0

  const pricingScore = margin >= 40 ? 10 : margin >= 30 ? 9 : margin >= 20 ? 7 : margin >= 10 ? 5 : 3
  const foodCostScore = foodCostOfTotal <= 50 ? 10 : foodCostOfTotal <= 65 ? 8 : foodCostOfTotal <= 80 ? 6 : 4

  const coreOpCost = (parseFloat(opCosts.labour) || 0) + (parseFloat(opCosts.utilities) || 0)
    + (parseFloat(opCosts.transport) || 0) + (parseFloat(opCosts.marketing) || 0) + (parseFloat(opCosts.other) || 0)
  const opCostRatio = results.totalCost > 0 ? coreOpCost / results.totalCost : 0
  const opCostScore = coreOpCost === 0 ? 5 : opCostRatio <= 0.25 ? 9 : opCostRatio <= 0.4 ? 7 : 5

  const packaging = parseFloat(opCosts.packaging) || 0
  const packagingScore = packaging > 0 ? 10 : 5

  const healthyPlats = results.platResults.filter((p: any) => p.margin >= 25).length
  const platformScore = results.platResults.length > 0
    ? Math.round((healthyPlats / results.platResults.length) * 10) : 5

  const overall = Math.round(((pricingScore + foodCostScore + opCostScore + packagingScore + platformScore) / 50) * 100)

  return { pricingScore, foodCostScore, opCostScore, packagingScore, platformScore, overall, foodCostOfTotal: Math.round(foodCostOfTotal) }
}

function starRating(overall: number) {
  if (overall >= 90) return { stars: 5, label: 'Very Healthy' }
  if (overall >= 75) return { stars: 4, label: 'Healthy' }
  if (overall >= 60) return { stars: 3, label: 'Fair' }
  if (overall >= 40) return { stars: 2, label: 'Needs Work' }
  return { stars: 1, label: 'At Risk' }
}

// Reference volume used only to translate a per-dish saving/gain into a
// monthly/annual figure. Declared explicitly in the UI as an assumption —
// not a claim about the user's actual sales.
const REFERENCE_DAILY_VOLUME = 25
const PROJECTION_VOLUMES = [10, 25, 50, 100]

function monthlyFromPerDish(perDish: number, volume = REFERENCE_DAILY_VOLUME) {
  return Math.round(perDish * volume * 30)
}

// The single most expensive ingredient and its share of total ingredient cost.
function topCostIngredient(ingBreakdown: { name: string; cost: number }[]) {
  if (!ingBreakdown.length) return null
  const totalIng = ingBreakdown.reduce((s, i) => s + i.cost, 0)
  if (totalIng === 0) return null
  const top = [...ingBreakdown].sort((a, b) => b.cost - a.cost)[0]
  return { name: top.name, cost: top.cost, pct: Math.round((top.cost / totalIng) * 100) }
}

function generateProfitLeaks(
  results: any, opCosts: OpCosts, sym: string,
  top: { name: string; cost: number; pct: number } | null
) {
  const leaks: { icon: string; title: string; desc: string; impact: string }[] = []
  const packaging = parseFloat(opCosts.packaging) || 0
  const commission = parseFloat(opCosts.commission) || 0
  const labour = parseFloat(opCosts.labour) || 0
  const foodCostPct = results.totalCost > 0 ? (results.ingCost / results.totalCost) * 100 : 0

  if (top && top.pct >= 50) {
    const saving = monthlyFromPerDish(top.cost * 0.1)
    leaks.push({
      icon: '🔥', title: 'Biggest Profit Leak',
      desc: `${top.name} accounts for ${top.pct}% of your ingredient cost.`,
      impact: `Potential monthly savings ${sym} ${saving.toLocaleString()}`,
    })
  }
  if (packaging === 0) {
    leaks.push({ icon: '⚠', title: 'Packaging missing', desc: "Ignoring packaging cost creates a fake margin, even at a few rupees per order.", impact: 'Untracked expense' })
  } else if (results.totalCost > 0 && packaging / results.totalCost > 0.15) {
    leaks.push({ icon: '⚠', title: 'Packaging cost high', desc: 'Packaging is a large share of your total cost.', impact: `${sym} ${Math.round(packaging)} per dish` })
  }
  if (!opCosts.marketing || parseFloat(opCosts.marketing) === 0) {
    leaks.push({ icon: '⚠', title: 'Marketing missing', desc: 'No marketing spend recorded — many businesses underestimate this.', impact: 'Possibly underpriced' })
  }
  if (opCosts.utilities !== '' && (parseFloat(opCosts.utilities) || 0) > 0
      && (parseFloat(opCosts.utilities) || 0) < results.totalCost * 0.02) {
    leaks.push({ icon: '⚠', title: 'Utilities very low', desc: 'Gas, electricity and water costs seem underestimated.', impact: 'Possible hidden cost' })
  }
  if (labour === 0) {
    leaks.push({ icon: '⚠', title: 'Labour missing', desc: "No cost assigned for cooking or prep time — time isn't free.", impact: 'Untracked expense' })
  } else if (results.totalCost > 0 && labour / results.totalCost <= 0.15) {
    leaks.push({ icon: '💡', title: 'Labour looks healthy', desc: 'Labour cost is well controlled relative to your total cost. Keep it there.', impact: `${sym} ${Math.round(labour)}/serving` })
  }
  if (foodCostPct > 40) {
    leaks.push({ icon: '⚠', title: 'Food cost above 40%', desc: 'Ingredients are consuming a large share of your dish cost.', impact: `${Math.round(foodCostPct)}% of total cost` })
  }
  if (commission > 0 && results.totalCost > 0 && commission / results.totalCost > 0.15) {
    leaks.push({ icon: '⚠', title: 'Delivery commission high', desc: 'Platform commissions are cutting into your margin.', impact: `${sym} ${Math.round(commission)} per dish` })
  }
  return leaks
}

function buildRecommendation(results: any, dishName: string) {
  const plats = results.platResults
  if (plats.length === 0) return null
  if (plats.length === 1) {
    const p = plats[0]
    return p.margin >= 30
      ? `${dishName} has strong margins on ${p.name}. Keep pricing consistent as your costs change, and revisit this costing if ingredient prices move.`
      : `${dishName}'s margin on ${p.name} is tighter than ideal. A small price increase or trimming operating costs would help protect your profit.`
  }
  const sorted = [...plats].sort((a: any, b: any) => b.margin - a.margin)
  const best = sorted[0], worst = sorted[sorted.length - 1]
  const gap = best.margin - worst.margin
  if (gap >= 15) {
    return `${dishName} performs well overall. ${best.name} is your most profitable channel at ${best.margin}% margin, while ${worst.name} trails at ${worst.margin}%. If you can shift orders toward ${best.name}, your profit per dish improves without changing anything else.`
  }
  return `${dishName} holds a fairly consistent margin across your platforms (${worst.margin}%–${best.margin}%). Your pricing is well balanced — the next lever is reducing ingredient or operating costs rather than changing prices.`
}

// Short version for the hero card — the fuller consultantNarrative() below
// is reserved for the dedicated "AI Restaurant Consultant" section.
function heroVerdict(results: any, top: { name: string; cost: number; pct: number } | null) {
  const margin = results.platResults[0]?.margin ?? 0
  const marginLine = margin >= 30
    ? 'Excellent margin with healthy pricing.'
    : margin >= 18
    ? 'Solid margin, with room to improve.'
    : 'Margin is tighter than ideal right now.'
  const ingredientLine = top && top.pct >= 40
    ? ` Your biggest opportunity is reducing ${top.name.toLowerCase()} cost by around 8%.`
    : ''
  const viability = margin >= 20
    ? ' This dish is commercially viable.'
    : ' This dish needs a pricing or cost adjustment to be reliably profitable.'
  return `${marginLine}${ingredientLine}${viability}`
}

// Longer, conversational "consultant" narrative — deliberately more specific
// than buildRecommendation() above, naming the actual dominant cost driver.
function consultantNarrative(
  dishName: string, results: any,
  top: { name: string; cost: number; pct: number } | null, sym: string
) {
  const margin = results.platResults[0]?.margin ?? 0
  const marginLine = margin >= 30
    ? 'Your pricing is healthy.'
    : margin >= 18
    ? 'Your pricing is workable, though there is room to improve.'
    : 'Your pricing is tighter than I\u2019d like to see.'

  let ingredientLine = ''
  let dollarLine = ''
  if (top && top.pct >= 40) {
    ingredientLine = ` However your ${top.name.toLowerCase()} cost is higher than ideal — it alone makes up ${top.pct}% of your ingredients.`
    const saving10pct = monthlyFromPerDish(top.cost * 0.1)
    dollarLine = ` If you can negotiate just a 10% better supplier price on ${top.name.toLowerCase()}, your monthly profit could increase by approximately ${sym} ${saving10pct.toLocaleString()}, assuming you sell around ${REFERENCE_DAILY_VOLUME} portions a day.`
  }

  const closing = margin >= 25
    ? `I would keep ${dishName} on the menu. Very high perceived value for the cost behind it.`
    : margin >= 12
    ? `${dishName} is worth keeping on the menu for now, but I'd revisit pricing next time ingredient costs move.`
    : `I'd hold off scaling ${dishName} until the margin improves — right now it's doing more work than it's earning.`

  return `${marginLine}${ingredientLine}${dollarLine} ${closing}`
}

function profitPotential(margin: number, foodCostPct: number) {
  if (margin >= 35 && foodCostPct <= 35) return { label: 'High', caption: 'Can scale well' }
  if (margin >= 20) return { label: 'Medium', caption: 'Scales with care' }
  return { label: 'Low', caption: 'Scaling will strain margin' }
}

function riskLevel(margin: number, foodCostPct: number) {
  if (margin >= 30 && foodCostPct <= 40) return { label: 'Low', caption: 'Healthy business' }
  if (margin >= 15) return { label: 'Medium', caption: 'Watch your costs' }
  return { label: 'High', caption: 'Margin is fragile' }
}

function menuVerdict(margin: number, foodCostPct: number) {
  if (margin >= 25 && foodCostPct <= 40) return { label: 'Definitely', icon: '🟢', desc: 'High margin, high profit, commercially viable.' }
  if (margin >= 12) return { label: 'Needs work', icon: '⚠', desc: 'Viable, but pricing or costs need attention before this is a strong menu item.' }
  return { label: 'Reconsider', icon: '❌', desc: 'At current pricing and cost, this dish is unlikely to be reliably profitable.' }
}

function businessTip(top: { name: string; cost: number; pct: number } | null, foodCostPct: number) {
  if (top && top.pct >= 60) {
    return `Since ${top.name.toLowerCase()} represents over ${top.pct}% of your ingredient cost, buying directly from a wholesaler instead of retail could meaningfully increase your margin.`
  }
  if (foodCostPct <= 35) {
    return 'Food cost is healthy. Focus on increasing average order value — add-ons, combos, or slightly larger portions at a small premium — rather than cutting costs further.'
  }
  return 'Review your top two or three ingredient costs first — small supplier or portion changes there usually move your margin more than trimming operating costs.'
}

function generateOpportunities(
  results: any, ingredients: Ingredient[], opCosts: OpCosts, sym: string
) {
  const opportunities: { title: string; desc: string; impact: string }[] = []
  const sell = results.platResults[0]?.sell ?? 0

  if (sell > 0) {
    const bump = Math.max(10, Math.round((sell * 0.03) / 5) * 5)
    const gain = monthlyFromPerDish(bump)
    opportunities.push({
      title: `Increase selling price by ${sym} ${bump}`,
      desc: 'A change this small is unlikely to cause customer resistance.',
      impact: `+${sym} ${gain.toLocaleString()}/month`,
    })
  }

  const highWastage = ingredients.filter(i => (parseFloat(i.wastage) || 0) >= 8 && i.name)
  if (highWastage.length > 0) {
    const savingPerDish = highWastage.reduce((s, i) => {
      const currentWaste = parseFloat(i.wastage) || 0
      const reducedWaste = currentWaste / 2
      const savingShare = 1 - (1 - reducedWaste / 100) / (1 - currentWaste / 100)
      return s + i.cost * savingShare
    }, 0)
    const monthlySaving = monthlyFromPerDish(savingPerDish)
    if (monthlySaving > 0) {
      const label = highWastage.length === 1 ? highWastage[0].name : `${highWastage.length} ingredients`
      opportunities.push({
        title: `Reduce wastage on ${label}`,
        desc: 'Halving your current wastage on these items adds straight to your margin.',
        impact: `Save ${sym} ${monthlySaving.toLocaleString()}/month`,
      })
    }
  }

  const packaging = parseFloat(opCosts.packaging) || 0
  if (packaging > 0) {
    const perOrderSaving = Math.round(packaging * 0.15)
    if (perOrderSaving > 0) {
      opportunities.push({
        title: 'Shop around for packaging suppliers',
        desc: 'Small suppliers often beat retail pricing at modest volume.',
        impact: `Potential saving ${sym} ${perOrderSaving}/order`,
      })
    }
  }

  return opportunities
}

function computeMonthlyProjection(sell: number, profitPerUnit: number) {
  return PROJECTION_VOLUMES.map(volume => {
    const monthlyRevenue = Math.round(sell * volume * 30)
    const monthlyProfit = Math.round(profitPerUnit * volume * 30)
    return { volume, monthlyRevenue, monthlyProfit, annualProfit: monthlyProfit * 12 }
  })
}

function platformTag(p: any, allPlats: any[]) {
  const sorted = [...allPlats].sort((a, b) => b.margin - a.margin)
  const isBest = sorted[0]?.name === p.name
  const isWorst = allPlats.length > 1 && sorted[sorted.length - 1]?.name === p.name
  const nameLower = p.name.toLowerCase()
  if (nameLower.includes('delivery') || nameLower.includes('foodpanda')) return { label: 'Commission hurting margin', tone: 'warn' as const }
  if (isBest) return { label: p.margin >= 30 ? 'Best' : 'Best available', tone: 'good' as const }
  if (isWorst) return { label: 'Lower margin', tone: 'warn' as const }
  return { label: 'Healthy', tone: 'neutral' as const }
}

// Same formula the engine already uses for minPrice (totalCost / (1 - margin)),
// just applied at three margin targets instead of one. No new calculation logic.
function computePriceTiers(totalCost: number) {
  return {
    minimum:     Math.round(totalCost / 0.70), // 30% margin
    recommended: Math.round(totalCost / 0.60), // 40% margin
    premium:     Math.round(totalCost / 0.50), // 50% margin
  }
}

const HEALTH_CATEGORIES = [
  { key: 'pricingScore',  glyph: '✦', label: 'Pricing' },
  { key: 'foodCostScore', glyph: '◎', label: 'Food Cost' },
  { key: 'opCostScore',   glyph: '⚙', label: 'Operating Costs' },
  { key: 'packagingScore',glyph: '▢', label: 'Packaging' },
  { key: 'platformScore', glyph: '↗', label: 'Platform Pricing' },
] as const

function categoryExplanation(key: string, score: number): string {
  const tier = score >= 9 ? 'great' : score >= 7 ? 'good' : score >= 5 ? 'okay' : 'weak'
  const text: Record<string, Record<string, string>> = {
    pricingScore: {
      great: 'Your pricing comfortably covers costs with room to spare.',
      good: 'Your pricing is solid, with a healthy margin.',
      okay: 'Your margin is workable but has little cushion.',
      weak: 'Pricing is too tight — costs are eating your margin.',
    },
    foodCostScore: {
      great: 'Ingredients make up a lean share of your total cost.',
      good: 'Ingredient costs are within a reasonable range.',
      okay: 'Ingredients are taking up more of your cost than ideal.',
      weak: 'Ingredients dominate your cost — worth reviewing suppliers or portions.',
    },
    opCostScore: {
      great: 'Operating costs are well controlled relative to your total cost.',
      good: 'Operating costs are reasonably in line.',
      okay: 'Operating costs are a bit high relative to total cost.',
      weak: 'Operating costs — or missing entries — need a closer look.',
    },
    packagingScore: {
      great: 'Packaging cost is accounted for in your pricing.',
      good: 'Packaging cost is accounted for in your pricing.',
      okay: 'Packaging cost looks light — double check it\u2019s accurate.',
      weak: 'No packaging cost entered — this is easy to forget and underprice.',
    },
    platformScore: {
      great: 'Every platform you sell on holds a healthy margin.',
      good: 'Most of your platforms hold a healthy margin.',
      okay: 'Some platforms are pulling your average margin down.',
      weak: 'Most platforms are underperforming on margin.',
    },
  }
  return text[key]?.[tier] ?? ''
}

export default function PlateProfitForm({ canCost, usageCount }: {
  canCost: boolean; usageCount: number
}) {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>('PKR')
  const [dishName, setDishName] = useState('')
  const [servings, setServings] = useState('1')
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id:1, name:'', mode:'weight', qty:'', useUnit:'g',    buyUnit:'per kg',   price:'', wastage:'0', fixedCost:'', cost:0 },
    { id:2, name:'', mode:'weight', qty:'', useUnit:'g',    buyUnit:'per kg',   price:'', wastage:'0', fixedCost:'', cost:0 },
    { id:3, name:'', mode:'spoon',  qty:'', useUnit:'tsp',  buyUnit:'per 100g', price:'', wastage:'0', fixedCost:'', cost:0 },
    { id:4, name:'', mode:'fixed',  qty:'', useUnit:'g',    buyUnit:'per kg',   price:'', wastage:'0', fixedCost:'', cost:0 },
  ])
  const [opCosts, setOpCosts] = useState<OpCosts>({
    labour:'', utilities:'', transport:'', marketing:'', packaging:'', commission:'', other:''
  })
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS)
  const [results, setResults] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [firstSuccess, setFirstSuccess] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    ingredients: true, operating: true, packaging: true, commission: true, other: true,
  })
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null)

  function toggleGroup(key: string) {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const sym = CURRENCY_SYMBOLS[currency]

  function calcCost(ing: Ingredient): number {
    if (ing.mode === 'fixed') return parseFloat(ing.fixedCost) || 0
    const q = parseFloat(ing.qty) || 0
    const p = parseFloat(ing.price) || 0
    const w = parseFloat(ing.wastage) || 0
    return Math.round(convert(q, ing.useUnit, ing.buyUnit, p, w) * 10) / 10
  }

  function updIng(id: number, patch: Partial<Ingredient>) {
    setIngredients(prev => prev.map(ing => {
      if (ing.id !== id) return ing
      const updated = { ...ing, ...patch }
      updated.cost = calcCost(updated)
      return updated
    }))
  }

  function addIng(mode: IngMode) {
    const id = nextId++
    const defs: Record<IngMode, Partial<Ingredient>> = {
      weight: { useUnit:'g',    buyUnit:'per kg' },
      spoon:  { useUnit:'tsp',  buyUnit:'per 100g' },
      fixed:  { useUnit:'g',    buyUnit:'per piece' },
    }
    setIngredients(prev => [...prev, {
      id, name:'', mode, qty:'', price:'', wastage:'0', fixedCost:'', cost:0,
      useUnit:'g', buyUnit:'per kg', ...defs[mode]
    }])
  }

  function removeIng(id: number) {
    setIngredients(prev => prev.filter(i => i.id !== id))
  }

  function updPlatform(id: number, patch: Partial<Platform>) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }

  function addPlatform() {
    setPlatforms(prev => [...prev, { id: nextId++, label:'custom', custom:'', price:'' }])
  }

  function calculate() {
    if (!dishName.trim()) { toast.error('Enter a dish name'); return }
    const activePlats = platforms.filter(p => parseFloat(p.price) > 0)
    if (activePlats.length === 0) { toast.error('Enter at least one selling price'); return }
    const ingCost = ingredients.reduce((s, i) => s + i.cost, 0)
    const opTotal = Object.values(opCosts).reduce((s, v) => s + (parseFloat(v) || 0), 0)
    const totalCost = Math.round(ingCost + opTotal)
    const srv = parseInt(servings) || 1
    const minPrice = Math.round(totalCost / 0.7)
    const platResults = activePlats.map(p => {
      const sell   = parseFloat(p.price) || 0
      const profit = sell - totalCost
      const margin = sell > 0 ? Math.round((profit / sell) * 100) : 0
      const name   = p.label === 'custom' ? (p.custom || 'Custom') : p.label
      return { name, sell: Math.round(sell), profit: Math.round(profit), margin, profitPerServing: Math.round(profit / srv) }
    })
    const ingBreakdown = ingredients.filter(i => i.name && i.cost > 0)
      .map(i => ({ name: i.name, cost: Math.round(i.cost) }))
    const opBreakdown = OP_ITEMS.filter(o => parseFloat(opCosts[o.key as keyof OpCosts]) > 0)
      .map(o => ({ name: o.label, cost: Math.round(parseFloat(opCosts[o.key as keyof OpCosts]) || 0) }))
    setResults({
      ingCost: Math.round(ingCost), opTotal: Math.round(opTotal),
      totalCost, costPerServing: Math.round(totalCost / srv),
      srv, ingBreakdown, opBreakdown, platResults, minPrice
    })
  }

  function handleCalculateClick() {
    if (!dishName.trim()) { toast.error('Enter a dish name'); return }
    const activePlats = platforms.filter(p => parseFloat(p.price) > 0)
    if (activePlats.length === 0) { toast.error('Enter at least one selling price'); return }
    setAnalyzing(true)
    setTimeout(() => {
      calculate()
      setAnalyzing(false)
    }, 2200)
  }

  async function handleSave() {
    if (!results || !canCost) return
    setSaving(true)
    try {
      const res = await fetch('/api/costings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName, ingredients: ingredients.filter(i => i.name),
          opCosts, sellingPrice: results.platResults[0]?.sell || 0,
          totalCost: results.totalCost, grandTotal: results.totalCost,
          profit: results.platResults[0]?.profit || 0,
          marginPct: results.platResults[0]?.margin || 0,
          packaging: parseFloat(opCosts.packaging) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Costing saved!')
      if (usageCount === 0) setFirstSuccess(true)
      router.refresh()
    } catch { toast.error('Could not save — try again') }
    finally { setSaving(false) }
  }

  const totalIngCost = Math.round(ingredients.reduce((s, i) => s + i.cost, 0))

  return (
    <div className="space-y-3">

      {/* DISH INFO */}
      <div className="card p-5">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Dish name</label>
            <input className="input" type="text" placeholder="e.g. Chicken Karahi"
              value={dishName} onChange={e => setDishName(e.target.value)} />
          </div>
          <div className="w-[80px]">
            <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Servings</label>
            <input className="input text-center" type="number" placeholder="1"
              value={servings} onChange={e => setServings(e.target.value)} />
          </div>
          <div className="w-[110px]">
            <label className="block text-[11px] font-bold uppercase tracking-[0.07em] text-muted mb-2">Currency</label>
            <select className="input text-[12px] py-[9px] cursor-pointer"
              value={currency} onChange={e => setCurrency(e.target.value as Currency)}>
              <option value="PKR">PKR</option>
              <option value="GBP">GBP £</option>
              <option value="AED">AED</option>
              <option value="USD">USD $</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>
      </div>

      {/* WEIGHT & VOLUME INGREDIENTS */}
      <div className="card p-5">
        <p className="text-[12px] font-bold text-ink mb-0.5">Weight & volume ingredients</p>
        <p className="text-[11px] text-muted mb-4">Chicken, rice, oil, vegetables, dairy, eggs</p>

        {/* Column headers */}
        <div className="grid gap-1.5 mb-1.5" style={{gridTemplateColumns:'minmax(80px,1.5fr) 60px 80px 80px minmax(110px,1fr) 70px 36px'}}>
          <Lbl>Ingredient</Lbl>
          <Lbl>Qty</Lbl>
          <Lbl>Used in</Lbl>
          <Lbl>Price</Lbl>
          <Lbl>Priced per</Lbl>
          <Lbl>Waste%</Lbl>
          <Lbl>Cost</Lbl>
        </div>

        {ingredients.filter(i => i.mode === 'weight').map(ing => (
          <div key={ing.id} className="grid gap-1.5 mb-2 items-center"
            style={{gridTemplateColumns:'minmax(80px,1.5fr) 60px 80px 80px minmax(110px,1fr) 70px 36px'}}>
            <input className="input text-[12px] py-2 px-2" type="text" placeholder="Chicken"
              value={ing.name} onChange={e => updIng(ing.id, { name: e.target.value })} />
            <input className="input text-[12px] py-2 px-1.5 text-center" type="number" placeholder="500"
              value={ing.qty} onChange={e => updIng(ing.id, { qty: e.target.value })} />
            <select className="input text-[11px] py-2 px-1 cursor-pointer"
              value={ing.useUnit} onChange={e => updIng(ing.id, { useUnit: e.target.value })}>
              {USE_UNITS_WEIGHT.map(u => <option key={u}>{u}</option>)}
            </select>
            <input className="input text-[12px] py-2 px-1.5 text-center" type="number" placeholder="480"
              value={ing.price} onChange={e => updIng(ing.id, { price: e.target.value })} />
            <select className="input text-[11px] py-2 px-1 cursor-pointer"
              value={ing.buyUnit} onChange={e => updIng(ing.id, { buyUnit: e.target.value })}>
              {BUY_UNITS_WEIGHT.map(u => <option key={u}>{u}</option>)}
            </select>
            <input className="input text-[12px] py-2 px-1.5 text-center" type="number" placeholder="0"
              value={ing.wastage} onChange={e => updIng(ing.id, { wastage: e.target.value })} />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-bold text-orange leading-none">
                {ing.cost > 0 ? Math.round(ing.cost) : '—'}
              </span>
              <button onClick={() => removeIng(ing.id)}
                className="text-[11px] text-muted hover:text-orange leading-none">✕</button>
            </div>
          </div>
        ))}
        <button onClick={() => addIng('weight')}
          className="text-[11px] text-green font-semibold hover:underline mt-1">
          + Add ingredient
        </button>
      </div>

      {/* SPICES */}
      <div className="card p-5">
        <p className="text-[12px] font-bold text-ink mb-0.5">Spices & dry ingredients</p>
        <p className="text-[11px] text-muted mb-4">Cumin, turmeric, garam masala — measured in tsp or tbsp</p>

        <div className="grid gap-1.5 mb-1.5" style={{gridTemplateColumns:'minmax(80px,1.5fr) 60px 70px 80px minmax(90px,1fr) 36px'}}>
          <Lbl>Spice</Lbl>
          <Lbl>Qty</Lbl>
          <Lbl>Unit</Lbl>
          <Lbl>Price paid</Lbl>
          <Lbl>Pack size</Lbl>
          <Lbl>Cost</Lbl>
        </div>

        {ingredients.filter(i => i.mode === 'spoon').map(ing => (
          <div key={ing.id} className="grid gap-1.5 mb-2 items-center"
            style={{gridTemplateColumns:'minmax(80px,1.5fr) 60px 70px 80px minmax(90px,1fr) 36px'}}>
            <input className="input text-[12px] py-2 px-2" type="text" placeholder="Cumin powder"
              value={ing.name} onChange={e => updIng(ing.id, { name: e.target.value })} />
            <input className="input text-[12px] py-2 px-1.5 text-center" type="number" placeholder="2"
              value={ing.qty} onChange={e => updIng(ing.id, { qty: e.target.value })} />
            <select className="input text-[11px] py-2 px-1 cursor-pointer"
              value={ing.useUnit} onChange={e => updIng(ing.id, { useUnit: e.target.value })}>
              {USE_UNITS_SPOON.map(u => <option key={u}>{u}</option>)}
            </select>
            <input className="input text-[12px] py-2 px-1.5 text-center" type="number" placeholder="85"
              value={ing.price} onChange={e => updIng(ing.id, { price: e.target.value })} />
            <select className="input text-[11px] py-2 px-1 cursor-pointer"
              value={ing.buyUnit} onChange={e => updIng(ing.id, { buyUnit: e.target.value })}>
              {BUY_UNITS_SPOON.map(u => <option key={u}>{u}</option>)}
            </select>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[11px] font-bold text-orange leading-none">
                {ing.cost > 0 ? Math.round(ing.cost) : '—'}
              </span>
              <button onClick={() => removeIng(ing.id)}
                className="text-[11px] text-muted hover:text-orange leading-none">✕</button>
            </div>
          </div>
        ))}
        <button onClick={() => addIng('spoon')}
          className="text-[11px] text-green font-semibold hover:underline mt-1">
          + Add spice
        </button>
      </div>

      {/* FIXED COST ITEMS */}
      <div className="card p-5">
        <p className="text-[12px] font-bold text-ink mb-0.5">Fixed cost items</p>
        <p className="text-[11px] text-muted mb-4">Whole lemon, coriander bunch, full masala packet — enter total cost directly</p>

        <div className="grid grid-cols-[1fr_140px_32px] gap-2 mb-1.5">
          <Lbl>Item</Lbl>
          <Lbl>Total cost ({sym})</Lbl>
          <Lbl></Lbl>
        </div>

        {ingredients.filter(i => i.mode === 'fixed').map(ing => (
          <div key={ing.id} className="grid grid-cols-[1fr_140px_32px] gap-2 mb-2 items-center">
            <input className="input text-[12px] py-2 px-2.5" type="text" placeholder="Coriander bunch"
              value={ing.name} onChange={e => updIng(ing.id, { name: e.target.value })} />
            <input className="input text-[12px] py-2 px-2.5" type="number" placeholder="30"
              value={ing.fixedCost} onChange={e => updIng(ing.id, { fixedCost: e.target.value })} />
            <button onClick={() => removeIng(ing.id)}
              className="text-[13px] text-muted hover:text-orange text-center">✕</button>
          </div>
        ))}
        <button onClick={() => addIng('fixed')}
          className="text-[11px] text-green font-semibold hover:underline mt-1">
          + Add fixed item
        </button>

        {totalIngCost > 0 && (
          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
            <span className="text-[12px] font-bold text-muted">Total ingredient cost</span>
            <span className="text-[13px] font-bold text-orange">{sym} {totalIngCost.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* OPERATING COSTS */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[12px] font-bold text-ink">Operating costs</p>
          <span className="text-[10px] bg-orange/10 text-orange font-bold px-2 py-0.5 rounded-full">
            Do not skip
          </span>
        </div>
        <p className="text-[11px] text-muted mb-4 leading-relaxed">
          Most food businesses underprice because they forget these. Enter cost per dish or divide your batch cost by number of dishes.
        </p>
        <div className="space-y-3">
          {OP_ITEMS.map(op => (
            <div key={op.key} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink">{op.label}</p>
                <p className="text-[11px] text-muted leading-tight">{op.hint}</p>
              </div>
              <div className="w-[130px] flex-shrink-0">
                <CurrencyInput
                  sym={sym}
                  value={opCosts[op.key as keyof OpCosts]}
                  onChange={v => setOpCosts(prev => ({ ...prev, [op.key]: v }))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SELLING PRICES */}
      <div className="card p-5">
        <p className="text-[12px] font-bold text-ink mb-1">Selling prices by platform</p>
        <p className="text-[11px] text-muted mb-4">Enter your price on each platform. Leave blank to skip.</p>
        <div className="space-y-3">
          {platforms.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                {p.label === 'custom' ? (
                  <input className="input text-[13px] py-2" type="text"
                    placeholder="Platform name e.g. Catering events"
                    value={p.custom} onChange={e => updPlatform(p.id, { custom: e.target.value })} />
                ) : (
                  <p className="text-[13px] font-semibold text-ink">{p.label}</p>
                )}
              </div>
              <div className="w-[130px] flex-shrink-0">
                <CurrencyInput
                  sym={sym}
                  value={p.price}
                  onChange={v => updPlatform(p.id, { price: v })}
                />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPlatform}
          className="mt-3 text-[11px] text-green font-semibold hover:underline">
          + Add custom platform
        </button>
      </div>

      {/* CALCULATE */}
      <button onClick={handleCalculateClick} disabled={!canCost || analyzing}
        className="btn-green w-full py-3.5 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed">
        ✦ Calculate margin
      </button>

      {!canCost && (
        <p className="text-center text-[12px] text-muted">
          You have used {usageCount} free costings.{' '}
          <a href="/account" className="text-orange font-bold">Upgrade to save more →</a>
        </p>
      )}

      {/* ANALYZING */}
      {analyzing && <AnalyzingScreen />}

      {/* FIRST-COSTING SUCCESS SCREEN */}
      {!analyzing && firstSuccess && results && (
        <div className="card p-6 text-center">
          <p className="text-[28px] mb-2">🎉</p>
          <h3 className="font-serif text-[22px] text-ink mb-1">Great job!</h3>
          <p className="text-[13px] text-muted mb-6">You've completed your first food costing.</p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            {(() => {
              const margin = results.platResults[0]?.margin ?? 0
              const costPct = 100 - margin
              const health = margin >= 30
                ? { label: 'Healthy margin', color: 'text-green' }
                : margin >= 20
                ? { label: 'Workable margin', color: 'text-yellow' }
                : { label: 'Needs attention', color: 'text-orange' }
              return (
                <>
                  <div className="bg-cream rounded-[10px] p-3">
                    <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Food cost %</p>
                    <p className="font-serif text-[20px] text-orange">{costPct}%</p>
                  </div>
                  <div className="bg-cream rounded-[10px] p-3">
                    <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Estimated margin</p>
                    <p className="font-serif text-[20px] text-green">{margin}%</p>
                  </div>
                  <div className="bg-cream rounded-[10px] p-3">
                    <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Recommended price</p>
                    <p className="font-serif text-[20px] text-ink">{sym} {results.minPrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-cream rounded-[10px] p-3">
                    <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Overall health</p>
                    <p className={`font-serif text-[16px] ${health.color}`}>{health.label}</p>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="border-t border-border pt-5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Next recommended step</p>
            <p className="text-[13px] text-muted mb-4">Create a matching recipe in Recipe Studio.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href="/recipe-gennie" className="btn-primary px-6 py-2.5 text-[13px]">Create Recipe</a>
              <a href="/dashboard" className="btn-secondary px-6 py-2.5 text-[13px]">Back to Dashboard</a>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {results && !firstSuccess && (() => {
        const health = computeHealthScores(results, opCosts)
        const rating = starRating(health.overall)
        const top = topCostIngredient(results.ingBreakdown)
        const leaks = generateProfitLeaks(results, opCosts, sym, top)
        const opportunities = generateOpportunities(results, ingredients, opCosts, sym)
        const recommendation = buildRecommendation(results, dishName)
        const narrative = consultantNarrative(dishName, results, top, sym)
        const heroSummary = heroVerdict(results, top)
        const priceTiers = computePriceTiers(results.totalCost)
        const primary = results.platResults[0]
        const primaryMargin = primary?.margin ?? 0
        const foodCostPct = 100 - primaryMargin
        const potential = profitPotential(primaryMargin, foodCostPct)
        const risk = riskLevel(primaryMargin, foodCostPct)
        const verdict = menuVerdict(primaryMargin, foodCostPct)
        const tip = businessTip(top, foodCostPct)
        const projection = computeMonthlyProjection(primary?.sell ?? 0, primary?.profit ?? 0)
        const healthColor = health.overall >= 75 ? 'text-green' : health.overall >= 50 ? 'text-yellow' : 'text-orange'
        const healthRing = health.overall >= 75 ? '#7A8B5C' : health.overall >= 50 ? '#F3C766' : '#E96B3C'

        const packagingItems = results.opBreakdown.filter((r: any) => r.name === 'Packaging')
        const commissionItems = results.opBreakdown.filter((r: any) => r.name === 'Delivery partner commission')
        const otherItems = results.opBreakdown.filter((r: any) => r.name === 'Other')
        const operatingItems = results.opBreakdown.filter((r: any) =>
          !['Packaging', 'Delivery partner commission', 'Other'].includes(r.name))
        const groupSum = (items: any[]) => items.reduce((s, r) => s + r.cost, 0)

        // Cost-composition pie (Ingredients / Operating / Packaging / Commission), for hover-to-highlight
        const pieSlices = [
          { key: 'ingredients', label: 'Ingredients', value: results.ingCost, color: '#E96B3C' },
          { key: 'operating',   label: 'Operating',   value: groupSum(operatingItems), color: '#7A8B5C' },
          { key: 'packaging',   label: 'Packaging',   value: groupSum(packagingItems), color: '#F3C766' },
          { key: 'commission',  label: 'Commission',  value: groupSum(commissionItems), color: '#9B6A45' },
        ].filter(s => s.value > 0)
        const pieTotal = pieSlices.reduce((s, p) => s + p.value, 0) || 1

        return (
          <div className="space-y-4 animate-fadeIn">

            {/* ── BUSINESS REVIEW HERO ──────────────────────── */}
            <div className="card p-6">
              <h3 className="font-serif text-[24px] text-ink mb-3 text-center">{dishName}</h3>

              <div className="flex flex-col items-center mb-5">
                <div className="relative w-[110px] h-[110px] flex items-center justify-center mb-2">
                  <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="55" cy="55" r="47" fill="none" stroke="#E8DDD0" strokeWidth="9" />
                    <circle cx="55" cy="55" r="47" fill="none" stroke={healthRing} strokeWidth="9"
                      strokeDasharray={`${(health.overall / 100) * 2 * Math.PI * 47} ${2 * Math.PI * 47}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.8s ease-out' }} />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <AnimatedNumber value={health.overall} className={`font-serif text-[28px] leading-none ${healthColor}`} />
                    <span className="text-[10px] text-muted">/ 100</span>
                  </div>
                </div>
                <p className={`text-[13px] font-bold ${healthColor}`}>
                  {'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)} {rating.label}
                </p>
              </div>

              <p className="text-[13px] text-ink leading-relaxed text-center max-w-[480px] mx-auto">
                {heroSummary}
              </p>
            </div>

            {/* ── EXECUTIVE CARDS ───────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="card p-4 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Food Cost</p>
                <p className={`font-serif text-[20px] ${foodCostPct <= 35 ? 'text-green' : 'text-orange'}`}>{foodCostPct}%</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${foodCostPct <= 35 ? 'text-green' : 'text-orange'}`}>
                  {foodCostPct <= 35 ? '🟢 Excellent' : foodCostPct <= 45 ? '🟠 Slightly high' : '🔴 High'}
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Margin</p>
                <p className={`font-serif text-[20px] ${primaryMargin >= 25 ? 'text-green' : 'text-orange'}`}>{primaryMargin}%</p>
                <p className={`text-[10px] font-semibold mt-0.5 ${primaryMargin >= 25 ? 'text-green' : 'text-orange'}`}>
                  {primaryMargin >= 25 ? '🟢 Excellent' : primaryMargin >= 15 ? '🟠 Workable' : '🔴 Thin'}
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Estimated Profit</p>
                <p className="font-serif text-[20px] text-ink">{sym} {(primary?.profit ?? 0).toLocaleString()}</p>
                <p className="text-[10px] text-muted mt-0.5">per {results.srv > 1 ? 'serving' : 'dish'}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Business Rating</p>
                <p className="font-serif text-[20px] text-ink">{health.overall}/100</p>
                <p className="text-[10px] text-orange mt-0.5">{'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Profit Potential</p>
                <p className="font-serif text-[18px] text-ink">{potential.label}</p>
                <p className="text-[10px] text-muted mt-0.5">{potential.caption}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Risk Level</p>
                <p className="font-serif text-[18px] text-ink">{risk.label}</p>
                <p className="text-[10px] text-muted mt-0.5">{risk.caption}</p>
              </div>
            </div>

            {/* ── BUSINESS HEALTH BREAKDOWN ─────────────────── */}
            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Business Health Breakdown</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {HEALTH_CATEGORIES.map(cat => {
                  const score = (health as any)[cat.key] as number
                  const color = score >= 8 ? 'text-green' : score >= 5 ? 'text-yellow' : 'text-orange'
                  return (
                    <div key={cat.key} className="border border-border rounded-[10px] p-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-2 text-[12px] font-bold text-ink">
                          <span className="text-orange">{cat.glyph}</span> {cat.label}
                        </span>
                        <span className={`text-[12px] font-bold ${color}`}>{score}/10</span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">{categoryExplanation(cat.key, score)}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── AI RESTAURANT CONSULTANT ──────────────────── */}
            <div className="card p-6 bg-ink">
              <p className="text-[10px] font-bold uppercase tracking-wide text-white/40 mb-3">
                What I would tell you as your restaurant consultant
              </p>
              <p className="text-[14px] text-white leading-relaxed">{narrative}</p>
            </div>

            {/* ── MARGIN BY PLATFORM ────────────────────────── */}
            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Margin by Platform</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.platResults.map((p: any) => {
                  const tag = platformTag(p, results.platResults)
                  const badgeClass = tag.tone === 'good' ? 'bg-green/15 text-green'
                    : tag.tone === 'warn' ? 'bg-orange/15 text-orange'
                    : 'bg-cream text-muted'
                  return (
                    <div key={p.name} className="border border-border rounded-[10px] p-4 hover:border-green/50 hover:shadow-sm transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-bold text-ink">{p.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>{tag.label}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted mb-1">
                        <span>Profit</span>
                        <span className="font-bold text-ink">{sym} {p.profit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted">
                        <span>Margin</span>
                        <span className={`font-bold ${p.margin >= 25 ? 'text-green' : 'text-orange'}`}>{p.margin}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── RECOMMENDED PRICING ───────────────────────── */}
            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Recommended Pricing</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-border rounded-[10px] p-4 text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Minimum Price</p>
                  <p className="font-serif text-[20px] text-ink mb-1">{sym} {priceTiers.minimum.toLocaleString()}</p>
                  <p className="text-[10px] text-muted">Lowest price you should charge</p>
                </div>
                <div className="border-2 border-green rounded-[10px] p-4 text-center relative bg-green/5">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Recommended
                  </div>
                  <p className="text-[10px] text-muted uppercase tracking-wide mb-1 mt-1">Recommended Price</p>
                  <p className="font-serif text-[20px] text-green mb-1">{sym} {priceTiers.recommended.toLocaleString()}</p>
                  <p className="text-[10px] text-muted">Best balance of sales and profit</p>
                </div>
                <div className="border border-border rounded-[10px] p-4 text-center">
                  <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Premium Price</p>
                  <p className="font-serif text-[20px] text-ink mb-1">{sym} {priceTiers.premium.toLocaleString()}</p>
                  <p className="text-[10px] text-muted">For premium positioning</p>
                </div>
              </div>
            </div>

            {/* ── BIGGEST PROFIT LEAKS ──────────────────────── */}
            {leaks.length > 0 && (
              <div className="card p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Biggest Profit Leaks</p>
                <div className="space-y-2">
                  {leaks.map((leak, i) => (
                    <div key={i} className={`flex gap-3 rounded-[10px] p-3.5 ${leak.icon === '💡' ? 'bg-green/5' : 'bg-orange/5'}`}>
                      <span className="flex-shrink-0 text-[15px]">{leak.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className="text-[12px] font-bold text-ink">{leak.title}</p>
                          <span className="text-[11px] font-bold text-orange flex-shrink-0">{leak.impact}</span>
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed">{leak.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SMART OPPORTUNITIES ───────────────────────── */}
            {opportunities.length > 0 && (
              <div className="card p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Opportunities</p>
                <p className="text-[10px] text-muted mb-3">
                  Impact estimates assume ~{REFERENCE_DAILY_VOLUME} portions/day — adjust for your own volume.
                </p>
                <div className="space-y-2">
                  {opportunities.map((op, i) => (
                    <div key={i} className="border border-green/20 bg-green/5 rounded-[10px] p-3.5">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-[12px] font-bold text-ink">{op.title}</p>
                        <span className="text-[11px] font-bold text-green flex-shrink-0">{op.impact}</span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed">{op.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TODAY'S RECOMMENDATION ────────────────────── */}
            {recommendation && (
              <div className="card p-6 bg-ink">
                <p className="text-[10px] font-bold uppercase tracking-wide text-white/40 mb-3">Today's Recommendation</p>
                <p className="text-[14px] text-white leading-relaxed">{recommendation}</p>
              </div>
            )}

            {/* ── MONTHLY PROFIT PROJECTION ─────────────────── */}
            {(primary?.sell ?? 0) > 0 && (
              <div className="card p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">Monthly Profit Projection</p>
                <p className="text-[10px] text-muted mb-3">If you sold this many portions a day, on {primary?.name}:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {projection.map(row => (
                    <div key={row.volume} className="border border-border rounded-[10px] p-3 text-center">
                      <p className="text-[11px] font-bold text-ink mb-2">{row.volume}/day</p>
                      <p className="text-[9px] text-muted uppercase tracking-wide">Revenue</p>
                      <p className="text-[13px] font-semibold text-ink mb-1.5">{sym} {row.monthlyRevenue.toLocaleString()}</p>
                      <p className="text-[9px] text-muted uppercase tracking-wide">Profit</p>
                      <p className="text-[13px] font-semibold text-green mb-1.5">{sym} {row.monthlyProfit.toLocaleString()}</p>
                      <p className="text-[9px] text-muted uppercase tracking-wide">Annual</p>
                      <p className="text-[12px] font-semibold text-orange">{sym} {row.annualProfit.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MENU RECOMMENDATION ───────────────────────── */}
            <div className="card p-5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Should this stay on your menu?</p>
              <p className="text-[18px] font-bold text-ink mb-1">{verdict.icon} {verdict.label}</p>
              <p className="text-[12px] text-muted max-w-[400px] mx-auto leading-relaxed">{verdict.desc}</p>
            </div>

            {/* ── BUSINESS TIPS ──────────────────────────────── */}
            <div className="card p-5 bg-cream border-none">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Business Tip</p>
              <p className="text-[13px] text-ink leading-relaxed">{tip}</p>
            </div>

            {/* ── COST BREAKDOWN (collapsible groups) ───────── */}
            <div className="card p-5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Cost Breakdown</p>

              {pieSlices.length > 1 && (
                <div className="flex flex-col sm:flex-row items-center gap-5 mb-4 pb-4 border-b border-border">
                  <svg width="110" height="110" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                    {(() => {
                      let offset = 0
                      const circ = 2 * Math.PI * 47
                      return pieSlices.map(slice => {
                        const frac = slice.value / pieTotal
                        const arc = frac * circ
                        const el = (
                          <circle key={slice.key} cx="55" cy="55" r="47" fill="none"
                            stroke={slice.color}
                            strokeWidth={hoveredSlice === slice.key ? 14 : 10}
                            strokeDasharray={`${arc} ${circ}`}
                            strokeDashoffset={-offset}
                            style={{ transition: 'stroke-width 0.2s ease-out', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredSlice(slice.key)}
                            onMouseLeave={() => setHoveredSlice(null)}
                          />
                        )
                        offset += arc
                        return el
                      })
                    })()}
                  </svg>
                  <div className="flex flex-col gap-1.5">
                    {pieSlices.map(slice => (
                      <div key={slice.key}
                        className={`flex items-center gap-2 text-[11px] rounded-[6px] px-1.5 py-1 transition-colors cursor-pointer
                          ${hoveredSlice === slice.key ? 'bg-cream' : ''}`}
                        onMouseEnter={() => setHoveredSlice(slice.key)}
                        onMouseLeave={() => setHoveredSlice(null)}>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: slice.color }} />
                        <span className="text-muted">{slice.label}</span>
                        <span className="font-bold text-ink">{Math.round((slice.value / pieTotal) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">

                {/* Ingredients */}
                <div className="border border-border rounded-[10px] overflow-hidden">
                  <button onClick={() => toggleGroup('ingredients')}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-cream transition-colors ${hoveredSlice === 'ingredients' ? 'bg-orange/10' : ''}`}>
                    <span className="text-[12px] font-bold text-ink">Ingredients</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-orange">{sym} {results.ingCost.toLocaleString()}</span>
                      <span className={`text-muted text-[10px] transition-transform ${openGroups.ingredients ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </button>
                  {openGroups.ingredients && (
                    <div className="px-4 pb-3 border-t border-border">
                      {results.ingBreakdown.map((r: any) => (
                        <div key={r.name} className="flex justify-between py-1.5 text-[12px]">
                          <span className="text-muted">{r.name}</span>
                          <span className="text-orange">{sym} {r.cost.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Operating Costs */}
                {operatingItems.length > 0 && (
                  <div className="border border-border rounded-[10px] overflow-hidden">
                    <button onClick={() => toggleGroup('operating')}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-cream transition-colors ${hoveredSlice === 'operating' ? 'bg-green/10' : ''}`}>
                      <span className="text-[12px] font-bold text-ink">Operating Costs</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-orange">{sym} {groupSum(operatingItems).toLocaleString()}</span>
                        <span className={`text-muted text-[10px] transition-transform ${openGroups.operating ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>
                    {openGroups.operating && (
                      <div className="px-4 pb-3 border-t border-border">
                        {operatingItems.map((r: any) => (
                          <div key={r.name} className="flex justify-between py-1.5 text-[12px]">
                            <span className="text-muted">{r.name}</span>
                            <span className="text-orange">{sym} {r.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Packaging */}
                {packagingItems.length > 0 && (
                  <div className="border border-border rounded-[10px] overflow-hidden">
                    <button onClick={() => toggleGroup('packaging')}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-cream transition-colors ${hoveredSlice === 'packaging' ? 'bg-yellow/10' : ''}`}>
                      <span className="text-[12px] font-bold text-ink">Packaging</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-orange">{sym} {groupSum(packagingItems).toLocaleString()}</span>
                        <span className={`text-muted text-[10px] transition-transform ${openGroups.packaging ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>
                    {openGroups.packaging && (
                      <div className="px-4 pb-3 border-t border-border">
                        {packagingItems.map((r: any) => (
                          <div key={r.name} className="flex justify-between py-1.5 text-[12px]">
                            <span className="text-muted">{r.name}</span>
                            <span className="text-orange">{sym} {r.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Commission */}
                {commissionItems.length > 0 && (
                  <div className="border border-border rounded-[10px] overflow-hidden">
                    <button onClick={() => toggleGroup('commission')}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-cream transition-colors ${hoveredSlice === 'commission' ? 'bg-brown/10' : ''}`}>
                      <span className="text-[12px] font-bold text-ink">Commission</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-orange">{sym} {groupSum(commissionItems).toLocaleString()}</span>
                        <span className={`text-muted text-[10px] transition-transform ${openGroups.commission ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>
                    {openGroups.commission && (
                      <div className="px-4 pb-3 border-t border-border">
                        {commissionItems.map((r: any) => (
                          <div key={r.name} className="flex justify-between py-1.5 text-[12px]">
                            <span className="text-muted">{r.name}</span>
                            <span className="text-orange">{sym} {r.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Other */}
                {otherItems.length > 0 && (
                  <div className="border border-border rounded-[10px] overflow-hidden">
                    <button onClick={() => toggleGroup('other')}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-cream transition-colors">
                      <span className="text-[12px] font-bold text-ink">Other</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-orange">{sym} {groupSum(otherItems).toLocaleString()}</span>
                        <span className={`text-muted text-[10px] transition-transform ${openGroups.other ? 'rotate-180' : ''}`}>▾</span>
                      </div>
                    </button>
                    {openGroups.other && (
                      <div className="px-4 pb-3 border-t border-border">
                        {otherItems.map((r: any) => (
                          <div key={r.name} className="flex justify-between py-1.5 text-[12px]">
                            <span className="text-muted">{r.name}</span>
                            <span className="text-orange">{sym} {r.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center bg-ink rounded-[10px] px-4 py-3.5 mt-3">
                  <span className="text-[13px] font-bold text-white">Total Cost</span>
                  <span className="font-serif text-[18px] text-white">{sym} {results.totalCost.toLocaleString()}</span>
                </div>
                {results.srv > 1 && (
                  <div className="flex justify-between px-1 text-[12px]">
                    <span className="text-muted">Cost per serving</span>
                    <span className="text-orange font-semibold">{sym} {results.costPerServing.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── SAVE ───────────────────────────────────────── */}
            <div className="card p-5">
              <div className="flex gap-3 mb-2">
                <button onClick={handleSave} disabled={saving || !canCost}
                  className="flex-1 btn-green py-2.5 text-[13px] disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save to Library'}
                </button>
                <button onClick={() => window.print()}
                  className="flex-1 border border-border rounded-full py-2.5 text-[13px]
                             font-bold text-ink hover:border-green hover:text-green transition-colors">
                  Download PDF
                </button>
              </div>
              <p className="text-[11px] text-muted text-center">
                Saved costings become available inside your Cost Library.
              </p>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
