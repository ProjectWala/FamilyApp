import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { EventItem, EventGuestInvite, EventRsvpStatus, GuestItem } from '@/types'
import { edgeCrud, getUserStorageKey } from '@/lib/supabase'
import { useGuestsStore } from './guests'

const STORAGE_KEY = 'events_store_v1'

export const defaultEventCategories = [
  'Wedding',
  'Reception',
  'Birthday',
  'Anniversary',
  'Housewarming',
  'Festival / Puja',
  'Dinner Party',
  'Baby Shower',
  'Get-Together',
  'Other',
]

export const eventCategoryColors: Record<string, string> = {
  Wedding: '#e91e63',
  Reception: '#9c27b0',
  Birthday: '#ff9800',
  Anniversary: '#e040fb',
  Housewarming: '#4caf50',
  'Festival / Puja': '#ff5722',
  'Dinner Party': '#2196f3',
  'Baby Shower': '#00bcd4',
  'Get-Together': '#673ab7',
  Other: '#607d8b',
}

const initialSampleEvents: EventItem[] = [
  {
    id: 'evt-sample-1',
    title: 'Family Anniversary Celebration',
    description: 'Celebrating 25th Wedding Anniversary with family and close friends.',
    date: new Date(Date.now() + 86400000 * 14).toISOString().slice(0, 10),
    time: '19:00',
    location: 'Royal Palms Banquet, Grand Ballroom',
    category: 'Anniversary',
    color: '#e040fb',
    invitedGuests: [],
    notes: 'Buffet dinner starts at 8:00 PM. Welcome drinks in lawn.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const useEventsStore = defineStore('events', () => {
  const guestsStore = useGuestsStore()

  // 1. Load stored events
  const stored = localStorage.getItem(getUserStorageKey(STORAGE_KEY))
  let rawEvents: EventItem[] = []
  try {
    const parsed = stored ? JSON.parse(stored) : null
    if (Array.isArray(parsed) && parsed.length > 0) {
      rawEvents = parsed
    } else {
      rawEvents = initialSampleEvents
    }
  } catch {
    rawEvents = initialSampleEvents
  }

  const events = ref<EventItem[]>(
    rawEvents.map((evt) => ({
      ...evt,
      invitedGuests: Array.isArray(evt.invitedGuests) ? evt.invitedGuests : [],
      category: evt.category || 'Celebration',
      color: evt.color || eventCategoryColors[evt.category || 'Other'] || '#1890ff',
    }))
  )

  watch(
    events,
    (newVal) => {
      localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(newVal))
    },
    { deep: true }
  )

  const isSyncing = ref(false)
  const searchQuery = ref('')
  const selectedCategory = ref<string>('all')
  const sortBy = ref<'date-asc' | 'date-desc' | 'name' | 'guests-count'>('date-asc')

  // Computed metrics
  const totalEvents = computed(() => events.value.length)

  const filteredEvents = computed(() => {
    let result = events.value.filter((evt) => {
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        const titleMatch = evt.title.toLowerCase().includes(q)
        const locMatch = evt.location ? evt.location.toLowerCase().includes(q) : false
        const descMatch = evt.description ? evt.description.toLowerCase().includes(q) : false
        const catMatch = evt.category ? evt.category.toLowerCase().includes(q) : false
        const guestMatch = Array.isArray(evt.invitedGuests) &&
          evt.invitedGuests.some((g) => g.name.toLowerCase().includes(q))
        if (!titleMatch && !locMatch && !descMatch && !catMatch && !guestMatch) return false
      }

      if (selectedCategory.value !== 'all' && evt.category !== selectedCategory.value) {
        return false
      }

      return true
    })

    if (sortBy.value === 'date-asc') {
      result.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    } else if (sortBy.value === 'date-desc') {
      result.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    } else if (sortBy.value === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy.value === 'guests-count') {
      result.sort((a, b) => (b.invitedGuests?.length || 0) - (a.invitedGuests?.length || 0))
    }

    return result
  })

  function safeParseArray<T>(val: any): T[] {
    if (Array.isArray(val)) return val
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  // Supabase Fetch
  async function fetchFromSupabase() {
    try {
      isSyncing.value = true
      const remote = await edgeCrud.list<any>('events')
      if (Array.isArray(remote) && remote.length > 0) {
        const remoteEvents: EventItem[] = remote.map((r) => ({
          id: r.id,
          title: r.title || 'Untitled Event',
          description: r.description || '',
          date: r.date || '',
          time: r.time || '',
          location: r.location || '',
          category: r.category || 'Celebration',
          color: r.color || eventCategoryColors[r.category || 'Other'] || '#1890ff',
          invitedGuests: safeParseArray<EventGuestInvite>(r.invited_guests),
          notes: r.notes || '',
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
        }))

        events.value = remoteEvents
        localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(remoteEvents))
      }
    } catch (e) {
      console.warn('Failed to fetch events from Supabase:', e)
    } finally {
      isSyncing.value = false
    }
  }

  // Add Event
  async function addEvent(
    eventData: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<EventItem> {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'evt-' + Date.now()
    const now = new Date().toISOString()

    const newEvent: EventItem = {
      ...eventData,
      id,
      invitedGuests: Array.isArray(eventData.invitedGuests) ? eventData.invitedGuests : [],
      color: eventData.color || eventCategoryColors[eventData.category || 'Other'] || '#1890ff',
      createdAt: now,
      updatedAt: now,
    }

    events.value.unshift(newEvent)

    // Sync to Supabase
    edgeCrud.create('events', {
      id,
      title: newEvent.title,
      description: newEvent.description || '',
      date: newEvent.date,
      time: newEvent.time || '',
      location: newEvent.location || '',
      category: newEvent.category || 'Celebration',
      color: newEvent.color,
      invited_guests: newEvent.invitedGuests,
      notes: newEvent.notes || '',
    })

    return newEvent
  }

  // Update Event
  async function updateEvent(id: string, updated: Partial<EventItem>) {
    const idx = events.value.findIndex((e) => e.id === id)
    if (idx !== -1) {
      events.value[idx] = {
        ...events.value[idx],
        ...updated,
        updatedAt: new Date().toISOString(),
      }

      // Sync to Supabase
      const payload: any = {}
      if (updated.title !== undefined) payload.title = updated.title
      if (updated.description !== undefined) payload.description = updated.description
      if (updated.date !== undefined) payload.date = updated.date
      if (updated.time !== undefined) payload.time = updated.time
      if (updated.location !== undefined) payload.location = updated.location
      if (updated.category !== undefined) payload.category = updated.category
      if (updated.color !== undefined) payload.color = updated.color
      if (updated.invitedGuests !== undefined) payload.invited_guests = updated.invitedGuests
      if (updated.notes !== undefined) payload.notes = updated.notes

      edgeCrud.update('events', id, payload)
    }
  }

  // Delete Event
  async function deleteEvent(id: string) {
    events.value = events.value.filter((e) => e.id !== id)
    edgeCrud.delete('events', id)
  }

  // Add Guests from DB catalog to Event
  async function addGuestsToEvent(eventId: string, guestIds: string[], defaultRsvp: EventRsvpStatus = 'invited') {
    const event = events.value.find((e) => e.id === eventId)
    if (!event) return

    const currentInvites = [...(event.invitedGuests || [])]
    const existingGuestIds = new Set(currentInvites.map((inv) => inv.guestId))

    guestIds.forEach((gid) => {
      if (!existingGuestIds.has(gid)) {
        const guest = guestsStore.getGuestById(gid)
        if (guest) {
          currentInvites.push({
            guestId: guest.id,
            name: guest.name,
            phone: guest.phone || '',
            email: guest.email || '',
            group: guest.group || 'General',
            tags: guest.tags || [],
            additionalGuests: guest.additionalGuests || 0,
            rsvpStatus: defaultRsvp,
            invitationSent: false,
            notes: '',
          })
          existingGuestIds.add(gid)
        }
      }
    })

    await updateEvent(eventId, { invitedGuests: currentInvites })
  }

  // Remove Guest from Event
  async function removeGuestFromEvent(eventId: string, guestId: string) {
    const event = events.value.find((e) => e.id === eventId)
    if (!event) return

    const updatedInvites = (event.invitedGuests || []).filter((inv) => inv.guestId !== guestId)
    await updateEvent(eventId, { invitedGuests: updatedInvites })
  }

  // Update a single guest invite inside an event (e.g. RSVP status, notes, addons)
  async function updateEventGuestInvite(
    eventId: string,
    guestId: string,
    changes: Partial<EventGuestInvite>
  ) {
    const event = events.value.find((e) => e.id === eventId)
    if (!event) return

    const updatedInvites = (event.invitedGuests || []).map((inv) => {
      if (inv.guestId === guestId) {
        return { ...inv, ...changes }
      }
      return inv
    })

    await updateEvent(eventId, { invitedGuests: updatedInvites })
  }

  // Toggle invitation sent
  async function toggleGuestInvitationSent(eventId: string, guestId: string) {
    const event = events.value.find((e) => e.id === eventId)
    if (!event) return

    const inv = event.invitedGuests?.find((i) => i.guestId === guestId)
    if (inv) {
      await updateEventGuestInvite(eventId, guestId, { invitationSent: !inv.invitationSent })
    }
  }

  // Compute event stats
  function getEventStats(event: EventItem) {
    const invites = event.invitedGuests || []
    const totalInvited = invites.length

    let confirmedCount = 0
    let pendingCount = 0
    let declinedCount = 0
    let invitedCount = 0
    let totalHeadcount = 0 // Confirmed attendees + their addons

    invites.forEach((inv) => {
      const party = 1 + (Number(inv.additionalGuests) || 0)
      if (inv.rsvpStatus === 'confirmed') {
        confirmedCount++
        totalHeadcount += party
      } else if (inv.rsvpStatus === 'pending') {
        pendingCount++
      } else if (inv.rsvpStatus === 'declined') {
        declinedCount++
      } else {
        invitedCount++
      }
    })

    const sentCount = invites.filter((i) => i.invitationSent).length

    return {
      totalInvited,
      totalHeadcount,
      confirmedCount,
      pendingCount,
      declinedCount,
      invitedCount,
      sentCount,
    }
  }

  // Initial load
  fetchFromSupabase()

  return {
    events,
    isSyncing,
    searchQuery,
    selectedCategory,
    sortBy,
    totalEvents,
    filteredEvents,
    fetchFromSupabase,
    addEvent,
    updateEvent,
    deleteEvent,
    addGuestsToEvent,
    removeGuestFromEvent,
    updateEventGuestInvite,
    toggleGuestInvitationSent,
    getEventStats,
  }
})
