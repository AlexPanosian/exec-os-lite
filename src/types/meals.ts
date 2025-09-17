/**
 * TypeScript types for the meals table in Supabase
 */

/**
 * Represents a meal entry in the database
 */
export interface Meal {
  id: string
  user_id: string
  created_at: string
  raw_text: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

/**
 * Type for creating a new meal (omits auto-generated fields)
 */
export type MealInsert = Omit<Meal, 'id' | 'created_at'> & {
  created_at?: string
}

/**
 * Type for updating a meal (all fields optional except id)
 */
export type MealUpdate = Partial<Omit<Meal, 'id' | 'user_id' | 'created_at'>>

/**
 * Type for meal query filters
 */
export interface MealFilters {
  user_id?: string
  date_from?: string
  date_to?: string
  has_nutrition?: boolean
}

/**
 * Aggregate statistics for meals
 */
export interface MealStats {
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meal_count: number
  date?: string // For daily aggregates
}

/**
 * Type guard to check if a meal has complete nutritional information
 */
export function hasNutritionInfo(meal: Meal): boolean {
  return (
    meal.calories !== null &&
    meal.protein !== null &&
    meal.carbs !== null &&
    meal.fat !== null
  )
}

/**
 * Calculate macro percentages from a meal
 */
export function calculateMacroPercentages(meal: Meal): {
  proteinPercent: number | null
  carbsPercent: number | null
  fatPercent: number | null
} | null {
  if (!hasNutritionInfo(meal)) {
    return null
  }

  const proteinCalories = (meal.protein ?? 0) * 4
  const carbsCalories = (meal.carbs ?? 0) * 4
  const fatCalories = (meal.fat ?? 0) * 9
  const totalMacroCalories = proteinCalories + carbsCalories + fatCalories

  if (totalMacroCalories === 0) {
    return null
  }

  return {
    proteinPercent: Math.round((proteinCalories / totalMacroCalories) * 100),
    carbsPercent: Math.round((carbsCalories / totalMacroCalories) * 100),
    fatPercent: Math.round((fatCalories / totalMacroCalories) * 100)
  }
}

/**
 * Format meal date for display
 */
export function formatMealDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    if (diffMinutes < 1) return 'Just now'
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  }

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString()
}