'use client'

import { useState, useEffect } from 'react'
import {
  getRecommendedWorkoutType,
  getTodaysWorkout,
  saveTodaysWorkout,
  getRecentWorkouts
} from '@/lib/workouts'
import { Workout, WorkoutType } from '@/types/workouts'

// Workout descriptions
const workoutDescriptions: Record<WorkoutType, string> = {
  push: 'Push Day: Chest, Shoulders, Triceps',
  pull: 'Pull Day: Back, Biceps',
  cardio: 'Cardio Day: Running, Cycling, or HIIT'
}

// Workout emojis for visual appeal
const workoutEmojis: Record<WorkoutType, string> = {
  push: '💪',
  pull: '🏋️',
  cardio: '🏃'
}

export default function ExercisePage() {
  const [recommendedType, setRecommendedType] = useState<WorkoutType>('push')
  const [todaysWorkout, setTodaysWorkout] = useState<Workout | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load initial data
  useEffect(() => {
    loadWorkoutData()
  }, [])

  async function loadWorkoutData() {
    setLoading(true)
    setError(null)

    try {
      // Load all data in parallel
      const [recommended, today, recent] = await Promise.all([
        getRecommendedWorkoutType(),
        getTodaysWorkout(),
        getRecentWorkouts(7)
      ])

      setRecommendedType(recommended)
      setTodaysWorkout(today)
      setRecentWorkouts(recent)
    } catch (err) {
      console.error('Failed to load workout data:', err)
      setError('Failed to load workout data')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkComplete() {
    setSaving(true)
    setError(null)

    try {
      const workout = await saveTodaysWorkout(recommendedType, true)
      setTodaysWorkout(workout)

      // Reload recent workouts to update history
      const recent = await getRecentWorkouts(7)
      setRecentWorkouts(recent)
    } catch (err) {
      console.error('Failed to save workout:', err)
      setError('Failed to save workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Format date for display
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }

    // Check if it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    // Otherwise, return formatted date
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Exercise Tracker</h1>

        {/* Today's Workout */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Workout</h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading workout...</div>
          ) : (
            <div className="space-y-4">
              {/* Recommended Workout */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{workoutEmojis[recommendedType]}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recommended: {recommendedType.charAt(0).toUpperCase() + recommendedType.slice(1)}
                      </h3>
                    </div>
                    <p className="text-gray-600">{workoutDescriptions[recommendedType]}</p>
                  </div>
                </div>
              </div>

              {/* Status and Action */}
              {todaysWorkout?.completed ? (
                <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 font-medium">Workout completed!</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  disabled={saving}
                  className="w-full bg-blue-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Mark as Complete'}
                </button>
              )}

              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Workout History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Last 7 Workouts</h2>

          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading history...</div>
          ) : recentWorkouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No workout history yet. Start your first workout today!
            </div>
          ) : (
            <div className="space-y-2">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{workoutEmojis[workout.type]}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(workout.created_at)}
                      </div>
                    </div>
                  </div>
                  <div>
                    {workout.completed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Not completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}