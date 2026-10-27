import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { FamilyMember } from '@/types'
import { edgeCrud, getUserStorageKey } from '@/lib/supabase'

const STORAGE_KEY = 'family_members_store_v2'
const ACTIVE_MEMBER_KEY = 'active_family_member_id_v2'

const initialMembers: FamilyMember[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Alex (Me)',
    role: 'Primary',
    avatarColor: '#6366F1',
    avatarIcon: 'mdi-account',
    monthlyBudget: 1500,
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Sarah',
    role: 'Spouse',
    avatarColor: '#EC4899',
    avatarIcon: 'mdi-face-woman',
    monthlyBudget: 1200,
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    name: 'Leo',
    role: 'Child',
    avatarColor: '#F59E0B',
    avatarIcon: 'mdi-emoticon-happy-outline',
    monthlyBudget: 300,
  },
]

export const useFamilyStore = defineStore('family', () => {
  const stored = localStorage.getItem(getUserStorageKey(STORAGE_KEY))
  const rawMembers: FamilyMember[] = stored ? JSON.parse(stored) : initialMembers
  const members = ref<FamilyMember[]>(
    rawMembers.map((m) => ({
      ...m,
      avatarColor: m.avatarColor || '#6366F1',
      avatarIcon: m.avatarIcon || 'mdi-account',
    }))
  )
  const isSyncing = ref(false)

  const storedActiveId = localStorage.getItem(getUserStorageKey(ACTIVE_MEMBER_KEY))
  const activeMemberId = ref<string>(
    storedActiveId && members.value.some((m) => m.id === storedActiveId)
      ? storedActiveId
      : members.value[0]?.id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  )

  watch(
    members,
    (newVal) => {
      localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(newVal))
      if (!newVal.some((m) => m.id === activeMemberId.value) && newVal.length > 0) {
        setActiveMember(newVal[0].id)
      }
    },
    { deep: true }
  )

  const activeMember = computed<FamilyMember>(() => {
    return members.value.find((m) => m.id === activeMemberId.value) || members.value[0] || {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      name: 'Alex',
      role: 'Primary',
      avatarColor: '#6366F1',
      avatarIcon: 'mdi-account',
    }
  })

  function setActiveMember(id: string) {
    if (members.value.some((m) => m.id === id)) {
      activeMemberId.value = id
      localStorage.setItem(getUserStorageKey(ACTIVE_MEMBER_KEY), id)
    }
  }

  async function fetchFromSupabase() {
    try {
      isSyncing.value = true
      const remote = await edgeCrud.list<any>('family_members')
      if (Array.isArray(remote)) {
        if (remote.length > 0) {
          members.value = remote.map((r) => ({
            id: r.id,
            name: r.name,
            role: r.role || 'Primary',
            avatarColor: r.avatar_color || '#6366F1',
            avatarIcon: r.avatar_icon || 'mdi-account',
            monthlyBudget: Number(r.monthly_budget) || 0,
          }))
        } else {
          const cached = localStorage.getItem(getUserStorageKey(STORAGE_KEY))
          if (cached) {
            try {
              members.value = JSON.parse(cached)
            } catch (e) {
              members.value = []
            }
          } else {
            // New user without members: seed default primary member
            const authUserRaw = localStorage.getItem('family_app_auth_user')
            const userName = authUserRaw ? JSON.parse(authUserRaw).name || 'Me' : 'Me'
            const defaultMember: FamilyMember = {
              id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'fam-' + Date.now(),
              name: userName,
              role: 'Primary',
              avatarColor: '#4F46E5',
              avatarIcon: 'mdi-account',
              monthlyBudget: 1500,
            }
            members.value = [defaultMember]
            edgeCrud.create('family_members', {
              id: defaultMember.id,
              name: defaultMember.name,
              role: defaultMember.role,
              avatar_color: defaultMember.avatarColor,
              avatar_icon: defaultMember.avatarIcon,
              monthly_budget: defaultMember.monthlyBudget,
            })
          }
        }
        localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(members.value))
        if (!members.value.some((m) => m.id === activeMemberId.value) && members.value.length > 0) {
          setActiveMember(members.value[0].id)
        }
      }
    } catch (e) {
      console.warn('Failed to fetch family members from Edge Function:', e)
    } finally {
      isSyncing.value = false
    }
  }

  async function addMember(member: Omit<FamilyMember, 'id'>) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'fam-' + Date.now()
    const newMember: FamilyMember = {
      ...member,
      id,
    }
    members.value.push(newMember)

    // Sync to Supabase Edge Function
    edgeCrud.create('family_members', {
      id,
      name: member.name,
      role: member.role,
      avatar_color: member.avatarColor,
      avatar_icon: member.avatarIcon,
      monthly_budget: member.monthlyBudget || 0,
    })

    return newMember
  }

  async function updateMember(id: string, updated: Partial<FamilyMember>) {
    const idx = members.value.findIndex((m) => m.id === id)
    if (idx !== -1) {
      members.value[idx] = { ...members.value[idx], ...updated }
    }

    // Sync to Supabase Edge Function
    const payload: any = {}
    if (updated.name !== undefined) payload.name = updated.name
    if (updated.role !== undefined) payload.role = updated.role
    if (updated.avatarColor !== undefined) payload.avatar_color = updated.avatarColor
    if (updated.avatarIcon !== undefined) payload.avatar_icon = updated.avatarIcon
    if (updated.monthlyBudget !== undefined) payload.monthly_budget = updated.monthlyBudget

    edgeCrud.update('family_members', id, payload)
  }

  async function deleteMember(id: string) {
    members.value = members.value.filter((m) => m.id !== id)
    if (activeMemberId.value === id && members.value.length > 0) {
      setActiveMember(members.value[0].id)
    }

    // Sync to Supabase Edge Function
    edgeCrud.delete('family_members', id)
  }

  function getMemberById(id: string) {
    return members.value.find((m) => m.id === id)
  }

  // Initial sync from Supabase Edge Function
  fetchFromSupabase()

  return {
    members,
    activeMemberId,
    activeMember,
    isSyncing,
    setActiveMember,
    fetchFromSupabase,
    addMember,
    updateMember,
    deleteMember,
    getMemberById,
  }
})
