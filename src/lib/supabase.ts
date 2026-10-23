import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://jqkzwndqfslzqjaamfph.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxa3p3bmRxZnNsenFqYWFtZnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzMzMzNjMsImV4cCI6MjEwNzkwOTM2M30.w1oiWCqveQbTs4OkhzwJxaMcCkCSy4UV4t2u0qdDCdM'
export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/app-crud`

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type SupportedResource =
  | 'family_members'
  | 'todos'
  | 'expenses'
  | 'recurring_expenses'
  | 'guests'
  | 'shopping_list'
  | 'shopping_products'

/**
 * Universal client helper for calling the Supabase Edge Function
 */
export const edgeCrud = {
  async list<T>(resource: SupportedResource): Promise<T[]> {
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}?resource=${resource}`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        return json.data as T[]
      }
      return []
    } catch (err) {
      console.warn(`[Edge Function] Failed to fetch ${resource}:`, err)
      return []
    }
  },

  async create<T>(resource: SupportedResource, data: Record<string, any>): Promise<T | null> {
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}?resource=${resource}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      return json.success ? (json.data as T) : null
    } catch (err) {
      console.warn(`[Edge Function] Failed to create ${resource}:`, err)
      return null
    }
  },

  async update<T>(
    resource: SupportedResource,
    id: string,
    data: Record<string, any>
  ): Promise<T | null> {
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}?resource=${resource}&id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      return json.success ? (json.data as T) : null
    } catch (err) {
      console.warn(`[Edge Function] Failed to update ${resource} [${id}]:`, err)
      return null
    }
  },

  async delete(resource: SupportedResource, id: string): Promise<boolean> {
    try {
      const res = await fetch(`${EDGE_FUNCTION_URL}?resource=${resource}&id=${id}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      })
      const json = await res.json()
      return !!json.success
    } catch (err) {
      console.warn(`[Edge Function] Failed to delete ${resource} [${id}]:`, err)
      return false
    }
  },
}
