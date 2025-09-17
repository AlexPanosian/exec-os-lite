import { supabase } from './supabaseClient'
import { Trip, CreateTripInput, UpdateTripInput } from '@/types/trips'

/**
 * Create a new trip entry
 */
export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .insert({
      user_id: user.id,
      destination: input.destination,
      country: input.country,
      city: input.city,
      accommodation: input.accommodation || null,
      start_date: input.start_date,
      end_date: input.end_date,
      flight_number: input.flight_number || null,
      departure_airport: input.departure_airport || null,
      arrival_airport: input.arrival_airport || null,
      departure_time: input.departure_time || null,
      arrival_time: input.arrival_time || null,
      notes: input.notes || null,
      status: input.status || 'planned'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating trip:', error)
    throw error
  }

  return data
}

/**
 * Get upcoming trips for the current user
 * Filters out trips where end_date < today
 * Sorted by start_date ascending
 */
export async function getUpcomingTrips(): Promise<Trip[]> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .gte('end_date', today)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming trips:', error)
    throw error
  }

  return data || []
}

/**
 * Get all trips for the current user
 * Sorted by start_date descending
 */
export async function getAllTrips(): Promise<Trip[]> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching all trips:', error)
    throw error
  }

  return data || []
}

/**
 * Get a specific trip by ID
 */
export async function getTrip(id: string): Promise<Trip | null> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching trip:', error)
    throw error
  }

  return data || null
}

/**
 * Update a trip
 */
export async function updateTrip(id: string, updates: UpdateTripInput): Promise<Trip> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating trip:', error)
    throw error
  }

  return data
}

/**
 * Delete a trip
 */
export async function deleteTrip(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting trip:', error)
    throw error
  }
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const endDay = end.getDate()
  const year = end.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}, ${year}`
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
  }
}

/**
 * Format time for display
 */
export function formatTime(timeString: string | null): string {
  if (!timeString) return ''

  const date = new Date(timeString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Calculate trip duration in days
 */
export function getTripDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1 // Add 1 to include both start and end days
}