import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { RecurringExpenseItem, Frequency, ExpenseCategory } from '@/types'
import { edgeCrud } from '@/lib/supabase'

const STORAGE_KEY = 'recurring_expenses_store_v2'

const initialRecurring: RecurringExpenseItem[] = [
  {
    id: 'f1111111-1111-4111-8111-111111111111',
    title: 'Apartment Rent & Maintenance',
    amount: 1100,
    frequency: 'monthly',
    category: 'Utilities',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    billingDay: 1,
    nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
    isActive: true,
    notes: 'Direct auto-debit on 1st',
  },
  {
    id: 'f2222222-2222-4222-8222-222222222222',
    title: 'Streaming & Entertainment Bundle',
    amount: 24.99,
    frequency: 'monthly',
    category: 'Entertainment',
    memberId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    billingDay: 15,
    nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 15).toISOString().split('T')[0],
    isActive: true,
    notes: 'Netflix + Spotify Family',
  },
  {
    id: 'f3333333-3333-4333-8333-333333333333',
    title: 'Family Health Insurance',
    amount: 220,
    frequency: 'monthly',
    category: 'Health',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    billingDay: 20,
    nextDueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 20).toISOString().split('T')[0],
    isActive: true,
    notes: 'Comprehensive plan',
  },
  {
    id: 'f4444444-4444-4444-8444-444444444444',
    title: 'Cloud Backup Storage',
    amount: 35.88,
    frequency: 'yearly',
    category: 'Utilities',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    billingDay: 10,
    nextDueDate: '2026-11-10',
    isActive: false,
    notes: 'Annual renew',
  },
]

export const useRecurringStore = defineStore('recurring', () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const items = ref<RecurringExpenseItem[]>(stored ? JSON.parse(stored) : initialRecurring)
  const isSyncing = ref(false)

  watch(
    items,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    },
    { deep: true }
  )

  const activeMonthlyEstimate = computed(() => {
    return items.value
      .filter((item) => item.isActive)
      .reduce((acc, curr) => {
        let monthly = Number(curr.amount || 0)
        if (curr.frequency === 'daily') monthly *= 30
        else if (curr.frequency === 'weekly') monthly *= 4.33
        else if (curr.frequency === 'yearly') monthly /= 12
        return acc + monthly
      }, 0)
  })

  async function fetchFromSupabase() {
    try {
      isSyncing.value = true
      const remote = await edgeCrud.list<any>('recurring_expenses')
      if (remote && remote.length > 0) {
        items.value = remote.map((r) => ({
          id: r.id,
          title: r.title,
          amount: Number(r.amount) || 0,
          frequency: (r.frequency || 'monthly') as Frequency,
          category: (r.category || 'Utilities') as ExpenseCategory,
          memberId: r.member_id || '',
          billingDay: Number(r.billing_day) || 1,
          nextDueDate: r.next_due_date || new Date().toISOString().split('T')[0],
          isActive: r.is_active !== undefined ? !!r.is_active : true,
          tags: Array.isArray(r.tags) ? r.tags : [],
          notes: r.notes || '',
        }))
      }
    } catch (e) {
      console.warn('Failed to fetch recurring expenses from Edge Function:', e)
    } finally {
      isSyncing.value = false
    }
  }

  async function addItem(item: Omit<RecurringExpenseItem, 'id'>) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'rec-' + Date.now()
    const newItem: RecurringExpenseItem = {
      ...item,
      id,
      amount: Number(item.amount),
    }
    items.value.unshift(newItem)

    // Sync to Supabase Edge Function
    edgeCrud.create('recurring_expenses', {
      id,
      title: newItem.title,
      amount: newItem.amount,
      frequency: newItem.frequency,
      category: newItem.category,
      member_id: newItem.memberId,
      billing_day: newItem.billingDay,
      next_due_date: newItem.nextDueDate,
      is_active: newItem.isActive,
      tags: newItem.tags || [],
      notes: newItem.notes || '',
    })

    return newItem
  }

  async function updateItem(id: string, updated: Partial<RecurringExpenseItem>) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx !== -1) {
      items.value[idx] = {
        ...items.value[idx],
        ...updated,
        amount: updated.amount !== undefined ? Number(updated.amount) : items.value[idx].amount,
      }
    }

    // Sync to Supabase Edge Function
    const payload: any = {}
    if (updated.title !== undefined) payload.title = updated.title
    if (updated.amount !== undefined) payload.amount = Number(updated.amount)
    if (updated.frequency !== undefined) payload.frequency = updated.frequency
    if (updated.category !== undefined) payload.category = updated.category
    if (updated.memberId !== undefined) payload.member_id = updated.memberId
    if (updated.billingDay !== undefined) payload.billing_day = Number(updated.billingDay)
    if (updated.nextDueDate !== undefined) payload.next_due_date = updated.nextDueDate
    if (updated.isActive !== undefined) payload.is_active = updated.isActive
    if (updated.notes !== undefined) payload.notes = updated.notes

    edgeCrud.update('recurring_expenses', id, payload)
  }

  async function deleteItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    // Sync to Supabase Edge Function
    edgeCrud.delete('recurring_expenses', id)
  }

  async function toggleActive(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (item) {
      item.isActive = !item.isActive
      // Sync to Supabase Edge Function
      edgeCrud.update('recurring_expenses', id, { is_active: item.isActive })
    }
  }

  // Initial fetch from Supabase
  fetchFromSupabase()

  return {
    items,
    isSyncing,
    activeMonthlyEstimate,
    fetchFromSupabase,
    addItem,
    updateItem,
    deleteItem,
    toggleActive,
  }
})
