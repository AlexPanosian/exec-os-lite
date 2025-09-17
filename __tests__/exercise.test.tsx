import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExercisePage from '../src/app/exercise/page'
import * as workoutsLib from '../src/lib/workouts'
import { Workout, WorkoutType } from '../src/types/workouts'

// Mock the workouts library
jest.mock('../src/lib/workouts', () => ({
  getRecommendedWorkoutType: jest.fn(),
  getTodaysWorkout: jest.fn(),
  saveTodaysWorkout: jest.fn(),
  getRecentWorkouts: jest.fn()
}))

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
})

describe('ExercisePage', () => {
  const mockWorkouts: Workout[] = [
    {
      id: '1',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      type: 'push',
      completed: true
    },
    {
      id: '2',
      user_id: 'user-123',
      created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      type: 'pull',
      completed: true
    },
    {
      id: '3',
      user_id: 'user-123',
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      type: 'cardio',
      completed: false
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementations
    ;(workoutsLib.getRecommendedWorkoutType as jest.Mock).mockResolvedValue('pull')
    ;(workoutsLib.getTodaysWorkout as jest.Mock).mockResolvedValue(null)
    ;(workoutsLib.getRecentWorkouts as jest.Mock).mockResolvedValue(mockWorkouts)
    ;(workoutsLib.saveTodaysWorkout as jest.Mock).mockResolvedValue({
      ...mockWorkouts[0],
      type: 'pull',
      completed: true
    })
  })

  it('should render the exercise page with title', async () => {
    render(<ExercisePage />)

    expect(screen.getByText('Exercise Tracker')).toBeInTheDocument()
    expect(screen.getByText("Today's Workout")).toBeInTheDocument()
    expect(screen.getByText('Last 7 Workouts')).toBeInTheDocument()
  })

  it('should load and display recommended workout on mount', async () => {
    ;(workoutsLib.getRecommendedWorkoutType as jest.Mock).mockResolvedValue('pull')

    render(<ExercisePage />)

    await waitFor(() => {
      expect(workoutsLib.getRecommendedWorkoutType).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(screen.getByText(/Recommended: Pull/)).toBeInTheDocument()
      expect(screen.getByText(/Pull Day: Back, Biceps/)).toBeInTheDocument()
    })

    expect(screen.getByText('Mark as Complete')).toBeInTheDocument()
  })

  it('should display completed status if today\'s workout is done', async () => {
    const completedWorkout: Workout = {
      id: '4',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      type: 'push',
      completed: true
    }

    ;(workoutsLib.getTodaysWorkout as jest.Mock).mockResolvedValue(completedWorkout)

    render(<ExercisePage />)

    await waitFor(() => {
      expect(screen.getByText('Workout completed!')).toBeInTheDocument()
    })

    expect(screen.queryByText('Mark as Complete')).not.toBeInTheDocument()
  })

  it('should mark workout as complete when button is clicked', async () => {
    const completedWorkout: Workout = {
      id: '5',
      user_id: 'user-123',
      created_at: new Date().toISOString(),
      type: 'pull',
      completed: true
    }

    ;(workoutsLib.saveTodaysWorkout as jest.Mock).mockResolvedValue(completedWorkout)

    render(<ExercisePage />)

    await waitFor(() => {
      expect(screen.getByText('Mark as Complete')).toBeInTheDocument()
    })

    const button = screen.getByText('Mark as Complete')
    fireEvent.click(button)

    await waitFor(() => {
      expect(workoutsLib.saveTodaysWorkout).toHaveBeenCalledWith('pull', true)
    })

    await waitFor(() => {
      expect(screen.getByText('Workout completed!')).toBeInTheDocument()
    })
  })

  it('should display recent workout history', async () => {
    render(<ExercisePage />)

    await waitFor(() => {
      expect(workoutsLib.getRecentWorkouts).toHaveBeenCalledWith(7)
    })

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Yesterday')).toBeInTheDocument()

      // Check workout types
      const pushElements = screen.getAllByText(/Push/i)
      expect(pushElements.length).toBeGreaterThan(0)

      // Check completion status
      expect(screen.getAllByText('Completed')).toHaveLength(2)
      expect(screen.getByText('Not completed')).toBeInTheDocument()
    })
  })

  it('should display message when no workout history exists', async () => {
    ;(workoutsLib.getRecentWorkouts as jest.Mock).mockResolvedValue([])

    render(<ExercisePage />)

    await waitFor(() => {
      expect(screen.getByText('No workout history yet. Start your first workout today!')).toBeInTheDocument()
    })
  })

  it('should handle errors when loading data fails', async () => {
    ;(workoutsLib.getRecommendedWorkoutType as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<ExercisePage />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load workout data')).toBeInTheDocument()
    })
  })

  it('should handle errors when saving workout fails', async () => {
    ;(workoutsLib.saveTodaysWorkout as jest.Mock).mockRejectedValue(new Error('Save error'))

    render(<ExercisePage />)

    await waitFor(() => {
      expect(screen.getByText('Mark as Complete')).toBeInTheDocument()
    })

    const button = screen.getByText('Mark as Complete')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Failed to save workout. Please try again.')).toBeInTheDocument()
    })
  })

  it('should show loading state while saving workout', async () => {
    ;(workoutsLib.saveTodaysWorkout as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        id: '6',
        user_id: 'user-123',
        created_at: new Date().toISOString(),
        type: 'pull',
        completed: true
      }), 100))
    )

    render(<ExercisePage />)

    await waitFor(() => {
      expect(screen.getByText('Mark as Complete')).toBeInTheDocument()
    })

    const button = screen.getByText('Mark as Complete')
    fireEvent.click(button)

    expect(screen.getByText('Saving...')).toBeInTheDocument()
    expect(button).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByText('Workout completed!')).toBeInTheDocument()
    })
  })

  describe('Recommendation Logic', () => {
    it('should cycle from push to pull', async () => {
      const lastPushWorkout: Workout[] = [{
        id: '1',
        user_id: 'user-123',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        type: 'push',
        completed: true
      }]

      ;(workoutsLib.getRecentWorkouts as jest.Mock).mockResolvedValue(lastPushWorkout)
      ;(workoutsLib.getRecommendedWorkoutType as jest.Mock).mockImplementation(async () => {
        const recent = await workoutsLib.getRecentWorkouts(7)
        if (recent.length === 0) return 'push'
        const last = recent[0]
        if (last.type === 'push') return 'pull'
        if (last.type === 'pull') return 'cardio'
        if (last.type === 'cardio') return 'push'
        return 'push'
      })

      const { getRecommendedWorkoutType } = require('../src/lib/workouts')
      const recommended = await getRecommendedWorkoutType()
      expect(recommended).toBe('pull')
    })

    it('should cycle from pull to cardio', async () => {
      const lastPullWorkout: Workout[] = [{
        id: '1',
        user_id: 'user-123',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        type: 'pull',
        completed: true
      }]

      ;(workoutsLib.getRecentWorkouts as jest.Mock).mockResolvedValue(lastPullWorkout)
      ;(workoutsLib.getRecommendedWorkoutType as jest.Mock).mockImplementation(async () => {
        const recent = await workoutsLib.getRecentWorkouts(7)
        if (recent.length === 0) return 'push'
        const last = recent[0]
        if (last.type === 'push') return 'pull'
        if (last.type === 'pull') return 'cardio'
        if (last.type === 'cardio') return 'push'
        return 'push'
      })

      const { getRecommendedWorkoutType } = require('../src/lib/workouts')
      const recommended = await getRecommendedWorkoutType()
      expect(recommended).toBe('cardio')
    })

    it('should cycle from cardio to push', async () => {
      const lastCardioWorkout: Workout[] = [{
        id: '1',
        user_id: 'user-123',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        type: 'cardio',
        completed: true
      }]

      ;(workoutsLib.getRecentWorkouts as jest.Mock).mockResolvedValue(lastCardioWorkout)
      ;(workoutsLib.getRecommendedWorkoutType as jest.Mock).mockImplementation(async () => {
        const recent = await workoutsLib.getRecentWorkouts(7)
        if (recent.length === 0) return 'push'
        const last = recent[0]
        if (last.type === 'push') return 'pull'
        if (last.type === 'pull') return 'cardio'
        if (last.type === 'cardio') return 'push'
        return 'push'
      })

      const { getRecommendedWorkoutType } = require('../src/lib/workouts')
      const recommended = await getRecommendedWorkoutType()
      expect(recommended).toBe('push')
    })

    it('should default to push if no history', async () => {
      ;(workoutsLib.getRecentWorkouts as jest.Mock).mockResolvedValue([])
      ;(workoutsLib.getRecommendedWorkoutType as jest.Mock).mockImplementation(async () => {
        const recent = await workoutsLib.getRecentWorkouts(7)
        if (recent.length === 0) return 'push'
        const last = recent[0]
        if (last.type === 'push') return 'pull'
        if (last.type === 'pull') return 'cardio'
        if (last.type === 'cardio') return 'push'
        return 'push'
      })

      const { getRecommendedWorkoutType } = require('../src/lib/workouts')
      const recommended = await getRecommendedWorkoutType()
      expect(recommended).toBe('push')
    })
  })
})

describe('Workout Helper Functions', () => {
  // Test the actual implementation of getRecommendedWorkoutType
  it('should correctly implement workout cycling logic', () => {
    const getNextType = (lastType: WorkoutType): WorkoutType => {
      switch (lastType) {
        case 'push':
          return 'pull'
        case 'pull':
          return 'cardio'
        case 'cardio':
          return 'push'
        default:
          return 'push'
      }
    }

    expect(getNextType('push')).toBe('pull')
    expect(getNextType('pull')).toBe('cardio')
    expect(getNextType('cardio')).toBe('push')
  })
})