import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { IncomeItem, IncomeCategory } from '@/types'
import { edgeCrud, getUserStorageKey } from '@/lib/supabase'

const STORAGE_KEY = 'incomes_store_v1'

export const useIncomesStore = defineStore('incomes', () => {
  const stored = localStorage.getItem(getUserStorageKey(STORAGE_KEY))
  const incomes = ref<IncomeItem[]>(stored ? JSON.parse(stored) : [])
  const isSyncing = ref(false)

  watch(
    incomes,
    (newVal) => {
      localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(newVal))
    },
    { deep: true }
  )

  const INCOMES_TAGS_KEY = 'incomes_tags_catalog_v1'
  const defaultSuggestedTags = [
    'Salary',
    'Brother Marriage',
    'Shagun',
    'Bonus',
    'Freelance',
    'Dividends',
    'Gift',
    'Rental Income',
  ]

  let initialIncomeTags: string[] = defaultSuggestedTags
  try {
    const storedTags = localStorage.getItem(INCOMES_TAGS_KEY)
    if (storedTags) {
      const parsed = JSON.parse(storedTags)
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialIncomeTags = parsed
      }
    }
  } catch {}

  const customTags = ref<string[]>(initialIncomeTags)

  watch(
    customTags,
    (newVal) => {
      localStorage.setItem(INCOMES_TAGS_KEY, JSON.stringify(newVal))
    },
    { deep: true }
  )

  const allTags = computed(() => {
    const tagSet = new Set<string>(customTags.value)
    incomes.value.forEach((inc) => {
      if (Array.isArray(inc.tags)) {
        inc.tags.forEach((t) => {
          if (t && t.trim()) tagSet.add(t.trim())
        })
      }
    })
    return Array.from(tagSet)
  })

  function addCustomTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (!customTags.value.includes(trimmed)) {
      customTags.value.push(trimmed)
    }
  }

  function removeCustomTag(tag: string, removeFromIncomes = true) {
    customTags.value = customTags.value.filter((t) => t !== tag)
    if (removeFromIncomes) {
      incomes.value.forEach((inc) => {
        if (Array.isArray(inc.tags) && inc.tags.includes(tag)) {
          inc.tags = inc.tags.filter((t) => t !== tag)
        }
      })
    }
  }

  const totalAmount = computed(() => {
    return incomes.value.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  })

  const thisMonthAmount = computed(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return incomes.value
      .filter((inc) => inc.date.startsWith(currentMonth))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  })

  function getTagTotal(tagName: string) {
    return incomes.value
      .filter((inc) => Array.isArray(inc.tags) && inc.tags.includes(tagName))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  }

  function getTagIncomesCount(tagName: string) {
    return incomes.value.filter((inc) => Array.isArray(inc.tags) && inc.tags.includes(tagName)).length
  }

  async function fetchFromSupabase() {
    try {
      isSyncing.value = true
      const remote = await edgeCrud.list<any>('incomes')
      if (Array.isArray(remote)) {
        incomes.value = remote.map((r) => ({
          id: r.id,
          title: r.title,
          amount: Number(r.amount) || 0,
          category: (r.category || 'Other') as IncomeCategory,
          memberId: r.member_id || '',
          date: r.date || new Date().toISOString().split('T')[0],
          tags: Array.isArray(r.tags) ? r.tags : [],
          notes: r.notes || '',
        }))
        localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(incomes.value))
      }
    } catch (e) {
      console.warn('Failed to fetch incomes from Edge Function:', e)
    } finally {
      isSyncing.value = false
    }
  }

  async function addIncome(income: Omit<IncomeItem, 'id'>) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'inc-' + Date.now()
    const newIncome: IncomeItem = {
      ...income,
      id,
      amount: Number(income.amount),
      tags: Array.isArray(income.tags) ? income.tags : [],
    }
    incomes.value.unshift(newIncome)

    // Sync to Supabase Edge Function
    edgeCrud.create('incomes', {
      id,
      title: newIncome.title,
      amount: newIncome.amount,
      category: newIncome.category,
      member_id: newIncome.memberId,
      date: newIncome.date,
      tags: newIncome.tags,
      notes: newIncome.notes,
    })

    return newIncome
  }

  async function updateIncome(id: string, updated: Partial<IncomeItem>) {
    const idx = incomes.value.findIndex((inc) => inc.id === id)
    if (idx !== -1) {
      incomes.value[idx] = {
        ...incomes.value[idx],
        ...updated,
        amount: updated.amount !== undefined ? Number(updated.amount) : incomes.value[idx].amount,
        tags: Array.isArray(updated.tags) ? updated.tags : incomes.value[idx].tags,
      }
      edgeCrud.update('incomes', id, {
        title: incomes.value[idx].title,
        amount: incomes.value[idx].amount,
        category: incomes.value[idx].category,
        member_id: incomes.value[idx].memberId,
        date: incomes.value[idx].date,
        tags: incomes.value[idx].tags,
        notes: incomes.value[idx].notes,
      })
    }
  }

  async function deleteIncome(id: string) {
    incomes.value = incomes.value.filter((inc) => inc.id !== id)
    // Sync to Supabase Edge Function
    edgeCrud.delete('incomes', id)
  }

  // Initial fetch from Supabase
  fetchFromSupabase()

  return {
    incomes,
    allTags,
    customTags,
    addCustomTag,
    removeCustomTag,
    isSyncing,
    totalAmount,
    thisMonthAmount,
    fetchFromSupabase,
    getTagTotal,
    getTagIncomesCount,
    addIncome,
    updateIncome,
    deleteIncome,
  }
})
