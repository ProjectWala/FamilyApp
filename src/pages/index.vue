<template>
  <!-- Restrict User Access: Render LoginView component if not logged in -->
  <LoginView
    v-if="!authStore.isAuthenticated"
    @login-success="onLoginSuccess"
  />

  <div v-else class="mobile-viewport">
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
          <v-list-item-subtitle class="text-caption">Addons, tags &amp; RSVPs</v-list-item-subtitle>
          <template #append v-if="guestsStore.totalGuests > 0">
            <v-chip size="x-small" variant="tonal" color="primary">{{ guestsStore.totalGuests }}</v-chip>
          </template>
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
          :active="currentTab === 'shopping'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('shopping')"
        >
          <template #prepend>
            <v-icon icon="mdi-cart-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Shopping List</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Groceries, prices &amp; tags</v-list-item-subtitle>
          <template #append v-if="shoppingStore.pendingCount > 0">
            <v-badge color="error" :content="shoppingStore.pendingCount" inline />
          </template>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-subheader class="text-uppercase text-caption font-weight-bold text-lightText tracking-wider" style="font-size: 0.68rem;">
          Misc
        </v-list-subheader>

        <v-list-item
          :active="currentTab === 'tags'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('tags')"
        >
          <template #prepend>
            <v-icon icon="mdi-tag-multiple-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Tag Manager</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Expenses, guests & shopping</v-list-item-subtitle>
        </v-list-item>

        <v-list-item
          :active="currentTab === 'gifts'"
          rounded="lg"
          class="mb-1"
          color="primary"
          @click="selectTab('gifts')"
        >
          <template #prepend>
            <v-icon icon="mdi-gift-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="font-weight-medium text-body-2">Return Gifts</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Presets & allocations</v-list-item-subtitle>
          <template #append v-if="guestsStore.giftPresets.length > 0">
            <v-chip size="x-small" variant="tonal" color="warning">{{ guestsStore.giftPresets.length }}</v-chip>
          </template>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-subheader class="text-uppercase text-caption font-weight-bold text-lightText tracking-wider" style="font-size: 0.68rem;">
          Account &amp; Settings
        </v-list-subheader>

        <!-- User Profile item if logged in -->
        <v-list-item
          v-if="authStore.isAuthenticated"
          rounded="lg"
          class="mb-1"
          @click="openProfileModal"
        >
          <template #prepend>
            <v-avatar
              size="24"
              class="mr-2 text-white"
              :style="{ backgroundColor: authStore.userAvatarColor || '#1677ff' }"
            >
              <span style="font-size: 0.65rem; font-weight: 700;">{{ authStore.userInitials }}</span>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-bold text-truncate">
            {{ authStore.displayName }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-truncate">
            {{ authStore.user?.email || 'My Profile' }}
          </v-list-item-subtitle>
        </v-list-item>

        <!-- Sign In item if not logged in -->
        <v-list-item
          v-else
          rounded="lg"
          class="mb-1"
          @click="router.push('/login')"
        >
          <template #prepend>
            <v-icon icon="mdi-login" class="mr-2 text-primary" size="20" />
          </template>
          <v-list-item-title class="text-body-2 font-weight-bold text-primary">
            Sign In / Register
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            Sync cloud household data
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item rounded="lg" class="mb-1" @click="openProfileSwitcher">
          <template #prepend>
            <v-icon icon="mdi-account-switch-outline" class="mr-2" size="20" />
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">Switch Acting Persona</v-list-item-title>
          <v-list-item-subtitle class="text-caption">Acting as {{ familyStore.activeMember.name }}</v-list-item-subtitle>
        </v-list-item>

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

        <!-- Logout button in drawer if logged in -->
        <v-list-item
          v-if="authStore.isAuthenticated"
          rounded="lg"
          class="mb-1 text-error"
          @click="handleLogout"
        >
          <template #prepend>
            <v-icon icon="mdi-logout" class="mr-2 text-error" size="20" />
          </template>
          <v-list-item-title class="text-body-2 font-weight-bold text-error">
            Log Out
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-error opacity-80">
            Sign out of account
          </v-list-item-subtitle>
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

        <!-- Right Side: Active Persona & Logged In User Profile Menu -->
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

          <!-- Acting Persona Chip -->
          <v-chip
            size="small"
            variant="tonal"
            color="primary"
            class="mr-1 font-weight-medium cursor-pointer px-2 border-primary-subtle"
            title="Click to switch acting family member persona"
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

          <!-- Profile Button (displays who logged in + dropdown menu with logout option) -->
          <v-menu
            v-if="authStore.isAuthenticated"
            location="bottom end"
            transition="slide-y-transition"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                variant="tonal"
                color="primary"
                size="small"
                class="ml-1 px-2 rounded-lg user-profile-top-btn font-weight-medium"
                title="Account Menu & Profile"
              >
                <v-avatar
                  size="22"
                  class="mr-1 text-white elevation-1 flex-shrink-0"
                  :style="{ backgroundColor: authStore.userAvatarColor || '#1677ff' }"
                >
                  <span style="font-size: 0.65rem; font-weight: 700;">{{ authStore.userInitials }}</span>
                </v-avatar>
                <span class="d-none d-sm-inline-block text-truncate text-darkText font-weight-bold" style="max-width: 90px; font-size: 0.78rem;">
                  {{ authStore.displayName.split(' ')[0] }}
                </span>
                <v-icon icon="mdi-chevron-down" size="14" class="ml-1 text-lightText" />
              </v-btn>
            </template>

            <v-card min-width="260" class="rounded-xl pa-0 bg-surface shadow-md" elevation="10">
              <!-- Menu Header: Displays who is logged in -->
              <div class="pa-3 bg-containerBg border-b">
                <div class="d-flex align-center">
                  <v-avatar
                    size="40"
                    class="mr-2.5 text-white font-weight-bold flex-shrink-0"
                    :style="{ backgroundColor: authStore.userAvatarColor || '#1677ff' }"
                  >
                    <span>{{ authStore.userInitials }}</span>
                  </v-avatar>
                  <div style="min-width: 0;">
                    <div class="text-subtitle-2 font-weight-bold text-darkText text-truncate line-height-1 mb-0.5">
                      {{ authStore.displayName }}
                    </div>
                    <div class="text-caption text-lightText text-truncate" style="font-size: 0.7rem;">
                      {{ authStore.user?.email }}
                    </div>
                    <v-chip size="x-small" color="primary" variant="flat" class="mt-1 font-weight-bold">
                      {{ authStore.user?.role || 'Member' }}
                    </v-chip>
                  </div>
                </div>
              </div>

              <!-- Menu Actions -->
              <v-list density="compact" nav class="pa-2">
                <v-list-item
                  prepend-icon="mdi-account-circle-outline"
                  title="My Profile"
                  subtitle="View & edit account"
                  rounded="lg"
                  class="mb-1"
                  @click="openProfileModal"
                />

                <v-list-item
                  prepend-icon="mdi-account-switch-outline"
                  title="Acting Persona"
                  :subtitle="'Acting as ' + familyStore.activeMember.name"
                  rounded="lg"
                  class="mb-1"
                  @click="profileSwitcherOpen = true"
                />

                <v-divider class="my-1" />

                <v-list-item
                  prepend-icon="mdi-logout"
                  title="Log Out"
                  rounded="lg"
                  color="error"
                  class="text-error font-weight-bold"
                  @click="handleLogout"
                />
              </v-list>
            </v-card>
          </v-menu>

          <!-- If Not Logged In: Sign In Button -->
          <v-btn
            v-else
            color="primary"
            variant="flat"
            size="small"
            rounded="lg"
            class="ml-1 px-2.5 font-weight-bold text-capitalize"
            prepend-icon="mdi-login"
            title="Sign in or register"
            @click="router.push('/login')"
          >
            Log In
          </v-btn>
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
          <Guestlist
            v-else-if="currentTab === 'guests'"
          />
          <FamilyMembers
            v-else-if="currentTab === 'family'"
          />
          <RecurringExpenses
            v-else-if="currentTab === 'recurring'"
          />
          <ShoppingList
            v-else-if="currentTab === 'shopping'"
          />
          <TagsManager
            v-else-if="currentTab === 'tags'"
          />
          <ReturnGiftsManager
            v-else-if="currentTab === 'gifts'"
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

        <!-- Guests Nav Tab (Replaced Family as requested) -->
        <v-btn value="guests" class="nav-tab-btn" :ripple="false">
          <v-badge
            v-if="guestsStore.totalGuests > 0"
            color="primary"
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

        <v-btn value="recurring" class="nav-tab-btn" :ripple="false">
          <v-icon icon="mdi-autorenew" size="20" />
          <span class="nav-btn-label">Recurring</span>
        </v-btn>

        <v-btn value="shopping" class="nav-tab-btn" :ripple="false">
          <v-badge
            v-if="shoppingStore.pendingCount > 0"
            color="error"
            :content="shoppingStore.pendingCount"
            size="x-small"
            offset-x="-2"
            offset-y="-2"
          >
            <v-icon icon="mdi-cart-outline" size="20" />
          </v-badge>
          <v-icon v-else icon="mdi-cart-outline" size="20" />
          <span class="nav-btn-label">Shopping</span>
        </v-btn>

      </v-bottom-navigation>

      <!-- Global Profile Switcher Dialog -->
      <ProfileSwitcher v-model="profileSwitcherOpen" />

      <!-- Global User Profile Modal (Profile details & Logout) -->
      <UserProfileModal
        v-model="profileModalOpen"
        @open-family-switcher="profileSwitcherOpen = true"
        @logged-out="onLoggedOut"
      />
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
import Guestlist from '@/components/Guestlist.vue'
import FamilyMembers from '@/components/FamilyMembers.vue'
import RecurringExpenses from '@/components/RecurringExpenses.vue'
import ShoppingList from '@/components/ShoppingList.vue'
import TagsManager from '@/components/TagsManager.vue'
import ReturnGiftsManager from '@/components/ReturnGiftsManager.vue'
import ProfileSwitcher from '@/components/ProfileSwitcher.vue'
import UserProfileModal from '@/components/UserProfileModal.vue'
import LoginView from '@/components/LoginView.vue'
import { useAppStore } from '@/stores/app'
import { useTodoStore } from '@/stores/todos'
import { useFamilyStore } from '@/stores/family'
import { useExpensesStore } from '@/stores/expenses'
import { useGuestsStore } from '@/stores/guests'
import { useRecurringStore } from '@/stores/recurring'
import { useShoppingStore } from '@/stores/shopping'
import { useAuthStore } from '@/stores/auth'
import { useModalBack } from '@/composables/useModalBack'

const theme = useTheme()
const appStore = useAppStore()
const todoStore = useTodoStore()
const familyStore = useFamilyStore()
const expensesStore = useExpensesStore()
const guestsStore = useGuestsStore()
const recurringStore = useRecurringStore()
const shoppingStore = useShoppingStore()
const authStore = useAuthStore()

const route = useRoute()
const router = useRouter()

type TabModule = 'dashboard' | 'todos' | 'expenses' | 'guests' | 'family' | 'recurring' | 'shopping' | 'tags' | 'gifts'
const VALID_TABS: TabModule[] = ['dashboard', 'todos', 'expenses', 'guests', 'family', 'recurring', 'shopping', 'tags', 'gifts']

function getTabFromPath(path: string): TabModule {
  const segment = (path || '').replace(/^\//, '').split('/')[0].toLowerCase()
  if (VALID_TABS.includes(segment as TabModule)) {
    return segment as TabModule
  }
  return 'dashboard'
}

const currentTab = ref<TabModule>(getTabFromPath(route.path))
const profileSwitcherOpen = ref(false)
const profileModalOpen = ref(false)

const drawer = toRef(appStore, 'leftDrawer')

// Maintain back button history for left drawer & dialogs
useModalBack(drawer, 'mainNavDrawer')
useModalBack(profileSwitcherOpen, 'profileSwitcherModal')
useModalBack(profileModalOpen, 'userProfileModal')

function openProfileModal() {
  profileModalOpen.value = true
  drawer.value = false
}

async function handleLogout() {
  await authStore.signOut()
  profileModalOpen.value = false
  drawer.value = false
  router.push('/login')
}

function onLoginSuccess() {
  router.push('/dashboard')
}

function onLoggedOut() {
  profileModalOpen.value = false
  router.push('/login')
}

// Watch routes for dedicated /profile URL
watch(
  () => route.path,
  (path) => {
    if (path === '/profile') {
      if (authStore.isAuthenticated) {
        openProfileModal()
      } else {
        router.push('/login')
      }
    }
  },
  { immediate: true }
)

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
  authStore.init()
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

