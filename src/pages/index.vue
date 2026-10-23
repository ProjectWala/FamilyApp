<template>
  <div class="mobile-viewport">
    <!-- Left Navigation Drawer (Sidebar) -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      width="290"
      class="mobile-sidebar-drawer bg-surface"
      elevation="16"
    >
      <!-- Sidebar Header -->
      <div class="sidebar-header pa-4 bg-primary text-white">
        <div class="d-flex align-center justify-space-between mb-3">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="flat" size="36" rounded="lg" class="mr-2 text-primary">
              <v-icon icon="mdi-home-heart" size="22" color="primary" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">Family Life</div>
              <div class="text-caption text-white opacity-80" style="font-size: 0.7rem;">Household & Tasks OS</div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            aria-label="Close sidebar"
            @click="drawer = false"
          />
        </div>

        <!-- Current Active Impersonated Profile Card -->
        <div
          class="active-profile-card pa-2.5 rounded-lg d-flex align-center justify-space-between cursor-pointer"
          title="Switch active family profile"
          @click="openProfileSwitcher"
        >
          <div class="d-flex align-center" style="min-width: 0;">
            <v-avatar
              :color="familyStore.activeMember.avatarColor || 'primary'"
              size="32"
              class="mr-2 text-white flex-shrink-0"
              :style="{ backgroundColor: familyStore.activeMember.avatarColor || '#6366F1' }"
            >
              <v-icon :icon="familyStore.activeMember.avatarIcon || 'mdi-account'" size="18" color="white" />
            </v-avatar>
            <div class="text-truncate">
              <div class="text-caption font-weight-bold text-white text-truncate line-height-1">
                {{ familyStore.activeMember.name }}
              </div>
              <div class="text-caption text-white opacity-80 font-weight-medium" style="font-size: 0.68rem;">
                {{ familyStore.activeMember.role }}
              </div>
            </div>
          </div>
          <v-chip size="x-small" variant="flat" color="white" class="text-primary font-weight-bold flex-shrink-0 ml-1">
            Switch
          </v-chip>
        </div>
      </div>

      <!-- Quick Summary Metric Bar -->
      <div class="px-3 py-2 bg-containerBg border-b d-flex justify-space-around text-center">
        <div class="stat-pill px-2 py-1">
          <div class="text-caption text-lightText" style="font-size: 0.65rem;">Active Tasks</div>
          <div class="text-subtitle-2 font-weight-bold text-primary">{{ todoStore.activeCount }}</div>
        </div>
        <v-divider vertical class="my-1" />
        <div class="stat-pill px-2 py-1">
          <div class="text-caption text-lightText" style="font-size: 0.65rem;">This Month</div>
          <div class="text-subtitle-2 font-weight-bold text-success">${{ expensesStore.thisMonthAmount.toFixed(0) }}</div>
        </div>
        <v-divider vertical class="my-1" />
        <div class="stat-pill px-2 py-1">
          <div class="text-caption text-lightText" style="font-size: 0.65rem;">Members</div>
          <div class="text-subtitle-2 font-weight-bold text-darkText">{{ familyStore.members.length }}</div>
        </div>
      </div>

      <!-- Nav Menu Items -->
      <v-list density="compact" nav class="pa-3">
        <v-list-subheader class="text-uppercase text-caption font-weight-bold text-lightText tracking-wider" style="font-size: 0.68rem;">
          Modules
        </v-list-subheader>

        <v-list-item
          :active="currentTab === 'dashboard'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('dashboard')"
        >
          <template #prepend>
            <v-icon icon="mdi-view-dashboard-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Dashboard</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Home overview</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          :active="currentTab === 'todos'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('todos')"
        >
          <template #prepend>
            <v-icon icon="mdi-checkbox-marked-circle-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">To-Do Tasks</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Checklist & assignments</v-list-item-subtitle>
          <template #append v-if="todoStore.activeCount > 0">
            <v-badge color="error" :content="todoStore.activeCount" inline />
          </template>
        </v-list-item>

        <v-list-item
          :active="currentTab === 'expenses'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('expenses')"
        >
          <template #prepend>
            <v-icon icon="mdi-cash-multiple" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Expenses</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Event tags & logs</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          :active="currentTab === 'family'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('family')"
        >
          <template #prepend>
            <v-icon icon="mdi-account-group-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Family Squad</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Members & avatars</v-list-item-subtitle>
          <template #append>
            <v-chip size="x-small" variant="tonal" color="primary">{{ familyStore.members.length }}</v-chip>
          </template>
        </v-list-item>

        <v-list-item
          :active="currentTab === 'recurring'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('recurring')"
        >
          <template #prepend>
            <v-icon icon="mdi-autorenew" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Recurring Expenses</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Subscriptions & bills</v-list-item-subtitle>
          <template #append v-if="recurringStore.items.length > 0">
            <v-chip size="x-small" variant="tonal" color="info">{{ recurringStore.items.length }}</v-chip>
          </template>
        </v-list-item>

        <v-list-item
          :active="currentTab === 'guests'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('guests')"
        >
          <template #prepend>
            <v-icon icon="mdi-account-multiple-check-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Guest List</v-list-item-title>
          <v-list-item-subtitle class="text-caption">RSVPs &amp; Return gifts</v-list-item-subtitle>
          <template #append v-if="guestsStore.totalGuests > 0">
            <v-chip size="x-small" variant="tonal" color="secondary">{{ guestsStore.totalGuests }}</v-chip>
          </template>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-subheader class="text-uppercase text-caption font-weight-bold text-lightText tracking-wider" style="font-size: 0.68rem;">
          Quick Settings
        </v-list-subheader>

        <v-list-item rounded="lg" class="mb-1" @click="toggleTheme">
          <template #prepend>
            <v-icon :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ isDark ? 'Light Theme' : 'Dark Theme' }}
          </v-list-item-title>
          <template #append>
            <v-switch
              :model-value="isDark"
              color="primary"
              density="compact"
              hide-details
              @update:model-value="toggleTheme"
            />
          </template>
        </v-list-item>

        <v-list-item rounded="lg" class="mb-1" @click="openProfileSwitcher">
          <template #prepend>
            <v-icon icon="mdi-account-switch-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">Switch Profile</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Change active member</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- Sidebar Footer -->
      <template #append>
        <div class="pa-3 border-t bg-surface">
          <div class="d-flex align-center justify-space-between text-caption text-lightText mb-2" style="font-size: 0.7rem;">
            <span class="d-flex align-center">
              <v-icon icon="mdi-gesture-swipe-horizontal" size="14" class="mr-1 text-primary" />
              Swipe thumb to toggle
            </span>
            <span class="font-weight-medium">v2.4</span>
          </div>
          <v-btn
            variant="tonal"
            color="primary"
            block
            size="small"
            rounded="lg"
            prepend-icon="mdi-chevron-left"
            @click="drawer = false"
          >
            Close Menu
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <div class="mobile-frame">
      <!-- Mobile Top Navigation Header (Mantis Style) -->
      <v-card class="mobile-header px-4 py-3 d-flex align-center justify-space-between bg-surface" elevation="0" rounded="0">
        <div class="d-flex align-center" style="min-width: 0;">
          <!-- Back button if not on dashboard -->
          <v-btn
            v-if="currentTab !== 'dashboard'"
            icon="mdi-arrow-left"
            variant="text"
            size="small"
            class="mr-1 flex-shrink-0"
            title="Back to Dashboard"
            @click="currentTab = 'dashboard'"
          />

          <!-- Main Icon in Top Bar: toggles left sidebar -->
          <v-btn
            icon="mdi-menu"
            variant="tonal"
            color="primary"
            size="small"
            class="mr-2 flex-shrink-0 rounded-md main-menu-btn"
            title="Toggle Sidebar Menu (or swipe thumb right)"
            aria-label="Toggle navigation drawer"
            @click="drawer = !drawer"
          />

          <div style="min-width: 0;">
            <div class="text-subtitle-1 font-weight-bold line-height-1 text-truncate text-darkText">
              {{ currentTitle }}
            </div>
            <div class="text-caption text-lightText text-truncate">
              {{ currentSubtitle }}
            </div>
          </div>
        </div>

        <!-- Right Side: Active Profile Impersonation Chip & Dark Mode -->
        <div class="d-flex align-center flex-shrink-0 ml-2">
          <!-- Supabase Cloud Sync Badge -->
          <v-chip
            size="x-small"
            color="success"
            variant="tonal"
            class="mr-1 d-none d-sm-inline-flex border-success-subtle font-weight-medium"
            title="Connected to Supabase Edge Function"
          >
            <v-icon icon="mdi-cloud-check" size="12" class="mr-1" />
            Cloud
          </v-chip>

          <!-- Impersonate Profile Chip -->
          <v-chip
            size="small"
            variant="tonal"
            color="primary"
            class="mr-1 font-weight-medium cursor-pointer px-2 border-primary-subtle"
            title="Click to switch impersonated family member profile"
            @click="profileSwitcherOpen = true"
          >
            <v-avatar
              :color="familyStore.activeMember.avatarColor || 'primary'"
              variant="flat"
              size="18"
              class="mr-1 text-white"
              :style="{ backgroundColor: familyStore.activeMember.avatarColor || '#6366F1' }"
            >
              <v-icon :icon="familyStore.activeMember.avatarIcon || 'mdi-account'" size="12" color="white" />
            </v-avatar>
            <span class="profile-name text-truncate text-darkText">{{ familyStore.activeMember.name.split(' ')[0] }}</span>
            <v-icon icon="mdi-chevron-down" size="14" class="ml-1 text-lightText" />
          </v-chip>

          <v-btn
            :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
            variant="text"
            size="small"
            color="darkText"
            @click="toggleTheme"
          />
        </div>
      </v-card>

      <!-- Main Content Container with Transitions -->
      <div class="mobile-content pa-4">
        <v-fade-transition mode="out-in">
          <MainDashboard
            v-if="currentTab === 'dashboard'"
            @select-module="selectTab($event)"
          />
          <TodoList
            v-else-if="currentTab === 'todos'"
          />
          <Expenses
            v-else-if="currentTab === 'expenses'"
          />
          <FamilyMembers
            v-else-if="currentTab === 'family'"
          />
          <RecurringExpenses
            v-else-if="currentTab === 'recurring'"
          />
          <GuestsList
            v-else-if="currentTab === 'guests'"
          />
        </v-fade-transition>
      </div>

      <!-- Elevated Mobile Bottom Navigation Bar (Refined for Mobile with Safe Border Inset) -->
      <v-bottom-navigation
        v-model="currentTab"
        color="primary"
        height="62"
        class="mobile-bottom-nav bg-surface px-2"
        elevation="0"
      >
        <v-btn value="dashboard" class="nav-tab-btn" :ripple="false">
          <v-icon icon="mdi-home-outline" size="20" />
          <span class="nav-btn-label">Home</span>
        </v-btn>

        <v-btn value="todos" class="nav-tab-btn" :ripple="false">
          <v-badge
            v-if="todoStore.activeCount > 0"
            color="error"
            :content="todoStore.activeCount"
            size="x-small"
            offset-x="-2"
            offset-y="-2"
          >
            <v-icon icon="mdi-checkbox-marked-circle-outline" size="20" />
          </v-badge>
          <v-icon v-else icon="mdi-checkbox-marked-circle-outline" size="20" />
          <span class="nav-btn-label">Tasks</span>
        </v-btn>

        <v-btn value="expenses" class="nav-tab-btn" :ripple="false">
          <v-icon icon="mdi-cash-plus" size="20" />
          <span class="nav-btn-label">Expenses</span>
        </v-btn>

        <v-btn value="family" class="nav-tab-btn" :ripple="false">
          <v-icon icon="mdi-account-group-outline" size="20" />
          <span class="nav-btn-label">Family</span>
        </v-btn>

        <v-btn value="recurring" class="nav-tab-btn" :ripple="false">
          <v-icon icon="mdi-autorenew" size="20" />
          <span class="nav-btn-label">Recurring</span>
        </v-btn>

        <v-btn value="guests" class="nav-tab-btn" :ripple="false">
          <v-badge
            v-if="guestsStore.totalGuests > 0"
            color="secondary"
            :content="guestsStore.totalGuests"
            size="x-small"
            offset-x="-2"
            offset-y="-2"
          >
            <v-icon icon="mdi-account-multiple-check-outline" size="20" />
          </v-badge>
          <v-icon v-else icon="mdi-account-multiple-check-outline" size="20" />
          <span class="nav-btn-label">Guests</span>
        </v-btn>
      </v-bottom-navigation>

      <!-- Global Profile Switcher Dialog -->
      <ProfileSwitcher v-model="profileSwitcherOpen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import MainDashboard from '@/components/MainDashboard.vue'
import TodoList from '@/components/TodoList.vue'
import Expenses from '@/components/Expenses.vue'
import FamilyMembers from '@/components/FamilyMembers.vue'
import RecurringExpenses from '@/components/RecurringExpenses.vue'
import GuestsList from '@/components/GuestsList.vue'
import ProfileSwitcher from '@/components/ProfileSwitcher.vue'
import { useAppStore } from '@/stores/app'
import { useTodoStore } from '@/stores/todos'
import { useFamilyStore } from '@/stores/family'
import { useExpensesStore } from '@/stores/expenses'
import { useRecurringStore } from '@/stores/recurring'
import { useGuestsStore } from '@/stores/guests'
import { useModalBack } from '@/composables/useModalBack'

const theme = useTheme()
const appStore = useAppStore()
const todoStore = useTodoStore()
const familyStore = useFamilyStore()
const expensesStore = useExpensesStore()
const recurringStore = useRecurringStore()
const guestsStore = useGuestsStore()

const route = useRoute()
const router = useRouter()

type TabModule = 'dashboard' | 'todos' | 'expenses' | 'family' | 'recurring' | 'guests'
const VALID_TABS: TabModule[] = ['dashboard', 'todos', 'expenses', 'family', 'recurring', 'guests']

function getTabFromPath(path: string): TabModule {
  const segment = (path || '').replace(/^\//, '').split('/')[0].toLowerCase()
  if (VALID_TABS.includes(segment as TabModule)) {
    return segment as TabModule
  }
  return 'dashboard'
}

const currentTab = ref<TabModule>(getTabFromPath(route.path))
const profileSwitcherOpen = ref(false)
const drawer = toRef(appStore, 'leftDrawer')

// Maintain back button history for left drawer & profile switcher modals
useModalBack(drawer, 'mainNavDrawer')
useModalBack(profileSwitcherOpen, 'profileSwitcherModal')

// Synchronize currentTab when route URL changes (e.g. phone back/forward button or bookmark)
watch(
  () => route.path,
  (newPath) => {
    const tab = getTabFromPath(newPath)
    if (currentTab.value !== tab) {
      currentTab.value = tab
    }
  },
  { immediate: true }
)

// Synchronize URL route when currentTab changes (e.g. from bottom nav or selectTab)
function selectTab(tab: TabModule) {
  if (currentTab.value !== tab) {
    currentTab.value = tab
  }
  drawer.value = false
  const target = `/${tab}`
  if (route.path !== target) {
    router.push(target)
  }
}

watch(currentTab, (newTab) => {
  const target = `/${newTab}`
  if (route.path !== target) {
    router.push(target)
  }
})

function openProfileSwitcher() {
  profileSwitcherOpen.value = true
  drawer.value = false
}

// Thumb swipe gesture recognition
let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0

function handleTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1) return
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
  touchStartTime = Date.now()
}

function handleTouchEnd(e: TouchEvent) {
  if (e.changedTouches.length !== 1) return
  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  const deltaTime = Date.now() - touchStartTime

  if (deltaTime > 900) return

  // Predominantly horizontal swipe: |deltaX| > |deltaY| * 1.15
  const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.15 && Math.abs(deltaX) > 38
  if (!isHorizontal) return

  if (!drawer.value) {
    // Swipe right from left edge zone (left 38% of screen or 150px)
    const isLeftZone = touchStartX < Math.max(150, window.innerWidth * 0.38)
    if (deltaX > 40 && isLeftZone) {
      drawer.value = true
    }
  } else {
    // Swipe left anywhere when drawer is open
    if (deltaX < -38) {
      drawer.value = false
    }
  }
}

// Mouse / pointer swipe gesture recognition (helpful for desktop mouse drag & subagent)
let pointerStartX = 0
let pointerStartY = 0
let isPointerDragging = false

function handlePointerDown(e: PointerEvent) {
  if (e.button !== 0 && e.pointerType === 'mouse') return
  const target = e.target as HTMLElement | null
  if (target && (target.closest('input') || target.closest('textarea') || target.closest('button') || target.closest('.v-btn'))) {
    return
  }
  pointerStartX = e.clientX
  pointerStartY = e.clientY
  isPointerDragging = true
}

function handlePointerUp(e: PointerEvent) {
  if (!isPointerDragging) return
  isPointerDragging = false
  const deltaX = e.clientX - pointerStartX
  const deltaY = e.clientY - pointerStartY
  const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.15 && Math.abs(deltaX) > 38
  if (!isHorizontal) return

  if (!drawer.value) {
    const isLeftZone = pointerStartX < Math.max(150, window.innerWidth * 0.38)
    if (deltaX > 40 && isLeftZone) {
      drawer.value = true
    }
  } else {
    if (deltaX < -38) {
      drawer.value = false
    }
  }
}

import {
  getTitleForTab,
  getSubtitleForTab,
  toggleAppTheme,
} from '@/services/service.js'

onMounted(() => {
  window.addEventListener('touchstart', handleTouchStart, { passive: true })
  window.addEventListener('touchend', handleTouchEnd, { passive: true })
  window.addEventListener('pointerdown', handlePointerDown)
  window.addEventListener('pointerup', handlePointerUp)
})

onUnmounted(() => {
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
  window.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('pointerup', handlePointerUp)
})

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  toggleAppTheme(theme, isDark.value)
}

const currentTitle = computed(() => getTitleForTab(currentTab.value))

const currentSubtitle = computed(() => getSubtitleForTab(currentTab.value))
</script>

