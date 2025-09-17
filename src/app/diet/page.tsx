'use client'

import { useState, useEffect } from 'react'
import { createMeal, getTodaysMeals } from '@/lib/meals'
import { parseMeal, formatParsedMeal } from '@/lib/parseMeal'
import { Meal } from '@/types/meals'

export default function DietPage() {
  const [mealText, setMealText] = useState('')
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load today's meals on mount
  useEffect(() => {
    loadTodaysMeals()
  }, [])

  async function loadTodaysMeals() {
    setLoading(true)
    setError(null)
    try {
      const meals = await getTodaysMeals()
      setTodaysMeals(meals)
    } catch (err) {
      console.error('Failed to load meals:', err)
      setError('Failed to load today\'s meals')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!mealText.trim()) {
      setError('Please enter a meal description')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Parse the meal using our mock AI function
      const parsed = await parseMeal(mealText)

      // Save to Supabase
      await createMeal({
        raw_text: mealText,
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        fat: parsed.fat
      })

      // Clear input and reload meals
      setMealText('')
      await loadTodaysMeals()
    } catch (err) {
      console.error('Failed to save meal:', err)
      setError('Failed to save meal. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate daily totals
  const dailyTotals = todaysMeals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Diet Tracker</h1>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="meal-input" className="block text-sm font-medium text-gray-700 mb-2">
                What did you eat?
              </label>
              <input
                id="meal-input"
                type="text"
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                placeholder="e.g., Grilled chicken breast with rice and vegetables"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving...' : 'Add Meal'}
            </button>
          </form>
        </div>

        {/* Today's Meals */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today&apos;s Meals</h2>

          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading meals...</div>
          ) : todaysMeals.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No meals logged today</div>
          ) : (
            <div className="space-y-3">
              {todaysMeals.map((meal) => (
                <div key={meal.id} className="border-b border-gray-200 pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{meal.raw_text}</p>
                      <div className="text-sm text-gray-600 mt-1">
                        {meal.calories ? (
                          <span className="inline-flex gap-3">
                            <span>{meal.calories} cal</span>
                            {meal.protein !== null && <span>{meal.protein}g protein</span>}
                            {meal.carbs !== null && <span>{meal.carbs}g carbs</span>}
                            {meal.fat !== null && <span>{meal.fat}g fat</span>}
                          </span>
                        ) : (
                          <span className="text-gray-400">Nutrition info not available</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(meal.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Totals */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Daily Totals</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-3xl font-bold">{dailyTotals.calories}</div>
              <div className="text-sm opacity-90">Calories</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{dailyTotals.protein}g</div>
              <div className="text-sm opacity-90">Protein</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{dailyTotals.carbs}g</div>
              <div className="text-sm opacity-90">Carbs</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{dailyTotals.fat}g</div>
              <div className="text-sm opacity-90">Fat</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}