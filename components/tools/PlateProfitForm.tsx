'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const SPOON_G: Record<string,number> = { tsp: 4, tbsp: 12, cup: 200 }

function convert(qty: number, useUnit: string, buyUnit: string, price: number, wastage: number, packQty: number): number {
  const usable = qty * (1 - wastage / 100)
  // If pack-based pricing, divide pack price by number of uses/pieces in pack
  const effectivePrice = (buyUnit.includes('pack') || buyUnit.includes('packet')) && packQty > 1
    ? price / packQty
    : price

  if (useUnit === 'g') {
    if (buyUnit === 'per kg')    return (usable / 1000) * effectivePrice
    if (buyUnit === 'per 500g')  return (usable / 500)  * effectivePrice
    if (buyUnit === 'per 200g')  return (usable / 200)  * effectivePrice
    if (buyUnit === 'per 100g')  return (usable / 100)  * effectivePrice
    if (buyUnit === 'per 50g')   return (usable / 50)   * effectivePrice
    if (buyUnit === 'per piece') return usable * effectivePrice
    if (buyUnit.includes('pack')) return usable * effectivePrice
  }
  if (useUnit === 'kg') {
    if (buyUnit === 'per kg')   return usable * effectivePrice
    if (buyUnit === 'per 500g') return (usable / 0.5) * effectivePrice
  }
  if (useUnit === 'ml') {
    if (buyUnit === 'per litre') return (usable / 1000) * effectivePrice
    if (buyUnit === 'per 500ml') return (usable / 500)  * effectivePrice
    if (buyUnit === 'per 200ml') return (usable / 200)  * effectivePrice
  }
  if (useUnit === 'litre') return usable * effectivePrice
  if (['tsp','tbsp','cup'].includes(useUnit)) {
    const grams = usable * (SPOON_G[useUnit] || 10)
    if (buyUnit === 'per kg')    return (grams / 1000) * effectivePrice
    if (buyUnit === 'per 500g')  return (grams / 500)  * effectivePrice
    if (buyUnit === 'per 200g')  return (grams / 200)  * effectivePrice
    if (buyUnit === 'per 100g')  return (grams / 100)  * effectivePrice
    if (buyUnit === 'per 50g')   return (grams / 50)   * effectivePrice
    if (buyUnit.includes('pack') || buyUnit.includes('packet')) return (grams / 100) * effectivePrice
  }
  if (useUnit === 'piece' || useUnit === 'pcs') {
    if (buyUnit === 'per dozen') return (usable / 12) * effectivePrice
    return usable * effectivePrice
  }
  return usable * effectivePrice
}

type IngMode = 'weight' | 'spoon' | 'fixed'
type Currency = 'PKR' | 'GBP' | 'AED' | 'USD' | 'CAD'
const CURRENCY_SYMBOLS: Record<Currency,string> = { PKR: 'Rs', GBP: '£', AED: 'AED', USD: '$', CAD: 'CA$' }

const USE_UNITS_WEIGHT = ['g','kg','ml','litre','cup','piece','pcs']
const BUY_UNITS_WEIGHT = ['per kg','per litre','per 500g','per 200g','per 100g','per 50g','per piece','per pcs','per pack','per dozen','per bunch','per packet']
const USE_UNITS_SPOON  = ['tsp','tbsp']
const BUY_UNITS_SPOON  = ['per 50g','per 100g','per 200g','per 500g','per kg','per packet','per pack']

interface Ingredient {
  id: number; name: string; mode: IngMode
  qty: string; useUnit: string; buyUnit: string; price: string; wastage: string
  packQty: string  // how many pieces/uses in the pack
  fixedCost: string; cost: number
}

interface Platform { id: number; label: string; custom: string; price: string }
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

function Lbl({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-1">{children}</p>
}

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
      <input type="number" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 w-0 min-w-0 text-[13px] py-2.5 px-2 outline-none bg-white" />
    </div>
  )
}

function isPackUnit(buyUnit: string) {
  return buyUnit.includes('pack') || buyUnit.includes('packet')
}

// ── PDF Export ────────────────────────────────────────────────────
function downloadCostingPDF(dishName: string, results: any, sym: string) {
  const lines: string[] = []
  lines.push('SALT THEORY — PLATE PROFIT REPORT')
  lines.push('='.repeat(50))
  lines.push('')
  lines.push(`Dish: ${dishName}`)
  lines.push(`Servings: ${results.srv}`)
  lines.push('')
  lines.push('COST BREAKDOWN')
  lines.push('-'.repeat(40))
  results.ingBreakdown.forEach((r: any) => {
    lines.push(`  ${r.name.padEnd(30)} ${sym} ${r.cost.toLocaleString()}`)
  })
  lines.push(`  ${'Total ingredients'.padEnd(30)} ${sym} ${results.ingCost.toLocaleString()}`)
  if (results.opBreakdown.length > 0) {
    lines.push('')
    lines.push('OPERATING COSTS')
    lines.push('-'.repeat(40))
    results.opBreakdown.forEach((r: any) => {
      lines.push(`  ${r.name.padEnd(30)} ${sym} ${r.cost.toLocaleString()}`)
    })
  }
  lines.push('')
  lines.push(`  ${'TOTAL COST PER DISH'.padEnd(30)} ${sym} ${results.totalCost.toLocaleString()}`)
  if (results.srv > 1) {
    lines.push(`  ${'Cost per serving'.padEnd(30)} ${sym} ${results.costPerServing.toLocaleString()}`)
  }
  lines.push('')
  lines.push('MARGIN BY PLATFORM')
  lines.push('-'.repeat(40))
  results.platResults.forEach((p: any) => {
    lines.push(`  ${p.name}`)
    lines.push(`    Selling price: ${sym} ${p.sell.toLocaleString()}`)
    lines.push(`    Profit:        ${sym} ${p.profit.toLocaleString()}`)
    lines.push(`    Margin:        ${p.margin}%${p.margin < 20 ? ' ⚠ LOW' : ''}`)
    lines.push('')
  })
  lines.push('')
  lines.push(`Minimum price for 30% margin: ${sym} ${results.minPrice.toLocaleString()}`)
  lines.push('')
  lines.push('salttheorylab.com')

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${dishName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-costing.txt`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Costing report downloaded!')
}

export default function PlateProfitForm({ canCost, usageCount }: {
  canCost: boolean; usageCount: number
}) {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>('PKR')
  const [dishName, setDishName] = useState('')
  const [servings, setServings] = useState('1')
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id:1, name:'', mode:'weight', qty:'', useUnit:'g',   buyUnit:'per kg',   price:'', wastage:'0', packQty:'', fixedCost:'', cost:0 },
    { id:2, name:'', mode:'weight', qty:'', useUnit:'g',   buyUnit:'per kg',   price:'', wastage:'0', packQty:'', fixedCost:'', cost:0 },
    { id:3, name:'', mode:'spoon',  qty:'', useUnit:'tsp', buyUnit:'per 100g', price:'', wastage:'0', packQty:'', fixedCost:'', cost:0 },
    { id:4, name:'', mode:'fixed',  qty:'', useUnit:'g',   buyUnit:'per kg',   price:'', wastage:'0', packQty:'', fixedCost:'', cost:0 },
  ])
  const [opCosts, setOpCosts] = useState<OpCosts>({
    labour:'', utilities:'', transport:'', marketing:'', packaging:'', commission:'', other:''
  })
  const [platforms, setPlatforms] = useState<Platform[]>(DEFAULT_PLATFORMS)
  const [results, setResults] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const sym = CURRENCY_SYMBOLS[currency]

  function calcCost(ing: Ingredient): number {
    if (ing.mode === 'fixed') return parseFloat(ing.fixedCost) || 0
    const q = parseFloat(ing.qty) || 0
    const p = parseFloat(ing.price) || 0
    const w = parseFloat(ing.wastage) || 0
    const pk = parseFloat(ing.packQty) || 1
    return Math.round(convert(q, ing.useUnit, ing.buyUnit, p, w, pk) * 10) / 10
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
      weight: { useUnit:'g',   buyUnit:'per kg' },
      spoon:  { useUnit:'tsp', buyUnit:'per 100g' },
      fixed:  { useUnit:'g',   buyUnit:'per piece' },
    }
    setIngredients(prev => [...prev, {
      id, name:'', mode, qty:'', price:'', wastage:'0', packQty:'', fixedCost:'', cost:0,
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
    const ingCost  = ingredients.reduce((s, i) => s + i.cost, 0)
    const opTotal  = Object.values(opCosts).reduce((s, v) => s + (parseFloat(v) || 0), 0)
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
      router.refresh()
    } catch { toast.error('Could not save — try again') }
    finally { setSaving(false) }
  }

  const totalIngCost = Math.round(ingredients.reduce((s, i) => s + i.cost, 0))

  // Donut chart values
  const donutSize = 120, donutStroke = 20
  const r = (donutSize - donutStroke) / 2
  const circ = 2 * Math.PI * r
  const primaryResult = results?.platResults?.[0]
  const costPct = primaryResult ? (100 - primaryResult.margin) : 50
  const marginPct = primaryResult ? primaryResult.margin : 50

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

      {/* WEIGHT & VOLUME */}
      <div className="card p-5">
        <p className="text-[12px] font-bold text-ink mb-0.5">Weight & volume ingredients</p>
        <p className="text-[11px] text-muted mb-4">Chicken, rice, oil, vegetables, dairy, eggs</p>
        <div className="grid gap-1.5 mb-1.5" style={{gridTemplateColumns:'minmax(80px,1.5fr) 60px 80px 80px minmax(110px,1fr) 70px 36px'}}>
          <Lbl>Ingredient</Lbl><Lbl>Qty</Lbl><Lbl>Used in</Lbl>
          <Lbl>Price</Lbl><Lbl>Priced per</Lbl><Lbl>Waste %</Lbl><Lbl>Cost</Lbl>
        </div>
        {ingredients.filter(i => i.mode === 'weight').map(ing => (
          <div key={ing.id}>
            <div className="grid gap-1.5 mb-1 items-center"
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
                <button onClick={() => removeIng(ing.id)} className="text-[11px] text-muted hover:text-orange">✕</button>
              </div>
            </div>
            {/* Pack quantity field — shows when pack/packet is selected */}
            {isPackUnit(ing.buyUnit) && (
              <div className="mb-2 ml-[calc(minmax(80px,1.5fr)+60px+80px+80px+8px)] flex items-center gap-2 pl-1">
                <p className="text-[10px] text-muted whitespace-nowrap">How many in pack?</p>
                <input className="input text-[12px] py-1.5 px-2 w-[80px]" type="number"
                  placeholder="e.g. 6"
                  value={ing.packQty} onChange={e => updIng(ing.id, { packQty: e.target.value })} />
                <p className="text-[10px] text-muted">pieces / uses</p>
              </div>
            )}
          </div>
        ))}
        <button onClick={() => addIng('weight')} className="text-[11px] text-green font-semibold hover:underline mt-1">
          + Add ingredient
        </button>
      </div>

      {/* SPICES */}
      <div className="card p-5">
        <p className="text-[12px] font-bold text-ink mb-0.5">Spices & dry ingredients</p>
        <p className="text-[11px] text-muted mb-4">Cumin, turmeric, garam masala — measured in tsp or tbsp</p>
        <div className="grid gap-1.5 mb-1.5" style={{gridTemplateColumns:'minmax(80px,1.5fr) 60px 70px 80px minmax(90px,1fr) 36px'}}>
          <Lbl>Spice</Lbl><Lbl>Qty</Lbl><Lbl>Unit</Lbl><Lbl>Price paid</Lbl><Lbl>Pack size</Lbl><Lbl>Cost</Lbl>
        </div>
        {ingredients.filter(i => i.mode === 'spoon').map(ing => (
          <div key={ing.id}>
            <div className="grid gap-1.5 mb-1 items-center"
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
                <button onClick={() => removeIng(ing.id)} className="text-[11px] text-muted hover:text-orange">✕</button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => addIng('spoon')} className="text-[11px] text-green font-semibold hover:underline mt-1">
          + Add spice
        </button>
      </div>

      {/* FIXED ITEMS */}
      <div className="card p-5">
        <p className="text-[12px] font-bold text-ink mb-0.5">Fixed cost items</p>
        <p className="text-[11px] text-muted mb-4">Whole lemon, coriander bunch, full masala packet — enter total cost directly</p>
        <div className="grid grid-cols-[1fr_140px_32px] gap-2 mb-1.5">
          <Lbl>Item</Lbl><Lbl>Total cost ({sym})</Lbl><Lbl></Lbl>
        </div>
        {ingredients.filter(i => i.mode === 'fixed').map(ing => (
          <div key={ing.id} className="grid grid-cols-[1fr_140px_32px] gap-2 mb-2 items-center">
            <input className="input text-[12px] py-2 px-2.5" type="text" placeholder="Coriander bunch"
              value={ing.name} onChange={e => updIng(ing.id, { name: e.target.value })} />
            <input className="input text-[12px] py-2 px-2.5" type="number" placeholder="30"
              value={ing.fixedCost} onChange={e => updIng(ing.id, { fixedCost: e.target.value })} />
            <button onClick={() => removeIng(ing.id)} className="text-[13px] text-muted hover:text-orange text-center">✕</button>
          </div>
        ))}
        <button onClick={() => addIng('fixed')} className="text-[11px] text-green font-semibold hover:underline mt-1">
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
          <span className="text-[10px] bg-orange/10 text-orange font-bold px-2 py-0.5 rounded-full">Do not skip</span>
        </div>
        <p className="text-[11px] text-muted mb-4 leading-relaxed">
          Most food businesses underprice because they forget these. Enter cost per dish or divide batch cost by number of dishes.
        </p>
        <div className="space-y-3">
          {OP_ITEMS.map(op => (
            <div key={op.key} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-ink">{op.label}</p>
                <p className="text-[11px] text-muted leading-tight">{op.hint}</p>
              </div>
              <div className="w-[130px] flex-shrink-0">
                <CurrencyInput sym={sym} value={opCosts[op.key as keyof OpCosts]}
                  onChange={v => setOpCosts(prev => ({ ...prev, [op.key]: v }))} />
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
                <CurrencyInput sym={sym} value={p.price} onChange={v => updPlatform(p.id, { price: v })} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPlatform} className="mt-3 text-[11px] text-green font-semibold hover:underline">
          + Add custom platform
        </button>
      </div>

      {/* CALCULATE */}
      <button onClick={calculate} disabled={!canCost}
        className="btn-green w-full py-3.5 text-[14px] disabled:opacity-50 disabled:cursor-not-allowed">
        ✦ Calculate margin
      </button>

      {!canCost && (
        <p className="text-center text-[12px] text-muted">
          You have used {usageCount} free costings.{' '}
          <a href="/account" className="text-orange font-bold">Upgrade to save more →</a>
        </p>
      )}

      {/* RESULTS */}
      {results && (
        <div className="card p-5">
          <div className="flex items-start justify-between mb-1 gap-3">
            <div>
              <h3 className="font-serif text-[22px]">{dishName}</h3>
              <p className="text-[12px] text-muted">Full breakdown · {results.srv} serving{results.srv > 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* PIE / DONUT CHART */}
          <div className="flex flex-col items-center my-5">
            <div className="relative">
              <svg width={donutSize} height={donutSize} className="-rotate-90">
                <circle cx={donutSize/2} cy={donutSize/2} r={r} fill="none" stroke="#E8DDD0" strokeWidth={donutStroke} />
                <circle cx={donutSize/2} cy={donutSize/2} r={r} fill="none" stroke="#E96B3C" strokeWidth={donutStroke}
                  strokeDasharray={`${(costPct/100)*circ} ${circ}`} strokeLinecap="round" />
                <circle cx={donutSize/2} cy={donutSize/2} r={r} fill="none" stroke="#7A8B5C" strokeWidth={donutStroke}
                  strokeDasharray={`${(marginPct/100)*circ} ${circ}`}
                  strokeDashoffset={-((costPct/100)*circ)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif text-[24px] text-green leading-none">{marginPct}%</span>
                <span className="text-[10px] text-muted">margin</span>
              </div>
            </div>
            <div className="flex gap-6 text-[12px] text-muted mt-3">
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-orange mr-1.5 align-middle" />Cost {costPct}%</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-green mr-1.5 align-middle" />Margin {marginPct}%</span>
            </div>
          </div>

          {/* COST BREAKDOWN */}
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-2">Cost breakdown</p>
          <div className="mb-5">
            {results.ingBreakdown.map((r: any) => (
              <div key={r.name} className="flex justify-between py-1.5 border-b border-border text-[12px]">
                <span className="text-muted">{r.name}</span>
                <span className="text-orange">{sym} {r.cost.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-1.5 border-b border-border text-[12px] font-semibold">
              <span className="text-muted">Total ingredients</span>
              <span className="text-orange">{sym} {results.ingCost.toLocaleString()}</span>
            </div>
            {results.opBreakdown.map((r: any) => (
              <div key={r.name} className="flex justify-between py-1.5 border-b border-border text-[12px]">
                <span className="text-muted">{r.name}</span>
                <span className="text-orange">{sym} {r.cost.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between py-2.5 border-t-2 border-border mt-1 text-[13px] font-bold">
              <span className="text-ink">Total cost per dish</span>
              <span className="text-orange">{sym} {results.totalCost.toLocaleString()}</span>
            </div>
            {results.srv > 1 && (
              <div className="flex justify-between py-1.5 text-[12px]">
                <span className="text-muted">Cost per serving</span>
                <span className="text-orange">{sym} {results.costPerServing.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* PLATFORM MARGINS */}
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted mb-3">Margin by platform</p>
          <div className="space-y-3 mb-5">
            {results.platResults.map((p: any) => {
              const barColor = p.margin >= 30 ? 'bg-green' : p.margin >= 20 ? 'bg-yellow' : 'bg-orange'
              return (
                <div key={p.name} className="border border-border rounded-[10px] p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] font-bold text-ink">{p.name}</span>
                    <span className="text-[13px] font-bold">{sym} {p.sell.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full mb-2 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${Math.max(0, Math.min(100, p.margin))}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className={`font-bold ${p.margin >= 20 ? 'text-green' : 'text-orange'}`}>
                      {p.margin}% margin
                    </span>
                    <span className="text-muted">
                      Profit: {sym} {p.profit.toLocaleString()}
                      {results.srv > 1 && ` · ${sym} ${p.profitPerServing}/serving`}
                    </span>
                  </div>
                  {p.margin < 20 && (
                    <div className="mt-2 text-[11px] text-orange bg-orange/5 rounded-[8px] p-2">
                      Low margin — for 30% margin, minimum price: {sym} {results.minPrice.toLocaleString()}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !canCost}
              className="flex-1 btn-green py-2.5 text-[13px] disabled:opacity-50">
              {saving ? 'Saving...' : 'Save costing'}
            </button>
            <button onClick={() => downloadCostingPDF(dishName, results, sym)}
              className="flex-1 border border-border rounded-full py-2.5 text-[13px]
                         font-bold text-ink hover:border-green hover:text-green transition-colors">
              ↓ Download report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
