'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTodaysMeals } from '@/lib/meals'
import { getTodaysWorkout, getRecommendedWorkoutType } from '@/lib/workouts'
import { getUpcomingTrips } from '@/lib/trips'
import { Meal } from '@/types/meals'
import { Workout, WorkoutType } from '@/types/workouts'
import { Trip } from '@/types/trips'

// Feature cards configuration
const features = [
  {
    title: 'Diet Tracker',
    description: 'Track your meals and nutrition',
    href: '/diet',
    icon: '🍎',
    color: 'from-green-400 to-green-600'
  },
  {
    title: 'Exercise Tracker',
    description: 'Log workouts and stay active',
    href: '/exercise',
    icon: '💪',
    color: 'from-blue-400 to-blue-600'
  },
  {
    title: 'Travel Tracker',
    description: 'Plan and manage your trips',
    href: '/travel',
    icon: '✈️',
    color: 'from-purple-400 to-purple-600'
  }
]

export default function HomePage() {
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>([])
  const [todaysWorkout, setTodaysWorkout] = useState<Workout | null>(null)
  const [recommendedWorkout, setRecommendedWorkout] = useState<WorkoutType>('push')
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)

    try {
      // Load all data in parallel
      const [meals, workout, recommended, trips] = await Promise.all([
        getTodaysMeals().catch(() => []),
        getTodaysWorkout().catch(() => null),
        getRecommendedWorkoutType().catch(() => 'push' as WorkoutType),
        getUpcomingTrips().catch(() => [])
      ])

      setTodaysMeals(meals)
      setTodaysWorkout(workout)
      setRecommendedWorkout(recommended)
      setUpcomingTrips(trips)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate daily totals for meals
  const dailyTotals = todaysMeals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0)
  }), { calories: 0, protein: 0 })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Life Tracker</h1>
            <p className="text-gray-600">Your personal wellness dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Diet Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Nutrition</h2>
              <span className="text-2xl">🍎</span>
            </div>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Meals logged:</span>
                  <span className="font-semibold">{todaysMeals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories:</span>
                  <span className="font-semibold">{dailyTotals.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein:</span>
                  <span className="font-semibold">{dailyTotals.protein}g</span>
                </div>
                <Link
                  href="/diet"
                  className="block mt-4 text-center bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Log a Meal
                </Link>
              </div>
            )}
          </div>

          {/* Exercise Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Today's Workout</h2>
              <span className="text-2xl">💪</span>
            </div>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold">
                    {todaysWorkout?.completed ? '✅ Complete' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recommended:</span>
                  <span className="font-semibold capitalize">{recommendedWorkout}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  {recommendedWorkout === 'push' && 'Chest, Shoulders, Triceps'}
                  {recommendedWorkout === 'pull' && 'Back, Biceps'}
                  {recommendedWorkout === 'cardio' && 'Running, Cycling, HIIT'}
                </div>
                <Link
                  href="/exercise"
                  className="block mt-4 text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {todaysWorkout?.completed ? 'View History' : 'Start Workout'}
                </Link>
              </div>
            )}
          </div>

          {/* Travel Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Trips</h2>
              <span className="text-2xl">✈️</span>
            </div>
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                {upcomingTrips.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    No trips planned
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next trip:</span>
                      <span className="font-semibold">
                        {upcomingTrips[0].city}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Departure:</span>
                      <span className="font-semibold">
                        {new Date(upcomingTrips[0].start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total trips:</span>
                      <span className="font-semibold">{upcomingTrips.length}</span>
                    </div>
                  </>
                )}
                <Link
                  href="/travel"
                  className="block mt-4 text-center bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  {upcomingTrips.length === 0 ? 'Plan a Trip' : 'View Trips'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-90`}></div>
                <div className="relative p-6 text-white">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-white/90">{feature.description}</p>
                  <div className="mt-4 inline-flex items-center text-white font-semibold group-hover:translate-x-1 transition-transform">
                    Open →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          {loading ? (
            <div className="text-gray-500 text-center py-4">Loading activity...</div>
          ) : (
            <div className="space-y-3">
              {/* Today's Meals */}
              {todaysMeals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className="text-xl">🍽️</span>
                  <div className="flex-1">
                    <p className="text-gray-900">{meal.raw_text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(meal.created_at).toLocaleTimeString()} - {meal.calories || 0} cal
                    </p>
                  </div>
                </div>
              ))}

              {/* Today's Workout */}
              {todaysWorkout && (
                <div className="flex items-center gap-3 py-2 border-b">
                  <span className="text-xl">🏋️</span>
                  <div className="flex-1">
                    <p className="text-gray-900 capitalize">{todaysWorkout.type} workout</p>
                    <p className="text-xs text-gray-500">
                      {todaysWorkout.completed ? 'Completed' : 'Planned'} today
                    </p>
                  </div>
                </div>
              )}

              {/* No activity message */}
              {todaysMeals.length === 0 && !todaysWorkout && upcomingTrips.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                  No recent activity. Start tracking to see your progress!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}