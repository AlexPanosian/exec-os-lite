import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import DietPage from '../src/app/diet/page'
import * as mealsLib from '../src/lib/meals'
import * as parseMealLib from '../src/lib/parseMeal'
import { Meal } from '../src/types/meals'

// Mock the meals library
jest.mock('../src/lib/meals', () => ({
  createMeal: jest.fn(),
  getTodaysMeals: jest.fn()
}))

// Mock the parseMeal library
jest.mock('../src/lib/parseMeal', () => ({
  parseMeal: jest.fn(),
  formatParsedMeal: jest.fn()
}))

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('DietPage', () => {
  const mockMeals: Meal[] = [
    {
      id: '1',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      raw_text: 'Chicken and rice',
      calories: 500,
      protein: 40,
      carbs: 50,
      fat: 10
    },
    {
      id: '2',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      raw_text: 'Protein shake',
      calories: 200,
      protein: 30,
      carbs: 10,
      fat: 5
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementations
    ;(mealsLib.getTodaysMeals as jest.Mock).mockResolvedValue(mockMeals)
    ;(parseMealLib.parseMeal as jest.Mock).mockResolvedValue({
      calories: 400,
      protein: 30,
      carbs: 40,
      fat: 15
    })
  })

  it('should render the diet page with title', async () => {
    render(<DietPage />)

    expect(screen.getByText('Diet Tracker')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Grilled chicken/i)).toBeInTheDocument()
    expect(screen.getByText('Add Meal')).toBeInTheDocument()
  })

  it('should load and display today\'s meals on mount', async () => {
    render(<DietPage />)

    await waitFor(() => {
      expect(mealsLib.getTodaysMeals).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getByText('Chicken and rice')).toBeInTheDocument()
      expect(screen.getByText('Protein shake')).toBeInTheDocument()
    })

    // Check if nutritional info is displayed
    expect(screen.getByText(/500 cal/)).toBeInTheDocument()
    expect(screen.getByText(/200 cal/)).toBeInTheDocument()
  })

  it('should calculate and display correct daily totals', async () => {
    render(<DietPage />)

    await waitFor(() => {
      expect(screen.getByText('Daily Totals')).toBeInTheDocument()
    })

    // Total calories: 500 + 200 = 700
    expect(screen.getByText('700')).toBeInTheDocument()
    // Total protein: 40 + 30 = 70g
    expect(screen.getByText('70g')).toBeInTheDocument()
    // Total carbs: 50 + 10 = 60g
    expect(screen.getByText('60g')).toBeInTheDocument()
    // Total fat: 10 + 5 = 15g
    expect(screen.getByText('15g')).toBeInTheDocument()
  })

  it('should save a new meal entry when submitted', async () => {
    ;(mealsLib.createMeal as jest.Mock).mockResolvedValue({
      id: '3',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      raw_text: 'Test meal',
      calories: 400,
      protein: 30,
      carbs: 40,
      fat: 15
    })

    render(<DietPage />)

    const input = screen.getByPlaceholderText(/Grilled chicken/i)
    const submitButton = screen.getByText('Add Meal')

    // Enter meal text
    fireEvent.change(input, { target: { value: 'Test meal' } })
    expect(input).toHaveValue('Test meal')

    // Submit form
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(parseMealLib.parseMeal).toHaveBeenCalledWith('Test meal')
    })

    await waitFor(() => {
      expect(mealsLib.createMeal).toHaveBeenCalledWith({
        raw_text: 'Test meal',
        calories: 400,
        protein: 30,
        carbs: 40,
        fat: 15
      })
    })

    // Should reload meals after saving
    await waitFor(() => {
      expect(mealsLib.getTodaysMeals).toHaveBeenCalledTimes(2) // Once on mount, once after save
    })

    // Input should be cleared
    await waitFor(() => {
      expect(input).toHaveValue('')
    })
  })

  it('should show error when meal text is empty', async () => {
    render(<DietPage />)

    const submitButton = screen.getByText('Add Meal')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a meal description')).toBeInTheDocument()
    })

    expect(parseMealLib.parseMeal).not.toHaveBeenCalled()
    expect(mealsLib.createMeal).not.toHaveBeenCalled()
  })

  it('should handle errors when saving meal fails', async () => {
    ;(mealsLib.createMeal as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<DietPage />)

    const input = screen.getByPlaceholderText(/Grilled chicken/i)
    const submitButton = screen.getByText('Add Meal')

    fireEvent.change(input, { target: { value: 'Test meal' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Failed to save meal. Please try again.')).toBeInTheDocument()
    })

    // Input should not be cleared on error
    expect(input).toHaveValue('Test meal')
  })

  it('should handle errors when loading meals fails', async () => {
    ;(mealsLib.getTodaysMeals as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<DietPage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load today\'s meals')).toBeInTheDocument()
    })
  })

  it('should show loading state while submitting', async () => {
    ;(parseMealLib.parseMeal as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        calories: 400,
        protein: 30,
        carbs: 40,
        fat: 15
      }), 100))
    )

    render(<DietPage />)

    const input = screen.getByPlaceholderText(/Grilled chicken/i)
    const submitButton = screen.getByText('Add Meal')

    fireEvent.change(input, { target: { value: 'Test meal' } })
    fireEvent.click(submitButton)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('Add Meal')).toBeInTheDocument()
    })
  })

  it('should display message when no meals are logged', async () => {
    ;(mealsLib.getTodaysMeals as jest.Mock).mockResolvedValue([])

    render(<DietPage />)

    await waitFor(() => {
      expect(screen.getByText('No meals logged today')).toBeInTheDocument()
    })

    // Totals should all be 0
    expect(screen.getByText('0')).toBeInTheDocument() // Calories
    expect(screen.getAllByText('0g')).toHaveLength(3) // Protein, Carbs, Fat
  })

  it('should handle meals with null nutritional values', async () => {
    const mealsWithNulls: Meal[] = [
      {
        id: '1',
        user_id: 'user-123',
        created_at: new Date().toISOString(),
        raw_text: 'Unknown food',
        calories: null,
        protein: null,
        carbs: null,
        fat: null
      }
    ]

    ;(mealsLib.getTodaysMeals as jest.Mock).mockResolvedValue(mealsWithNulls)

    render(<DietPage />)

    await waitFor(() => {
      expect(screen.getByText('Unknown food')).toBeInTheDocument()
      expect(screen.getByText('Nutrition info not available')).toBeInTheDocument()
    })

    // Totals should handle null values as 0
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getAllByText('0g')).toHaveLength(3)
  })

  it('should format meal times correctly', async () => {
    const date = new Date('2024-01-01T14:30:00')
    const mealsWithTime: Meal[] = [
      {
        ...mockMeals[0],
        created_at: date.toISOString()
      }
    ]

    ;(mealsLib.getTodaysMeals as jest.Mock).mockResolvedValue(mealsWithTime)

    render(<DietPage />)

    await waitFor(() => {
      // Should display time in 12-hour format
      expect(screen.getByText(/2:30 PM/i)).toBeInTheDocument()
    })
  })
})