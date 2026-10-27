import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ShoppingItem, ShoppingProduct, ShoppingPriority } from '@/types'
import { edgeCrud, getUserStorageKey } from '@/lib/supabase'

const ITEMS_STORAGE_KEY = 'shopping_list_v1'
const CATALOG_STORAGE_KEY = 'shopping_products_catalog_v1'
const SHOPPING_TAGS_KEY = 'shopping_tags_catalog_v1'

const defaultSuggestedTags = [
  'Groceries',
  'Pantry',
  'Household',
  'Dairy',
  'Produce',
  'Bakery',
  'Snacks',
  'Beverages',
  'Personal Care',
]

const initialCatalog: ShoppingProduct[] = [
  { name: 'Organic Whole Milk (1L)', defaultPrice: 65, defaultQuantity: 2, defaultTag: 'Dairy' },
  { name: 'Brown Eggs (12 pk)', defaultPrice: 90, defaultQuantity: 1, defaultTag: 'Groceries' },
  { name: 'Whole Wheat Bread', defaultPrice: 45, defaultQuantity: 1, defaultTag: 'Bakery' },
  { name: 'Basmati Rice (5kg)', defaultPrice: 450, defaultQuantity: 1, defaultTag: 'Pantry' },
  { name: 'Olive Oil (1L)', defaultPrice: 850, defaultQuantity: 1, defaultTag: 'Pantry' },
  { name: 'Greek Yogurt (400g)', defaultPrice: 120, defaultQuantity: 2, defaultTag: 'Dairy' },
  { name: 'Dishwashing Liquid (500ml)', defaultPrice: 110, defaultQuantity: 1, defaultTag: 'Household' },
  { name: 'Fresh Bananas (1 Dozen)', defaultPrice: 60, defaultQuantity: 1, defaultTag: 'Produce' },
  { name: 'Ground Coffee Beans (250g)', defaultPrice: 380, defaultQuantity: 1, defaultTag: 'Beverages' },
  { name: 'Almonds (500g)', defaultPrice: 420, defaultQuantity: 1, defaultTag: 'Snacks' },
  { name: 'Dark Chocolate (100g)', defaultPrice: 150, defaultQuantity: 1, defaultTag: 'Snacks' },
  { name: 'Toilet Paper (6 rolls)', defaultPrice: 220, defaultQuantity: 1, defaultTag: 'Household' },
  { name: 'Green Tea (25 bags)', defaultPrice: 180, defaultQuantity: 1, defaultTag: 'Beverages' },
]

const initialShoppingItems: ShoppingItem[] = []

export const useShoppingStore = defineStore('shopping', () => {
  // 1. Stored state
  const storedItems = localStorage.getItem(getUserStorageKey(ITEMS_STORAGE_KEY))
  const items = ref<ShoppingItem[]>(storedItems ? JSON.parse(storedItems) : [])

  const storedCatalog = localStorage.getItem(CATALOG_STORAGE_KEY)
  const catalogProducts = ref<ShoppingProduct[]>(storedCatalog ? JSON.parse(storedCatalog) : initialCatalog)

  const isSyncing = ref(false)

  // 2. Filters & view toggles
  const activeTagFilter = ref<string | null>(null)
  const selectedPriority = ref<string>('all')
  const selectedStatus = ref<string>('all') // 'all' | 'pending' | 'purchased'
  const searchQuery = ref('')
  const sortBy = ref<'priority' | 'price-desc' | 'price-asc' | 'name' | 'newest'>('priority')

  // Auto-sync to localStorage
  watch(
    items,
    (val) => {
      localStorage.setItem(getUserStorageKey(ITEMS_STORAGE_KEY), JSON.stringify(val))
    },
    { deep: true }
  )

  watch(
    catalogProducts,
    (val) => {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true }
  )

  // 3. Computed aggregates
  const totalItems = computed(() => items.value.length)
  const pendingCount = computed(() => items.value.filter((i) => !i.isPurchased).length)
  const purchasedCount = computed(() => items.value.filter((i) => i.isPurchased).length)

  const totalEstimatedCost = computed(() => {
    return items.value.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
  })

  const pendingCost = computed(() => {
    return items.value
      .filter((i) => !i.isPurchased)
      .reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
  })

  const purchasedCost = computed(() => {
    return items.value
      .filter((i) => i.isPurchased)
      .reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
  })

  let initialShoppingTags: string[] = defaultSuggestedTags
  try {
    const storedTags = localStorage.getItem(SHOPPING_TAGS_KEY)
    if (storedTags) {
      const parsed = JSON.parse(storedTags)
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialShoppingTags = parsed
      }
    }
  } catch {}

  const customTags = ref<string[]>(initialShoppingTags)

  watch(
    customTags,
    (newVal) => {
      localStorage.setItem(SHOPPING_TAGS_KEY, JSON.stringify(newVal))
    },
    { deep: true }
  )

  function addCustomTag(tag: string) {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (!customTags.value.includes(trimmed)) {
      customTags.value.push(trimmed)
    }
  }

  function removeCustomTag(tag: string, removeFromItems = true) {
    customTags.value = customTags.value.filter((t) => t !== tag)
    if (removeFromItems) {
      items.value.forEach((item) => {
        if (Array.isArray(item.tags) && item.tags.includes(tag)) {
          item.tags = item.tags.filter((t) => t !== tag)
          item.updatedAt = new Date().toISOString()
          edgeCrud.update('shopping_list', item.id, { tags: item.tags })
        }
      })
    }
  }

  // All distinct tags combining defaults and existing items
  const allTags = computed(() => {
    const tagSet = new Set<string>(customTags.value)
    items.value.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => {
          if (t && t.trim()) tagSet.add(t.trim())
        })
      }
    })
    return Array.from(tagSet)
  })

  const tagCountMap = computed(() => {
    const map: Record<string, number> = {}
    items.value.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => {
          map[t] = (map[t] || 0) + 1
        })
      }
    })
    return map
  })

  const tagTotalMap = computed(() => {
    const map: Record<string, number> = {}
    items.value.forEach((item) => {
      const itemCost = (Number(item.price) || 0) * (Number(item.quantity) || 1)
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => {
          map[t] = (map[t] || 0) + itemCost
        })
      }
    })
    return map
  })

  // Catalog product names for autocomplete suggestions
  const catalogProductNames = computed(() => {
    return catalogProducts.value.map((p) => p.name)
  })

  // Priority weight helper for sorting
  const priorityWeight: Record<ShoppingPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  }

  // Filtered and sorted items
  const filteredItems = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()

    let result = items.value.filter((item) => {
      // 1. Text Search
      if (q) {
        const nameMatch = item.productName.toLowerCase().includes(q)
        const notesMatch = item.notes ? item.notes.toLowerCase().includes(q) : false
        const tagMatch = Array.isArray(item.tags) && item.tags.some((t) => t.toLowerCase().includes(q))
        if (!nameMatch && !notesMatch && !tagMatch) return false
      }

      // 2. Tag Filter
      if (activeTagFilter.value) {
        if (!Array.isArray(item.tags) || !item.tags.includes(activeTagFilter.value)) {
          return false
        }
      }

      // 3. Priority Filter
      if (selectedPriority.value !== 'all') {
        if (item.priority !== selectedPriority.value) {
          return false
        }
      }

      // 4. Status Filter
      if (selectedStatus.value === 'pending' && item.isPurchased) return false
      if (selectedStatus.value === 'purchased' && !item.isPurchased) return false

      return true
    })

    // Sort
    result = [...result].sort((a, b) => {
      // Unpurchased items first, then purchased items
      if (a.isPurchased !== b.isPurchased) {
        return a.isPurchased ? 1 : -1
      }

      if (sortBy.value === 'priority') {
        const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
        if (diff !== 0) return diff
      } else if (sortBy.value === 'price-desc') {
        const diff = (Number(b.price) || 0) * (Number(b.quantity) || 1) - (Number(a.price) || 0) * (Number(a.quantity) || 1)
        if (diff !== 0) return diff
      } else if (sortBy.value === 'price-asc') {
        const diff = (Number(a.price) || 0) * (Number(a.quantity) || 1) - (Number(b.price) || 0) * (Number(b.quantity) || 1)
        if (diff !== 0) return diff
      } else if (sortBy.value === 'name') {
        return a.productName.localeCompare(b.productName)
      }

      // Default or fallback: newest first
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

    return result
  })

  // Grouped items by Tag (when grouping view is enabled)
  const groupedByTag = computed(() => {
    const groups: Record<string, ShoppingItem[]> = {}
    filteredItems.value.forEach((item) => {
      const primaryTag = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : 'General'
      if (!groups[primaryTag]) {
        groups[primaryTag] = []
      }
      groups[primaryTag].push(item)
    })
    return groups
  })

  function getTagTotal(tagName: string) {
    return items.value
      .filter((i) => Array.isArray(i.tags) && i.tags.includes(tagName))
      .reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0)
  }

  function getTagItemsCount(tagName: string) {
    return items.value.filter((i) => Array.isArray(i.tags) && i.tags.includes(tagName)).length
  }

  // 4. Remote Sync via Supabase Edge Function
  async function fetchFromSupabase() {
    try {
      isSyncing.value = true

      // A. Fetch Products Catalog for Autocomplete
      const remoteProducts = await edgeCrud.list<any>('shopping_products')
      if (remoteProducts && remoteProducts.length > 0) {
        const mappedProducts: ShoppingProduct[] = remoteProducts.map((r) => ({
          id: r.id,
          name: r.name,
          defaultPrice: Number(r.default_price) || 0,
          defaultQuantity: Number(r.default_quantity) || 1,
          defaultTag: r.default_tag || 'Groceries',
        }))
        // Merge with existing catalog without duplicates by name
        const existingNames = new Set(catalogProducts.value.map((p) => p.name.toLowerCase()))
        mappedProducts.forEach((p) => {
          if (!existingNames.has(p.name.toLowerCase())) {
            catalogProducts.value.push(p)
            existingNames.add(p.name.toLowerCase())
          }
        })
      }

      // B. Fetch Shopping List Items
      const remoteItems = await edgeCrud.list<any>('shopping_list')
      if (remoteItems && remoteItems.length > 0) {
        items.value = remoteItems.map((r) => ({
          id: r.id,
          productName: r.product_name,
          price: Number(r.price) || 0,
          quantity: Number(r.quantity) || 1,
          tags: Array.isArray(r.tags) ? r.tags : [],
          priority: (r.priority || 'medium') as ShoppingPriority,
          isPurchased: Boolean(r.is_purchased),
          memberId: r.member_id || undefined,
          notes: r.notes || '',
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
        }))
      }
    } catch (err) {
      console.warn('[ShoppingStore] Failed to fetch from Supabase:', err)
    } finally {
      isSyncing.value = false
    }
  }

  // 5. Catalog Persistence Helper
  async function ensureProductInCatalog(productName: string, defaultPrice?: number, defaultTag?: string) {
    const cleanName = productName.trim()
    if (!cleanName) return

    const existingIndex = catalogProducts.value.findIndex(
      (p) => p.name.trim().toLowerCase() === cleanName.toLowerCase()
    )

    if (existingIndex === -1) {
      const newProduct: ShoppingProduct = {
        name: cleanName,
        defaultPrice: Number(defaultPrice) || 0,
        defaultQuantity: 1,
        defaultTag: defaultTag || 'Groceries',
      }
      catalogProducts.value.unshift(newProduct)

      // Save product in Supabase DB for future autocomplete across all sessions
      edgeCrud.create('shopping_products', {
        name: cleanName,
        default_price: newProduct.defaultPrice,
        default_quantity: 1,
        default_tag: newProduct.defaultTag,
      })
    } else if (defaultPrice && !catalogProducts.value[existingIndex].defaultPrice) {
      // Update catalog entry price if it was 0
      catalogProducts.value[existingIndex].defaultPrice = Number(defaultPrice)
    }
  }

  // 6. CRUD Actions
  async function addShoppingItem(data: Omit<ShoppingItem, 'id'>) {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'shop-' + Date.now()
    const now = new Date().toISOString()

    const newItem: ShoppingItem = {
      ...data,
      id,
      price: Number(data.price) || 0,
      quantity: Number(data.quantity) || 1,
      tags: Array.isArray(data.tags) ? data.tags : [],
      priority: data.priority || 'medium',
      isPurchased: Boolean(data.isPurchased),
      createdAt: now,
      updatedAt: now,
    }

    items.value.unshift(newItem)

    // Save product to catalog so it appears in autocomplete next time
    ensureProductInCatalog(newItem.productName, newItem.price, newItem.tags[0])

    // Sync item to Supabase DB
    edgeCrud.create('shopping_list', {
      id,
      product_name: newItem.productName,
      price: newItem.price,
      quantity: newItem.quantity,
      tags: newItem.tags,
      priority: newItem.priority,
      is_purchased: newItem.isPurchased,
      member_id: newItem.memberId || null,
      notes: newItem.notes || '',
    })

    return newItem
  }

  async function updateShoppingItem(id: string, updates: Partial<ShoppingItem>) {
    const index = items.value.findIndex((i) => i.id === id)
    if (index === -1) return null

    const current = items.value[index]
    const updated: ShoppingItem = {
      ...current,
      ...updates,
      price: typeof updates.price !== 'undefined' ? Number(updates.price) : current.price,
      quantity: typeof updates.quantity !== 'undefined' ? Number(updates.quantity) : current.quantity,
      updatedAt: new Date().toISOString(),
    }

    items.value[index] = updated

    // If product name updated, ensure catalog has it
    if (updated.productName) {
      ensureProductInCatalog(updated.productName, updated.price, updated.tags?.[0])
    }

    // Sync to Supabase
    edgeCrud.update('shopping_list', id, {
      product_name: updated.productName,
      price: updated.price,
      quantity: updated.quantity,
      tags: updated.tags,
      priority: updated.priority,
      is_purchased: updated.isPurchased,
      member_id: updated.memberId || null,
      notes: updated.notes || '',
    })

    return updated
  }

  async function deleteShoppingItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    edgeCrud.delete('shopping_list', id)
  }

  async function togglePurchased(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (item) {
      item.isPurchased = !item.isPurchased
      item.updatedAt = new Date().toISOString()
      edgeCrud.update('shopping_list', id, {
        is_purchased: item.isPurchased,
      })
    }
  }

  async function clearPurchased() {
    const purchased = items.value.filter((i) => i.isPurchased)
    items.value = items.value.filter((i) => !i.isPurchased)
    purchased.forEach((i) => {
      edgeCrud.delete('shopping_list', i.id)
    })
  }

  // Trigger initial background fetch
  fetchFromSupabase()

  return {
    // State
    items,
    catalogProducts,
    isSyncing,
    activeTagFilter,
    selectedPriority,
    selectedStatus,
    searchQuery,
    sortBy,
    // Computeds
    totalItems,
    pendingCount,
    purchasedCount,
    totalEstimatedCost,
    pendingCost,
    purchasedCost,
    allTags,
    customTags,
    tagCountMap,
    tagTotalMap,
    catalogProductNames,
    filteredItems,
    groupedByTag,
    // Methods
    getTagTotal,
    getTagItemsCount,
    fetchFromSupabase,
    ensureProductInCatalog,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    togglePurchased,
    clearPurchased,
    addCustomTag,
    removeCustomTag,
  }
})
