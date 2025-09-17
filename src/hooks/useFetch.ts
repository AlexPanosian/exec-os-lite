import { useEffect, useState } from 'react'
import { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

interface FetchState<T> {
  data: T[] | null
  error: PostgrestError | null
  loading: boolean
}

interface FilterParams {
  column?: string
  value?: any
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in'
  orderBy?: string
  ascending?: boolean
  limit?: number
}

export function useFetch<T = any>(
  tableName: string,
  filterParams?: FilterParams
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: true
  })

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        let query = supabase.from(tableName).select('*')

        if (filterParams) {
          if (filterParams.column && filterParams.value !== undefined) {
            const operator = filterParams.operator || 'eq'
            query = query[operator](filterParams.column, filterParams.value)
          }

          if (filterParams.orderBy) {
            query = query.order(filterParams.orderBy, {
              ascending: filterParams.ascending ?? true
            })
          }

          if (filterParams.limit) {
            query = query.limit(filterParams.limit)
          }
        }

        const { data, error } = await query

        if (!isCancelled) {
          if (error) {
            setState({
              data: null,
              error: error,
              loading: false
            })
          } else {
            setState({
              data: data as T[],
              error: null,
              loading: false
            })
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setState({
            data: null,
            error: {
              message: err instanceof Error ? err.message : 'An unknown error occurred',
              details: null,
              hint: null,
              code: 'UNKNOWN'
            },
            loading: false
          })
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, JSON.stringify(filterParams)])

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      let query = supabase.from(tableName).select('*')

      if (filterParams) {
        if (filterParams.column && filterParams.value !== undefined) {
          const operator = filterParams.operator || 'eq'
          query = query[operator](filterParams.column, filterParams.value)
        }

        if (filterParams.orderBy) {
          query = query.order(filterParams.orderBy, {
            ascending: filterParams.ascending ?? true
          })
        }

        if (filterParams.limit) {
          query = query.limit(filterParams.limit)
        }
      }

      const { data, error } = await query

      if (error) {
        setState({
          data: null,
          error: error,
          loading: false
        })
      } else {
        setState({
          data: data as T[],
          error: null,
          loading: false
        })
      }
    } catch (err) {
      setState({
        data: null,
        error: {
          message: err instanceof Error ? err.message : 'An unknown error occurred',
          details: null,
          hint: null,
          code: 'UNKNOWN'
        },
        loading: false
      })
    }
  }

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    refetch
  }
}