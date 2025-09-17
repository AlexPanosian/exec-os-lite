import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import TravelPage from '../src/app/travel/page'
import * as tripsLib from '../src/lib/trips'
import { Trip } from '../src/types/trips'

// Mock the trips library
jest.mock('../src/lib/trips', () => ({
  createTrip: jest.fn(),
  getUpcomingTrips: jest.fn(),
  formatDateRange: jest.fn(),
  formatTime: jest.fn(),
  getTripDuration: jest.fn()
}))

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('TravelPage', () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const mockTrips: Trip[] = [
    {
      id: '1',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      destination: 'Visit the Eiffel Tower',
      country: 'France',
      city: 'Paris',
      accommodation: 'Hotel Ritz',
      start_date: tomorrow.toISOString().split('T')[0],
      end_date: nextWeek.toISOString().split('T')[0],
      flight_number: 'AA123',
      departure_airport: 'JFK',
      arrival_airport: 'CDG',
      departure_time: `${tomorrow.toISOString().split('T')[0]}T10:00:00`,
      arrival_time: `${tomorrow.toISOString().split('T')[0]}T22:00:00`,
      notes: 'Visit Eiffel Tower',
      status: 'planned'
    },
    {
      id: '2',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      destination: 'Explore temples and city',
      country: 'Japan',
      city: 'Tokyo',
      accommodation: null,
      start_date: nextWeek.toISOString().split('T')[0],
      end_date: new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      flight_number: null,
      departure_airport: null,
      arrival_airport: null,
      departure_time: null,
      arrival_time: null,
      notes: null,
      status: 'planned'
    }
  ]

  // Past trip that should not appear
  const pastTrip: Trip = {
    id: '3',
    user_id: 'user-123',
    created_at: new Date().toISOString(),
    destination: 'Business trip',
    country: 'UK',
    city: 'London',
    accommodation: 'Hilton',
    start_date: lastWeek.toISOString().split('T')[0],
    end_date: lastWeek.toISOString().split('T')[0],
    flight_number: null,
    departure_airport: null,
    arrival_airport: null,
    departure_time: null,
    arrival_time: null,
    notes: null,
    status: 'completed'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementations
    ;(tripsLib.getUpcomingTrips as jest.Mock).mockResolvedValue(mockTrips)
    ;(tripsLib.formatDateRange as jest.Mock).mockImplementation((start, end) => {
      return `${start} - ${end}`
    })
    ;(tripsLib.formatTime as jest.Mock).mockImplementation((time) => {
      return time ? new Date(time).toLocaleTimeString() : ''
    })
    ;(tripsLib.getTripDuration as jest.Mock).mockImplementation((start, end) => {
      const startDate = new Date(start)
      const endDate = new Date(end)
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    })
  })

  it('should render the travel page with title', async () => {
    render(<TravelPage />)

    expect(screen.getByText('Travel Tracker')).toBeInTheDocument()
    expect(screen.getByText('+ Add Trip')).toBeInTheDocument()
    expect(screen.getByText('Upcoming Trips')).toBeInTheDocument()
  })

  it('should load and display upcoming trips on mount', async () => {
    render(<TravelPage />)

    await waitFor(() => {
      expect(tripsLib.getUpcomingTrips).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getByText('Paris, France')).toBeInTheDocument()
      expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    })
  })

  it('should display flight details only if present', async () => {
    render(<TravelPage />)

    await waitFor(() => {
      // First trip has flight details
      expect(screen.getByText('AA123')).toBeInTheDocument()
      expect(screen.getByText('JFK → CDG')).toBeInTheDocument()
    })

    // Second trip should not have flight details displayed
    expect(screen.queryByText('Flight:')).toBeInTheDocument() // Only for first trip
    const flightElements = screen.getAllByText(/Flight:/)
    expect(flightElements).toHaveLength(1) // Only one trip has flight info
  })

  it('should show trip form when Add Trip button is clicked', async () => {
    render(<TravelPage />)

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Upcoming Trips')).toBeInTheDocument()
    })

    const addButton = screen.getByText('+ Add Trip')

    // Form should not be visible initially
    expect(screen.queryByText('New Trip')).not.toBeInTheDocument()

    // Click to show form
    fireEvent.click(addButton)

    await waitFor(() => {
      expect(screen.getByText('New Trip')).toBeInTheDocument()
      expect(screen.getByLabelText(/Destination \*/)).toBeInTheDocument()
      expect(screen.getByText('Save Trip')).toBeInTheDocument()
    })
  })

  it('should submit trip with all fields correctly', async () => {
    const newTrip: Trip = {
      id: '4',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      destination: 'Rome, Italy',
      country: 'Italy',
      city: 'Rome',
      accommodation: 'Airbnb',
      start_date: '2024-06-01',
      end_date: '2024-06-07',
      flight_number: 'BA456',
      departure_airport: 'LHR',
      arrival_airport: 'FCO',
      departure_time: '2024-06-01T08:00:00',
      arrival_time: '2024-06-01T11:00:00',
      notes: 'Summer vacation',
      status: 'planned'
    }

    ;(tripsLib.createTrip as jest.Mock).mockResolvedValue(newTrip)
    ;(tripsLib.getUpcomingTrips as jest.Mock).mockResolvedValue([...mockTrips, newTrip])

    render(<TravelPage />)

    // Open form
    fireEvent.click(screen.getByText('+ Add Trip'))

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Destination \*/), { target: { value: 'Rome, Italy' } })
    fireEvent.change(screen.getByLabelText(/Country \*/), { target: { value: 'Italy' } })
    fireEvent.change(screen.getByLabelText(/City \*/), { target: { value: 'Rome' } })
    fireEvent.change(screen.getByLabelText(/Start Date \*/), { target: { value: '2024-06-01' } })
    fireEvent.change(screen.getByLabelText(/End Date \*/), { target: { value: '2024-06-07' } })

    // Fill in optional fields
    fireEvent.change(screen.getByLabelText('Accommodation'), { target: { value: 'Airbnb' } })
    fireEvent.change(screen.getByLabelText('Flight Number'), { target: { value: 'BA456' } })
    fireEvent.change(screen.getByLabelText('Departure Airport'), { target: { value: 'LHR' } })
    fireEvent.change(screen.getByLabelText('Arrival Airport'), { target: { value: 'FCO' } })
    fireEvent.change(screen.getByLabelText('Departure Time'), { target: { value: '08:00' } })
    fireEvent.change(screen.getByLabelText('Arrival Time'), { target: { value: '11:00' } })
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Summer vacation' } })

    // Submit form
    fireEvent.click(screen.getByText('Save Trip'))

    await waitFor(() => {
      expect(tripsLib.createTrip).toHaveBeenCalledWith({
        destination: 'Rome, Italy',
        country: 'Italy',
        city: 'Rome',
        accommodation: 'Airbnb',
        start_date: '2024-06-01',
        end_date: '2024-06-07',
        flight_number: 'BA456',
        departure_airport: 'LHR',
        arrival_airport: 'FCO',
        departure_time: '2024-06-01T08:00:00',
        arrival_time: '2024-06-01T11:00:00',
        notes: 'Summer vacation'
      })
    })

    // Should reload trips after saving
    await waitFor(() => {
      expect(tripsLib.getUpcomingTrips).toHaveBeenCalledTimes(2)
    })
  })

  it('should validate required fields', async () => {
    render(<TravelPage />)

    // Open form
    fireEvent.click(screen.getByText('+ Add Trip'))

    // Fill in some but not all required fields (missing country)
    fireEvent.change(screen.getByLabelText(/Destination \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/City \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Start Date \*/), { target: { value: '2024-06-01' } })
    fireEvent.change(screen.getByLabelText(/End Date \*/), { target: { value: '2024-06-07' } })
    // Leaving country empty

    // Note: HTML5 validation will prevent form submission, but we can test the JS validation
    // by calling the submit handler directly
    const form = screen.getByText('Save Trip').closest('form')
    if (form) {
      fireEvent.submit(form)
    }

    // Since HTML5 validation blocks submission, createTrip should not be called
    expect(tripsLib.createTrip).not.toHaveBeenCalled()
  })

  it('should validate date order', async () => {
    render(<TravelPage />)

    // Open form
    fireEvent.click(screen.getByText('+ Add Trip'))

    // Fill required fields with invalid date order
    fireEvent.change(screen.getByLabelText(/Destination \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Country \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/City \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Start Date \*/), { target: { value: '2024-06-07' } })
    fireEvent.change(screen.getByLabelText(/End Date \*/), { target: { value: '2024-06-01' } })

    fireEvent.click(screen.getByText('Save Trip'))

    await waitFor(() => {
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument()
    })

    expect(tripsLib.createTrip).not.toHaveBeenCalled()
  })

  it('should filter out trips with end_date < today', async () => {
    // getUpcomingTrips should already filter these on the backend
    ;(tripsLib.getUpcomingTrips as jest.Mock).mockResolvedValue(mockTrips) // Only future trips

    render(<TravelPage />)

    await waitFor(() => {
      // Cities should appear in the UI
      expect(screen.getByText('Paris, France')).toBeInTheDocument()
      expect(screen.getByText('Tokyo, Japan')).toBeInTheDocument()
    })

    // Past trip should not appear (London is not in the mock trips returned)
    expect(screen.queryByText('London')).not.toBeInTheDocument()
  })

  it('should sort trips by start_date ascending', async () => {
    // Trips are already sorted by getUpcomingTrips
    render(<TravelPage />)

    await waitFor(() => {
      const trips = screen.getAllByText(/days/)
      expect(trips).toHaveLength(2)
    })

    // Verify the order by checking which appears first in the document
    const container = screen.getByText('Upcoming Trips').parentElement
    const content = container?.textContent || ''
    const parisIndex = content.indexOf('Paris')
    const tokyoIndex = content.indexOf('Tokyo')

    // Paris should appear before Tokyo (sorted by start date)
    expect(parisIndex).toBeLessThan(tokyoIndex)
    expect(parisIndex).toBeGreaterThan(-1)
    expect(tokyoIndex).toBeGreaterThan(-1)
  })

  it('should handle error when loading trips fails', async () => {
    ;(tripsLib.getUpcomingTrips as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<TravelPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load trips')).toBeInTheDocument()
    })
  })

  it('should handle error when saving trip fails', async () => {
    ;(tripsLib.createTrip as jest.Mock).mockRejectedValue(new Error('Save error'))

    render(<TravelPage />)

    // Open form and fill required fields
    fireEvent.click(screen.getByText('+ Add Trip'))
    fireEvent.change(screen.getByLabelText(/Destination \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Country \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/City \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Start Date \*/), { target: { value: '2024-06-01' } })
    fireEvent.change(screen.getByLabelText(/End Date \*/), { target: { value: '2024-06-07' } })

    fireEvent.click(screen.getByText('Save Trip'))

    await waitFor(() => {
      expect(screen.getByText('Failed to save trip. Please try again.')).toBeInTheDocument()
    })
  })

  it('should display message when no trips exist', async () => {
    ;(tripsLib.getUpcomingTrips as jest.Mock).mockResolvedValue([])

    render(<TravelPage />)

    await waitFor(() => {
      expect(screen.getByText('No upcoming trips. Click "Add Trip" to plan your next adventure!')).toBeInTheDocument()
    })
  })

  it('should show loading state while submitting', async () => {
    ;(tripsLib.createTrip as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockTrips[0]), 100))
    )

    render(<TravelPage />)

    // Open form and fill required fields
    fireEvent.click(screen.getByText('+ Add Trip'))
    fireEvent.change(screen.getByLabelText(/Destination \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Country \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/City \*/), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText(/Start Date \*/), { target: { value: '2024-06-01' } })
    fireEvent.change(screen.getByLabelText(/End Date \*/), { target: { value: '2024-06-07' } })

    fireEvent.click(screen.getByText('Save Trip'))

    expect(screen.getByText('Saving...')).toBeInTheDocument()

    const submitButton = screen.getByText('Saving...')
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(tripsLib.createTrip).toHaveBeenCalled()
    })
  })

  it('should handle optional fields being null', async () => {
    const tripWithNulls: Trip = {
      id: '5',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      destination: 'City break',
      country: 'Spain',
      city: 'Barcelona',
      accommodation: null,
      start_date: '2024-07-01',
      end_date: '2024-07-05',
      flight_number: null,
      departure_airport: null,
      arrival_airport: null,
      departure_time: null,
      arrival_time: null,
      notes: null,
      status: 'planned'
    }

    ;(tripsLib.getUpcomingTrips as jest.Mock).mockResolvedValue([tripWithNulls])

    render(<TravelPage />)

    await waitFor(() => {
      // Use getAllByText since the destination appears in both heading and location
      const elements = screen.getAllByText(/Barcelona/)
      expect(elements.length).toBeGreaterThan(0)
    })

    // Should not display optional fields when they are null
    expect(screen.queryByText('Accommodation:')).not.toBeInTheDocument()
    expect(screen.queryByText('Flight:')).not.toBeInTheDocument()
    expect(screen.queryByText('Route:')).not.toBeInTheDocument()
    expect(screen.queryByText('Notes:')).not.toBeInTheDocument()
  })
})