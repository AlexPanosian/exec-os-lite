import { supabase } from './supabaseClient'
import { Workout, CreateWorkoutInput, UpdateWorkoutInput, WorkoutType } from '@/types/workouts'

/**
 * Create a new workout entry
 */
export async function createWorkout(input: CreateWorkoutInput): Promise<Workout> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      type: input.type,
      completed: input.completed ?? false
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating workout:', error)
    throw error
  }

  return data
}

/**
 * Get the last N workouts for the current user
 */
export async function getRecentWorkouts(limit: number = 7): Promise<Workout[]> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent workouts:', error)
    throw error
  }

  return data || []
}

/**
 * Get today's workout if it exists
 */
export async function getTodaysWorkout(): Promise<Workout | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching today\'s workout:', error)
    throw error
  }

  return data || null
}

/**
 * Update a workout (e.g., mark as completed)
 */
export async function updateWorkout(id: string, updates: UpdateWorkoutInput): Promise<Workout> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('workouts')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating workout:', error)
    throw error
  }

  return data
}

/**
 * Get the recommended workout type based on recent history
 * Cycles: push -> pull -> cardio -> push
 */
export async function getRecommendedWorkoutType(): Promise<WorkoutType> {
  try {
    const recentWorkouts = await getRecentWorkouts(7)

    if (recentWorkouts.length === 0) {
      return 'push' // Default to push if no history
    }

    // Get the most recent workout
    const lastWorkout = recentWorkouts[0]

    // Cycle through: push -> pull -> cardio -> push
    switch (lastWorkout.type) {
      case 'push':
        return 'pull'
      case 'pull':
        return 'cardio'
      case 'cardio':
        return 'push'
      default:
        return 'push'
    }
  } catch (error) {
    console.error('Error getting recommended workout:', error)
    return 'push' // Default to push on error
  }
}

/**
 * Create or update today's workout
 */
export async function saveTodaysWorkout(type: WorkoutType, completed: boolean = false): Promise<Workout> {
  // Check if today's workout already exists
  const existingWorkout = await getTodaysWorkout()

  if (existingWorkout) {
    // Update existing workout
    return updateWorkout(existingWorkout.id, { completed, type })
  } else {
    // Create new workout
    return createWorkout({ type, completed })
  }
}