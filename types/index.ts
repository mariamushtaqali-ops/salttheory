export type Tier = 'free' | 'pro'

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  tier: Tier
  role: 'home_cook' | 'home_business' | 'caterer' | 'restaurant' | null
  recipe_count: number
  costing_count: number
  billing_date: string | null
  is_admin: boolean
  created_at: string
  safepay_subscription_id: string | null
}

export interface Recipe {
  id: string
  user_id: string
  dish_name: string
  occasion: string
  cuisine: string
  servings: string
  dietary: string[]
  ingredients_on_hand: string | null
  output: RecipeOutput
  created_at: string
}

export interface RecipeOutput {
  title: string
  servings: string
  cuisine: string
  occasion: string
  ingredients: { name: string; quantity: string }[]
  method: string[]
  serving_notes: string
  cost_estimate?: CostEstimate
}

export interface CostEstimate {
  type: 'ai' | 'manual'
  total_cost: number
  cost_per_serving: number
  suggested_price: number
  margin_pct: number
  breakdown?: { ingredient: string; estimated_cost: number }[]
}

export interface Costing {
  id: string
  user_id: string
  dish_name: string
  ingredients: { name: string; cost: number }[]
  packaging_cost: number
  selling_price: number
  total_cost: number
  profit: number
  margin_pct: number
  created_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  published: boolean
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  source: string
  created_at: string
}

// Usage limits per tier
export const LIMITS: Record<Tier, { recipes: number; costings: number }> = {
  free: { recipes: 5, costings: 3 },
  pro:  { recipes: 30, costings: Infinity },
}
