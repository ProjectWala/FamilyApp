<template>
  <div class="incomes-component">
    <!-- Summary Header Cards (Mantis Style - Inverse Green Theme) -->
    <v-card class="mb-4 pa-4 rounded-lg elevation-0 text-white income-gradient-card">
      <div class="d-flex justify-space-between align-center flex-wrap gap-2 mb-2">
        <div class="d-flex align-center gap-2">
          <v-avatar color="white" variant="tonal" size="38" rounded="lg">
            <v-icon icon="mdi-cash-check" size="22" color="white" />
          </v-avatar>
          <div>
            <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
              Income & Inflow Tracker
            </span>
            <div class="text-h6 font-weight-bold text-white line-height-1">
              +₹{{ incomesStore.totalAmount.toFixed(2) }} Total
            </div>
          </div>
        </div>

        <!-- Add Income Primary CTA -->
        <v-btn
          color="white"
          variant="flat"
          size="small"
          rounded="lg"
          class="text-success font-weight-bold text-capitalize"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          + Add Income
        </v-btn>
      </div>

      <v-divider class="my-2 border-t-white-20" />

      <div class="d-flex justify-space-between text-caption pt-1 text-white-85">
        <span>This Month: <strong class="text-white">+₹{{ incomesStore.thisMonthAmount.toFixed(2) }}</strong></span>
        <span>Entries: <strong class="text-white">{{ incomesStore.incomes.length }} items</strong></span>
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
              <v-avatar color="success" variant="tonal" size="38" rounded="lg" class="mr-3">
                <v-icon icon="mdi-tag-heart" size="20" />
              </v-avatar>
              <div>
                <div class="text-label-small text-lightText text-uppercase font-weight-medium">
                  Event Group Income
                </div>
                <div class="text-h6 font-weight-bold text-truncate text-darkText">
                  {{ activeTagFilter }}
                </div>
              </div>
            </div>

            <v-btn
              size="small"
              variant="tonal"
              color="success"
              icon="mdi-close"
              rounded="lg"
              @click="activeTagFilter = null"
            />
          </div>

          <div class="d-flex align-center justify-space-between mt-3 pt-2 border-t">
            <div>
              <div class="text-caption text-lightText">Event Inflow Total</div>
              <div class="text-h5 font-weight-bold text-success">
                +₹{{ incomesStore.getTagTotal(activeTagFilter).toFixed(2) }}
              </div>
            </div>
            <div class="text-right">
              <div class="text-caption text-lightText">Entries</div>
              <div class="text-subtitle-1 font-weight-bold text-darkText">
                {{ incomesStore.getTagIncomesCount(activeTagFilter) }} items
              </div>
            </div>
          </div>

          <!-- Breakdown by family contributor/earner for this event -->
          <div class="mt-2 pt-2 border-t text-caption text-lightText d-flex align-center flex-wrap gap-2">
            <span>Earners / Receivers:</span>
            <v-chip
              v-for="contrib in eventContributors"
              :key="contrib.name"
              size="x-small"
              variant="tonal"
              color="success"
              label
              rounded="md"
              class="font-weight-medium"
            >
              {{ contrib.name }}: +₹{{ contrib.amount.toFixed(0) }}
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
          <v-avatar color="success" variant="tonal" size="28" rounded="md">
            <v-icon icon="mdi-filter-variant" size="16" />
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
              Tags &amp; Filters
              <v-chip
                v-if="activeTagFilter || selectedCategory !== 'All'"
                size="x-small"
                color="success"
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
            <div v-if="activeTagFilter" class="mb-2 d-flex align-center justify-space-between bg-containerBg pa-2 rounded-md">
              <span class="text-caption font-weight-medium text-success">
                Active Tag: <strong>{{ activeTagFilter }}</strong>
              </span>
              <v-btn
                icon="mdi-close"
                size="x-small"
                variant="text"
                color="success"
                @click="activeTagFilter = null"
              />
            </div>

            <!-- 1. Togglable Tags Section -->
            <div class="mb-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption font-weight-bold text-lightText text-uppercase">
                  All Income &amp; Source Tags ({{ incomesStore.allTags.length }}):
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
                  :color="!activeTagFilter ? 'success' : undefined"
                  rounded="lg"
                  filter
                  @click="activeTagFilter = null"
                >
                  All Tags
                </v-chip>

                <v-chip
                  v-for="tag in incomesStore.allTags"
                  :key="tag"
                  size="default"
                  class="filter-tag-chip px-3 font-weight-medium cursor-pointer"
                  rounded="lg"
                  :color="activeTagFilter === tag ? 'success' : undefined"
                  :variant="activeTagFilter === tag ? 'flat' : 'tonal'"
                  filter
                  @click="activeTagFilter = activeTagFilter === tag ? null : tag"
                >
                  <v-icon icon="mdi-tag-outline" size="14" class="mr-1" />
                  {{ tag }}
                </v-chip>
              </div>
            </div>

            <!-- 2. Category Filter -->
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

    <!-- Incomes Section Title -->
    <div class="d-flex align-center justify-space-between mb-3 px-1">
      <div class="text-subtitle-1 font-weight-bold d-flex align-center text-darkText">
        <v-icon icon="mdi-history" class="mr-2 text-success" size="20" />
        {{ activeTagFilter ? `Incomes in "${activeTagFilter}"` : (selectedCategory !== 'All' ? `${selectedCategory} Incomes` : 'Recent Incomes') }}
      </div>

      <span class="text-caption text-lightText font-weight-medium">
        {{ filteredIncomes.length }} items
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="filteredIncomes.length === 0" class="text-center py-8">
      <v-avatar color="surface-variant" size="56" rounded="lg" class="mb-3">
        <v-icon icon="mdi-cash-fast" size="32" color="success" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium text-darkText">No incomes recorded</div>
      <div class="text-body-2 text-lightText">
        {{ activeTagFilter ? `No incomes tagged under "${activeTagFilter}".` : 'Tap the button above to add an income entry!' }}
      </div>
    </div>

    <!-- Incomes List -->
    <v-slide-y-transition group>
      <v-card
        v-for="income in filteredIncomes"
        :key="income.id"
        variant="outlined"
        elevation="0"
        class="mb-3 pa-3 rounded-lg bg-surface card-hover-border"
      >
        <div class="d-flex align-center">
          <!-- Category Icon -->
          <div class="mr-3 flex-shrink-0 d-flex align-center justify-center category-icon-wrap">
            <v-icon :icon="getCategoryIcon(income.category)" :color="getCategoryColor(income.category)" size="26" />
          </div>

          <!-- Income Info -->
          <div class="flex-grow-1" style="min-width: 0;">
            <div class="text-subtitle-2 font-weight-bold text-truncate income-title-light-green">
              {{ income.title }}
            </div>

            <div class="d-flex align-center gap-1 text-lightText flex-wrap">
              <span class="app-date-text">{{ income.date }}</span>
              <span class="date-sep">•</span>
              <!-- Member attribution -->
              <span class="d-inline-flex align-center font-weight-medium text-darkText app-member-text">
                <v-avatar
                  v-if="getMember(income.memberId)"
                  size="14"
                  variant="flat"
                  :style="{ backgroundColor: getMember(income.memberId)?.avatarColor || '#6366F1' }"
                  class="mr-1"
                >
                  <v-icon :icon="getMember(income.memberId)?.avatarIcon || 'mdi-account'" size="9" color="white" />
                </v-avatar>
                <v-icon v-else icon="mdi-account" size="11" class="mr-1 text-lightText" />
                {{ getMemberName(income.memberId) }}
              </span>
            </div>

            <!-- Tags Chips -->
            <div v-if="income.tags && income.tags.length > 0" class="d-flex align-center gap-1 mt-1 flex-wrap">
              <v-chip
                v-for="tag in income.tags"
                :key="tag"
                size="x-small"
                variant="tonal"
                color="success"
                label
                rounded="md"
                class="font-weight-medium cursor-pointer"
                @click.stop="activeTagFilter = tag"
              >
                <v-icon icon="mdi-tag" size="10" class="mr-1" />
                {{ tag }}
              </v-chip>
            </div>

            <div v-if="income.notes" class="text-caption text-lightText mt-1 text-truncate">
              {{ income.notes }}
            </div>
          </div>

          <!-- Amount and Actions -->
          <div class="text-right ml-2 flex-shrink-0">
            <div class="text-subtitle-1 font-weight-bold income-amount-green">
              +₹{{ Number(income.amount).toFixed(2) }}
            </div>
            <div class="d-flex align-center justify-end">
              <v-btn
                icon="mdi-pencil-outline"
                size="x-small"
                variant="text"
                color="primary"
                title="Edit Income"
                @click.stop="openEditModal(income)"
              />
              <v-btn
                icon="mdi-trash-can-outline"
                size="x-small"
                variant="text"
                color="error"
                title="Delete Income"
                @click.stop="incomesStore.deleteIncome(income.id)"
              />
            </div>
          </div>
        </div>
      </v-card>
    </v-slide-y-transition>

    <!-- Add / Edit Income Dialog with Tagging System -->
    <v-dialog v-model="dialogOpen" max-width="540" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <!-- Dialog Header (Inverse Success Tone) -->
        <v-card-title class="pa-4 bg-success text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="tonal" size="34" class="mr-3">
              <v-icon :icon="isEditing ? 'mdi-cash-edit' : 'mdi-cash-plus'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditing ? 'Edit Income & Details' : 'Add New Income' }}
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
            color="success"
            rounded="md"
            class="text-caption mb-3 d-flex align-center"
            icon="mdi-account-check"
          >
            Logging as <strong>{{ familyStore.activeMember.name }}</strong> (Auto-selected)
          </v-alert>

          <v-form ref="formRef" @submit.prevent="submitIncome">
            <v-text-field
              v-model="form.title"
              label="Income Title *"
              placeholder="e.g. Monthly Salary, Shagun Gift, Bonus"
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
                  label="Received By *"
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
                :items="incomesStore.allTags"
                label="Tags / Event Group"
                placeholder="Type tag & press enter (e.g. Brother Marriage, Salary)"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-tag-multiple-outline"
                hint="Group incomes by source or event like 'Brother Marriage' or 'Freelance'"
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
                  color="success"
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
            color="success"
            variant="flat"
            rounded="lg"
            class="text-capitalize font-weight-bold px-4"
            prepend-icon="mdi-content-save"
            @click="submitIncome"
          >
            {{ isEditing ? 'Save Changes' : 'Save Income' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIncomesStore } from '@/stores/incomes'
import { useFamilyStore } from '@/stores/family'
import { useModalBack } from '@/composables/useModalBack'
import type { IncomeItem, IncomeCategory } from '@/types'
import {
  getIncomeCategoryIcon,
  getIncomeCategoryColor,
  getActiveIncomeFilterSummary,
  filterIncomes,
  calculateIncomeContributors,
  createDefaultIncomeForm,
  cleanIncomeTags,
  addTagToIncomeForm,
} from '@/services/service.js'

const incomesStore = useIncomesStore()
const familyStore = useFamilyStore()

const dialogOpen = ref(false)
const isEditing = ref(false)
const editingIncomeId = ref<string | null>(null)
useModalBack(dialogOpen, 'incomeDialog')
const selectedCategory = ref('All')
const activeTagFilter = ref<string | null>(null)
const showTagFilters = ref(false)

const activeFilterSummary = computed(() =>
  getActiveIncomeFilterSummary(activeTagFilter.value, selectedCategory.value)
)

const categoryList: IncomeCategory[] = [
  'Salary',
  'Business',
  'Freelance',
  'Investments',
  'Gift/Shagun',
  'Rental',
  'Refund',
  'Other',
]

const suggestedQuickTags = [
  'Salary',
  'Brother Marriage',
  'Shagun',
  'Bonus',
  'Freelance',
  'Dividends',
]

const form = ref(createDefaultIncomeForm(familyStore.activeMember.id, activeTagFilter.value))

const familyOptions = computed(() => {
  return familyStore.members.map((m) => ({
    id: m.id,
    name: `${m.name} (${m.role})`,
  }))
})

const filteredIncomes = computed(() =>
  filterIncomes(incomesStore.incomes, activeTagFilter.value, selectedCategory.value)
)

const eventContributors = computed(() =>
  calculateIncomeContributors(incomesStore.incomes, activeTagFilter.value, getMemberName)
)

function getMemberName(memberId: string) {
  const member = familyStore.getMemberById(memberId)
  return member ? member.name : 'Unknown'
}

function getMember(memberId: string) {
  return familyStore.getMemberById(memberId)
}

function getCategoryIcon(cat: IncomeCategory) {
  return getIncomeCategoryIcon(cat)
}

function getCategoryColor(cat: IncomeCategory) {
  return getIncomeCategoryColor(cat)
}

function openAddModal() {
  isEditing.value = false
  editingIncomeId.value = null
  form.value = createDefaultIncomeForm(familyStore.activeMember.id, activeTagFilter.value)
  dialogOpen.value = true
}

function openEditModal(income: IncomeItem) {
  isEditing.value = true
  editingIncomeId.value = income.id
  form.value = {
    title: income.title,
    amount: income.amount,
    category: income.category,
    memberId: income.memberId,
    tags: Array.isArray(income.tags) ? [...income.tags] : [],
    date: income.date,
    notes: income.notes || '',
  }
  dialogOpen.value = true
}

function addTagToForm(tag: string) {
  addTagToIncomeForm(form.value.tags, tag)
}

function clearAllFilters() {
  activeTagFilter.value = null
  selectedCategory.value = 'All'
}

function closeDialog() {
  dialogOpen.value = false
}

function submitIncome() {
  if (!form.value.title.trim() || !form.value.amount || Number(form.value.amount) <= 0) {
    return
  }

  const cleanTags = cleanIncomeTags(form.value.tags)

  if (isEditing.value && editingIncomeId.value) {
    incomesStore.updateIncome(editingIncomeId.value, {
      title: form.value.title.trim(),
      amount: Number(form.value.amount),
      category: form.value.category as IncomeCategory,
      memberId: form.value.memberId || familyStore.activeMember.id,
      tags: cleanTags,
      date: form.value.date || new Date().toISOString().split('T')[0],
      notes: form.value.notes.trim(),
    })
  } else {
    incomesStore.addIncome({
      title: form.value.title.trim(),
      amount: Number(form.value.amount),
      category: form.value.category as IncomeCategory,
      memberId: form.value.memberId || familyStore.activeMember.id,
      tags: cleanTags,
      date: form.value.date || new Date().toISOString().split('T')[0],
      notes: form.value.notes.trim(),
    })
  }

  closeDialog()
}
</script>
