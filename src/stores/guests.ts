import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { GuestItem, ReturnGift, AccompanyingPerson, RsvpStatus } from '@/types'
import { edgeCrud } from '@/lib/supabase'

const STORAGE_KEY = 'guests_store_v1'

const initialGuests: GuestItem[] = [
  {
    id: '35b86327-1737-45a7-af2f-61582e8e0a78',
    name: 'Vikram & Ananya Sharma',
    phone: '+91 98765 43210',
    email: 'vikram.sharma@example.com',
    group: "Groom's Family",
    tags: ['Brother Marriage', 'VIP'],
    rsvpStatus: 'confirmed',
    additionalGuests: 2,
    accompanyingPersons: [
      { name: 'Ananya Sharma', relation: 'Spouse' },
      { name: 'Aarav Sharma', relation: 'Son' },
    ],
    returnGifts: [
      { name: 'Silver Coin (10g)', price: 2500 },
      { name: 'Royal Mithai Box', price: 450 },
    ],
    notes: 'Close family arriving from Delhi on Friday',
    createdAt: new Date().toISOString(),
  },
  {
    id: '46c97438-2848-46b8-bf3f-72693f9f1b89',
    name: 'Priya Patel',
    phone: '+91 98123 45678',
    email: 'priya.patel@example.com',
    group: "Bride's Family",
    tags: ['Brother Marriage'],
    rsvpStatus: 'confirmed',
    additionalGuests: 1,
    accompanyingPersons: [{ name: 'Kavita Patel', relation: 'Sister' }],
    returnGifts: [{ name: 'Silk Stole & Scarf', price: 1200 }],
    notes: 'Requires ground floor seating',
    createdAt: new Date().toISOString(),
  },
  {
    id: '57da8549-3959-47c9-ca4a-837a4a0a2c90',
    name: 'Rahul & Meera Verma',
    phone: '+91 97234 56789',
    email: 'rahul.v@example.com',
    group: 'College Friends',
    tags: ['Brother Marriage', 'Outstation'],
    rsvpStatus: 'confirmed',
    additionalGuests: 1,
    accompanyingPersons: [{ name: 'Meera Verma', relation: 'Spouse' }],
    returnGifts: [{ name: 'Sweets & Dry Fruits Hamper', price: 650 }],
    notes: 'Staying at Hotel Novotel',
    createdAt: new Date().toISOString(),
  },
  {
    id: '68eb9650-406a-48da-db5b-948b5b1b3da1',
    name: 'Uncle Rajesh Malhotra',
    phone: '+91 99345 67890',
    email: 'rajesh.malhotra@example.com',
    group: 'Close Relatives',
    tags: ['Brother Marriage', 'VIP'],
    rsvpStatus: 'confirmed',
    additionalGuests: 3,
    accompanyingPersons: [
      { name: 'Sunita Malhotra', relation: 'Spouse' },
      { name: 'Rohan Malhotra', relation: 'Son' },
      { name: 'Simran Malhotra', relation: 'Daughter' },
    ],
    returnGifts: [{ name: 'Silver Diya Pair', price: 3200 }],
    notes: 'Special VIP car pass required',
    createdAt: new Date().toISOString(),
  },
  {
    id: '79fc0761-517b-49eb-ec6c-a59c6c2c4eb2',
    name: 'Amitabh Sengupta',
    phone: '+91 98456 78901',
    email: 'amitabh.s@example.com',
    group: 'Colleagues',
    tags: ['Office Squad'],
    rsvpStatus: 'pending',
    additionalGuests: 0,
    accompanyingPersons: [],
    returnGifts: [{ name: 'Artisanal Candle & Tea Set', price: 850 }],
    notes: 'Awaiting leave confirmation',
    createdAt: new Date().toISOString(),
  },
]

export const defaultGuestGroups = [
  "Groom's Family",
  "Bride's Family",
  'Close Relatives',
  'College Friends',
  'Colleagues',
  'Neighbors',
  'VIP',
  'General',
]

export const defaultSuggestedTags = [
  'Brother Marriage',
  'VIP',
  'Outstation',
  'Vegetarian',
  'Hotel Needed',
  'Family Event',
  'Office Squad',
]

export const defaultGiftPresets = [
  { name: 'Silver Coin (10g)', price: 2500 },
  { name: 'Silver Diya Pair', price: 3200 },
  { name: 'Royal Mithai Box', price: 450 },
  { name: 'Sweets & Dry Fruits Hamper', price: 650 },
  { name: 'Silk Stole & Scarf', price: 1200 },
  { name: 'Artisanal Candle & Tea Set', price: 850 },
  { name: 'Premium Ceramic Mug Set', price: 500 },
  { name: 'Handcrafted Brass Bell', price: 950 },
]

export const useGuestsStore = defineStore('guests', () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  let rawGuests: GuestItem[] = []
  try {
    const parsed = stored ? JSON.parse(stored) : null
    if (Array.isArray(parsed) && parsed.length > 0) {
      const storedIds = new Set(parsed.map((g: any) => g.id))
      const missingInitial = initialGuests.filter((g) => !storedIds.has(g.id))
      rawGuests = [...parsed, ...missingInitial]
    } else {
      rawGuests = initialGuests
    }
  } catch {
    rawGuests = initialGuests
  }

  const guests = ref<GuestItem[]>(
    rawGuests.map((g) => ({
      ...g,
      tags: Array.isArray(g.tags) ? g.tags : [],
      returnGifts: Array.isArray(g.returnGifts) ? g.returnGifts : [],
      returnGiftGiven: Boolean(g.returnGiftGiven || false),
      accompanyingPersons: Array.isArray(g.accompanyingPersons) ? g.accompanyingPersons : [],
      additionalGuests: typeof g.additionalGuests === 'number' ? g.additionalGuests : 0,
      rsvpStatus: g.rsvpStatus || 'confirmed',
      group: g.group || 'General',
    }))
  )

  const isSyncing = ref(false)
  const searchQuery = ref('')
  const selectedGroup = ref<string>('all')
  const selectedRsvp = ref<string>('all')
  const selectedTag = ref<string | null>(null)
  const selectedTags = ref<string[]>([])
  const giftFilter = ref<'all' | 'with_gift' | 'without_gift'>('all')
  const selectedGiftName = ref<string | null>(null)

  watch(
    guests,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    },
    { deep: true }
  )

  // Computed metrics
  const totalGuests = computed(() => guests.value.length)

  const totalPartyCount = computed(() => {
    return guests.value.reduce((acc, curr) => {
      if (curr.rsvpStatus === 'declined') return acc
      return acc + 1 + (Number(curr.additionalGuests) || 0)
    }, 0)
  })

  const totalConfirmedParty = computed(() => {
    return guests.value
      .filter((g) => g.rsvpStatus === 'confirmed')
      .reduce((acc, curr) => acc + 1 + (Number(curr.additionalGuests) || 0), 0)
  })

  const confirmedCount = computed(
    () => guests.value.filter((g) => g.rsvpStatus === 'confirmed').length
  )

  const pendingCount = computed(
    () => guests.value.filter((g) => g.rsvpStatus === 'pending').length
  )

  const declinedCount = computed(
    () => guests.value.filter((g) => g.rsvpStatus === 'declined').length
  )

  const totalReturnGiftsCount = computed(() => {
    return guests.value.reduce((acc, curr) => {
      if (curr.rsvpStatus === 'declined') return acc
      return acc + (Array.isArray(curr.returnGifts) ? curr.returnGifts.length : 0)
    }, 0)
  })

  const totalReturnGiftsCost = computed(() => {
    return guests.value.reduce((acc, curr) => {
      if (curr.rsvpStatus === 'declined') return acc
      const guestGiftSum = Array.isArray(curr.returnGifts)
        ? curr.returnGifts.reduce((sum, gift) => sum + (Number(gift.price) || 0), 0)
        : 0
      return acc + guestGiftSum
    }, 0)
  })

  const guestsWithGiftCount = computed(() => {
    return guests.value.filter(
      (g) => Array.isArray(g.returnGifts) && g.returnGifts.length > 0
    ).length
  })

  const guestsWithoutGiftCount = computed(() => {
    return guests.value.filter(
      (g) => !Array.isArray(g.returnGifts) || g.returnGifts.length === 0
    ).length
  })

  const allGroups = computed(() => {
    const groupSet = new Set<string>(defaultGuestGroups)
    guests.value.forEach((g) => {
      if (g.group && g.group.trim()) groupSet.add(g.group.trim())
    })
    return Array.from(groupSet)
  })

  const allTags = computed(() => {
    const tagSet = new Set<string>(defaultSuggestedTags)
    guests.value.forEach((g) => {
      if (Array.isArray(g.tags)) {
        g.tags.forEach((t) => {
          if (t && t.trim()) tagSet.add(t.trim())
        })
      }
    })
    return Array.from(tagSet)
  })

  const tagCountMap = computed(() => {
    const map: Record<string, number> = {}
    guests.value.forEach((g) => {
      if (Array.isArray(g.tags)) {
        g.tags.forEach((t) => {
          map[t] = (map[t] || 0) + 1
        })
      }
    })
    return map
  })

  const returnGiftsDistribution = computed(() => {
    const map: Record<string, number> = {}
    guests.value.forEach((g) => {
      if (Array.isArray(g.returnGifts)) {
        g.returnGifts.forEach((gift) => {
          if (gift.name && gift.name.trim()) {
            map[gift.name] = (map[gift.name] || 0) + 1
          }
        })
      }
    })
    return Object.entries(map).map(([name, count]) => ({ name, count }))
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    if (selectedGroup.value !== 'all') count++
    if (selectedRsvp.value !== 'all') count++
    if (selectedTags.value.length > 0 || selectedTag.value) count++
    if (giftFilter.value !== 'all') count++
    if (selectedGiftName.value) count++
    return count
  })

  const filteredGuests = computed(() => {
    return guests.value.filter((guest) => {
      // Search by name, phone, email, notes, or companion names
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        const nameMatch = guest.name.toLowerCase().includes(query)
        const phoneMatch = guest.phone ? guest.phone.toLowerCase().includes(query) : false
        const emailMatch = guest.email ? guest.email.toLowerCase().includes(query) : false
        const notesMatch = guest.notes ? guest.notes.toLowerCase().includes(query) : false
        const giftMatch = Array.isArray(guest.returnGifts) &&
          guest.returnGifts.some((g) => g.name.toLowerCase().includes(query))
        const companionMatch = Array.isArray(guest.accompanyingPersons) &&
          guest.accompanyingPersons.some((p) => p.name.toLowerCase().includes(query))
        if (!nameMatch && !phoneMatch && !emailMatch && !notesMatch && !giftMatch && !companionMatch) {
          return false
        }
      }

      // Group filter
      if (selectedGroup.value !== 'all' && guest.group !== selectedGroup.value) {
        return false
      }

      // RSVP filter (treat 'declined' as 'all' since declined was removed from RSVP filter UI)
      if (
        selectedRsvp.value !== 'all' &&
        selectedRsvp.value !== 'declined' &&
        guest.rsvpStatus !== selectedRsvp.value
      ) {
        return false
      }

      // Tag filter (multi-tag selection or single selectedTag)
      if (selectedTags.value.length > 0) {
        if (!Array.isArray(guest.tags) || !selectedTags.value.some((t) => guest.tags.includes(t))) {
          return false
        }
      } else if (selectedTag.value) {
        if (!Array.isArray(guest.tags) || !guest.tags.includes(selectedTag.value)) {
          return false
        }
      }

      // Return gift filter: with / without
      if (giftFilter.value === 'with_gift') {
        if (!Array.isArray(guest.returnGifts) || guest.returnGifts.length === 0) {
          return false
        }
      } else if (giftFilter.value === 'without_gift') {
        if (Array.isArray(guest.returnGifts) && guest.returnGifts.length > 0) {
          return false
        }
      }

      // Specific return gift filter
      if (selectedGiftName.value) {
        if (!Array.isArray(guest.returnGifts) || !guest.returnGifts.some((g) => g.name === selectedGiftName.value)) {
          return false
        }
      }

      return true
    })
  })

  function toggleTag(tag: string) {
    const idx = selectedTags.value.indexOf(tag)
    if (idx === -1) {
      selectedTags.value.push(tag)
    } else {
      selectedTags.value.splice(idx, 1)
    }
    selectedTag.value = selectedTags.value.length === 1 ? selectedTags.value[0] : null
  }

  function toggleGiftNameFilter(giftName: string) {
    if (selectedGiftName.value === giftName) {
      selectedGiftName.value = null
    } else {
      selectedGiftName.value = giftName
    }
  }

  function resetAllFilters() {
    searchQuery.value = ''
    selectedGroup.value = 'all'
    selectedRsvp.value = 'all'
    selectedTag.value = null
    selectedTags.value = []
    giftFilter.value = 'all'
    selectedGiftName.value = null
  }

  // Group count map
  const groupCountMap = computed(() => {
    const map: Record<string, number> = {}
    guests.value.forEach((g) => {
      const grp = g.group || 'General'
      map[grp] = (map[grp] || 0) + 1
    })
    return map
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

  async function fetchFromSupabase() {
    try {
      isSyncing.value = true
      const remote = await edgeCrud.list<any>('guests')
      if (remote && remote.length > 0) {
        const remoteGuests: GuestItem[] = remote.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone || '',
          email: r.email || '',
          group: r.group || 'General',
          tags: Array.isArray(r.tags) ? r.tags : [],
          rsvpStatus: (r.rsvp_status || 'confirmed') as RsvpStatus,
          additionalGuests: Number(r.additional_guests) || 0,
          accompanyingPersons: safeParseArray(r.accompanying_persons),
          returnGifts: safeParseArray(r.return_gifts),
          returnGiftGiven: Boolean(r.return_gift_given || r.returnGiftGiven || false),
          notes: r.notes || '',
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
        }))

        // Merge remote guests with initial demo guests by ID
        const remoteIds = new Set(remoteGuests.map((g) => g.id))
        const unseeded = initialGuests.filter((g) => !remoteIds.has(g.id))
        guests.value = [...remoteGuests, ...unseeded]
      } else if (!guests.value || guests.value.length === 0) {
        guests.value = initialGuests
      }
    } catch (e) {
      console.warn('Failed to fetch guests from Edge Function:', e)
      if (!guests.value || guests.value.length === 0) {
        guests.value = initialGuests
      }
    } finally {
      isSyncing.value = false
    }
  }

  async function addGuest(
    guestData: Omit<GuestItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GuestItem> {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'guest-' + Date.now()
    const now = new Date().toISOString()

    const newGuest: GuestItem = {
      ...guestData,
      id,
      additionalGuests: Number(guestData.additionalGuests) || 0,
      tags: Array.isArray(guestData.tags) ? guestData.tags : [],
      returnGifts: Array.isArray(guestData.returnGifts) ? guestData.returnGifts : [],
      returnGiftGiven: Boolean(guestData.returnGiftGiven || false),
      accompanyingPersons: Array.isArray(guestData.accompanyingPersons)
        ? guestData.accompanyingPersons
        : [],
      createdAt: now,
      updatedAt: now,
    }

    guests.value.unshift(newGuest)

    // Sync to Supabase Edge Function
    edgeCrud.create('guests', {
      id,
      name: newGuest.name,
      phone: newGuest.phone || null,
      email: newGuest.email || null,
      group: newGuest.group,
      tags: newGuest.tags,
      rsvp_status: newGuest.rsvpStatus,
      additional_guests: newGuest.additionalGuests,
      accompanying_persons: newGuest.accompanyingPersons,
      return_gifts: newGuest.returnGifts,
      return_gift_given: newGuest.returnGiftGiven,
      notes: newGuest.notes || '',
    })

    return newGuest
  }

  async function updateGuest(id: string, updated: Partial<GuestItem>) {
    const idx = guests.value.findIndex((g) => g.id === id)
    if (idx !== -1) {
      guests.value[idx] = {
        ...guests.value[idx],
        ...updated,
        updatedAt: new Date().toISOString(),
      }
    }

    // Sync to Supabase Edge Function
    const payload: any = {}
    if (updated.name !== undefined) payload.name = updated.name
    if (updated.phone !== undefined) payload.phone = updated.phone
    if (updated.email !== undefined) payload.email = updated.email
    if (updated.group !== undefined) payload.group = updated.group
    if (updated.tags !== undefined) payload.tags = updated.tags
    if (updated.rsvpStatus !== undefined) payload.rsvp_status = updated.rsvpStatus
    if (updated.additionalGuests !== undefined) payload.additional_guests = updated.additionalGuests
    if (updated.accompanyingPersons !== undefined) payload.accompanying_persons = updated.accompanyingPersons
    if (updated.returnGifts !== undefined) payload.return_gifts = updated.returnGifts
    if (updated.returnGiftGiven !== undefined) payload.return_gift_given = updated.returnGiftGiven
    if (updated.notes !== undefined) payload.notes = updated.notes

    edgeCrud.update('guests', id, payload)
  }

  async function toggleReturnGiftGiven(guestId: string) {
    const guest = guests.value.find((g) => g.id === guestId)
    if (!guest) return
    const newState = !guest.returnGiftGiven
    await updateGuest(guestId, { returnGiftGiven: newState })
  }

  async function deleteGuest(id: string) {
    guests.value = guests.value.filter((g) => g.id !== id)
    edgeCrud.delete('guests', id)
  }

  async function addReturnGiftToGuest(guestId: string, gift: ReturnGift) {
    const guest = guests.value.find((g) => g.id === guestId)
    if (!guest) return
    const gifts = [...(guest.returnGifts || []), gift]
    await updateGuest(guestId, { returnGifts: gifts })
  }

  async function removeReturnGiftFromGuest(guestId: string, giftIndex: number) {
    const guest = guests.value.find((g) => g.id === guestId)
    if (!guest) return
    const gifts = (guest.returnGifts || []).filter((_, i) => i !== giftIndex)
    await updateGuest(guestId, { returnGifts: gifts })
  }

  function getGuestById(id: string) {
    return guests.value.find((g) => g.id === id)
  }

  // Initial load
  fetchFromSupabase()

  return {
    guests,
    isSyncing,
    searchQuery,
    selectedGroup,
    selectedRsvp,
    selectedTag,
    selectedTags,
    giftFilter,
    selectedGiftName,
    totalGuests,
    totalPartyCount,
    totalConfirmedParty,
    confirmedCount,
    pendingCount,
    declinedCount,
    totalReturnGiftsCount,
    totalReturnGiftsCost,
    guestsWithGiftCount,
    guestsWithoutGiftCount,
    allGroups,
    allTags,
    tagCountMap,
    returnGiftsDistribution,
    activeFiltersCount,
    groupCountMap,
    filteredGuests,
    toggleTag,
    toggleGiftNameFilter,
    resetAllFilters,
    fetchFromSupabase,
    addGuest,
    updateGuest,
    toggleReturnGiftGiven,
    deleteGuest,
    addReturnGiftToGuest,
    removeReturnGiftFromGuest,
    getGuestById,
  }
})
