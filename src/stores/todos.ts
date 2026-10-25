import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { TodoItem, Priority } from '@/types'
import { edgeCrud } from '@/lib/supabase'

const STORAGE_KEY = 'todos_store_v2'

const initialTodos: TodoItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Buy fresh groceries & vegetables',
    completed: false,
    priority: 'high',
    category: 'Groceries',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Review quarterly electric & water bills',
    completed: false,
    priority: 'medium',
    category: 'Utilities',
    memberId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    title: 'Plan weekend family dinner',
    completed: true,
    priority: 'low',
    category: 'Family',
    memberId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    title: 'Schedule dentist checkup for Leo',
    completed: false,
    priority: 'high',
    category: 'Health',
    memberId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  },
]

export const useTodoStore = defineStore('todos', () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const todos = ref<TodoItem[]>(stored ? JSON.parse(stored) : initialTodos)
  const isSyncing = ref(false)

  watch(
    todos,
    (newVal) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
    },
    { deep: true }
  )

  const completedCount = computed(() => todos.value.filter((t) => t.completed).length)
  const activeCount = computed(() => todos.value.filter((t) => !t.completed).length)
  const totalCount = computed(() => todos.value.length)

  async function fetchFromSupabase() {
    try {
      isSyncing.value = true
      const remote = await edgeCrud.list<any>('todos')
      if (remote && remote.length > 0) {
        todos.value = remote.map((r) => ({
          id: r.id,
          title: r.title,
          completed: !!r.completed,
          priority: (r.priority || 'medium') as Priority,
          category: r.category || 'General',
          dueDate: r.due_date || undefined,
          memberId: r.member_id || undefined,
          createdAt: r.created_at || new Date().toISOString(),
        }))
      }
    } catch (e) {
      console.warn('Failed to fetch todos from Edge Function:', e)
    } finally {
      isSyncing.value = false
    }
  }

  async function addTodo(
    title: string,
    priority: Priority = 'medium',
    category = 'General',
    dueDate?: string,
    memberId?: string
  ) {
    if (!title.trim()) return
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'todo-' + Date.now()
    const newTodo: TodoItem = {
      id,
      title: title.trim(),
      completed: false,
      priority,
      category,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      memberId: memberId || undefined,
      createdAt: new Date().toISOString(),
    }
    todos.value.unshift(newTodo)

    // Sync to Supabase Edge Function
    edgeCrud.create('todos', {
      id,
      title: newTodo.title,
      completed: false,
      priority: newTodo.priority,
      category: newTodo.category,
      due_date: newTodo.dueDate,
      member_id: newTodo.memberId || null,
    })
  }

  async function toggleDone(id: string) {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      // Sync to Supabase Edge Function
      edgeCrud.update('todos', id, { completed: todo.completed })
    }
  }

  async function updateTodo(id: string, updated: Partial<TodoItem>) {
    const todo = todos.value.find((t) => t.id === id)
    if (todo) {
      Object.assign(todo, updated)
      edgeCrud.update('todos', id, {
        title: todo.title,
        priority: todo.priority,
        category: todo.category,
        due_date: todo.dueDate,
        member_id: todo.memberId || null,
        completed: todo.completed,
      })
    }
  }

  async function deleteTodo(id: string) {
    todos.value = todos.value.filter((t) => t.id !== id)
    // Sync to Supabase Edge Function
    edgeCrud.delete('todos', id)
  }

  async function clearCompleted() {
    const completedList = todos.value.filter((t) => t.completed)
    todos.value = todos.value.filter((t) => !t.completed)
    // Sync to Supabase Edge Function
    completedList.forEach((c) => {
      edgeCrud.delete('todos', c.id)
    })
  }

  // Initial fetch from Supabase
  fetchFromSupabase()

  return {
    todos,
    isSyncing,
    completedCount,
    activeCount,
    totalCount,
    fetchFromSupabase,
    addTodo,
    updateTodo,
    toggleDone,
    deleteTodo,
    clearCompleted,
  }
})
