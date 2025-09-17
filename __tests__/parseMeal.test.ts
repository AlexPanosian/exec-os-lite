import { parseMeal, formatParsedMeal, calculateTotals, ParsedMeal } from '../src/lib/parseMeal'

describe('parseMeal', () => {
  it('should parse a simple meal with known foods', async () => {
    const result = await parseMeal('chicken and rice')

    expect(result.calories).toBeGreaterThan(0)
    expect(result.protein).toBeGreaterThan(0)
    expect(result.carbs).toBeGreaterThan(0)
    expect(result.fat).toBeDefined()

    // Chicken (165 cal) + Rice (205 cal) = 370 cal
    expect(result.calories).toBe(370)
    expect(result.protein).toBe(35) // 31 + 4
    expect(result.carbs).toBe(45) // 0 + 45
    expect(result.fat).toBe(4) // 4 + 0
  })

  it('should handle quantity modifiers', async () => {
    const result = await parseMeal('two eggs with toast')

    // Should detect eggs, toast and bread (toast triggers both)
    expect(result.calories).toBeGreaterThan(200)
    expect(result.protein).toBeGreaterThan(10)
  })

  it('should handle "large" modifier', async () => {
    const result = await parseMeal('large salad')

    // Large salad = 20 * 1.5 = 30 cal
    expect(result.calories).toBe(30)
  })

  it('should handle multiple foods', async () => {
    const result = await parseMeal('chicken breast with broccoli and rice')

    // Should detect chicken, chicken breast, broccoli, and rice
    expect(result.calories).toBeGreaterThan(400)
    expect(result.protein).toBeGreaterThan(30)
  })

  it('should return generic estimate for unknown foods', async () => {
    const result = await parseMeal('mystery food item')

    expect(result.calories).toBeGreaterThan(0)
    expect(result.protein).toBeGreaterThan(0)
    expect(result.carbs).toBeGreaterThan(0)
    expect(result.fat).toBeGreaterThan(0)
    expect(result.confidence).toBeLessThan(0.5)
  })

  it('should handle empty input', async () => {
    const result = await parseMeal('')

    // Empty string has 1 word, so 100 + 1*50 = 150
    expect(result.calories).toBe(150)
    expect(result.confidence).toBe(0.3)
  })

  it('should calculate confidence based on matches', async () => {
    const knownFoodResult = await parseMeal('chicken rice vegetables')
    const unknownFoodResult = await parseMeal('xyz abc def')

    expect(knownFoodResult.confidence).toBeGreaterThan(unknownFoodResult.confidence!)
  })

  it('should validate macros match calories approximately', async () => {
    const result = await parseMeal('chicken and rice')

    const calculatedCalories = (result.protein! * 4) + (result.carbs! * 4) + (result.fat! * 9)
    const difference = Math.abs(calculatedCalories - result.calories!)

    // Should be within 20% tolerance
    expect(difference).toBeLessThan(result.calories! * 0.2)
  })

  it('should be case insensitive', async () => {
    const result1 = await parseMeal('CHICKEN')
    const result2 = await parseMeal('chicken')
    const result3 = await parseMeal('ChIcKeN')

    expect(result1.calories).toBe(result2.calories)
    expect(result2.calories).toBe(result3.calories)
  })
})

describe('formatParsedMeal', () => {
  it('should format a complete parsed meal', () => {
    const meal: ParsedMeal = {
      calories: 500,
      protein: 30,
      carbs: 50,
      fat: 20
    }

    const formatted = formatParsedMeal(meal)
    expect(formatted).toBe('500 cal • 30g protein • 50g carbs • 20g fat')
  })

  it('should handle partial nutritional info', () => {
    const meal: ParsedMeal = {
      calories: 300,
      protein: 20,
      carbs: null,
      fat: null
    }

    const formatted = formatParsedMeal(meal)
    expect(formatted).toBe('300 cal • 20g protein')
  })

  it('should handle no calories', () => {
    const meal: ParsedMeal = {
      calories: null,
      protein: null,
      carbs: null,
      fat: null
    }

    const formatted = formatParsedMeal(meal)
    expect(formatted).toBe('Unable to parse meal')
  })

  it('should handle only calories', () => {
    const meal: ParsedMeal = {
      calories: 250,
      protein: null,
      carbs: null,
      fat: null
    }

    const formatted = formatParsedMeal(meal)
    expect(formatted).toBe('250 cal')
  })
})

describe('calculateTotals', () => {
  it('should sum up multiple meals correctly', () => {
    const meals: ParsedMeal[] = [
      { calories: 300, protein: 20, carbs: 30, fat: 10 },
      { calories: 400, protein: 30, carbs: 40, fat: 15 },
      { calories: 200, protein: 15, carbs: 25, fat: 5 }
    ]

    const totals = calculateTotals(meals)

    expect(totals.calories).toBe(900)
    expect(totals.protein).toBe(65)
    expect(totals.carbs).toBe(95)
    expect(totals.fat).toBe(30)
  })

  it('should handle null values', () => {
    const meals: ParsedMeal[] = [
      { calories: 300, protein: null, carbs: 30, fat: null },
      { calories: null, protein: 20, carbs: null, fat: 10 }
    ]

    const totals = calculateTotals(meals)

    expect(totals.calories).toBe(300)
    expect(totals.protein).toBe(20)
    expect(totals.carbs).toBe(30)
    expect(totals.fat).toBe(10)
  })

  it('should handle empty array', () => {
    const totals = calculateTotals([])

    expect(totals.calories).toBe(0)
    expect(totals.protein).toBe(0)
    expect(totals.carbs).toBe(0)
    expect(totals.fat).toBe(0)
  })

  it('should handle all null meals', () => {
    const meals: ParsedMeal[] = [
      { calories: null, protein: null, carbs: null, fat: null },
      { calories: null, protein: null, carbs: null, fat: null }
    ]

    const totals = calculateTotals(meals)

    expect(totals.calories).toBe(0)
    expect(totals.protein).toBe(0)
    expect(totals.carbs).toBe(0)
    expect(totals.fat).toBe(0)
  })
})