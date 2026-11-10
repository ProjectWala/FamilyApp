<template>
  <div class="guests-names-container">
    <!-- Header Card -->
    <v-card class="mb-3 pa-4 rounded-lg elevation-0 text-white"
      style="background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);">
      <div class="d-flex justify-space-between align-center flex-wrap gap-2">
        <div class="d-flex align-center gap-2">
          <v-avatar color="white" variant="tonal" size="36" rounded="lg">
            <v-icon icon="mdi-format-list-bulleted" size="20" color="white" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold text-white line-height-1">
            Guest Names ({{ totalNamesCount }})
          </div>
        </div>

        <!-- Header CTAs -->
        <div class="d-flex align-center gap-2">
          <!-- Add Guest CTA -->
          <v-btn color="white" variant="flat" size="small" rounded="lg"
            class="text-primary font-weight-bold text-capitalize" prepend-icon="mdi-account-plus"
            @click="openAddGuestDialog">
            Add
          </v-btn>

          <!-- Quick Copy CTA -->
          <v-btn color="white" variant="outlined" size="small" rounded="lg"
            class="font-weight-bold text-capitalize text-white"
            :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'" :disabled="guestNamesList.length === 0"
            @click="copyAllNames">
            {{ copied ? 'Copied!' : 'Copy Names' }}
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- Search & Filter Options Bar -->
    <v-card class="mb-3 pa-3 rounded-lg elevation-0 bg-surface border">
      <div class="d-flex align-center gap-2 flex-wrap">
        <v-text-field v-model="searchQuery" density="compact" variant="outlined" placeholder="Search guest names..."
          prepend-inner-icon="mdi-magnify" hide-details clearable rounded="md" class="flex-grow-1"
          style="min-width: 180px;" @click:clear="searchQuery = ''" />

        <!-- Sort Toggle: A-Z / Default -->
        <v-btn variant="outlined" color="secondary" size="small" rounded="md" class="text-capitalize font-weight-medium"
          :prepend-icon="sortAlpha ? 'mdi-sort-alphabetical-ascending' : 'mdi-sort'" @click="sortAlpha = !sortAlpha">
          {{ sortAlpha ? 'A to Z' : 'Order Added' }}
        </v-btn>

        <!-- Toggle Include Accompanying / Addon Names -->
        <v-chip v-if="hasAccompanyingPersons" size="small" :variant="includeAddons ? 'flat' : 'outlined'"
          :color="includeAddons ? 'primary' : 'secondary'" class="cursor-pointer font-weight-medium"
          @click="includeAddons = !includeAddons">
          <v-icon :icon="includeAddons ? 'mdi-account-multiple' : 'mdi-account'" size="14" class="mr-1" />
          {{ includeAddons ? 'All Persons' : 'Main Guests Only' }}
        </v-chip>
      </div>
    </v-card>

    <!-- Names List Card -->
    <v-card class="rounded-lg elevation-0 bg-surface border overflow-hidden">
      <!-- Loading State -->
      <div v-if="guestsStore.isSyncing" class="pa-6 text-center text-lightText">
        <v-progress-circular indeterminate color="primary" size="28" class="mb-2" />
        <div class="text-caption">Loading guest names...</div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredNames.length === 0" class="pa-8 text-center text-lightText">
        <v-avatar color="containerBg" size="48" class="mb-2">
          <v-icon icon="mdi-account-off-outline" size="24" class="text-lightText" />
        </v-avatar>
        <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
          {{ searchQuery ? 'No Matching Names' : 'No Guests Yet' }}
        </div>
        <div class="text-caption">
          {{ searchQuery ? 'Try searching for a different name.' : 'Guests added to your guest list will appear here.'
          }}
        </div>
      </div>

      <!-- Names List -->
      <v-list v-else density="comfortable" class="pa-0">
        <template v-for="(item, index) in filteredNames" :key="item.id || index">
          <v-list-item class="px-4 py-2 hover-bg">
            <template #prepend>
              <div class="name-index text-caption font-weight-bold text-lightText mr-3 text-center"
                style="width: 28px; font-variant-numeric: tabular-nums;">
                {{ index + 1 }}.
              </div>
              <v-avatar size="32" rounded="md" variant="tonal" :color="item.isAddon ? 'secondary' : 'primary'"
                class="mr-3 font-weight-bold" style="font-size: 0.75rem;">
                {{ getInitials(item.name) }}
              </v-avatar>
            </template>

            <v-list-item-title class="text-body-1 font-weight-medium text-darkText d-flex align-center gap-1.5">
              <span>{{ item.name }}</span>
              <v-chip v-if="item.isAddon" size="x-small" variant="tonal" color="secondary"
                class="font-weight-medium text-caption" style="font-size: 0.68rem;">
                {{ item.relation || 'Addon' }}
              </v-chip>
            </v-list-item-title>
          </v-list-item>
          <v-divider v-if="index < filteredNames.length - 1" :key="`div-${item.id || index}`" />
        </template>
      </v-list>
    </v-card>

    <!-- ADD NEW GUEST MODAL DIALOG -->
    <v-dialog v-model="addGuestDialog" max-width="580" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="tonal" size="34" class="mr-3">
              <v-icon icon="mdi-account-plus" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                Add New Guest
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="closeAddGuestDialog" />
        </v-card-title>

        <v-divider />

        <!-- Form Body -->
        <v-card-text class="pa-4" style="max-height: 75vh;">
          <v-form ref="addGuestFormRef" @submit.prevent="saveNewGuest">
            <!-- SECTION 1: GUEST NAME WITH AUTOCOMPLETE / AUTO-CORRECT -->
            <div class="mb-3">
              <v-combobox
                v-model="guestForm.name"
                :items="guestsStore.knownGuestNames"
                label="Guest / Family Name *"
                placeholder="Type or select guest name (e.g. Vikram Sharma)"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-account"
                clearable
                :rules="[(v) => !!(typeof v === 'string' ? v.trim() : v) || 'Guest name is required']"
                @update:model-value="onGuestNameChange"
              >
                <template #prepend-item>
                  <div class="px-3 py-1 text-caption text-lightText font-weight-bold border-b bg-containerBg">
                    Saved Guests &amp; Contacts (Autocomplete)
                  </div>
                </template>
              </v-combobox>
            </div>

            <!-- SECTION 2: GROUP CATEGORY & TAGS -->
            <div class="mb-4">
              <div class="text-subtitle-2 font-weight-bold text-darkText mb-2 d-flex align-center">
                <v-icon icon="mdi-tag-multiple-outline" size="18" class="mr-1 text-primary" />
                Group Category &amp; Tags
              </div>

              <!-- Group Category -->
              <v-combobox
                v-model="guestForm.group"
                :items="guestsStore.allGroups"
                label="Group Category *"
                placeholder="Select or type category"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-folder-outline"
                class="mb-3"
                :rules="[(v) => !!v || 'Group category is required']"
              />

              <!-- Tags Multi-Selector -->
              <div class="mt-1">
                <v-combobox
                  v-model="guestForm.tags"
                  :items="guestsStore.allTags"
                  label="Tags for Grouping (Type &amp; press Enter for custom tags)"
                  placeholder="Select tags or type custom (e.g. VIP, Outstation)"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-tag-outline"
                />

                <!-- Quick Suggested Tag Toggles -->
                <div class="d-flex align-center gap-1 flex-wrap mt-1">
                  <span class="text-caption text-lightText" style="font-size: 0.68rem;">Quick Tags:</span>
                  <v-chip
                    v-for="tag in ['VIP', 'Family Event', 'Friends', 'Outstation', 'Vegetarian', 'Hotel Needed', 'College']"
                    :key="tag"
                    size="x-small"
                    :variant="isTagInForm(tag) ? 'flat' : 'outlined'"
                    color="primary"
                    class="cursor-pointer"
                    @click="toggleFormTag(tag)"
                  >
                    <v-icon :icon="isTagInForm(tag) ? 'mdi-check' : 'mdi-plus'" size="10" class="mr-0.5" />
                    {{ tag }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- SECTION 3: CONTACT & NOTES (Optional) -->
            <v-expansion-panels variant="accordion" class="mb-2">
              <v-expansion-panel elevation="0" class="border rounded-lg">
                <v-expansion-panel-title class="py-2 text-caption font-weight-bold text-darkText">
                  <v-icon icon="mdi-card-account-phone-outline" size="16" class="mr-2 text-primary" />
                  Additional Details (Phone, Email, Notes)
                </v-expansion-panel-title>
                <v-expansion-panel-text eager>
                  <v-row density="compact" class="pt-2">
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="guestForm.phone"
                        label="Phone Number"
                        placeholder="+91 98765 43210"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        prepend-inner-icon="mdi-phone"
                      />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="guestForm.email"
                        label="Email Address"
                        placeholder="guest@example.com"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        prepend-inner-icon="mdi-email-outline"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="guestForm.notes"
                        label="Notes &amp; Special Arrangements"
                        placeholder="e.g. Arriving Friday evening, requires ground-floor room"
                        variant="outlined"
                        density="comfortable"
                        rows="2"
                        rounded="lg"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Dialog Footer Actions -->
        <v-card-actions class="pa-4 bg-surface d-flex justify-space-between">
          <v-btn variant="outlined" rounded="lg" color="secondary" class="text-capitalize" @click="closeAddGuestDialog">
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-capitalize font-weight-bold px-4"
            prepend-icon="mdi-content-save"
            :loading="isSaving"
            @click="saveNewGuest"
          >
            Add Guest
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Feedback Snackbar -->
    <v-snackbar v-model="showSnackbar" timeout="2500" color="success" rounded="lg">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-check-circle" size="18" />
        <span>{{ feedbackMessage }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGuestsStore } from '@/stores/guests'
import { getInitials } from '@/services/service.js'
import { useModalBack } from '@/composables/useModalBack'

interface DisplayNameItem {
  id: string
  name: string
  isAddon?: boolean
  relation?: string
}

const emit = defineEmits<{
  (e: 'add-guest'): void
}>()

const guestsStore = useGuestsStore()

const searchQuery = ref('')
const sortAlpha = ref(false)
const includeAddons = ref(false)
const copied = ref(false)
const showSnackbar = ref(false)
const feedbackMessage = ref('')

// Add Guest Dialog State
const addGuestDialog = ref(false)
const isSaving = ref(false)
const addGuestFormRef = ref<any>(null)

useModalBack(addGuestDialog, 'addGuestModal')

const guestForm = ref({
  name: '',
  phone: '',
  email: '',
  group: 'Family',
  tags: ['Family Event'] as string[],
  notes: '',
})

function openAddGuestDialog() {
  emit('add-guest')
  guestForm.value = {
    name: '',
    phone: '',
    email: '',
    group: 'Family',
    tags: ['Family Event'],
    notes: '',
  }
  addGuestDialog.value = true
}

function closeAddGuestDialog() {
  addGuestDialog.value = false
}

function onGuestNameChange(val: string) {
  if (!val || typeof val !== 'string') return
  const trimmed = val.trim().toLowerCase()
  const match = guestsStore.guests.find((g) => g.name.toLowerCase() === trimmed)
  if (match) {
    if (match.group) guestForm.value.group = match.group
    if (Array.isArray(match.tags) && match.tags.length > 0) guestForm.value.tags = [...match.tags]
    if (match.phone && !guestForm.value.phone) guestForm.value.phone = match.phone
    if (match.email && !guestForm.value.email) guestForm.value.email = match.email
    if (match.notes && !guestForm.value.notes) guestForm.value.notes = match.notes
  }
}

function isTagInForm(tag: string) {
  return Array.isArray(guestForm.value.tags) && guestForm.value.tags.includes(tag)
}

function toggleFormTag(tag: string) {
  if (!Array.isArray(guestForm.value.tags)) {
    guestForm.value.tags = []
  }
  const idx = guestForm.value.tags.indexOf(tag)
  if (idx === -1) {
    guestForm.value.tags.push(tag)
  } else {
    guestForm.value.tags.splice(idx, 1)
  }
}

async function saveNewGuest() {
  const formValidation = await addGuestFormRef.value?.validate()
  if (formValidation && !formValidation.valid) {
    return
  }

  isSaving.value = true
  try {
    const rawName = guestForm.value.name
    const cleanName = (typeof rawName === 'string' ? rawName : (rawName as any)?.value || '').trim()

    const payload = {
      name: cleanName,
      phone: (guestForm.value.phone || '').trim(),
      email: (guestForm.value.email || '').trim(),
      group: guestForm.value.group || 'General',
      tags: Array.isArray(guestForm.value.tags)
        ? guestForm.value.tags.map((t) => (typeof t === 'string' ? t.trim() : (t as any).value || '')).filter(Boolean)
        : [],
      rsvpStatus: 'confirmed' as const,
      additionalGuests: 0,
      accompanyingPersons: [],
      returnGifts: [],
      notes: (guestForm.value.notes || '').trim(),
    }

    await guestsStore.addGuest(payload)
    addGuestDialog.value = false
    feedbackMessage.value = `Guest "${cleanName}" added successfully!`
    showSnackbar.value = true
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  openAddGuestDialog,
})

// Check if any guests have accompanying persons
const hasAccompanyingPersons = computed(() => {
  return guestsStore.guests.some(
    (g) => Array.isArray(g.accompanyingPersons) && g.accompanyingPersons.length > 0
  )
})

// Build the base list of guest names
const guestNamesList = computed<DisplayNameItem[]>(() => {
  const list: DisplayNameItem[] = []

  guestsStore.guests.forEach((g) => {
    if (g.name && g.name.trim()) {
      list.push({
        id: g.id,
        name: g.name.trim(),
        isAddon: false,
      })

      // Include accompanying persons if toggled
      if (includeAddons.value && Array.isArray(g.accompanyingPersons)) {
        g.accompanyingPersons.forEach((person, pIdx) => {
          if (person.name && person.name.trim()) {
            list.push({
              id: `${g.id}-addon-${pIdx}`,
              name: person.name.trim(),
              isAddon: true,
              relation: person.relation || 'Family',
            })
          }
        })
      }
    }
  })

  return list
})

// Filter and sort the names
const filteredNames = computed<DisplayNameItem[]>(() => {
  let result = [...guestNamesList.value]

  // Search filter
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter((item) => item.name.toLowerCase().includes(q))
  }

  // Sort order
  if (sortAlpha.value) {
    result.sort((a, b) => a.name.localeCompare(b.name))
  }

  return result
})

const totalNamesCount = computed(() => filteredNames.value.length)

async function copyAllNames() {
  const namesText = filteredNames.value.map((item, idx) => `${idx + 1}. ${item.name}`).join('\n')
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(namesText)
    } else {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = namesText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copied.value = true
    feedbackMessage.value = `${filteredNames.value.length} guest names copied to clipboard!`
    showSnackbar.value = true
    setTimeout(() => {
      copied.value = false
    }, 2500)
  } catch (err) {
    console.error('Failed to copy names:', err)
  }
}
</script>

<style scoped>
.guests-names-container {
  width: 100%;
}

.hover-bg:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
