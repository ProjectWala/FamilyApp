/**
 * Centralized Application Service Layer
 * Location: src/services/service.js
 *
 * Consolidates all reusable component script JS functions across the application:
 * - Family & Squad Analytics (Budgets, Spent, Pie chart calculations)
 * - Main Dashboard Helpers
 * - Todo List Functions
 * - Expense & Event Group Helpers
 * - Recurring Expense Services
 * - Profile Switching Helpers
 * - Donut / Pie Chart SVG Geometry & Math
 * - Navigation & Theme Helpers
 */

// ============================================================================
// 1. FAMILY MEMBERS & SQUAD ANALYTICS
// ============================================================================

/**
 * Calculates total spending for a specific family member from an expense list.
 * @param {string} memberId
 * @param {Array<{memberId: string, amount: number|string}>} expenses
 * @returns {number}
 */
export function getMemberSpent(memberId, expenses = []) {
  if (!memberId || !Array.isArray(expenses)) return 0
  return expenses
    .filter((e) => e && e.memberId === memberId)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
}

/**
 * Calculates combined family budget from all members.
 * @param {Array<{monthlyBudget?: number}>} members
 * @returns {number}
 */
export function calculateTotalFamilyBudget(members = []) {
  if (!Array.isArray(members)) return 0
  return members.reduce((acc, m) => acc + (Number(m.monthlyBudget) || 0), 0)
}

/**
 * Calculates total family spent from all members.
 * @param {Array<{id: string}>} members
 * @param {Array<{memberId: string, amount: number|string}>} expenses
 * @returns {number}
 */
export function calculateTotalFamilySpent(members = [], expenses = []) {
  if (!Array.isArray(members) || !Array.isArray(expenses)) return 0
  return members.reduce((acc, m) => acc + getMemberSpent(m.id, expenses), 0)
}

/**
 * Calculates remaining balance from total budget and spent.
 * @param {number} totalBudget
 * @param {number} totalSpent
 * @returns {number}
 */
export function calculateTotalFamilyRemaining(totalBudget, totalSpent) {
  return Math.max(0, (totalBudget || 0) - (totalSpent || 0))
}

/**
 * Calculates overspent amount from total budget and spent.
 * @param {number} totalBudget
 * @param {number} totalSpent
 * @returns {number}
 */
export function calculateTotalFamilyOverspent(totalBudget, totalSpent) {
  return Math.max(0, (totalSpent || 0) - (totalBudget || 0))
}

/**
 * Calculates squad spent percentage.
 * @param {number} totalBudget
 * @param {number} totalSpent
 * @returns {number}
 */
export function calculateSquadSpentPercent(totalBudget, totalSpent) {
  if (!totalBudget || totalBudget <= 0) {
    return (totalSpent || 0) > 0 ? 100 : 0
  }
  return Math.round(((totalSpent || 0) / totalBudget) * 100)
}

/**
 * Generates pie slices for the collective Family Squad "Budget vs Spent" chart.
 * @param {number} budget
 * @param {number} spent
 * @param {number} remaining
 * @param {number} overspent
 * @returns {Array<{id: string, label: string, value: number, color: string, icon?: string}>}
 */
export function getSquadBudgetVsSpentSlices(budget, spent, remaining, overspent) {
  if ((!budget || budget <= 0) && (!spent || spent <= 0)) return []

  if (spent > budget && budget > 0) {
    return [
      {
        id: 'budget-utilized',
        label: 'Budget Spent',
        value: budget,
        color: '#faad14',
        icon: 'mdi-cash-check',
      },
      {
        id: 'budget-over',
        label: 'Over Budget',
        value: overspent || spent - budget,
        color: '#ff4d4f',
        icon: 'mdi-alert-circle-outline',
      },
    ]
  }

  if (budget <= 0 && spent > 0) {
    return [
      {
        id: 'spent-no-budget',
        label: 'Total Spent',
        value: spent,
        color: '#ff4d4f',
        icon: 'mdi-credit-card-minus-outline',
      },
    ]
  }

  return [
    {
      id: 'family-spent',
      label: 'Total Spent',
      value: spent,
      color: '#ff4d4f',
      icon: 'mdi-credit-card-minus-outline',
    },
    {
      id: 'family-remaining',
      label: 'Remaining Budget',
      value: remaining,
      color: '#52c41a',
      icon: 'mdi-wallet-outline',
    },
  ]
}

/**
 * Generates pie slices for the collective Family Squad "Member Breakdown" chart.
 * @param {Array<any>} members
 * @param {Array<any>} expenses
 * @param {number} remaining
 * @returns {Array<{id: string, label: string, value: number, color: string, icon?: string}>}
 */
export function getSquadMemberBreakdownSlices(members = [], expenses = [], remaining = 0) {
  const slices = []

  members.forEach((m) => {
    const spent = getMemberSpent(m.id, expenses)
    if (spent > 0) {
      slices.push({
        id: m.id,
        label: m.name,
        value: spent,
        color: m.avatarColor || '#6366F1',
        icon: m.avatarIcon || 'mdi-account',
      })
    }
  })

  if (remaining > 0) {
    slices.push({
      id: 'unspent-budget',
      label: 'Unspent Budget',
      value: remaining,
      color: '#52c41a',
      icon: 'mdi-wallet-outline',
    })
  }

  return slices
}

/**
 * Gets member budget allowance.
 * @param {{monthlyBudget?: number}} member
 * @returns {number}
 */
export function getMemberBudget(member) {
  return Number(member?.monthlyBudget) || 0
}

/**
 * Gets remaining budget for an individual member.
 * @param {any} member
 * @param {number} spent
 * @returns {number}
 */
export function getMemberRemaining(member, spent) {
  const budget = getMemberBudget(member)
  return Math.max(0, budget - (spent || 0))
}

/**
 * Gets overspent amount for an individual member.
 * @param {any} member
 * @param {number} spent
 * @returns {number}
 */
export function getMemberOverspent(member, spent) {
  const budget = getMemberBudget(member)
  return Math.max(0, (spent || 0) - budget)
}

/**
 * Gets percentage of budget spent by a member.
 * @param {any} member
 * @param {number} spent
 * @returns {number}
 */
export function getMemberSpentPercent(member, spent) {
  const budget = getMemberBudget(member)
  if (!budget || budget <= 0) return (spent || 0) > 0 ? 100 : 0
  return Math.round(((spent || 0) / budget) * 100)
}

/**
 * Gets Vuetify status color name based on member budget utilization.
 * @param {any} member
 * @param {number} spent
 * @returns {'error' | 'warning' | 'success'}
 */
export function getMemberStatusColor(member, spent) {
  const percent = getMemberSpentPercent(member, spent)
  if (percent > 100) return 'error'
  if (percent >= 85) return 'warning'
  return 'success'
}

/**
 * Generates pie chart slices for an individual member.
 * @param {any} member
 * @param {number} spent
 * @returns {Array<{id: string, label: string, value: number, color: string}>}
 */
export function getMemberSlices(member, spent) {
  const budget = getMemberBudget(member)
  const actualSpent = spent || 0

  if (budget === 0 && actualSpent === 0) return []

  if (actualSpent > budget && budget > 0) {
    return [
      {
        id: `${member.id}-budget`,
        label: 'Budget',
        value: budget,
        color: member.avatarColor || '#1677ff',
      },
      {
        id: `${member.id}-over`,
        label: 'Over Budget',
        value: actualSpent - budget,
        color: '#ff4d4f',
      },
    ]
  }

  if (budget === 0 && actualSpent > 0) {
    return [
      {
        id: `${member.id}-spent`,
        label: 'Spent',
        value: actualSpent,
        color: '#ff4d4f',
      },
    ]
  }

  return [
    {
      id: `${member.id}-spent`,
      label: 'Spent',
      value: actualSpent,
      color: member.avatarColor || '#ff4d4f',
    },
    {
      id: `${member.id}-remaining`,
      label: 'Remaining',
      value: Math.max(0, budget - actualSpent),
      color: '#52c41a',
    },
  ]
}

/**
 * Factory for creating a blank family member form.
 * @returns {{name: string, role: string, monthlyBudget: number, avatarColor: string, avatarIcon: string}}
 */
export function createDefaultFamilyMemberForm() {
  return {
    name: '',
    role: 'Primary',
    monthlyBudget: 1000,
    avatarColor: '#6366F1',
    avatarIcon: 'mdi-account',
  }
}

/**
 * Factory for creating an edit form prefilled with member data.
 * @param {any} member
 * @returns {{name: string, role: string, monthlyBudget: number, avatarColor: string, avatarIcon: string}}
 */
export function createEditFamilyMemberForm(member) {
  return {
    name: member?.name || '',
    role: member?.role || 'Primary',
    monthlyBudget: Number(member?.monthlyBudget) || 0,
    avatarColor: member?.avatarColor || '#6366F1',
    avatarIcon: member?.avatarIcon || 'mdi-account',
  }
}

// ============================================================================
// 2. MAIN DASHBOARD FUNCTIONS
// ============================================================================

/**
 * Returns formatted current date string (e.g., "Wed, Oct 21").
 * @returns {string}
 */
export function getCurrentDateString() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date())
}

/**
 * Returns uncompleted todos up to specified limit for quick dashboard preview.
 * @param {Array<{completed: boolean}>} todos
 * @param {number} limit
 * @returns {Array<any>}
 */
export function getPendingTodosPreview(todos = [], limit = 3) {
  if (!Array.isArray(todos)) return []
  return todos.filter((t) => !t.completed).slice(0, limit)
}

/**
 * Returns total expenses for featured event tag 'Brother Marriage'.
 * @param {any} expensesStore
 * @returns {number}
 */
export function getBrotherMarriageTotal(expensesStore) {
  if (!expensesStore || typeof expensesStore.getTagTotal !== 'function') return 0
  return expensesStore.getTagTotal('Brother Marriage')
}

// ============================================================================
// 3. TODO LIST FUNCTIONS
// ============================================================================

/**
 * Returns Vuetify color identifier for priority level.
 * @param {'high' | 'medium' | 'low' | string} priority
 * @returns {string}
 */
export function getPriorityColor(priority) {
  switch (priority) {
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    case 'low':
      return 'info'
    default:
      return 'grey'
  }
}

/**
 * Calculates completion percentage for tasks.
 * @param {number} completedCount
 * @param {number} totalCount
 * @returns {number}
 */
export function calculateProgressPercent(completedCount, totalCount) {
  if (!totalCount || totalCount <= 0) return 0
  return Math.round(((completedCount || 0) / totalCount) * 100)
}

/**
 * Filters todos based on active filter.
 * @param {Array<{completed: boolean}>} todos
 * @param {'all' | 'active' | 'completed'} filter
 * @returns {Array<any>}
 */
export function filterTodos(todos = [], filter = 'all') {
  if (!Array.isArray(todos)) return []
  if (filter === 'active') {
    return todos.filter((t) => !t.completed)
  }
  if (filter === 'completed') {
    return todos.filter((t) => t.completed)
  }
  return todos
}

/**
 * Factory for creating a blank todo item form.
 * @returns {{title: string, priority: 'medium', category: string, dueDate: string, memberId: string}}
 */
export function createDefaultTodoForm() {
  return {
    title: '',
    priority: 'medium',
    category: 'General',
    dueDate: new Date().toISOString().split('T')[0],
    memberId: '', // '' represents 'Unassigned'
  }
}

/**
 * Resolves family member name from family store.
 * @param {any} familyStore
 * @param {string} memberId
 * @returns {string}
 */
export function getTodoMemberName(familyStore, memberId) {
  if (!familyStore || typeof familyStore.getMemberById !== 'function' || !memberId) {
    return 'Unknown'
  }
  const m = familyStore.getMemberById(memberId)
  return m ? m.name : 'Unknown'
}

// ============================================================================
// 4. EXPENSES & EVENT GROUP FUNCTIONS
// ============================================================================

/**
 * Returns MDI icon string for an expense category.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryIcon(category) {
  switch (category) {
    case 'Groceries':
      return 'mdi-cart-outline'
    case 'Utilities':
      return 'mdi-flash-outline'
    case 'Dining':
      return 'mdi-silverware-fork-knife'
    case 'Shopping':
      return 'mdi-shopping-outline'
    case 'Entertainment':
      return 'mdi-movie-open-outline'
    case 'Health':
      return 'mdi-medical-bag'
    case 'Transport':
      return 'mdi-car-outline'
    default:
      return 'mdi-tag-outline'
  }
}

/**
 * Returns color string for an expense category.
 * @param {string} category
 * @returns {string}
 */
export function getCategoryColor(category) {
  switch (category) {
    case 'Groceries':
      return 'green'
    case 'Utilities':
      return 'amber-darken-2'
    case 'Dining':
      return 'deep-orange'
    case 'Shopping':
      return 'purple'
    case 'Entertainment':
      return 'pink'
    case 'Health':
      return 'red'
    case 'Transport':
      return 'blue'
    default:
      return 'indigo'
  }
}

/**
 * Builds descriptive summary text for active expense filters.
 * @param {string|null} activeTagFilter
 * @param {string} selectedCategory
 * @returns {string}
 */
export function getActiveFilterSummary(activeTagFilter, selectedCategory) {
  if (activeTagFilter && selectedCategory !== 'All') {
    return `Tag: "${activeTagFilter}" • Cat: ${selectedCategory}`
  }
  if (activeTagFilter) {
    return `Tag: "${activeTagFilter}"`
  }
  if (selectedCategory !== 'All') {
    return `Category: ${selectedCategory}`
  }
  return 'Tap to browse & toggle tags or category'
}

/**
 * Filters expense items by active tag filter and category filter.
 * @param {Array<{tags?: string[], category?: string}>} expenses
 * @param {string|null} activeTagFilter
 * @param {string} selectedCategory
 * @returns {Array<any>}
 */
export function filterExpenses(expenses = [], activeTagFilter = null, selectedCategory = 'All') {
  if (!Array.isArray(expenses)) return []
  let list = expenses
  if (activeTagFilter) {
    list = list.filter((e) => Array.isArray(e.tags) && e.tags.includes(activeTagFilter))
  }
  if (selectedCategory && selectedCategory !== 'All') {
    list = list.filter((e) => e.category === selectedCategory)
  }
  return list
}

/**
 * Aggregates contributor totals for a specific event tag.
 * @param {Array<{tags?: string[], memberId: string, amount: number|string}>} expenses
 * @param {string|null} activeTagFilter
 * @param {(id: string) => string} getMemberNameFn
 * @returns {Array<{name: string, amount: number}>}
 */
export function calculateEventContributors(expenses = [], activeTagFilter = null, getMemberNameFn) {
  if (!activeTagFilter || !Array.isArray(expenses)) return []
  const map = new Map()

  expenses
    .filter((e) => Array.isArray(e.tags) && e.tags.includes(activeTagFilter))
    .forEach((e) => {
      const name = typeof getMemberNameFn === 'function' ? getMemberNameFn(e.memberId) : e.memberId
      map.set(name, (map.get(name) || 0) + Number(e.amount || 0))
    })

  return Array.from(map.entries()).map(([name, amount]) => ({ name, amount }))
}

/**
 * Factory for creating a blank expense form.
 * @param {string} activeMemberId
 * @param {string|null} activeTagFilter
 * @returns {any}
 */
export function createDefaultExpenseForm(activeMemberId = '', activeTagFilter = null) {
  return {
    title: '',
    amount: '',
    category: 'Groceries',
    memberId: activeMemberId,
    tags: activeTagFilter ? [activeTagFilter] : [],
    date: new Date().toISOString().split('T')[0],
    notes: '',
  }
}

/**
 * Trims and sanitizes an array of tags.
 * @param {Array<string>} tags
 * @returns {Array<string>}
 */
export function cleanExpenseTags(tags = []) {
  if (!Array.isArray(tags)) return []
  return tags
    .map((t) => (typeof t === 'string' ? t.trim() : ''))
    .filter(Boolean)
}

/**
 * Appends a tag to the tags array if not already present.
 * @param {Array<string>} formTags
 * @param {string} tag
 */
export function addTagToExpenseForm(formTags, tag) {
  if (!Array.isArray(formTags) || !tag) return
  if (!formTags.includes(tag)) {
    formTags.push(tag)
  }
}

// ============================================================================
// 5. RECURRING EXPENSES FUNCTIONS
// ============================================================================

/**
 * Returns icon for recurring expense category.
 * @param {string} category
 * @returns {string}
 */
export function getRecurringCategoryIcon(category) {
  switch (category) {
    case 'Utilities':
      return 'mdi-flash-outline'
    case 'Entertainment':
      return 'mdi-movie-open-outline'
    case 'Health':
      return 'mdi-heart-pulse'
    case 'Groceries':
      return 'mdi-cart-outline'
    case 'Dining':
      return 'mdi-silverware-fork-knife'
    case 'Shopping':
      return 'mdi-shopping-outline'
    case 'Transport':
      return 'mdi-car-outline'
    default:
      return 'mdi-tag-outline'
  }
}

/**
 * Returns color for recurring expense category.
 * @param {string} category
 * @returns {string}
 */
export function getRecurringCategoryColor(category) {
  switch (category) {
    case 'Utilities':
      return 'teal'
    case 'Entertainment':
      return 'pink'
    case 'Health':
      return 'red'
    case 'Groceries':
      return 'green'
    case 'Dining':
      return 'deep-orange'
    case 'Shopping':
      return 'purple'
    case 'Transport':
      return 'blue'
    default:
      return 'indigo'
  }
}

/**
 * Filters recurring expense items by status.
 * @param {Array<{isActive: boolean}>} items
 * @param {'all' | 'active'} statusFilter
 * @returns {Array<any>}
 */
export function filterRecurringItems(items = [], statusFilter = 'all') {
  if (!Array.isArray(items)) return []
  if (statusFilter === 'active') {
    return items.filter((i) => i.isActive)
  }
  return items
}

/**
 * Factory for creating default recurring expense form.
 * @param {string} defaultMemberId
 * @returns {any}
 */
export function createDefaultRecurringForm(defaultMemberId = '') {
  return {
    title: '',
    amount: '',
    frequency: 'monthly',
    category: 'Utilities',
    memberId: defaultMemberId,
    billingDay: 1,
    nextDueDate: new Date().toISOString().split('T')[0],
    isActive: true,
    notes: '',
  }
}

/**
 * Factory for creating edit form prefilled with recurring item data.
 * @param {any} item
 * @returns {any}
 */
export function createEditRecurringForm(item) {
  return {
    title: item?.title || '',
    amount: item?.amount ?? '',
    frequency: item?.frequency || 'monthly',
    category: item?.category || 'Utilities',
    memberId: item?.memberId || '',
    billingDay: item?.billingDay ?? 1,
    nextDueDate: item?.nextDueDate || '',
    isActive: item?.isActive ?? true,
    notes: item?.notes || '',
  }
}

/**
 * Builds clean payload for creating or updating a recurring expense item.
 * @param {any} form
 * @param {string} defaultMemberId
 * @returns {any}
 */
export function buildRecurringPayload(form, defaultMemberId = 'unknown') {
  return {
    title: String(form?.title || '').trim(),
    amount: Number(form?.amount || 0),
    frequency: form?.frequency || 'monthly',
    category: form?.category || 'Utilities',
    memberId: form?.memberId || defaultMemberId,
    billingDay: Number(form?.billingDay) || 1,
    nextDueDate: form?.nextDueDate || new Date().toISOString().split('T')[0],
    isActive: Boolean(form?.isActive),
    notes: String(form?.notes || '').trim(),
  }
}

// ============================================================================
// 6. PROFILE SWITCHING FUNCTIONS
// ============================================================================

/**
 * Switches the active profile and executes an optional callback after animation delay.
 * @param {any} familyStore
 * @param {string} memberId
 * @param {Function} [onComplete]
 * @param {number} [delayMs=250]
 */
export function switchProfile(familyStore, memberId, onComplete, delayMs = 250) {
  if (!familyStore || !memberId) return
  if (typeof familyStore.setActiveMember === 'function') {
    familyStore.setActiveMember(memberId)
  }
  if (typeof onComplete === 'function') {
    setTimeout(onComplete, delayMs)
  }
}

// ============================================================================
// 7. DONUT & PIE CHART SVG GEOMETRY
// ============================================================================

/**
 * Converts polar coordinates to Cartesian (x, y) coordinates.
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} radius
 * @param {number} angleDeg
 * @returns {{x: number, y: number}}
 */
export function polarToCartesian(centerX, centerY, radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  }
}

/**
 * Creates SVG arc segment path string.
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {number} outerR
 * @param {number} innerR
 * @param {number} cX
 * @param {number} cY
 * @returns {string}
 */
export function createSegment(startAngle, endAngle, outerR, innerR, cX, cY) {
  const startOuter = polarToCartesian(cX, cY, outerR, startAngle)
  const endOuter = polarToCartesian(cX, cY, outerR, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  if (innerR <= 0) {
    return `M ${cX} ${cY} L ${startOuter.x} ${startOuter.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y} Z`
  }

  const startInner = polarToCartesian(cX, cY, innerR, startAngle)
  const endInner = polarToCartesian(cX, cY, innerR, endAngle)

  return `M ${startOuter.x} ${startOuter.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y} L ${endInner.x} ${endInner.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${startInner.x} ${startInner.y} Z`
}

/**
 * Creates continuous arc path, splitting full 360 circles into two 180-deg segments.
 * @param {number} startAngle
 * @param {number} endAngle
 * @param {number} outerR
 * @param {number} innerR
 * @param {number} cX
 * @param {number} cY
 * @returns {string}
 */
export function createArcPath(startAngle, endAngle, outerR, innerR, cX, cY) {
  const sweep = endAngle - startAngle
  const isFull = sweep >= 359.99

  if (isFull) {
    const midAngle = startAngle + 180
    return `${createSegment(startAngle, midAngle, outerR, innerR, cX, cY)} ${createSegment(midAngle, startAngle + 360, outerR, innerR, cX, cY)}`
  }

  return createSegment(startAngle, endAngle, outerR, innerR, cX, cY)
}

/**
 * Calculates SVG paths, percentages, and angles for pie/donut slices.
 * @param {Array<{value: number, color: string, label: string}>} slices
 * @param {number} totalValue
 * @param {number} outerRadius
 * @param {number} innerRadius
 * @param {number} cx
 * @param {number} cy
 * @returns {Array<any>}
 */
export function computePieSlices(slices = [], totalValue = 0, outerRadius = 0, innerRadius = 0, cx = 0, cy = 0) {
  const validSlices = slices.filter((s) => (s.value || 0) > 0)
  if (totalValue <= 0 || validSlices.length === 0) return []

  let currentAngle = 0
  return validSlices.map((slice) => {
    const sliceVal = Math.max(0, slice.value || 0)
    const portion = sliceVal / totalValue
    const sweep = portion * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + sweep
    currentAngle = endAngle

    const percentage = Math.round(portion * 100)
    const path = createArcPath(startAngle, endAngle, outerRadius, innerRadius, cx, cy)

    return {
      ...slice,
      percentage,
      path,
      startAngle,
      endAngle,
    }
  })
}

// ============================================================================
// 8. NAVIGATION & THEME FUNCTIONS
// ============================================================================

/**
 * Returns header title based on active tab module.
 * @param {string} tab
 * @returns {string}
 */
export function getTitleForTab(tab) {
  switch (tab) {
    case 'todos':
      return 'To Do List'
    case 'expenses':
      return 'Update Expenses'
    case 'family':
      return 'Family Members'
    case 'recurring':
      return 'Recurring Expenses'
    case 'guests':
      return 'Guest List & RSVP'
    default:
      return 'Family Life App'
  }
}

/**
 * Returns header subtitle based on active tab module.
 * @param {string} tab
 * @returns {string}
 */
export function getSubtitleForTab(tab) {
  switch (tab) {
    case 'todos':
      return 'Task manager with Mark as Done'
    case 'expenses':
      return 'Event tags & spending tracker'
    case 'family':
      return 'Add, update & impersonate'
    case 'recurring':
      return 'Repeating bills & subscriptions'
    case 'guests':
      return 'Tagging, family +1/+2 & return gifts'
    default:
      return 'Daily Tasks & Budget Management'
  }
}

/**
 * Toggles dark/light theme on the Vuetify instance.
 * @param {any} theme
 * @param {boolean} isDark
 */
export function toggleAppTheme(theme, isDark) {
  if (!theme) return
  const next = isDark ? 'light' : 'dark'
  if ('change' in theme && typeof theme.change === 'function') {
    theme.change(next)
  } else if (theme.global && 'name' in theme.global) {
    theme.global.name.value = next
  }
}

// ============================================================================
// 8. GUESTS & RETURN GIFTS SERVICES
// ============================================================================

/**
 * Returns color corresponding to a guest group/category.
 * @param {string} group
 * @returns {string}
 */
export function getGuestGroupColor(group) {
  switch (group) {
    case "Groom's Family":
      return '#1677ff'
    case "Bride's Family":
      return '#eb2f96'
    case 'Close Relatives':
      return '#722ed1'
    case 'College Friends':
      return '#13c2c2'
    case 'Colleagues':
      return '#fa8c16'
    case 'VIP':
      return '#faad14'
    case 'Neighbors':
      return '#52c41a'
    default:
      return '#8c8c8c'
  }
}

/**
 * Returns icon for a guest group.
 * @param {string} group
 * @returns {string}
 */
export function getGuestGroupIcon(group) {
  switch (group) {
    case "Groom's Family":
      return 'mdi-account-heart'
    case "Bride's Family":
      return 'mdi-heart-multiple'
    case 'Close Relatives':
      return 'mdi-account-multiple'
    case 'College Friends':
      return 'mdi-school'
    case 'Colleagues':
      return 'mdi-briefcase-outline'
    case 'VIP':
      return 'mdi-star-face'
    case 'Neighbors':
      return 'mdi-home-group'
    default:
      return 'mdi-account-outline'
  }
}

/**
 * Returns color associated with an RSVP status.
 * @param {string} status
 * @returns {string}
 */
export function getRsvpColor(status) {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'declined':
      return 'error'
    default:
      return 'grey'
  }
}

/**
 * Returns icon associated with an RSVP status.
 * @param {string} status
 * @returns {string}
 */
export function getRsvpIcon(status) {
  switch (status) {
    case 'confirmed':
      return 'mdi-check-circle'
    case 'pending':
      return 'mdi-clock-outline'
    case 'declined':
      return 'mdi-close-circle'
    default:
      return 'mdi-help-circle-outline'
  }
}

/**
 * Calculates sum of prices for an array of return gifts.
 * @param {Array<{price?: number|string}>} returnGifts
 * @returns {number}
 */
export function calculateGuestGiftsTotal(returnGifts = []) {
  if (!Array.isArray(returnGifts)) return 0
  return returnGifts.reduce((acc, curr) => acc + (Number(curr?.price) || 0), 0)
}

/**
 * Formats party display text, e.g. "+2 (3 persons)".
 * @param {{additionalGuests?: number}} guest
 * @returns {string}
 */
export function formatGuestPartyDisplay(guest) {
  if (!guest) return 'Solo (1 person)'
  const extra = Number(guest.additionalGuests) || 0
  if (extra === 0) return 'Solo (1 person)'
  return `+${extra} (${extra + 1} persons)`
}

/**
 * Creates default empty guest form.
 */
export function createDefaultGuestForm() {
  return {
    name: '',
    phone: '',
    email: '',
    group: "Groom's Family",
    tags: ['Brother Marriage'],
    rsvpStatus: 'confirmed',
    additionalGuests: 0,
    accompanyingPersons: [],
    returnGifts: [],
    notes: '',
  }
}

/**
 * Creates edit guest form prefilled from guest item.
 * @param {any} guest
 */
export function createEditGuestForm(guest) {
  if (!guest) return createDefaultGuestForm()
  return {
    name: guest.name || '',
    phone: guest.phone || '',
    email: guest.email || '',
    group: guest.group || 'General',
    tags: Array.isArray(guest.tags) ? [...guest.tags] : [],
    rsvpStatus: guest.rsvpStatus || 'confirmed',
    additionalGuests: Number(guest.additionalGuests) || 0,
    accompanyingPersons: Array.isArray(guest.accompanyingPersons)
      ? guest.accompanyingPersons.map((p) => ({ ...p }))
      : [],
    returnGifts: Array.isArray(guest.returnGifts)
      ? guest.returnGifts.map((g) => ({ ...g }))
      : [],
    notes: guest.notes || '',
  }
}

/**
 * Extracts 1-2 uppercase initials from a person or guest name.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return 'G'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Sanitizes and cleans an array of accompanying persons, removing empty rows.
 * @param {Array<{name?: string, relation?: string}>} persons
 * @returns {Array<{name: string, relation: string}>}
 */
export function sanitizeAccompanyingPersons(persons = []) {
  if (!Array.isArray(persons)) return []
  return persons
    .filter((p) => p && typeof p.name === 'string' && p.name.trim().length > 0)
    .map((p) => ({
      name: p.name.trim(),
      relation: (p.relation && p.relation.trim()) || 'Family',
    }))
}

/**
 * Sanitizes and cleans an array of return gifts, removing empty rows and formatting price.
 * @param {Array<{name?: string, price?: number|string}>} gifts
 * @returns {Array<{name: string, price: number}>}
 */
export function sanitizeReturnGifts(gifts = []) {
  if (!Array.isArray(gifts)) return []
  return gifts
    .filter((g) => g && typeof g.name === 'string' && g.name.trim().length > 0)
    .map((g) => ({
      name: g.name.trim(),
      price: Math.max(0, Number(g.price) || 0),
    }))
}

/**
 * Synchronizes the accompanying persons list to match a given count.
 * @param {Array<{name: string, relation: string}>} currentPersons
 * @param {number} targetCount
 * @returns {Array<{name: string, relation: string}>}
 */
export function syncAccompanyingPersons(currentPersons = [], targetCount = 0) {
  const result = Array.isArray(currentPersons) ? [...currentPersons] : []
  const currentLen = result.length
  if (targetCount > currentLen) {
    for (let i = currentLen; i < targetCount; i++) {
      result.push({
        name: '',
        relation: i === 0 ? 'Spouse' : 'Child',
      })
    }
  } else if (targetCount < currentLen) {
    return result.slice(0, targetCount)
  }
  return result
}

/**
 * Constructs a sanitized guest payload for store create/update.
 * @param {any} form
 * @returns {any}
 */
export function buildGuestPayload(form) {
  if (!form) return {}
  return {
    name: (form.name || '').trim(),
    phone: (form.phone || '').trim(),
    email: (form.email || '').trim(),
    group: form.group || 'General',
    tags: Array.isArray(form.tags) ? [...form.tags] : [],
    rsvpStatus: form.rsvpStatus || 'confirmed',
    additionalGuests: Number(form.additionalGuests) || 0,
    accompanyingPersons: sanitizeAccompanyingPersons(form.accompanyingPersons),
    returnGifts: sanitizeReturnGifts(form.returnGifts),
    notes: (form.notes || '').trim(),
  }
}

/**
 * Constructs a single return gift object.
 * @param {string} name
 * @param {number|string} price
 * @returns {{name: string, price: number}}
 */
export function buildReturnGift(name, price) {
  return {
    name: (name || '').trim(),
    price: Math.max(0, Number(price) || 0),
  }
}

// ============================================================================
// UNIFIED DEFAULT EXPORT
// ============================================================================

export default {
  // Family & Squad
  getMemberSpent,
  calculateTotalFamilyBudget,
  calculateTotalFamilySpent,
  calculateTotalFamilyRemaining,
  calculateTotalFamilyOverspent,
  calculateSquadSpentPercent,
  getSquadBudgetVsSpentSlices,
  getSquadMemberBreakdownSlices,
  getMemberBudget,
  getMemberRemaining,
  getMemberOverspent,
  getMemberSpentPercent,
  getMemberStatusColor,
  getMemberSlices,
  createDefaultFamilyMemberForm,
  createEditFamilyMemberForm,

  // Dashboard
  getCurrentDateString,
  getPendingTodosPreview,
  getBrotherMarriageTotal,

  // Todos
  getPriorityColor,
  calculateProgressPercent,
  filterTodos,
  createDefaultTodoForm,
  getTodoMemberName,

  // Expenses
  getCategoryIcon,
  getCategoryColor,
  getActiveFilterSummary,
  filterExpenses,
  calculateEventContributors,
  createDefaultExpenseForm,
  cleanExpenseTags,
  addTagToExpenseForm,

  // Recurring
  getRecurringCategoryIcon,
  getRecurringCategoryColor,
  filterRecurringItems,
  createDefaultRecurringForm,
  createEditRecurringForm,
  buildRecurringPayload,

  // Profile Switcher
  switchProfile,

  // SVG Geometry
  polarToCartesian,
  createSegment,
  createArcPath,
  computePieSlices,

  // Navigation & Theme
  getTitleForTab,
  getSubtitleForTab,
  toggleAppTheme,

  // Guests & Return Gifts
  getGuestGroupColor,
  getGuestGroupIcon,
  getRsvpColor,
  getRsvpIcon,
  calculateGuestGiftsTotal,
  formatGuestPartyDisplay,
  createDefaultGuestForm,
  createEditGuestForm,
  getInitials,
  sanitizeAccompanyingPersons,
  sanitizeReturnGifts,
  syncAccompanyingPersons,
  buildGuestPayload,
  buildReturnGift,
}
