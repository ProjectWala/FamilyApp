<template>
  <div class="recurring-component">
    <!-- Header Summary Card (Mantis Style) -->
    <v-card class="mb-4 pa-4 rounded-lg elevation-0 text-white" style="background: var(--v-gradient, linear-gradient(250.38deg, #1677ff 0%, #0958d9 100%));">
      <div class="d-flex justify-space-between align-center flex-wrap gap-2 mb-2">
        <div class="d-flex align-center gap-2">
          <v-avatar color="white" variant="tonal" size="38" rounded="lg">
            <v-icon icon="mdi-repeat" size="22" color="white" />
          </v-avatar>
          <div>
            <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
              Recurring Commitments
            </span>
            <div class="text-h6 font-weight-bold text-white line-height-1">
              ₹{{ recurringStore.activeMonthlyEstimate.toFixed(0) }} <span class="text-caption text-white-75 font-weight-regular">/ month</span>
            </div>
          </div>
        </div>

        <!-- Add Recurring Primary CTA -->
        <v-btn
          color="white"
          variant="flat"
          size="small"
          rounded="lg"
          class="text-primary font-weight-bold text-capitalize"
          prepend-icon="mdi-plus"
          @click="openAddDialog"
        >
          + Add
        </v-btn>
      </div>

      <v-divider class="my-2 border-t-white-20" />

      <div class="d-flex justify-space-between text-caption pt-1 text-white-85">
        <span>Active: <strong>{{ activeCount }}</strong></span>
        <span>Total Repeating: <strong>{{ recurringStore.items.length }} items</strong></span>
      </div>
    </v-card>

    <!-- Header and Status Filter -->
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-subtitle-1 font-weight-bold d-flex align-center text-darkText">
        <v-icon icon="mdi-calendar-sync" class="mr-2 text-primary" size="20" />
        Subscriptions &amp; Bills
      </div>

      <v-chip-group v-model="statusFilter" mandatory>
        <v-chip value="all" size="x-small" filter variant="tonal" rounded="md">All</v-chip>
        <v-chip value="active" size="x-small" filter variant="tonal" color="primary" rounded="md">Active</v-chip>
      </v-chip-group>
    </div>

    <!-- Empty State -->
    <div v-if="filteredItems.length === 0" class="text-center py-8">
      <v-avatar color="surface-variant" size="56" rounded="lg" class="mb-3">
        <v-icon icon="mdi-autorenew" size="32" color="primary" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium text-darkText">No recurring expenses</div>
      <div class="text-body-2 text-lightText">
        Add subscriptions, utilities, and repeating bills to track monthly burn.
      </div>
    </div>

    <!-- Recurring Items List -->
    <v-slide-y-transition group>
      <v-card
        v-for="item in filteredItems"
        :key="item.id"
        variant="outlined"
        elevation="0"
        class="mb-3 pa-3 rounded-lg bg-surface card-hover-border"
        :class="{ 'opacity-60': !item.isActive }"
      >
        <div class="d-flex align-start justify-space-between">
          <div class="d-flex align-center flex-grow-1" style="min-width: 0;">
            <!-- Category Icon (No Background Box) -->
            <div class="mr-3 flex-shrink-0 d-flex align-center justify-center category-icon-wrap">
              <v-icon :icon="getCategoryIcon(item.category)" :color="getCategoryColor(item.category)" size="26" />
            </div>

            <!-- Details -->
            <div class="flex-grow-1" style="min-width: 0;">
              <div class="d-flex align-center gap-2">
                <span class="text-subtitle-2 font-weight-bold text-truncate expense-title-light-red">{{ item.title }}</span>
                <v-chip size="x-small" :color="item.isActive ? 'primary' : 'grey'" variant="tonal" label rounded="md" class="font-weight-medium">
                  {{ item.frequency }}
                </v-chip>
              </div>

              <div class="d-flex align-center gap-2 text-lightText mt-1 flex-wrap">
                <span class="app-date-text">Due: <strong>Day {{ item.billingDay }}</strong></span>
                <span class="date-sep">•</span>
                <span class="d-inline-flex align-center app-member-text text-darkText font-weight-medium">
                  <v-avatar
                    v-if="getMember(item.memberId)"
                    size="14"
                    variant="flat"
                    :style="{ backgroundColor: getMember(item.memberId)?.avatarColor || '#6366F1' }"
                    class="mr-1"
                  >
                    <v-icon :icon="getMember(item.memberId)?.avatarIcon || 'mdi-account'" size="9" color="white" />
                  </v-avatar>
                  <v-icon v-else icon="mdi-account" size="11" class="mr-1 text-lightText" />
                  {{ getMemberName(item.memberId) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Price & Active Switch -->
          <div class="text-right flex-shrink-0 ml-2">
            <div class="text-subtitle-1 font-weight-bold text-primary">
              ₹{{ Number(item.amount).toFixed(2) }}
            </div>
            <v-switch
              :model-value="item.isActive"
              color="teal"
              density="compact"
              hide-details
              class="d-inline-flex"
              @update:model-value="recurringStore.toggleActive(item.id)"
            />
          </div>
        </div>

        <!-- Action footer on card -->
        <div class="d-flex align-center justify-space-between mt-2 pt-2 border-t text-caption">
          <span v-if="item.notes" class="text-medium-emphasis text-truncate" style="max-width: 220px;">
            {{ item.notes }}
          </span>
          <span v-else class="app-date-text text-lightText">
            Next: {{ item.nextDueDate || 'Every ' + item.frequency }}
          </span>

          <div class="d-flex gap-1">
            <v-btn
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-pencil-outline"
              @click="openEditDialog(item)"
            >
              Edit
            </v-btn>
            <v-btn
              size="small"
              variant="text"
              color="error"
              icon="mdi-trash-can-outline"
              @click="confirmDelete(item)"
            />
          </div>
        </div>
      </v-card>
    </v-slide-y-transition>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="520" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="tonal" size="34" class="mr-3">
              <v-icon :icon="isEditing ? 'mdi-autorenew' : 'mdi-plus-circle-outline'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditing ? 'Update Recurring Expense' : 'Add Recurring Expense' }}
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
          <v-form @submit.prevent="saveItem">
            <v-text-field
              v-model="form.title"
              label="Service / Expense Title *"
              placeholder="e.g. Netflix, Wifi, Gym"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
              :rules="[(v) => !!v || 'Title is required']"
            />

            <v-row density="compact">
              <v-col cols="6">
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
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="form.frequency"
                  :items="frequencyOptions"
                  label="Frequency *"
                  variant="outlined"
                  density="comfortable"
                  rounded="md"
                  class="mb-3"
                />
              </v-col>
            </v-row>

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
                <v-text-field
                  v-model.number="form.billingDay"
                  label="Day of Month (1-31)"
                  type="number"
                  min="1"
                  max="31"
                  variant="outlined"
                  density="comfortable"
                  rounded="md"
                  class="mb-3"
                />
              </v-col>
            </v-row>

            <v-select
              v-model="form.memberId"
              :items="familyOptions"
              item-title="name"
              item-value="id"
              label="Assigned Member"
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
              class="mb-2"
            />

            <v-switch
              v-model="form.isActive"
              color="primary"
              label="Active Subscription"
              hide-details
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
            @click="saveItem"
          >
            {{ isEditing ? 'Save Changes' : 'Add Recurring' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteConfirmOpen" max-width="400">
      <v-card class="rounded-lg pa-4">
        <v-card-title class="font-weight-bold text-h6">
          Delete Recurring Expense?
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ itemToDelete?.title }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="deleteConfirmOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" rounded="lg" @click="executeDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecurringStore } from '@/stores/recurring'
import { useFamilyStore } from '@/stores/family'
import { useModalBack } from '@/composables/useModalBack'
import type { RecurringExpenseItem, Frequency, ExpenseCategory } from '@/types'
import {
  getRecurringCategoryIcon as serviceGetCategoryIcon,
  getRecurringCategoryColor as serviceGetCategoryColor,
  filterRecurringItems as serviceFilterRecurringItems,
  createDefaultRecurringForm,
  createEditRecurringForm,
  buildRecurringPayload,
} from '@/services/service.js'

const recurringStore = useRecurringStore()
const familyStore = useFamilyStore()

const dialogOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const deleteConfirmOpen = ref(false)
const itemToDelete = ref<RecurringExpenseItem | null>(null)

useModalBack(dialogOpen, 'recurringDialog')
useModalBack(deleteConfirmOpen, 'recurringDeleteDialog')

const statusFilter = ref<'all' | 'active'>('all')

const frequencyOptions: Frequency[] = ['daily', 'weekly', 'monthly', 'yearly']
const categoryList: ExpenseCategory[] = [
  'Utilities',
  'Entertainment',
  'Health',
  'Groceries',
  'Dining',
  'Shopping',
  'Transport',
  'Other',
]

const form = ref(createDefaultRecurringForm(familyStore.members[0]?.id || ''))

const activeCount = computed(() => recurringStore.items.filter((i) => i.isActive).length)

const familyOptions = computed(() => {
  return familyStore.members.map((m) => ({
    id: m.id,
    name: `${m.name} (${m.role})`,
  }))
})

const filteredItems = computed(() =>
  serviceFilterRecurringItems(recurringStore.items, statusFilter.value)
)

function getMemberName(memberId: string) {
  const member = familyStore.getMemberById(memberId)
  return member ? member.name : 'Unassigned'
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

function openAddDialog() {
  isEditing.value = false
  editingId.value = null
  form.value = createDefaultRecurringForm(familyStore.members[0]?.id || '')
  dialogOpen.value = true
}

function openEditDialog(item: RecurringExpenseItem) {
  isEditing.value = true
  editingId.value = item.id
  form.value = createEditRecurringForm(item)
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  editingId.value = null
}

function saveItem() {
  if (!form.value.title.trim() || !form.value.amount || Number(form.value.amount) <= 0) {
    return
  }

  const payload = buildRecurringPayload(
    form.value,
    familyStore.members[0]?.id || 'unknown'
  )

  if (isEditing.value && editingId.value) {
    recurringStore.updateItem(editingId.value, payload)
  } else {
    recurringStore.addItem(payload)
  }

  closeDialog()
}

function confirmDelete(item: RecurringExpenseItem) {
  itemToDelete.value = item
  deleteConfirmOpen.value = true
}

function executeDelete() {
  if (itemToDelete.value) {
    recurringStore.deleteItem(itemToDelete.value.id)
  }
  deleteConfirmOpen.value = false
  itemToDelete.value = null
}
</script>
