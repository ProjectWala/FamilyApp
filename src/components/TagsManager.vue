<template>
  <div class="tags-manager-component">
    <!-- Top Header Card (Mantis Style) -->
    <v-card
      class="mb-4 pa-4 rounded-lg elevation-0 text-white"
      style="background: var(--v-gradient, linear-gradient(250.38deg, #1677ff 0%, #0958d9 100%));"
    >
      <div class="d-flex justify-space-between align-center flex-wrap gap-2 mb-2">
        <div class="d-flex align-center gap-2">
          <v-avatar color="white" variant="tonal" size="38" rounded="lg">
            <v-icon icon="mdi-tag-multiple-outline" size="22" color="white" />
          </v-avatar>
          <div>
            <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
              Tag Management
            </span>
            <div class="text-h6 font-weight-bold text-white line-height-1">
              {{ totalDistinctTagsCount }} Tags in Catalog
            </div>
          </div>
        </div>

        <!-- Add Tag Primary CTA -->
        <v-btn
          color="white"
          variant="flat"
          size="small"
          rounded="lg"
          class="text-primary font-weight-bold text-capitalize"
          prepend-icon="mdi-plus"
          @click="openAddDialog()"
        >
          + Add Tag
        </v-btn>
      </div>

      <v-divider class="my-2 border-t-white-20" />

      <div class="d-flex justify-space-between align-center text-caption pt-1 text-white-85 flex-wrap gap-2">
        <div class="d-flex align-center gap-3">
          <span>
            Expenses:
            <strong class="text-white font-weight-bold">{{ expenseTagsList.length }}</strong>
          </span>
          <span>•</span>
          <span>
            Guests:
            <strong class="text-white font-weight-bold">{{ guestTagsList.length }}</strong>
          </span>
          <span>•</span>
          <span>
            Shopping:
            <strong class="text-white font-weight-bold">{{ shoppingTagsList.length }}</strong>
          </span>
        </div>
      </div>
    </v-card>

    <!-- Domain Statistics Strip -->
    <v-row dense class="mb-3">
      <v-col cols="4">
        <v-card
          variant="outlined"
          class="pa-2.5 rounded-lg text-center cursor-pointer transition-all border"
          :class="{ 'border-primary bg-primary-subtle': selectedDomain === 'expenses' }"
          @click="selectedDomain = selectedDomain === 'expenses' ? 'all' : 'expenses'"
        >
          <div class="text-caption text-lightText font-weight-medium d-flex align-center justify-center">
            <v-icon icon="mdi-cash" size="14" class="text-warning mr-1" />
            <span>Expenses</span>
          </div>
          <div class="text-subtitle-1 font-weight-bold text-warning">
            {{ expenseTagsList.length }}
          </div>
          <div class="text-caption text-lightText" style="font-size: 0.68rem;">
            {{ totalExpensesTagged }} items
          </div>
        </v-card>
      </v-col>

      <v-col cols="4">
        <v-card
          variant="outlined"
          class="pa-2.5 rounded-lg text-center cursor-pointer transition-all border"
          :class="{ 'border-primary bg-primary-subtle': selectedDomain === 'guests' }"
          @click="selectedDomain = selectedDomain === 'guests' ? 'all' : 'guests'"
        >
          <div class="text-caption text-lightText font-weight-medium d-flex align-center justify-center">
            <v-icon icon="mdi-account-group" size="14" class="text-primary mr-1" />
            <span>Guests</span>
          </div>
          <div class="text-subtitle-1 font-weight-bold text-primary">
            {{ guestTagsList.length }}
          </div>
          <div class="text-caption text-lightText" style="font-size: 0.68rem;">
            {{ totalGuestsTagged }} guests
          </div>
        </v-card>
      </v-col>

      <v-col cols="4">
        <v-card
          variant="outlined"
          class="pa-2.5 rounded-lg text-center cursor-pointer transition-all border"
          :class="{ 'border-primary bg-primary-subtle': selectedDomain === 'shopping' }"
          @click="selectedDomain = selectedDomain === 'shopping' ? 'all' : 'shopping'"
        >
          <div class="text-caption text-lightText font-weight-medium d-flex align-center justify-center">
            <v-icon icon="mdi-cart" size="14" class="text-success mr-1" />
            <span>Shopping</span>
          </div>
          <div class="text-subtitle-1 font-weight-bold text-success">
            {{ shoppingTagsList.length }}
          </div>
          <div class="text-caption text-lightText" style="font-size: 0.68rem;">
            {{ totalShoppingTagged }} items
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search & Filter Controls -->
    <v-card variant="outlined" class="mb-4 pa-3 rounded-lg border bg-surface">
      <div class="d-flex flex-column gap-2">
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          placeholder="Search tags by name..."
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          rounded="lg"
          class="search-input"
        />

        <div class="d-flex align-center justify-space-between flex-wrap gap-2 pt-1">
          <div class="d-flex align-center gap-1 flex-wrap">
            <v-chip
              size="small"
              :variant="selectedDomain === 'all' ? 'flat' : 'tonal'"
              :color="selectedDomain === 'all' ? 'primary' : undefined"
              class="font-weight-medium cursor-pointer"
              @click="selectedDomain = 'all'"
            >
              All ({{ unifiedTagEntries.length }})
            </v-chip>
            <v-chip
              size="small"
              :variant="selectedDomain === 'expenses' ? 'flat' : 'tonal'"
              color="warning"
              class="font-weight-medium cursor-pointer"
              @click="selectedDomain = 'expenses'"
            >
              <v-icon icon="mdi-cash" size="13" class="mr-1" />
              Expenses ({{ expenseTagsList.length }})
            </v-chip>
            <v-chip
              size="small"
              :variant="selectedDomain === 'guests' ? 'flat' : 'tonal'"
              color="primary"
              class="font-weight-medium cursor-pointer"
              @click="selectedDomain = 'guests'"
            >
              <v-icon icon="mdi-account-group" size="13" class="mr-1" />
              Guests ({{ guestTagsList.length }})
            </v-chip>
            <v-chip
              size="small"
              :variant="selectedDomain === 'shopping' ? 'flat' : 'tonal'"
              color="success"
              class="font-weight-medium cursor-pointer"
              @click="selectedDomain = 'shopping'"
            >
              <v-icon icon="mdi-cart" size="13" class="mr-1" />
              Shopping ({{ shoppingTagsList.length }})
            </v-chip>
          </div>

          <span class="text-caption text-lightText font-weight-medium">
            Showing {{ filteredTags.length }} tags
          </span>
        </div>
      </div>
    </v-card>

    <!-- Empty State -->
    <v-card
      v-if="filteredTags.length === 0"
      variant="outlined"
      class="pa-8 text-center rounded-lg border bg-surface"
    >
      <v-avatar color="primary" variant="tonal" size="56" class="mb-3">
        <v-icon icon="mdi-tag-off-outline" size="30" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold text-darkText mb-1">
        No tags found
      </div>
      <div class="text-caption text-lightText mb-4">
        {{ searchQuery ? `No tags matching "${searchQuery}"` : 'Get started by adding your first tag' }}
      </div>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        rounded="lg"
        prepend-icon="mdi-plus"
        @click="openAddDialog()"
      >
        Add Tag Now
      </v-btn>
    </v-card>

    <!-- Tags List -->
    <div v-else class="tags-grid d-flex flex-column gap-2 mb-6">
      <v-card
        v-for="item in filteredTags"
        :key="`${item.domain}-${item.name}`"
        variant="outlined"
        class="pa-3 rounded-lg border bg-surface tag-row-card card-hover-border"
      >
        <div class="d-flex justify-space-between align-center flex-wrap gap-2">
          <!-- Left: Tag Name & Domain Badge -->
          <div class="d-flex align-center gap-2" style="min-width: 0;">
            <v-avatar :color="getDomainColor(item.domain)" variant="tonal" size="32" rounded="lg">
              <v-icon :icon="getDomainIcon(item.domain)" size="16" />
            </v-avatar>
            <div class="text-truncate">
              <div class="d-flex align-center gap-2">
                <span class="text-subtitle-2 font-weight-bold text-darkText text-truncate">
                  {{ item.name }}
                </span>
                <v-chip
                  size="x-small"
                  :color="getDomainColor(item.domain)"
                  variant="tonal"
                  class="font-weight-medium text-capitalize"
                >
                  {{ item.domain }}
                </v-chip>
              </div>
              <div class="text-caption text-lightText d-flex align-center gap-2 mt-0.5">
                <span>
                  <v-icon icon="mdi-link-variant" size="12" class="mr-0.5" />
                  <strong>{{ item.usageCount }}</strong>
                  {{ item.domain === 'guests' ? 'guests assigned' : 'items linked' }}
                </span>
                <span v-if="item.totalValue > 0">• ₹{{ item.totalValue.toLocaleString() }} total</span>
              </div>
            </div>
          </div>

          <!-- Right: Quick Actions -->
          <div class="d-flex align-center gap-1">
            <!-- Delete Button -->
            <v-btn
              icon="mdi-delete-outline"
              size="small"
              variant="text"
              color="error"
              title="Delete Tag"
              @click="confirmDeleteTag(item)"
            />
          </div>
        </div>
      </v-card>
    </div>

    <!-- ADD TAG DIALOG (Guestlist Aligned Fixed Header/Footer) -->
    <v-dialog v-model="addModalOpen" max-width="480" scrollable persistent>
      <v-card class="rounded-xl overflow-hidden bg-surface">
        <!-- Fixed Header -->
        <div class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="32" rounded="md">
              <v-icon icon="mdi-tag-plus-outline" size="18" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">Add New Tag</div>
              <div class="text-caption text-white-75" style="font-size: 0.72rem;">Create custom tags for your events & items</div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="closeAddDialog" />
        </div>

        <v-divider />

        <!-- Scrollable Form Body -->
        <v-card-text class="pa-4">
          <v-form ref="tagFormRef" @submit.prevent="saveTag">
            <!-- Tag Name Input -->
            <div class="mb-4">
              <label class="text-caption font-weight-bold text-darkText d-block mb-1">
                Tag Name *
              </label>
              <v-text-field
                v-model="newTagName"
                density="comfortable"
                variant="outlined"
                placeholder="e.g. Reception, Haldi, Groceries, VIP..."
                rounded="lg"
                autofocus
                clearable
                :rules="[(v: string) => !!(v && v.trim()) || 'Tag name is required']"
                hide-details="auto"
              />
            </div>

            <!-- Target Domains Selection -->
            <div class="mb-4">
              <label class="text-caption font-weight-bold text-darkText d-block mb-1">
                Select Destination Module(s) *
              </label>
              <p class="text-caption text-lightText mb-2">
                Choose which modules should make this tag available for selection.
              </p>

              <div class="d-flex flex-column gap-2">
                <v-checkbox
                  v-model="selectedTargets"
                  value="expenses"
                  color="warning"
                  density="compact"
                  hide-details
                >
                  <template #label>
                    <div class="d-flex align-center gap-2">
                      <v-icon icon="mdi-cash" size="18" color="warning" />
                      <span class="text-body-2 font-weight-medium">Expenses & Events</span>
                    </div>
                  </template>
                </v-checkbox>

                <v-checkbox
                  v-model="selectedTargets"
                  value="guests"
                  color="primary"
                  density="compact"
                  hide-details
                >
                  <template #label>
                    <div class="d-flex align-center gap-2">
                      <v-icon icon="mdi-account-group" size="18" color="primary" />
                      <span class="text-body-2 font-weight-medium">Guests & Invites</span>
                    </div>
                  </template>
                </v-checkbox>

                <v-checkbox
                  v-model="selectedTargets"
                  value="shopping"
                  color="success"
                  density="compact"
                  hide-details
                >
                  <template #label>
                    <div class="d-flex align-center gap-2">
                      <v-icon icon="mdi-cart" size="18" color="success" />
                      <span class="text-body-2 font-weight-medium">Shopping List</span>
                    </div>
                  </template>
                </v-checkbox>
              </div>
            </div>

            <!-- Quick Preset Suggestions -->
            <div>
              <label class="text-caption font-weight-bold text-lightText d-block mb-1.5">
                Quick Preset Suggestions:
              </label>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="sug in suggestedTagPresets"
                  :key="sug"
                  size="x-small"
                  variant="outlined"
                  class="cursor-pointer"
                  @click="newTagName = sug"
                >
                  {{ sug }}
                </v-chip>
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Fixed Footer Actions -->
        <v-card-actions class="pa-4 bg-surface d-flex justify-space-between">
          <v-btn
            variant="outlined"
            color="secondary"
            rounded="lg"
            size="small"
            class="px-4"
            @click="closeAddDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="flat"
            color="primary"
            rounded="lg"
            size="small"
            class="px-4 font-weight-bold"
            prepend-icon="mdi-check"
            :disabled="!newTagName.trim() || selectedTargets.length === 0"
            @click="saveTag"
          >
            Save Tag
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRMATION DIALOG -->
    <v-dialog v-model="deleteModalOpen" max-width="420">
      <v-card class="rounded-xl overflow-hidden bg-surface">
        <div class="pa-4 bg-error text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-icon icon="mdi-alert-circle-outline" size="22" color="white" />
            <div class="text-subtitle-1 font-weight-bold">Delete Tag?</div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="deleteModalOpen = false" />
        </div>

        <v-card-text class="pa-4">
          <p class="text-body-2 mb-3">
            Are you sure you want to remove the tag
            <strong class="text-darkText">"{{ tagToDelete?.name }}"</strong>
            from <strong class="text-capitalize">{{ tagToDelete?.domain }}</strong>?
          </p>

          <v-checkbox
            v-model="removeTagFromItems"
            label="Also remove this tag from all existing items/guests"
            density="compact"
            color="error"
            hide-details
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4 bg-surface d-flex justify-space-between">
          <v-btn
            variant="outlined"
            color="secondary"
            size="small"
            rounded="lg"
            @click="deleteModalOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            variant="flat"
            color="error"
            size="small"
            rounded="lg"
            class="font-weight-bold"
            prepend-icon="mdi-delete"
            @click="executeDeleteTag"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Feedback Snackbar -->
    <v-snackbar v-model="snackbarOpen" :color="snackbarColor" timeout="2500" rounded="lg">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" color="white" size="small" @click="snackbarOpen = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useExpensesStore } from '@/stores/expenses'
import { useGuestsStore } from '@/stores/guests'
import { useShoppingStore } from '@/stores/shopping'

type DomainType = 'expenses' | 'guests' | 'shopping'

interface TagItemView {
  name: string
  domain: DomainType
  usageCount: number
  totalValue: number
}

const expensesStore = useExpensesStore()
const guestsStore = useGuestsStore()
const shoppingStore = useShoppingStore()

// State
const searchQuery = ref('')
const selectedDomain = ref<'all' | DomainType>('all')
const addModalOpen = ref(false)
const deleteModalOpen = ref(false)
const removeTagFromItems = ref(true)
const tagToDelete = ref<TagItemView | null>(null)

// Form State
const newTagName = ref('')
const selectedTargets = ref<DomainType[]>(['expenses', 'guests'])
const suggestedTagPresets = [
  'VIP',
  'Family Event',
  'Brother Marriage',
  'Haldi',
  'Sangeet',
  'Reception',
  'Outstation',
  'Groceries',
  'Household',
  'Hotel Needed',
  'Decoration',
  'Catering',
]

// Snackbar State
const snackbarOpen = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

function showFeedback(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbarOpen.value = true
}

// Compute tags by module
const expenseTagsList = computed(() => expensesStore.allTags)
const guestTagsList = computed(() => guestsStore.allTags)
const shoppingTagsList = computed(() => shoppingStore.allTags)

// Aggregates
const totalDistinctTagsCount = computed(() => {
  const set = new Set<string>()
  expenseTagsList.value.forEach((t) => set.add(t))
  guestTagsList.value.forEach((t) => set.add(t))
  shoppingTagsList.value.forEach((t) => set.add(t))
  return set.size
})

const totalExpensesTagged = computed(() => {
  return expensesStore.expenses.filter((e) => Array.isArray(e.tags) && e.tags.length > 0).length
})

const totalGuestsTagged = computed(() => {
  return guestsStore.guests.filter((g) => Array.isArray(g.tags) && g.tags.length > 0).length
})

const totalShoppingTagged = computed(() => {
  return shoppingStore.items.filter((i) => Array.isArray(i.tags) && i.tags.length > 0).length
})

// Unified list of tag items
const unifiedTagEntries = computed<TagItemView[]>(() => {
  const list: TagItemView[] = []

  // 1. Expenses Tags
  expenseTagsList.value.forEach((name) => {
    const usageCount = expensesStore.getTagExpensesCount(name)
    const totalValue = expensesStore.getTagTotal(name)
    list.push({ name, domain: 'expenses', usageCount, totalValue })
  })

  // 2. Guest Tags
  guestTagsList.value.forEach((name) => {
    const usageCount = guestsStore.tagCountMap[name] || 0
    list.push({ name, domain: 'guests', usageCount, totalValue: 0 })
  })

  // 3. Shopping Tags
  shoppingTagsList.value.forEach((name) => {
    const usageCount = shoppingStore.tagCountMap[name] || 0
    const totalValue = shoppingStore.tagTotalMap[name] || 0
    list.push({ name, domain: 'shopping', usageCount, totalValue })
  })

  return list
})

// Filtered items
const filteredTags = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return unifiedTagEntries.value.filter((item) => {
    if (selectedDomain.value !== 'all' && item.domain !== selectedDomain.value) {
      return false
    }
    if (q && !item.name.toLowerCase().includes(q)) {
      return false
    }
    return true
  })
})

function getDomainColor(domain: DomainType): string {
  switch (domain) {
    case 'expenses':
      return 'warning'
    case 'guests':
      return 'primary'
    case 'shopping':
      return 'success'
    default:
      return 'info'
  }
}

function getDomainIcon(domain: DomainType): string {
  switch (domain) {
    case 'expenses':
      return 'mdi-cash'
    case 'guests':
      return 'mdi-account-group'
    case 'shopping':
      return 'mdi-cart'
    default:
      return 'mdi-tag'
  }
}

function openAddDialog(defaultDomain?: DomainType) {
  newTagName.value = ''
  if (defaultDomain) {
    selectedTargets.value = [defaultDomain]
  } else if (selectedDomain.value !== 'all') {
    selectedTargets.value = [selectedDomain.value]
  } else {
    selectedTargets.value = ['expenses', 'guests']
  }
  addModalOpen.value = true
}

function closeAddDialog() {
  addModalOpen.value = false
  newTagName.value = ''
}

function saveTag() {
  const tag = newTagName.value.trim()
  if (!tag || selectedTargets.value.length === 0) return

  if (selectedTargets.value.includes('expenses')) {
    expensesStore.addCustomTag(tag)
  }
  if (selectedTargets.value.includes('guests')) {
    guestsStore.addCustomTag(tag)
  }
  if (selectedTargets.value.includes('shopping')) {
    shoppingStore.addCustomTag(tag)
  }

  showFeedback(`Tag "${tag}" added to ${selectedTargets.value.join(', ')}`)
  closeAddDialog()
}

function confirmDeleteTag(item: TagItemView) {
  tagToDelete.value = item
  removeTagFromItems.value = true
  deleteModalOpen.value = true
}

function executeDeleteTag() {
  if (!tagToDelete.value) return
  const { name, domain } = tagToDelete.value

  if (domain === 'expenses') {
    expensesStore.removeCustomTag(name, removeTagFromItems.value)
  } else if (domain === 'guests') {
    guestsStore.removeCustomTag(name, removeTagFromItems.value)
  } else if (domain === 'shopping') {
    shoppingStore.removeCustomTag(name, removeTagFromItems.value)
  }

  showFeedback(`Tag "${name}" removed from ${domain}`, 'info')
  deleteModalOpen.value = false
  tagToDelete.value = null
}
</script>

<style scoped>
.tags-manager-component {
  animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-hover-border {
  transition: all 0.2s ease;
}

.card-hover-border:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.border-t-white-20 {
  border-top-color: rgba(255, 255, 255, 0.2) !important;
}

.text-white-75 {
  color: rgba(255, 255, 255, 0.75);
}

.text-white-85 {
  color: rgba(255, 255, 255, 0.85);
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
