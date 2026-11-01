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
            @click="emit('add-guest')">
            + Add Guest
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

    <!-- Copied Snackbar Feedback -->
    <v-snackbar v-model="showSnackbar" timeout="2000" color="success" rounded="lg">
      <div class="d-flex align-center gap-2">
        <v-icon icon="mdi-check-circle" size="18" />
        <span>{{ copyMessage }}</span>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGuestsStore } from '@/stores/guests'
import { getInitials } from '@/services/service.js'

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
const copyMessage = ref('')

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
    copyMessage.value = `${filteredNames.value.length} guest names copied to clipboard!`
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
