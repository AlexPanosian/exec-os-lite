import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../src/hooks/useAuth'
import { supabase } from '../src/lib/supabaseClient'

jest.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn()
    }
  }
}))

describe('useAuth', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2024-01-01'
  }

  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser
  }

  const mockUnsubscribe = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: {
        subscription: {
          unsubscribe: mockUnsubscribe
        }
      }
    })
  })

  it('should initialize with loading state', async () => {
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
  })

  it('should set user when session exists', async () => {
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.session).toEqual(mockSession)
  })

  it('should handle auth state changes', async () => {
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null
    })

    let authChangeCallback: any
    ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe
          }
        }
      }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBe(null)

    await act(async () => {
      authChangeCallback('SIGNED_IN', mockSession)
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.session).toEqual(mockSession)
    })
  })

  it('should handle sign out', async () => {
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession },
      error: null
    })

    let authChangeCallback: any
    ;(supabase.auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      authChangeCallback = callback
      return {
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe
          }
        }
      }
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
    })

    await act(async () => {
      authChangeCallback('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)
    })
  })

  it('should handle errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: new Error('Session error')
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toBe(null)
    expect(result.current.session).toBe(null)
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting session:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })

  it('should unsubscribe on unmount', async () => {
    ;(supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null
    })

    const { unmount } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
    })

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})