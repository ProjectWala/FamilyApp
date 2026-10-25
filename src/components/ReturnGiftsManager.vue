<template>
  <div class="return-gifts-manager-component">
    <!-- 1. Header Card with Gradient & Quick Stats (Matching Guestlist Purple Gradient) -->
    <v-card class="mb-4 rounded-lg elevation-0 overflow-hidden bg-surface card-hover-border border">
      <!-- Gradient Header Bar -->
      <div
        class="pa-4 text-white position-relative"
        style="background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);"
      >
        <div class="d-flex justify-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="38" rounded="lg">
              <v-icon icon="mdi-gift-outline" size="22" color="white" />
            </v-avatar>
            <div>
              <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
                Return Gifts
              </span>
              <div class="text-h6 font-weight-bold text-white line-height-1">
                {{ giftPresets.length }} Presets • ₹{{ guestsStore.totalReturnGiftsCost.toLocaleString() }} Allocated
              </div>
            </div>
          </div>

          <!-- Add Gift Primary CTA -->
          <v-btn
            color="white"
            variant="flat"
            size="small"
            rounded="lg"
            class="text-primary font-weight-bold text-capitalize"
            prepend-icon="mdi-gift-open-outline"
            @click="openAddGiftDialog"
          >
            + Add Gift
          </v-btn>
        </div>
      </div>

      <!-- Quick Stats Metric Grid (4 Columns) -->
      <div class="pa-3 px-4">
        <div class="stats-overview-grid">
          <!-- Col 1: Total Presets -->
          <div class="stat-grid-col pr-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-format-list-bulleted" size="13" class="text-primary mr-1 flex-shrink-0" />
              <span>Catalog Items</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-primary text-truncate">
              {{ giftPresets.length }} <span class="text-caption font-weight-regular text-lightText">presets</span>
            </div>
          </div>

          <!-- Col 2: Allocated -->
          <div class="stat-grid-col px-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-account-check" size="13" class="text-warning mr-1 flex-shrink-0" />
              <span>Allocated</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-warning text-truncate">
              {{ totalAllocatedCount }} <span class="text-caption font-weight-regular text-lightText">gifts</span>
            </div>
          </div>

          <!-- Col 3: Given -->
          <div class="stat-grid-col px-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-check-circle" size="13" class="text-success mr-1 flex-shrink-0" />
              <span>Delivered</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-success text-truncate">
              {{ deliveredGiftsCount }} <span class="text-caption font-weight-regular text-lightText">given</span>
            </div>
          </div>

          <!-- Col 4: Pending -->
          <div class="stat-grid-col pl-2">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-clock-outline" size="13" class="text-error mr-1 flex-shrink-0" />
              <span>Pending</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-error text-truncate">
              {{ pendingGiftsCount }} <span class="text-caption font-weight-regular text-lightText">to give</span>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- View Mode Switcher & Filter Controls -->
    <v-card variant="outlined" class="mb-4 pa-3 rounded-lg border bg-surface">
      <div class="d-flex flex-column gap-2">
        <div class="d-flex align-center justify-space-between flex-wrap gap-2">
          <!-- View Tabs (Presets vs Allocations) -->
          <v-btn-toggle
            v-model="activeViewTab"
            mandatory
            density="compact"
            color="primary"
            rounded="lg"
            variant="outlined"
          >
            <v-btn value="presets" size="small" class="font-weight-medium text-capitalize">
              <v-icon icon="mdi-cube-outline" size="16" class="mr-1" />
              Gift Presets ({{ giftPresets.length }})
            </v-btn>
            <v-btn value="allocations" size="small" class="font-weight-medium text-capitalize">
              <v-icon icon="mdi-account-heart-outline" size="16" class="mr-1" />
              Allocated to Guests ({{ totalAllocatedCount }})
            </v-btn>
          </v-btn-toggle>

          <!-- Search Input -->
          <div style="min-width: 220px; flex: 1; max-width: 320px;">
            <v-text-field
              v-model="searchQuery"
              density="compact"
              variant="outlined"
              placeholder="Search gifts or guests..."
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              rounded="lg"
            />
          </div>
        </div>
      </div>
    </v-card>

    <!-- VIEW 1: GIFT PRESETS CATALOG -->
    <div v-if="activeViewTab === 'presets'" class="presets-section">
      <!-- Empty State -->
      <v-card
        v-if="filteredPresets.length === 0"
        variant="outlined"
        class="pa-8 text-center rounded-lg border bg-surface"
      >
        <v-avatar color="primary" variant="tonal" size="56" class="mb-3">
          <v-icon icon="mdi-gift-off-outline" size="30" />
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-darkText mb-1">
          No gift presets found
        </div>
        <div class="text-caption text-lightText mb-4">
          {{ searchQuery ? `No gifts matching "${searchQuery}"` : 'Add your first return gift to initialize your catalog' }}
        </div>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          rounded="lg"
          prepend-icon="mdi-plus"
          @click="openAddGiftDialog"
        >
          Add Return Gift
        </v-btn>
      </v-card>

      <!-- Presets Grid -->
      <div v-else class="d-flex flex-column gap-2 mb-6">
        <v-card
          v-for="gift in filteredPresets"
          :key="gift.name"
          variant="outlined"
          class="pa-3 rounded-lg border bg-surface card-hover-border"
        >
          <div class="d-flex justify-space-between align-center flex-wrap gap-2">
            <!-- Left info -->
            <div class="d-flex align-center gap-2" style="min-width: 0;">
              <v-avatar color="warning" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-gift-outline" size="20" />
              </v-avatar>
              <div class="text-truncate">
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-2 font-weight-bold text-darkText text-truncate">
                    {{ gift.name }}
                  </span>
                  <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
                    ₹{{ (gift.price || 0).toLocaleString() }}
                  </v-chip>
                </div>
                <div class="text-caption text-lightText d-flex align-center gap-2 mt-0.5">
                  <span>
                    <v-icon icon="mdi-account-check-outline" size="12" class="mr-0.5 text-warning" />
                    <strong>{{ getGiftAllocatedGuestCount(gift.name) }}</strong> guests assigned
                  </span>
                  <span>•</span>
                  <span>
                    ₹{{ (getGiftAllocatedGuestCount(gift.name) * (gift.price || 0)).toLocaleString() }} est. total
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Actions -->
            <div class="d-flex align-center gap-1">
              <v-btn
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                color="primary"
                title="Edit Gift Preset"
                @click="openEditGiftDialog(gift)"
              />
              <v-btn
                icon="mdi-delete-outline"
                size="small"
                variant="text"
                color="error"
                title="Delete Gift Preset"
                @click="confirmDeleteGift(gift)"
              />
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- VIEW 2: GUEST ALLOCATIONS LIST -->
    <div v-else class="allocations-section">
      <!-- Empty State -->
      <v-card
        v-if="filteredGuestAllocations.length === 0"
        variant="outlined"
        class="pa-8 text-center rounded-lg border bg-surface"
      >
        <v-avatar color="primary" variant="tonal" size="56" class="mb-3">
          <v-icon icon="mdi-account-heart-outline" size="30" />
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-darkText mb-1">
          No guests with return gifts
        </div>
        <div class="text-caption text-lightText mb-4">
          Assign return gifts to your guests from the Guest List tab or create a preset first.
        </div>
      </v-card>

      <!-- Guest Allocation Cards -->
      <div v-else class="d-flex flex-column gap-2 mb-6">
        <v-card
          v-for="allocation in filteredGuestAllocations"
          :key="`${allocation.guestId}-${allocation.giftIndex}`"
          variant="outlined"
          class="pa-3 rounded-lg border bg-surface card-hover-border"
        >
          <div class="d-flex justify-space-between align-center flex-wrap gap-2">
            <!-- Left Guest & Gift Info -->
            <div class="d-flex align-center gap-2" style="min-width: 0;">
              <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
                <span class="text-caption font-weight-bold text-primary">{{ getInitials(allocation.guestName) }}</span>
              </v-avatar>
              <div class="text-truncate">
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-2 font-weight-bold text-darkText text-truncate">
                    {{ allocation.guestName }}
                  </span>
                  <v-chip size="x-small" :color="allocation.delivered ? 'success' : 'warning'" variant="tonal" class="font-weight-medium">
                    {{ allocation.delivered ? 'Delivered' : 'Pending' }}
                  </v-chip>
                </div>
                <div class="text-caption text-lightText d-flex align-center gap-1 mt-0.5">
                  <v-icon icon="mdi-gift" size="13" color="warning" />
                  <strong class="text-darkText">{{ allocation.giftName }}</strong>
                  <span>(₹{{ allocation.giftPrice.toLocaleString() }})</span>
                </div>
              </div>
            </div>

            <!-- Right Actions: Toggle Delivered & Remove -->
            <div class="d-flex align-center gap-1">
              <v-btn
                :color="allocation.delivered ? 'success' : 'default'"
                :variant="allocation.delivered ? 'flat' : 'outlined'"
                size="x-small"
                rounded="lg"
                class="font-weight-bold text-capitalize"
                :prepend-icon="allocation.delivered ? 'mdi-check-circle' : 'mdi-circle-outline'"
                @click="toggleAllocationDelivered(allocation)"
              >
                {{ allocation.delivered ? 'Given' : 'Mark Given' }}
              </v-btn>

              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                title="Unassign Gift from Guest"
                @click="unassignGift(allocation)"
              />
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- ADD / EDIT GIFT MODAL DIALOG (Guestlist Aligned Fixed Header/Footer) -->
    <v-dialog v-model="giftModalOpen" max-width="480" scrollable persistent>
      <v-card class="rounded-xl overflow-hidden bg-surface">
        <!-- Fixed Header -->
        <div class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="32" rounded="md">
              <v-icon :icon="isEditingGift ? 'mdi-pencil-outline' : 'mdi-gift-open-outline'" size="18" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditingGift ? 'Edit Return Gift' : 'Add Return Gift' }}
              </div>
              <div class="text-caption text-white-75" style="font-size: 0.72rem;">
                {{ isEditingGift ? 'Update gift preset details' : 'Create return gift catalog preset' }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="closeGiftModal" />
        </div>

        <v-divider />

        <!-- Scrollable Form Body -->
        <v-card-text class="pa-4">
          <v-form ref="giftFormRef" @submit.prevent="saveGift">
            <!-- Gift Name -->
            <div class="mb-4">
              <label class="text-caption font-weight-bold text-darkText d-block mb-1">
                Gift Name *
              </label>
              <v-text-field
                v-model="giftForm.name"
                density="comfortable"
                variant="outlined"
                placeholder="e.g. Silver Coin (10g), Royal Mithai Box..."
                rounded="lg"
                autofocus
                clearable
                :rules="[(v: string) => !!(v && v.trim()) || 'Gift name is required']"
                hide-details="auto"
              />
            </div>

            <!-- Price Input -->
            <div class="mb-4">
              <label class="text-caption font-weight-bold text-darkText d-block mb-1">
                Estimated Price (₹) *
              </label>
              <v-text-field
                v-model="giftForm.price"
                type="number"
                min="0"
                prefix="₹"
                density="comfortable"
                variant="outlined"
                placeholder="0"
                rounded="lg"
                :rules="[(v: any) => Number(v) >= 0 || 'Price cannot be negative']"
                hide-details="auto"
              />
            </div>

            <!-- Quick Popular Presets (Only when adding) -->
            <div v-if="!isEditingGift">
              <label class="text-caption font-weight-bold text-lightText d-block mb-1.5">
                Popular Gift Presets:
              </label>
              <div class="d-flex flex-wrap gap-1">
                <v-chip
                  v-for="preset in suggestedReturnGifts"
                  :key="preset.name"
                  size="small"
                  variant="outlined"
                  class="cursor-pointer mb-1"
                  @click="applyPreset(preset)"
                >
                  <v-icon icon="mdi-gift-outline" size="13" class="mr-1" />
                  {{ preset.name }} (₹{{ preset.price }})
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
            @click="closeGiftModal"
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
            :disabled="!giftForm.name.trim()"
            @click="saveGift"
          >
            {{ isEditingGift ? 'Update Gift' : 'Save Gift' }}
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
            <div class="text-subtitle-1 font-weight-bold">Delete Return Gift?</div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="deleteModalOpen = false" />
        </div>

        <v-card-text class="pa-4">
          <p class="text-body-2 mb-3">
            Are you sure you want to remove the return gift preset
            <strong class="text-darkText">"{{ giftToDelete?.name }}"</strong>?
          </p>

          <v-checkbox
            v-model="removeGiftFromGuests"
            label="Also unassign this gift from all assigned guests"
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
            @click="executeDeleteGift"
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
import { useGuestsStore } from '@/stores/guests'
import type { ReturnGift } from '@/types'

interface GuestAllocationView {
  guestId: string
  guestName: string
  giftName: string
  giftPrice: number
  giftIndex: number
  delivered: boolean
}

const guestsStore = useGuestsStore()

// State
const activeViewTab = ref<'presets' | 'allocations'>('presets')
const searchQuery = ref('')
const giftModalOpen = ref(false)
const isEditingGift = ref(false)
const originalGiftName = ref('')
const deleteModalOpen = ref(false)
const removeGiftFromGuests = ref(true)
const giftToDelete = ref<ReturnGift | null>(null)

// Form State
const giftForm = ref<{ name: string; price: number | string }>({
  name: '',
  price: 0,
})

// Snackbar
const snackbarOpen = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

function showFeedback(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbarOpen.value = true
}

const giftPresets = computed(() => guestsStore.giftPresets)

// Suggested Preset Templates
const suggestedReturnGifts: ReturnGift[] = [
  { name: 'Silver Coin (10g)', price: 2500 },
  { name: 'Silver Diya Pair', price: 3200 },
  { name: 'Royal Mithai Box', price: 450 },
  { name: 'Sweets & Dry Fruits Hamper', price: 650 },
  { name: 'Silk Stole & Scarf', price: 1200 },
  { name: 'Artisanal Candle & Tea Set', price: 850 },
  { name: 'Premium Ceramic Mug Set', price: 500 },
  { name: 'Handcrafted Brass Bell', price: 950 },
  { name: 'Kashmiri Saffron Gift Box', price: 1500 },
  { name: 'Pashmina Shawl', price: 2800 },
]

function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function getGiftAllocatedGuestCount(giftName: string): number {
  if (!giftName) return 0
  const q = giftName.toLowerCase().trim()
  let count = 0
  guestsStore.guests.forEach((g) => {
    if (Array.isArray(g.returnGifts)) {
      g.returnGifts.forEach((gift) => {
        if (gift.name.toLowerCase().trim() === q) count++
      })
    }
  })
  return count
}

// Aggregates
const totalAllocatedCount = computed(() => {
  return guestsStore.guests.reduce((sum, g) => sum + (Array.isArray(g.returnGifts) ? g.returnGifts.length : 0), 0)
})

const deliveredGiftsCount = computed(() => {
  return guestsStore.guests.filter((g) => g.returnGiftGiven && Array.isArray(g.returnGifts) && g.returnGifts.length > 0).length
})

const pendingGiftsCount = computed(() => {
  return guestsStore.guests.filter((g) => !g.returnGiftGiven && Array.isArray(g.returnGifts) && g.returnGifts.length > 0).length
})

// Filtered Presets
const filteredPresets = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return giftPresets.value
  return giftPresets.value.filter((g) => g.name.toLowerCase().includes(q))
})

// Guest Allocations List
const guestAllocations = computed<GuestAllocationView[]>(() => {
  const list: GuestAllocationView[] = []
  guestsStore.guests.forEach((guest) => {
    if (Array.isArray(guest.returnGifts) && guest.returnGifts.length > 0) {
      guest.returnGifts.forEach((gift, idx) => {
        list.push({
          guestId: guest.id,
          guestName: guest.name,
          giftName: gift.name,
          giftPrice: Number(gift.price) || 0,
          giftIndex: idx,
          delivered: Boolean(guest.returnGiftGiven),
        })
      })
    }
  })
  return list
})

const filteredGuestAllocations = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return guestAllocations.value
  return guestAllocations.value.filter((item) => {
    return (
      item.guestName.toLowerCase().includes(q) ||
      item.giftName.toLowerCase().includes(q)
    )
  })
})

function openAddGiftDialog() {
  isEditingGift.value = false
  originalGiftName.value = ''
  giftForm.value = {
    name: '',
    price: 0,
  }
  giftModalOpen.value = true
}

function openEditGiftDialog(gift: ReturnGift) {
  isEditingGift.value = true
  originalGiftName.value = gift.name
  giftForm.value = {
    name: gift.name,
    price: gift.price || 0,
  }
  giftModalOpen.value = true
}

function closeGiftModal() {
  giftModalOpen.value = false
  giftForm.value = { name: '', price: 0 }
}

function applyPreset(preset: ReturnGift) {
  giftForm.value = {
    name: preset.name,
    price: preset.price,
  }
}

function saveGift() {
  const name = giftForm.value.name.trim()
  const price = Math.max(0, Number(giftForm.value.price) || 0)
  if (!name) return

  if (isEditingGift.value && originalGiftName.value) {
    guestsStore.updateGiftPreset(originalGiftName.value, { name, price })
    showFeedback(`Gift preset "${name}" updated successfully`)
  } else {
    guestsStore.addGiftPreset(name, price)
    showFeedback(`Gift preset "${name}" added to catalog`)
  }
  closeGiftModal()
}

function confirmDeleteGift(gift: ReturnGift) {
  giftToDelete.value = gift
  removeGiftFromGuests.value = true
  deleteModalOpen.value = true
}

function executeDeleteGift() {
  if (!giftToDelete.value) return
  const name = giftToDelete.value.name
  guestsStore.removeGiftPreset(name, removeGiftFromGuests.value)
  showFeedback(`Gift preset "${name}" removed`, 'info')
  deleteModalOpen.value = false
  giftToDelete.value = null
}

async function toggleAllocationDelivered(allocation: GuestAllocationView) {
  await guestsStore.toggleReturnGiftGiven(allocation.guestId)
  showFeedback(
    allocation.delivered
      ? `Marked pending for ${allocation.guestName}`
      : `Delivered to ${allocation.guestName}!`
  )
}

async function unassignGift(allocation: GuestAllocationView) {
  await guestsStore.removeReturnGiftFromGuest(allocation.guestId, allocation.giftIndex)
  showFeedback(`Removed ${allocation.giftName} from ${allocation.guestName}`, 'info')
}
</script>

<style scoped>
.return-gifts-manager-component {
  animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}

.stat-grid-col {
  min-width: 0;
}

.card-hover-border {
  transition: all 0.2s ease;
}

.card-hover-border:hover {
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.text-white-75 {
  color: rgba(255, 255, 255, 0.75);
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
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
