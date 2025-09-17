/**
 * Mock AI meal parser
 * This is a placeholder that simulates AI parsing of meal descriptions
 * In production, this would call an actual AI service (OpenAI, Claude, etc.)
 */

export interface ParsedMeal {
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  confidence?: number // 0-1 confidence score
}

/**
 * Mock database of common foods for simulation
 */
const mockFoodDatabase: Record<string, Partial<ParsedMeal>> = {
  // Breakfast items
  'egg': { calories: 70, protein: 6, carbs: 1, fat: 5 },
  'eggs': { calories: 140, protein: 12, carbs: 2, fat: 10 },
  'toast': { calories: 75, protein: 3, carbs: 14, fat: 1 },
  'bread': { calories: 75, protein: 3, carbs: 14, fat: 1 },
  'butter': { calories: 100, protein: 0, carbs: 0, fat: 11 },
  'oatmeal': { calories: 150, protein: 5, carbs: 27, fat: 3 },
  'banana': { calories: 105, protein: 1, carbs: 27, fat: 0 },
  'apple': { calories: 95, protein: 0, carbs: 25, fat: 0 },
  'orange': { calories: 62, protein: 1, carbs: 15, fat: 0 },
  'coffee': { calories: 2, protein: 0, carbs: 0, fat: 0 },
  'milk': { calories: 150, protein: 8, carbs: 12, fat: 8 },

  // Lunch/Dinner items
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 4 },
  'rice': { calories: 205, protein: 4, carbs: 45, fat: 0 },
  'pasta': { calories: 220, protein: 8, carbs: 43, fat: 1 },
  'salad': { calories: 20, protein: 1, carbs: 4, fat: 0 },
  'sandwich': { calories: 350, protein: 15, carbs: 35, fat: 15 },
  'burger': { calories: 540, protein: 25, carbs: 40, fat: 27 },
  'pizza': { calories: 285, protein: 12, carbs: 36, fat: 10 },
  'steak': { calories: 271, protein: 25, carbs: 0, fat: 19 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'vegetables': { calories: 50, protein: 2, carbs: 10, fat: 0 },
  'broccoli': { calories: 55, protein: 4, carbs: 11, fat: 1 },

  // Snacks
  'chips': { calories: 150, protein: 2, carbs: 15, fat: 10 },
  'cookies': { calories: 160, protein: 2, carbs: 21, fat: 8 },
  'yogurt': { calories: 100, protein: 10, carbs: 12, fat: 0 },
  'nuts': { calories: 160, protein: 7, carbs: 6, fat: 14 },
  'protein bar': { calories: 200, protein: 20, carbs: 20, fat: 7 },
  'smoothie': { calories: 250, protein: 10, carbs: 40, fat: 5 },
}

/**
 * Parse a meal description and estimate nutritional values
 * This is a mock implementation that simulates AI parsing
 *
 * @param mealDescription - Freeform text describing the meal
 * @returns Parsed nutritional information
 */
export async function parseMeal(mealDescription: string): Promise<ParsedMeal> {
  // Simulate async AI processing delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Convert to lowercase for matching
  const lowerDesc = mealDescription.toLowerCase()

  // Initialize totals
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0
  let matchCount = 0

  // Look for quantity indicators
  const quantities: Record<string, number> = {
    'two': 2,
    '2': 2,
    'three': 3,
    '3': 3,
    'four': 4,
    '4': 4,
    'double': 2,
    'large': 1.5,
    'small': 0.75,
    'half': 0.5,
  }

  // Check for each food in our mock database
  for (const [food, nutrition] of Object.entries(mockFoodDatabase)) {
    if (lowerDesc.includes(food)) {
      // Check for quantity modifiers
      let multiplier = 1
      for (const [quantityWord, value] of Object.entries(quantities)) {
        const pattern = new RegExp(`${quantityWord}\\s+${food}|${food}\\s+${quantityWord}`)
        if (pattern.test(lowerDesc)) {
          multiplier = value
          break
        }
      }

      // Add to totals
      totalCalories += (nutrition.calories || 0) * multiplier
      totalProtein += (nutrition.protein || 0) * multiplier
      totalCarbs += (nutrition.carbs || 0) * multiplier
      totalFat += (nutrition.fat || 0) * multiplier
      matchCount++
    }
  }

  // If no matches found, return a generic estimate based on description length
  if (matchCount === 0) {
    // Assume longer descriptions = bigger meals
    const words = mealDescription.split(' ').length
    const baseCals = Math.min(100 + words * 50, 800)

    return {
      calories: baseCals,
      protein: Math.round(baseCals * 0.15 / 4), // 15% from protein, 4 cal/g
      carbs: Math.round(baseCals * 0.5 / 4), // 50% from carbs, 4 cal/g
      fat: Math.round(baseCals * 0.35 / 9), // 35% from fat, 9 cal/g
      confidence: 0.3
    }
  }

  // Round values and calculate confidence
  const result: ParsedMeal = {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    confidence: Math.min(0.9, 0.3 + matchCount * 0.2)
  }

  // Validate macros roughly match calories (within 20% tolerance)
  const calculatedCals = (result.protein! * 4) + (result.carbs! * 4) + (result.fat! * 9)
  const calorieDiff = Math.abs(calculatedCals - result.calories!)

  if (calorieDiff > result.calories! * 0.2) {
    // Adjust macros proportionally if they don't match
    const ratio = result.calories! / calculatedCals
    result.protein = Math.round(result.protein! * ratio)
    result.carbs = Math.round(result.carbs! * ratio)
    result.fat = Math.round(result.fat! * ratio)
  }

  return result
}

/**
 * Helper function to format parsed meal for display
 */
export function formatParsedMeal(parsed: ParsedMeal): string {
  if (!parsed.calories) return 'Unable to parse meal'

  const parts = [`${parsed.calories} cal`]
  if (parsed.protein) parts.push(`${parsed.protein}g protein`)
  if (parsed.carbs) parts.push(`${parsed.carbs}g carbs`)
  if (parsed.fat) parts.push(`${parsed.fat}g fat`)

  return parts.join(' • ')
}

/**
 * Calculate totals from multiple parsed meals
 */
export function calculateTotals(meals: ParsedMeal[]): ParsedMeal {
  return meals.reduce((acc, meal) => ({
    calories: (acc.calories || 0) + (meal.calories || 0),
    protein: (acc.protein || 0) + (meal.protein || 0),
    carbs: (acc.carbs || 0) + (meal.carbs || 0),
    fat: (acc.fat || 0) + (meal.fat || 0),
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  })
}