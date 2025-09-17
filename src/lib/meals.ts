/**
 * Helper functions for meal operations
 */

import { supabase } from './supabaseClient'
import { Meal, MealInsert, MealUpdate, MealFilters, MealStats } from '../types/meals'

/**
 * Create a new meal entry
 */
export async function createMeal(meal: Omit<MealInsert, 'user_id'>) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('meals')
    .insert({
      ...meal,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all meals for the current user
 */
export async function getUserMeals(filters?: MealFilters) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  let query = supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from)
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  if (filters?.has_nutrition === true) {
    query = query.not('calories', 'is', null)
      .not('protein', 'is', null)
      .not('carbs', 'is', null)
      .not('fat', 'is', null)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Meal[]
}

/**
 * Get a single meal by ID
 */
export async function getMealById(id: string) {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Meal
}

/**
 * Update a meal
 */
export async function updateMeal(id: string, updates: MealUpdate) {
  const { data, error } = await supabase
    .from('meals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Meal
}

/**
 * Delete a meal
 */
export async function deleteMeal(id: string) {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Get daily meal statistics
 */
export async function getDailyStats(date: string): Promise<MealStats> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('meals')
    .select('calories, protein, carbs, fat')
    .eq('user_id', user.id)
    .gte('created_at', startOfDay.toISOString())
    .lte('created_at', endOfDay.toISOString())

  if (error) throw error

  const stats: MealStats = {
    total_calories: 0,
    total_protein: 0,
    total_carbs: 0,
    total_fat: 0,
    meal_count: data?.length || 0,
    date
  }

  if (data) {
    data.forEach(meal => {
      stats.total_calories += meal.calories || 0
      stats.total_protein += meal.protein || 0
      stats.total_carbs += meal.carbs || 0
      stats.total_fat += meal.fat || 0
    })
  }

  return stats
}

/**
 * Get meals for today
 */
export async function getTodaysMeals() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return getUserMeals({
    date_from: today.toISOString()
  })
}

/**
 * Search meals by text
 */
export async function searchMeals(searchText: string) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .ilike('raw_text', `%${searchText}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Meal[]
}