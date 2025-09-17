'use client'

import { useState, useEffect } from 'react'
import {
  createTrip,
  getUpcomingTrips,
  formatDateRange,
  formatTime,
  getTripDuration
} from '@/lib/trips'
import { Trip } from '@/types/trips'

export default function TravelPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    country: '',
    city: '',
    accommodation: '',
    start_date: '',
    end_date: '',
    flight_number: '',
    departure_airport: '',
    arrival_airport: '',
    departure_time: '',
    arrival_time: '',
    notes: ''
  })

  // Load trips on mount
  useEffect(() => {
    loadTrips()
  }, [])

  async function loadTrips() {
    setLoading(true)
    setError(null)

    try {
      const upcomingTrips = await getUpcomingTrips()
      setTrips(upcomingTrips)
    } catch (err) {
      console.error('Failed to load trips:', err)
      setError('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate required fields
    if (!formData.destination || !formData.country || !formData.city || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields')
      return
    }

    // Validate date order
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be after start date')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Prepare trip data, converting empty strings to null for optional fields
      const tripData = {
        destination: formData.destination,
        country: formData.country,
        city: formData.city,
        accommodation: formData.accommodation || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        flight_number: formData.flight_number || null,
        departure_airport: formData.departure_airport || null,
        arrival_airport: formData.arrival_airport || null,
        departure_time: formData.departure_time ? `${formData.start_date}T${formData.departure_time}:00` : null,
        arrival_time: formData.arrival_time ? `${formData.start_date}T${formData.arrival_time}:00` : null,
        notes: formData.notes || null
      }

      await createTrip(tripData)

      // Reset form and reload trips
      setFormData({
        destination: '',
        country: '',
        city: '',
        accommodation: '',
        start_date: '',
        end_date: '',
        flight_number: '',
        departure_airport: '',
        arrival_airport: '',
        departure_time: '',
        arrival_time: '',
        notes: ''
      })
      setShowForm(false)
      await loadTrips()
    } catch (err) {
      console.error('Failed to save trip:', err)
      setError('Failed to save trip. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Travel Tracker</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Trip'}
          </button>
        </div>

        {/* Trip Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">New Trip</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <input
                    id="destination"
                    name="destination"
                    type="text"
                    value={formData.destination}
                    onChange={handleInputChange}
                    placeholder="e.g., Paris, France"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., France"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g., Paris"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {/* Dates and Accommodation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 mb-1">
                    Accommodation
                  </label>
                  <input
                    id="accommodation"
                    name="accommodation"
                    type="text"
                    value={formData.accommodation}
                    onChange={handleInputChange}
                    placeholder="e.g., Hotel Ritz"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Flight Info */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Flight Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="flight_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Flight Number
                    </label>
                    <input
                      id="flight_number"
                      name="flight_number"
                      type="text"
                      value={formData.flight_number}
                      onChange={handleInputChange}
                      placeholder="e.g., AA123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="departure_airport" className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Airport
                    </label>
                    <input
                      id="departure_airport"
                      name="departure_airport"
                      type="text"
                      value={formData.departure_airport}
                      onChange={handleInputChange}
                      placeholder="e.g., JFK"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="arrival_airport" className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Airport
                    </label>
                    <input
                      id="arrival_airport"
                      name="arrival_airport"
                      type="text"
                      value={formData.arrival_airport}
                      onChange={handleInputChange}
                      placeholder="e.g., CDG"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Departure Time
                    </label>
                    <input
                      id="departure_time"
                      name="departure_time"
                      type="time"
                      value={formData.departure_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Arrival Time
                    </label>
                    <input
                      id="arrival_time"
                      name="arrival_time"
                      type="time"
                      value={formData.arrival_time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={submitting}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Trip'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trips List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Trips</h2>

          {error && !showForm && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading trips...</div>
          ) : trips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming trips. Click "Add Trip" to plan your next adventure!
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {trip.city}, {trip.country}
                      </h3>
                      <p className="text-gray-600">
                        {trip.destination}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateRange(trip.start_date, trip.end_date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTripDuration(trip.start_date, trip.end_date)} days
                      </p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                    {trip.accommodation && (
                      <div className="flex gap-2">
                        <span className="text-gray-500">Accommodation:</span>
                        <span className="text-gray-700">{trip.accommodation}</span>
                      </div>
                    )}

                    {trip.flight_number && (
                      <div className="flex gap-2">
                        <span className="text-gray-500">Flight:</span>
                        <span className="text-gray-700">{trip.flight_number}</span>
                      </div>
                    )}

                    {trip.departure_airport && trip.arrival_airport && (
                      <div className="flex gap-2">
                        <span className="text-gray-500">Route:</span>
                        <span className="text-gray-700">
                          {trip.departure_airport} → {trip.arrival_airport}
                        </span>
                      </div>
                    )}

                    {trip.departure_time && trip.arrival_time && (
                      <div className="flex gap-2">
                        <span className="text-gray-500">Times:</span>
                        <span className="text-gray-700">
                          {formatTime(trip.departure_time)} - {formatTime(trip.arrival_time)}
                        </span>
                      </div>
                    )}
                  </div>

                  {trip.notes && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {trip.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}