import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ExpenseItem, ExpenseCategory } from '@/types'
import { edgeCrud } from '@/lib/supabase'

const STORAGE_KEY = 'expenses_store_v3'

const initialExpenses: ExpenseItem[] = [
  {
    id: 'e1111111-1111-4111-8111-111111111111',
    title: 'Wedding Reception Venue Deposit',
    amount: 1500.0,
    category: 'Other',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    date: new Date().toISOString().split('T')[0],
    tags: ['Brother Marriage', 'Family Event'],
    notes: 'Advance booking for Grand Ballroom',
  },
  {
    id: 'e2222222-2222-4222-8222-222222222222',
    title: 'Traditional Wedding Attire & Suits',
    amount: 620.0,
    category: 'Shopping',
    memberId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    tags: ['Brother Marriage'],
    notes: 'Designer wear for the ceremony',
  },
  {
    id: 'e3333333-3333-4333-8333-333333333333',
    title: 'Catering Advance Tasting Menu',
    amount: 350.0,
    category: 'Dining',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    tags: ['Brother Marriage'],
    notes: 'Menu finalized with chef',
  },
  {
    id: 'e4444444-4444-4444-8444-444444444444',
    title: 'Supermarket Groceries',
    amount: 84.5,
    category: 'Groceries',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    date: new Date().toISOString().split('T')[0],
    tags: ['Household'],
    notes: 'Weekly pantry refill',
  },
]

export const useExpensesStore = defineStore('expenses', () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const expenses = ref<ExpenseItem[]>(stored ? JSON.parse(stored) : initialExpenses)
  const isSyncing = ref(false)

  watch(
    expenses,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    },
    { deep: true }
  )

  const EXPENSES_TAGS_KEY = 'expenses_tags_catalog_v1'
  const defaultSuggestedTags = [
    'Brother Marriage',
    'Home Renovation',
    'Vacation',
    'Birthday',
    'Household',
    'Bills',
    'Family Event',
  ]

  let initialExpenseTags: string[] = defaultSuggestedTags
  try {
    const storedTags = localStorage.getItem(EXPENSES_TAGS_KEY)
    if (storedTags) {
      const parsed = JSON.parse(storedTags)
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialExpenseTags = parsed
      }
    }
  } catch {}

  const customTags = ref<string[]>(initialExpenseTags)

  watch(
    customTags,
    (newVal) => {
      localStorage.setItem(EXPENSES_TAGS_KEY, JSON.stringify(newVal))
    },
    { deep: true }
  )

  const allTags = computed(() => {
    const tagSet = new Set<string>(customTags.value)
    expenses.value.forEach((e) => {
      if (Array.isArray(e.tags)) {
        e.tags.forEach((t) => {
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

  function removeCustomTag(tag: string, removeFromExpenses = true) {
    customTags.value = customTags.value.filter((t) => t !== tag)
    if (removeFromExpenses) {
      expenses.value.forEach((e) => {
        if (Array.isArray(e.tags) && e.tags.includes(tag)) {
          e.tags = e.tags.filter((t) => t !== tag)
        }
      })
    }
  }

  const totalAmount = computed(() => {
    return expenses.value.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  })

  const thisMonthAmount = computed(() => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return expenses.value
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  })

  function getTagTotal(tagName: string) {
    return expenses.value
      .filter((e) => Array.isArray(e.tags) && e.tags.includes(tagName))
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  }

  function getTagExpensesCount(tagName: string) {
    return expenses.value.filter((e) => Array.isArray(e.tags) && e.tags.includes(tagName)).length
  }

  async function fetchFromSupabase() {
    try {
      isSyncing.value = true
      const remote = await edgeCrud.list<any>('expenses')
      if (remote && remote.length > 0) {
        expenses.value = remote.map((r) => ({
          id: r.id,
          title: r.title,
          amount: Number(r.amount) || 0,
          category: (r.category || 'Other') as ExpenseCategory,
          memberId: r.member_id || '',
          date: r.date || new Date().toISOString().split('T')[0],
          tags: Array.isArray(r.tags) ? r.tags : [],
          notes: r.notes || '',
        }))
      }
    } catch (e) {
      console.warn('Failed to fetch expenses from Edge Function:', e)
    } finally {
      isSyncing.value = false
    }
  }

  async function addExpense(expense: Omit<ExpenseItem, 'id'>) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'exp-' + Date.now()
    const newExpense: ExpenseItem = {
      ...expense,
      id,
      amount: Number(expense.amount),
      tags: Array.isArray(expense.tags) ? expense.tags : [],
    }
    expenses.value.unshift(newExpense)

    // Sync to Supabase Edge Function
    edgeCrud.create('expenses', {
      id,
      title: newExpense.title,
      amount: newExpense.amount,
      category: newExpense.category,
      member_id: newExpense.memberId,
      date: newExpense.date,
      tags: newExpense.tags,
      notes: newExpense.notes,
    })

    return newExpense
  }

  async function updateExpense(id: string, updated: Partial<ExpenseItem>) {
    const idx = expenses.value.findIndex((e) => e.id === id)
    if (idx !== -1) {
      expenses.value[idx] = {
        ...expenses.value[idx],
        ...updated,
        amount: updated.amount !== undefined ? Number(updated.amount) : expenses.value[idx].amount,
        tags: Array.isArray(updated.tags) ? updated.tags : expenses.value[idx].tags,
      }
      edgeCrud.update('expenses', id, {
        title: expenses.value[idx].title,
        amount: expenses.value[idx].amount,
        category: expenses.value[idx].category,
        member_id: expenses.value[idx].memberId,
        date: expenses.value[idx].date,
        tags: expenses.value[idx].tags,
        notes: expenses.value[idx].notes,
      })
    }
  }

  async function deleteExpense(id: string) {
    expenses.value = expenses.value.filter((e) => e.id !== id)
    // Sync to Supabase Edge Function
    edgeCrud.delete('expenses', id)
  }

  // Initial fetch from Supabase
  fetchFromSupabase()

  return {
    expenses,
    allTags,
    customTags,
    addCustomTag,
    removeCustomTag,
    isSyncing,
    totalAmount,
    thisMonthAmount,
    fetchFromSupabase,
    getTagTotal,
    getTagExpensesCount,
    addExpense,
    updateExpense,
    deleteExpense,
  }
})
