import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { TodoItem, Priority } from '@/types'
import { edgeCrud, getUserStorageKey } from '@/lib/supabase'

const STORAGE_KEY = 'todos_store_v2'

const initialTodos: TodoItem[] = []

export const useTodoStore = defineStore('todos', () => {
  const stored = localStorage.getItem(getUserStorageKey(STORAGE_KEY))
  const todos = ref<TodoItem[]>(stored ? JSON.parse(stored) : [])
  const isSyncing = ref(false)

  watch(
    todos,
    (newVal) => {
      localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(newVal))
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
      if (Array.isArray(remote)) {
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
        localStorage.setItem(getUserStorageKey(STORAGE_KEY), JSON.stringify(todos.value))
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
