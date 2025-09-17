import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from '../src/hooks/useFetch'
import { supabase } from '../src/lib/supabaseClient'

jest.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  }
}))

describe('useFetch', () => {
  const mockData = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 }
  ]

  const mockError = {
    message: 'Database error',
    details: 'Connection failed',
    hint: 'Check your connection',
    code: 'DB001'
  }

  let mockQuery: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockQuery = {
      select: jest.fn(),
      eq: jest.fn(),
      neq: jest.fn(),
      gt: jest.fn(),
      gte: jest.fn(),
      lt: jest.fn(),
      lte: jest.fn(),
      like: jest.fn(),
      ilike: jest.fn(),
      in: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
      then: jest.fn()
    }

    // Setup chaining for all methods
    Object.keys(mockQuery).forEach(key => {
      if (key !== 'then') {
        mockQuery[key].mockReturnValue(mockQuery)
      }
    })

    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
  })

  it('should initialize with loading state', () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: mockData, error: null }).then(callback)
    )

    const { result } = renderHook(() => useFetch('test_table'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('should fetch data successfully', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: mockData, error: null }).then(callback)
    )

    const { result } = renderHook(() => useFetch('test_table'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
    expect(supabase.from).toHaveBeenCalledWith('test_table')
    expect(mockQuery.select).toHaveBeenCalledWith('*')
  })

  it('should handle errors correctly', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: null, error: mockError }).then(callback)
    )

    const { result } = renderHook(() => useFetch('test_table'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toEqual(mockError)
  })

  it('should apply filter with eq operator', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: [mockData[0]], error: null }).then(callback)
    )

    const { result } = renderHook(() =>
      useFetch('test_table', {
        column: 'id',
        value: 1,
        operator: 'eq'
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
    expect(result.current.data).toEqual([mockData[0]])
  })

  it('should apply filter with default eq operator', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: [mockData[0]], error: null }).then(callback)
    )

    const { result } = renderHook(() =>
      useFetch('test_table', {
        column: 'id',
        value: 1
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)
  })

  it('should apply ordering', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: mockData, error: null }).then(callback)
    )

    const { result } = renderHook(() =>
      useFetch('test_table', {
        orderBy: 'value',
        ascending: false
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockQuery.order).toHaveBeenCalledWith('value', { ascending: false })
    expect(result.current.data).toEqual(mockData)
  })

  it('should apply limit', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: mockData.slice(0, 2), error: null }).then(callback)
    )

    const { result } = renderHook(() =>
      useFetch('test_table', {
        limit: 2
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockQuery.limit).toHaveBeenCalledWith(2)
    expect(result.current.data).toEqual(mockData.slice(0, 2))
  })

  it('should apply multiple filters and options', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: [mockData[1]], error: null }).then(callback)
    )

    const { result } = renderHook(() =>
      useFetch('test_table', {
        column: 'value',
        value: 150,
        operator: 'gt',
        orderBy: 'name',
        ascending: true,
        limit: 10
      })
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockQuery.gt).toHaveBeenCalledWith('value', 150)
    expect(mockQuery.order).toHaveBeenCalledWith('name', { ascending: true })
    expect(mockQuery.limit).toHaveBeenCalledWith(10)
  })

  it('should provide refetch function', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: mockData, error: null }).then(callback)
    )

    const { result } = renderHook(() => useFetch('test_table'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)

    const updatedData = [...mockData, { id: 4, name: 'Item 4', value: 400 }]
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: updatedData, error: null }).then(callback)
    )

    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.data).toEqual(updatedData)
    })
  })

  it.skip('should handle exceptions gracefully', async () => {
    const errorMessage = 'Network error'
    mockQuery.then.mockImplementation(() =>
      Promise.reject(new Error(errorMessage))
    )

    const { result } = renderHook(() => useFetch('test_table'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toEqual({
      message: errorMessage,
      details: null,
      hint: null,
      code: 'UNKNOWN'
    })
  })

  it('should cleanup on unmount', async () => {
    let resolvePromise: any
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockQuery.then.mockImplementation((callback) => promise.then(callback))

    const { unmount } = renderHook(() => useFetch('test_table'))

    unmount()

    resolvePromise({ data: mockData, error: null })

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('test_table')
    })
  })

  it('should refetch when parameters change', async () => {
    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: mockData, error: null }).then(callback)
    )

    const { result, rerender } = renderHook(
      ({ table, filter }) => useFetch(table, filter),
      {
        initialProps: {
          table: 'test_table',
          filter: { column: 'id', value: 1 }
        }
      }
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockQuery.eq).toHaveBeenCalledWith('id', 1)

    rerender({ table: 'test_table', filter: { column: 'id', value: 2 } })

    await waitFor(() => {
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 2)
    })
  })

  it('should handle typed data correctly', async () => {
    interface User {
      id: number
      name: string
      email: string
    }

    const typedData: User[] = [
      { id: 1, name: 'User 1', email: 'user1@example.com' },
      { id: 2, name: 'User 2', email: 'user2@example.com' }
    ]

    mockQuery.then.mockImplementation((callback) =>
      Promise.resolve({ data: typedData, error: null }).then(callback)
    )

    const { result } = renderHook(() => useFetch<User>('users'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(typedData)
    if (result.current.data) {
      expect(result.current.data[0].email).toBe('user1@example.com')
    }
  })
})