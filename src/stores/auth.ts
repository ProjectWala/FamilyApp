import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { AppUser } from '@/types'
import { useFamilyStore } from './family'

const LOCAL_STORAGE_KEY = 'family_app_auth_user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(null)
  const session = ref<any | null>(null)
  const isLoading = ref<boolean>(false)
  const authError = ref<string | null>(null)
  const isInitialized = ref<boolean>(false)

  // Initialize immediately from localStorage synchronously so app doesn't flicker login view
  const initialCached = loadCachedUser()
  if (initialCached) {
    user.value = initialCached
  }

  const isAuthenticated = computed(() => !!user.value)

  const displayName = computed(() => {
    if (!user.value) return 'Guest'
    return user.value.name || user.value.email.split('@')[0] || 'User'
  })

  const userInitials = computed(() => {
    if (!user.value) return '?'
    const raw = (user.value.name || user.value.email || '').trim()
    if (!raw) return 'U'
    const parts = raw.split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return raw.slice(0, 2).toUpperCase()
  })

  const userAvatarColor = computed(() => {
    return user.value?.avatarColor || '#1677ff'
  })

  const userAvatarIcon = computed(() => {
    return user.value?.avatarIcon || 'mdi-account-circle'
  })

  // Format Supabase User into our AppUser format
  function formatUser(sbUser: any): AppUser {
    const meta = sbUser.user_metadata || {}
    return {
      id: sbUser.id,
      email: sbUser.email || '',
      name: meta.name || sbUser.email?.split('@')[0] || 'Family Member',
      mobile: meta.mobile || '',
      role: meta.role || 'Member',
      avatarColor: meta.avatarColor || '#1677ff',
      avatarIcon: meta.avatarIcon || 'mdi-account',
      familyMemberId: meta.familyMemberId || undefined,
      createdAt: sbUser.created_at || new Date().toISOString(),
    }
  }

  // Save to localStorage for instant UI responsiveness & persistence across reloads
  function persistUser(u: AppUser | null) {
    if (u) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(u))
      localStorage.setItem('family_app_logged_in', 'true')
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      localStorage.removeItem('family_app_logged_in')
    }
  }

  // Load from localStorage cache
  function loadCachedUser(): AppUser | null {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (e) {
      console.warn('Failed to parse cached auth user:', e)
    }
    return null
  }

  // Refresh all stores for the newly active user
  async function refreshUserStores() {
    try {
      const { useTodoStore } = await import('./todos')
      const { useExpensesStore } = await import('./expenses')
      const { useGuestsStore } = await import('./guests')
      const { useRecurringStore } = await import('./recurring')
      const { useShoppingStore } = await import('./shopping')
      const { useFamilyStore } = await import('./family')

      await Promise.allSettled([
        useTodoStore().fetchFromSupabase(),
        useExpensesStore().fetchFromSupabase(),
        useGuestsStore().fetchFromSupabase(),
        useRecurringStore().fetchFromSupabase(),
        useShoppingStore().fetchFromSupabase(),
        useFamilyStore().fetchFromSupabase(),
      ])
    } catch (e) {
      console.warn('[Auth] Failed to refresh stores for user:', e)
    }
  }

  // Clear all stores and cached data on logout
  async function clearUserStores(targetUid?: string) {
    try {
      const uid = targetUid || user.value?.id
      // Clear all possible storage keys
      const keysToClear = [
        'todos_store_v2',
        'expenses_store_v3',
        'recurring_store_v2',
        'guests_store_v3',
        'shopping_items_v2',
        'shopping_products_v2',
        'family_members_store_v2',
        'active_family_member_id_v2',
      ]
      keysToClear.forEach((k) => {
        localStorage.removeItem(k)
        if (uid) {
          localStorage.removeItem(`${k}_${uid}`)
        }
      })

      const { useTodoStore } = await import('./todos')
      const { useExpensesStore } = await import('./expenses')
      const { useGuestsStore } = await import('./guests')
      const { useRecurringStore } = await import('./recurring')
      const { useShoppingStore } = await import('./shopping')
      const { useFamilyStore } = await import('./family')

      useTodoStore().todos = []
      useExpensesStore().expenses = []
      useGuestsStore().guests = []
      useRecurringStore().items = []
      useShoppingStore().items = []
      useFamilyStore().members = []
    } catch (e) {
      console.warn('[Auth] Failed to clear stores on logout:', e)
    }
  }

  // Initialize auth state
  async function init() {
    if (isInitialized.value) return
    authError.value = null

    // 1. Hydrate with cached user for zero flicker
    const cached = loadCachedUser()
    if (cached) {
      user.value = cached
    }

    try {
      // 2. Fetch session from Supabase
      const { data: sessionData, error } = await supabase.auth.getSession()
      if (error) {
        console.warn('[Auth] getSession error:', error.message)
      }

      if (sessionData?.session?.user) {
        session.value = sessionData.session
        const formatted = formatUser(sessionData.session.user)

        // Enrich with public.users table if available
        try {
          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('id', formatted.id)
            .maybeSingle()

          if (dbUser) {
            if (dbUser.name) formatted.name = dbUser.name
            if (dbUser.mobile) formatted.mobile = dbUser.mobile
          }
        } catch {
          // Ignore DB fetch errors
        }

        user.value = formatted
        persistUser(formatted)
        // Refresh stores with current user's segregated data
        refreshUserStores()
      } else if (!cached) {
        user.value = null
        persistUser(null)
      }

      // 3. Listen to auth state changes (login, logout, token refresh)
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession?.user) {
            session.value = newSession
            const formatted = formatUser(newSession.user)
            user.value = formatted
            persistUser(formatted)
            refreshUserStores()
          }
        } else if (event === 'SIGNED_OUT') {
          user.value = null
          session.value = null
          persistUser(null)
          clearUserStores()
        }
      })
    } catch (err: any) {
      console.error('[Auth] Init exception:', err)
      authError.value = err?.message || 'Authentication error'
    } finally {
      isInitialized.value = true
    }
  }

  // Sign In with Email & Password
  async function signIn(credentials: { email: string; password: string }) {
    isLoading.value = true
    authError.value = null

    try {
      const emailClean = credentials.email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailClean,
        password: credentials.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('No user returned from server.')
      }

      session.value = data.session
      const formatted = formatUser(data.user)
      user.value = formatted
      persistUser(formatted)

      // Refresh stores with this user's data
      await refreshUserStores()

      // Try matching active family member persona
      matchActiveFamilyMember(formatted.name)

      return { success: true, user: formatted }
    } catch (err: any) {
      const msg = err?.message || 'Sign in failed. Please check your credentials.'
      authError.value = msg
      throw new Error(msg)
    } finally {
      isLoading.value = false
    }
  }

  // Sign Up with Name, Email, Password, Mobile & Role
  async function signUp(payload: {
    name: string
    email: string
    password: string
    mobile?: string
    role?: string
    avatarColor?: string
    avatarIcon?: string
  }) {
    isLoading.value = true
    authError.value = null

    try {
      const emailClean = payload.email.trim().toLowerCase()
      const meta = {
        name: payload.name.trim(),
        mobile: payload.mobile?.trim() || '',
        role: payload.role || 'Primary / Organizer',
        avatarColor: payload.avatarColor || '#1677ff',
        avatarIcon: payload.avatarIcon || 'mdi-account',
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailClean,
        password: payload.password,
        options: {
          data: meta,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user) {
        throw new Error('Sign up failed: no user object created.')
      }

      // If session is already created:
      if (data.session) {
        session.value = data.session
        const formatted = formatUser(data.user)
        user.value = formatted
        persistUser(formatted)
        await refreshUserStores()
        matchActiveFamilyMember(formatted.name)
        return { success: true, user: formatted }
      }

      // If email was auto-confirmed by database trigger, immediately sign in to get active session
      const loginRes = await supabase.auth.signInWithPassword({
        email: emailClean,
        password: payload.password,
      })

      if (loginRes.data?.session?.user) {
        session.value = loginRes.data.session
        const formatted = formatUser(loginRes.data.session.user)
        user.value = formatted
        persistUser(formatted)
        await refreshUserStores()
        matchActiveFamilyMember(formatted.name)
        return { success: true, user: formatted }
      }

      // Fallback: user registered, format initial user
      const formatted = formatUser(data.user)
      user.value = formatted
      persistUser(formatted)
      await refreshUserStores()
      return { success: true, user: formatted }
    } catch (err: any) {
      const msg = err?.message || 'Sign up failed. Please check details.'
      authError.value = msg
      throw new Error(msg)
    } finally {
      isLoading.value = false
    }
  }

  // 1-Click Multi-User Test Sign-In Helper
  async function demoSignIn(preset: { name: string; email: string; role: string; mobile?: string }) {
    isLoading.value = true
    authError.value = null

    const demoPassword = 'FamilyPassword2026!'
    try {
      // 1. Try signing in first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: preset.email.trim().toLowerCase(),
        password: demoPassword,
      })

      if (!error && data.session?.user) {
        session.value = data.session
        const formatted = formatUser(data.session.user)
        user.value = formatted
        persistUser(formatted)
        await refreshUserStores()
        matchActiveFamilyMember(formatted.name)
        return { success: true, user: formatted }
      }

      // 2. If user doesn't exist yet, sign them up on the fly!
      return await signUp({
        name: preset.name,
        email: preset.email,
        password: demoPassword,
        mobile: preset.mobile || '9876543210',
        role: preset.role,
        avatarColor: '#1677ff',
        avatarIcon: 'mdi-account',
      })
    } catch (err: any) {
      // Direct session fallback for quick testing
      const fallbackUser: AppUser = {
        id: 'user-' + preset.name.toLowerCase().replace(/\s+/g, '-'),
        email: preset.email,
        name: preset.name,
        mobile: preset.mobile || '9876543210',
        role: preset.role,
        avatarColor: '#1677ff',
        avatarIcon: 'mdi-account',
        createdAt: new Date().toISOString(),
      }
      user.value = fallbackUser
      persistUser(fallbackUser)
      await refreshUserStores()
      matchActiveFamilyMember(fallbackUser.name)
      return { success: true, user: fallbackUser }
    } finally {
      isLoading.value = false
    }
  }

  // Update Profile details
  async function updateProfile(updates: {
    name?: string
    mobile?: string
    role?: string
    avatarColor?: string
    avatarIcon?: string
  }) {
    if (!user.value) throw new Error('Not authenticated')
    isLoading.value = true

    try {
      const nextMeta = {
        name: updates.name ?? user.value.name,
        mobile: updates.mobile ?? user.value.mobile,
        role: updates.role ?? user.value.role,
        avatarColor: updates.avatarColor ?? user.value.avatarColor,
        avatarIcon: updates.avatarIcon ?? user.value.avatarIcon,
      }

      // Update Supabase auth user_metadata
      const { data, error } = await supabase.auth.updateUser({
        data: nextMeta,
      })

      if (error) {
        console.warn('[Auth] Error updating user metadata:', error.message)
      }

      // Also update public.users table if synced
      try {
        await supabase
          .from('users')
          .update({
            name: nextMeta.name,
            mobile: nextMeta.mobile,
          })
          .eq('id', user.value.id)
      } catch {
        // Ignore table update errors if table schema differs
      }

      // Update local state
      user.value = {
        ...user.value,
        name: nextMeta.name,
        mobile: nextMeta.mobile,
        role: nextMeta.role,
        avatarColor: nextMeta.avatarColor,
        avatarIcon: nextMeta.avatarIcon,
      }
      persistUser(user.value)

      // Also sync active family member if matching
      matchActiveFamilyMember(nextMeta.name)

      return { success: true, user: user.value }
    } catch (err: any) {
      const msg = err?.message || 'Failed to update profile.'
      authError.value = msg
      throw new Error(msg)
    } finally {
      isLoading.value = false
    }
  }

  // Sign Out: clear session, localStorage cache, and reset in-memory stores
  async function signOut() {
    isLoading.value = true
    const uid = user.value?.id
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('[Auth] Sign out error:', err)
    } finally {
      user.value = null
      session.value = null
      persistUser(null)
      await clearUserStores(uid)
      isLoading.value = false
    }
  }

  // Helper to switch acting family member to logged in user if name matches
  function matchActiveFamilyMember(name: string) {
    try {
      const familyStore = useFamilyStore()
      const match = familyStore.members.find(
        (m) => m.name.toLowerCase().trim() === name.toLowerCase().trim()
      )
      if (match) {
        familyStore.setActiveMember(match.id)
      }
    } catch (e) {
      // Family store might not be mounted yet
    }
  }

  return {
    user,
    session,
    isLoading,
    authError,
    isAuthenticated,
    displayName,
    userInitials,
    userAvatarColor,
    userAvatarIcon,
    init,
    signIn,
    signUp,
    demoSignIn,
    updateProfile,
    signOut,
    refreshUserStores,
    clearUserStores,
  }
})
