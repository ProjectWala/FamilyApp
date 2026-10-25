<template>
  <div class="expenses-component">
    <!-- Summary Header Cards (Mantis Style) -->
    <v-card class="mb-4 pa-4 rounded-lg elevation-0 text-white" style="background: var(--v-gradient, linear-gradient(250.38deg, #1677ff 0%, #0958d9 100%));">
      <div class="d-flex justify-space-between align-center flex-wrap gap-2 mb-2">
        <div class="d-flex align-center gap-2">
          <v-avatar color="white" variant="tonal" size="38" rounded="lg">
            <v-icon icon="mdi-wallet-outline" size="22" color="white" />
          </v-avatar>
          <div>
            <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
              Expense Tracker
            </span>
            <div class="text-h6 font-weight-bold text-white line-height-1">
              ₹{{ expensesStore.totalAmount.toFixed(2) }} Total
            </div>
          </div>
        </div>

        <!-- Add Expense Primary CTA -->
        <v-btn
          color="white"
          variant="flat"
          size="small"
          rounded="lg"
          class="text-primary font-weight-bold text-capitalize"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          + Add
        </v-btn>
      </div>

      <v-divider class="my-2 border-t-white-20" />

      <div class="d-flex justify-space-between text-caption pt-1 text-white-85">
        <span>This Month: <strong class="text-white">₹{{ expensesStore.thisMonthAmount.toFixed(2) }}</strong></span>
        <span>Entries: <strong class="text-white">{{ expensesStore.expenses.length }} items</strong></span>
      </div>
    </v-card>

    <!-- EVENT GROUP BANNER (When Tag Filter is Active) -->
    <v-expand-transition>
      <div v-if="activeTagFilter" class="expand-wrapper">
        <v-card
          variant="outlined"
          elevation="0"
          class="mb-4 pa-4 rounded-lg bg-surface card-hover-border"
        >
        <div class="d-flex justify-space-between align-start">
          <div class="d-flex align-center">
            <v-avatar color="primary" variant="tonal" size="38" rounded="lg" class="mr-3">
              <v-icon icon="mdi-tag-heart" size="20" />
            </v-avatar>
            <div>
              <div class="text-label-small text-lightText text-uppercase font-weight-medium">
                Event Group Expenses
              </div>
              <div class="text-h6 font-weight-bold text-truncate text-darkText">
                {{ activeTagFilter }}
              </div>
            </div>
          </div>

          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            icon="mdi-close"
            rounded="lg"
            @click="activeTagFilter = null"
          />
        </div>

        <div class="d-flex align-center justify-space-between mt-3 pt-2 border-t">
          <div>
            <div class="text-caption text-lightText">Event Total</div>
            <div class="text-h5 font-weight-bold text-error">
              ₹{{ expensesStore.getTagTotal(activeTagFilter).toFixed(2) }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-caption text-lightText">Entries</div>
            <div class="text-subtitle-1 font-weight-bold text-darkText">
              {{ expensesStore.getTagExpensesCount(activeTagFilter) }} items
            </div>
          </div>
        </div>

        <!-- Breakdown by family contributor for this event -->
        <div class="mt-2 pt-2 border-t text-caption text-lightText d-flex align-center flex-wrap gap-2">
          <span>Contributors:</span>
          <v-chip
            v-for="contrib in eventContributors"
            :key="contrib.name"
            size="x-small"
            variant="tonal"
            color="primary"
            label
            rounded="md"
            class="font-weight-medium"
          >
            {{ contrib.name }}: ₹{{ contrib.amount.toFixed(0) }}
          </v-chip>
        </div>
      </v-card>
    </div>
  </v-expand-transition>


    <!-- COLLAPSIBLE TAGS & FILTERS PANEL -->
    <v-card
      variant="outlined"
      elevation="0"
      class="mb-3 rounded-lg bg-surface card-hover-border overflow-hidden"
    >
      <div
        class="d-flex align-center justify-space-between pa-3 cursor-pointer select-none filter-header-bar"
        @click="showTagFilters = !showTagFilters"
      >
        <div class="d-flex align-center flex-wrap gap-2" style="min-width: 0;">
          <v-avatar color="primary" variant="tonal" size="28" rounded="md">
            <v-icon icon="mdi-filter-variant" size="16" />
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
              Tags &amp; Filters
              <v-chip
                v-if="activeTagFilter || selectedCategory !== 'All'"
                size="x-small"
                color="primary"
                variant="flat"
                rounded="pill"
                class="ml-2 font-weight-bold px-2"
              >
                Filtered
              </v-chip>
            </div>
            <div class="text-caption text-lightText" style="font-size: 0.68rem !important;">
              {{ activeFilterSummary }}
            </div>
          </div>
        </div>

        <div class="d-flex align-center">
          <v-btn
            v-if="activeTagFilter || selectedCategory !== 'All'"
            variant="text"
            size="x-small"
            color="error"
            class="mr-1 text-capitalize px-2 font-weight-bold"
            @click.stop="clearAllFilters"
          >
            Reset
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="lightText"
            :aria-label="showTagFilters ? 'Collapse Filters' : 'Expand Filters'"
          >
            <v-icon :icon="showTagFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
          </v-btn>
        </div>
      </div>

      <!-- Collapsible Container for All Togglable Tags -->
      <v-expand-transition>
        <div v-if="showTagFilters" class="expand-wrapper">
          <div class="px-3 pb-3 pt-1 border-t">
          <!-- Active Filter Pill if set -->
          <div v-if="activeTagFilter" class="mb-2 d-flex align-center justify-space-between bg-primary100 pa-2 rounded-md">
            <span class="text-caption font-weight-medium text-primary">
              Active Tag: <strong>{{ activeTagFilter }}</strong>
            </span>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              color="primary"
              @click="activeTagFilter = null"
            />
          </div>

          <!-- 1. Togglable Tags Section (All tags wrapped, clear, and readable) -->
          <div class="mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-bold text-lightText text-uppercase">
                All Event &amp; Group Tags ({{ expensesStore.allTags.length }}):
              </span>
              <span class="text-caption text-lightText" style="font-size: 0.68rem !important;">
                Tap tag to toggle
              </span>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <v-chip
                size="default"
                class="filter-tag-chip px-3 font-weight-medium cursor-pointer"
                :variant="!activeTagFilter ? 'flat' : 'outlined'"
                :color="!activeTagFilter ? 'primary' : undefined"
                rounded="lg"
                filter
                @click="activeTagFilter = null"
              >
                All Tags
              </v-chip>

              <v-chip
                v-for="tag in expensesStore.allTags"
                :key="tag"
                size="default"
                class="filter-tag-chip px-3 font-weight-medium cursor-pointer"
                rounded="lg"
                :color="activeTagFilter === tag ? 'primary' : undefined"
                :variant="activeTagFilter === tag ? 'flat' : 'tonal'"
                filter
                @click="activeTagFilter = activeTagFilter === tag ? null : tag"
              >
                <v-icon icon="mdi-tag-outline" size="14" class="mr-1" />
                {{ tag }}
              </v-chip>
            </div>
          </div>

          <!-- 2. Category Filter (Full width, clear, not shrinked) -->
          <div>
            <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
              Filter by Category:
            </div>
            <v-select
              v-model="selectedCategory"
              :items="['All', ...categoryList]"
              label="Select Category"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details
            />
          </div>
        </div>
      </div>
    </v-expand-transition>
    </v-card>

    <!-- Expenses Section Title -->
    <div class="d-flex align-center justify-space-between mb-3 px-1">
      <div class="text-subtitle-1 font-weight-bold d-flex align-center text-darkText">
        <v-icon icon="mdi-history" class="mr-2 text-primary" size="20" />
        {{ activeTagFilter ? `Expenses in "${activeTagFilter}"` : (selectedCategory !== 'All' ? `${selectedCategory} Expenses` : 'Recent Expenses') }}
      </div>

      <span class="text-caption text-lightText font-weight-medium">
        {{ filteredExpenses.length }} items
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="filteredExpenses.length === 0" class="text-center py-8">
      <v-avatar color="surface-variant" size="56" rounded="lg" class="mb-3">
        <v-icon icon="mdi-receipt-text-outline" size="32" color="primary" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium text-darkText">No expenses found</div>
      <div class="text-body-2 text-lightText">
        {{ activeTagFilter ? `No expenses tagged under "${activeTagFilter}".` : 'Tap the button above to add an expense!' }}
      </div>
    </div>

    <!-- Expenses List -->
    <v-slide-y-transition group>
      <v-card
        v-for="expense in filteredExpenses"
        :key="expense.id"
        variant="outlined"
        elevation="0"
        class="mb-3 pa-3 rounded-lg bg-surface card-hover-border"
      >
        <div class="d-flex align-center">
          <!-- Category Icon (No Background Box) -->
          <div class="mr-3 flex-shrink-0 d-flex align-center justify-center category-icon-wrap">
            <v-icon :icon="getCategoryIcon(expense.category)" :color="getCategoryColor(expense.category)" size="26" />
          </div>

          <!-- Expense Info -->
          <div class="flex-grow-1" style="min-width: 0;">
            <div class="text-subtitle-2 font-weight-bold text-truncate expense-title-light-red">
              {{ expense.title }}
            </div>

            <div class="d-flex align-center gap-1 text-lightText flex-wrap">
              <span class="app-date-text">{{ expense.date }}</span>
              <span class="date-sep">•</span>
              <!-- Member attribution -->
              <span class="d-inline-flex align-center font-weight-medium text-darkText app-member-text">
                <v-avatar
                  v-if="getMember(expense.memberId)"
                  size="14"
                  variant="flat"
                  :style="{ backgroundColor: getMember(expense.memberId)?.avatarColor || '#6366F1' }"
                  class="mr-1"
                >
                  <v-icon :icon="getMember(expense.memberId)?.avatarIcon || 'mdi-account'" size="9" color="white" />
                </v-avatar>
                <v-icon v-else icon="mdi-account" size="11" class="mr-1 text-lightText" />
                {{ getMemberName(expense.memberId) }}
              </span>
            </div>

            <!-- Tags Chips -->
            <div v-if="expense.tags && expense.tags.length > 0" class="d-flex align-center gap-1 mt-1 flex-wrap">
              <v-chip
                v-for="tag in expense.tags"
                :key="tag"
                size="x-small"
                variant="tonal"
                color="primary"
                label
                rounded="md"
                class="font-weight-medium cursor-pointer"
                @click.stop="activeTagFilter = tag"
              >
                <v-icon icon="mdi-tag" size="10" class="mr-1" />
                {{ tag }}
              </v-chip>
            </div>

            <div v-if="expense.notes" class="text-caption text-lightText mt-1 text-truncate">
              {{ expense.notes }}
            </div>
          </div>

          <!-- Amount and Actions -->
          <div class="text-right ml-2 flex-shrink-0">
            <div class="text-subtitle-1 font-weight-bold expense-amount-red">
              -₹{{ Number(expense.amount).toFixed(2) }}
            </div>
            <div class="d-flex align-center justify-end">
              <v-btn
                icon="mdi-pencil-outline"
                size="x-small"
                variant="text"
                color="primary"
                title="Edit Expense"
                @click.stop="openEditModal(expense)"
              />
              <v-btn
                icon="mdi-trash-can-outline"
                size="x-small"
                variant="text"
                color="error"
                title="Delete Expense"
                @click.stop="expensesStore.deleteExpense(expense.id)"
              />
            </div>
          </div>
        </div>
      </v-card>
    </v-slide-y-transition>

    <!-- Add / Edit Expense Dialog with Tagging System -->
    <v-dialog v-model="dialogOpen" max-width="540" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="tonal" size="34" class="mr-3">
              <v-icon :icon="isEditing ? 'mdi-cash-edit' : 'mdi-cash-plus'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditing ? 'Edit Expense & Details' : 'Add New Expense' }}
              </div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="closeDialog"
          />
        </v-card-title>

        <v-divider />

        <!-- Form Body -->
        <v-card-text class="pa-4" style="max-height: 75vh;">
          <!-- Active impersonated user banner -->
          <v-alert
            density="compact"
            variant="tonal"
            color="primary"
            rounded="md"
            class="text-caption mb-3 d-flex align-center"
            icon="mdi-account-check"
          >
            Logging as <strong>{{ familyStore.activeMember.name }}</strong> (Auto-selected)
          </v-alert>

          <v-form ref="formRef" @submit.prevent="submitExpense">
            <v-text-field
              v-model="form.title"
              label="Expense Title *"
              placeholder="e.g. Wedding Hall Advance"
              variant="outlined"
              density="comfortable"
              rounded="md"
              class="mb-3"
              :rules="[(v) => !!v || 'Title is required']"
            />

            <v-text-field
              v-model.number="form.amount"
              label="Amount (₹) *"
              placeholder="0.00"
              type="number"
              step="0.01"
              variant="outlined"
              density="comfortable"
              rounded="md"
              class="mb-3"
              prepend-inner-icon="mdi-currency-inr"
              :rules="[(v) => (v !== null && v > 0) || 'Enter a valid amount']"
            />

            <v-row density="compact">
              <v-col cols="6">
                <v-select
                  v-model="form.category"
                  :items="categoryList"
                  label="Category *"
                  variant="outlined"
                  density="comfortable"
                  rounded="md"
                  class="mb-3"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="form.memberId"
                  :items="familyOptions"
                  item-title="name"
                  item-value="id"
                  label="Paid By *"
                  variant="outlined"
                  density="comfortable"
                  rounded="md"
                  class="mb-3"
                />
              </v-col>
            </v-row>

            <!-- TAGGING / EVENT GROUP SYSTEM -->
            <div class="mb-3">
              <v-combobox
                v-model="form.tags"
                :items="expensesStore.allTags"
                label="Tags / Event Group"
                placeholder="Type tag & press enter (e.g. Brother Marriage)"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-tag-multiple-outline"
                hint="Group expenses by event like 'Brother Marriage' or 'Vacation'"
                persistent-hint
              />

              <!-- Quick Tag Suggestions -->
              <div class="d-flex align-center gap-1 mt-2 flex-wrap text-caption">
                <span class="text-medium-emphasis">Popular:</span>
                <v-chip
                  v-for="sug in suggestedQuickTags"
                  :key="sug"
                  size="x-small"
                  variant="outlined"
                  color="deep-purple"
                  class="cursor-pointer"
                  @click="addTagToForm(sug)"
                >
                  + {{ sug }}
                </v-chip>
              </div>
            </div>

            <v-text-field
              v-model="form.date"
              label="Date"
              type="date"
              variant="outlined"
              density="comfortable"
              rounded="md"
              class="mb-3"
            />

            <v-textarea
              v-model="form.notes"
              label="Optional Notes"
              rows="2"
              variant="outlined"
              density="comfortable"
              rounded="md"
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Dialog Footer Actions -->
        <v-card-actions class="pa-4 bg-surface d-flex justify-space-between">
          <v-btn
            variant="outlined"
            rounded="lg"
            color="secondary"
            class="text-capitalize"
            @click="closeDialog"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-capitalize font-weight-bold px-4"
            prepend-icon="mdi-content-save"
            @click="submitExpense"
          >
            {{ isEditing ? 'Save Changes' : 'Save Expense' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useFamilyStore } from '@/stores/family'
import { useModalBack } from '@/composables/useModalBack'
import type { ExpenseItem, ExpenseCategory } from '@/types'
import {
  getCategoryIcon as serviceGetCategoryIcon,
  getCategoryColor as serviceGetCategoryColor,
  getActiveFilterSummary as serviceGetActiveFilterSummary,
  filterExpenses as serviceFilterExpenses,
  calculateEventContributors,
  createDefaultExpenseForm,
  cleanExpenseTags,
  addTagToExpenseForm,
} from '@/services/service.js'

const expensesStore = useExpensesStore()
const familyStore = useFamilyStore()

const dialogOpen = ref(false)
const isEditing = ref(false)
const editingExpenseId = ref<string | null>(null)
useModalBack(dialogOpen, 'expenseDialog')
const selectedCategory = ref('All')
const activeTagFilter = ref<string | null>(null)
const showTagFilters = ref(false)

const activeFilterSummary = computed(() =>
  serviceGetActiveFilterSummary(activeTagFilter.value, selectedCategory.value)
)

const categoryList: ExpenseCategory[] = [
  'Groceries',
  'Utilities',
  'Dining',
  'Shopping',
  'Entertainment',
  'Health',
  'Transport',
  'Other',
]

const suggestedQuickTags = [
  'Brother Marriage',
  'Home Renovation',
  'Vacation',
  'Birthday',
]

const form = ref(createDefaultExpenseForm(familyStore.activeMember.id, activeTagFilter.value))

const familyOptions = computed(() => {
  return familyStore.members.map((m) => ({
    id: m.id,
    name: `${m.name} (${m.role})`,
  }))
})

const filteredExpenses = computed(() =>
  serviceFilterExpenses(expensesStore.expenses, activeTagFilter.value, selectedCategory.value)
)

const eventContributors = computed(() =>
  calculateEventContributors(expensesStore.expenses, activeTagFilter.value, getMemberName)
)

function getMemberName(memberId: string) {
  const member = familyStore.getMemberById(memberId)
  return member ? member.name : 'Unknown'
}

function getMember(memberId: string) {
  return familyStore.getMemberById(memberId)
}

function getCategoryIcon(cat: ExpenseCategory) {
  return serviceGetCategoryIcon(cat)
}

function getCategoryColor(cat: ExpenseCategory) {
  return serviceGetCategoryColor(cat)
}

function openAddModal() {
  isEditing.value = false
  editingExpenseId.value = null
  form.value = createDefaultExpenseForm(familyStore.activeMember.id, activeTagFilter.value)
  dialogOpen.value = true
}

function openEditModal(expense: ExpenseItem) {
  isEditing.value = true
  editingExpenseId.value = expense.id
  form.value = {
    title: expense.title,
    amount: expense.amount,
    category: expense.category,
    memberId: expense.memberId,
    tags: Array.isArray(expense.tags) ? [...expense.tags] : [],
    date: expense.date,
    notes: expense.notes || '',
  }
  dialogOpen.value = true
}

function addTagToForm(tag: string) {
  addTagToExpenseForm(form.value.tags, tag)
}

function clearAllFilters() {
  activeTagFilter.value = null
  selectedCategory.value = 'All'
}

function closeDialog() {
  dialogOpen.value = false
}

function submitExpense() {
  if (!form.value.title.trim() || !form.value.amount || Number(form.value.amount) <= 0) {
    return
  }

  // Clean and filter tags using service function
  const cleanTags = cleanExpenseTags(form.value.tags)

  if (isEditing.value && editingExpenseId.value) {
    expensesStore.updateExpense(editingExpenseId.value, {
      title: form.value.title.trim(),
      amount: Number(form.value.amount),
      category: form.value.category,
      memberId: form.value.memberId || familyStore.activeMember.id,
      tags: cleanTags,
      date: form.value.date || new Date().toISOString().split('T')[0],
      notes: form.value.notes.trim(),
    })
  } else {
    expensesStore.addExpense({
      title: form.value.title.trim(),
      amount: Number(form.value.amount),
      category: form.value.category,
      memberId: form.value.memberId || familyStore.activeMember.id,
      tags: cleanTags,
      date: form.value.date || new Date().toISOString().split('T')[0],
      notes: form.value.notes.trim(),
    })
  }

  closeDialog()
}
</script>
