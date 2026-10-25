<template>
  <div class="main-dashboard">
    <!-- User Greeting Card (Mantis Gradient Style) -->
    <v-card class="mb-4 pa-4 rounded-lg elevation-0 greeting-card text-white overflow-hidden position-relative">
      <div class="position-relative" style="z-index: 2;">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-avatar
              :color="familyStore.activeMember.avatarColor || 'primary'"
              variant="flat"
              size="40"
              rounded="lg"
              class="mr-3 border-avatar-white"
              :style="{ backgroundColor: familyStore.activeMember.avatarColor || '#6366F1' }"
            >
              <v-icon :icon="familyStore.activeMember.avatarIcon || 'mdi-account'" size="22" color="white" />
            </v-avatar>
            <div>
              <div class="text-caption text-white-50 d-flex align-center">
                <span class="app-date-text text-white-75">{{ currentDateString }}</span>
                <span class="mx-1">•</span>
                <span class="text-white font-weight-bold">{{ familyStore.activeMember.role }}</span>
              </div>
              <div class="text-headline-large font-weight-bold">
                Hi, {{ familyStore.activeMember.name }} 👋
              </div>
            </div>
          </div>

          <!-- Switch Profile CTA Button -->
          <v-btn
            size="small"
            color="white"
            variant="flat"
            class="text-primary font-weight-medium text-capitalize"
            prepend-icon="mdi-account-switch"
            rounded="lg"
            @click="profileModalOpen = true"
          >
            Switch
          </v-btn>
        </div>
      </div>
      <div class="bg-decoration" />
    </v-card>

    <!-- HIGHLIGHTED EVENT GROUP: Brother Marriage Expenses Spotlight (Mantis Card) -->
    <v-card
      v-if="brotherMarriageTotal > 0"
      variant="outlined"
      elevation="0"
      class="mb-4 pa-3 rounded-lg card-hover-border bg-surface cursor-pointer"
      @click="emit('select-module', 'expenses')"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="38" rounded="lg" class="mr-3">
            <v-icon icon="mdi-ring" size="20" />
          </v-avatar>
          <div>
            <div class="text-label-small text-lightText text-uppercase font-weight-medium">
              Featured Event Group
            </div>
            <div class="text-subtitle-2 font-weight-bold text-darkText">
              Brother Marriage Expenses
            </div>
          </div>
        </div>

        <div class="text-right">
          <div class="text-h6 font-weight-bold text-primary">
            ₹{{ brotherMarriageTotal.toFixed(0) }}
          </div>
          <div class="text-caption text-lightText d-flex align-center justify-end">
            <span>View Group</span>
            <v-icon icon="mdi-chevron-right" size="14" />
          </div>
        </div>
      </div>
    </v-card>

    <!-- SECTION TITLE: 6 Main Action CTAs -->
    <div class="d-flex align-center justify-space-between mb-3 px-1">
      <div class="text-headline-medium text-darkText font-weight-bold">
        Quick Action Hub
      </div>
      <span class="text-caption text-lightText">6 modules</span>
    </div>

    <!-- 6 CTA Buttons / Cards Grid (Mantis Outlined Card Hover Style) -->
    <v-row density="compact" class="mb-4">
      <!-- 1. To Do List CTA -->
      <v-col cols="6">
        <v-card
          variant="outlined"
          elevation="0"
          class="card-hover-border pa-3 rounded-lg bg-surface h-100 d-flex flex-column justify-space-between cursor-pointer"
          @click="emit('select-module', 'todos')"
        >
          <div>
            <div class="d-flex justify-space-between align-center mb-2">
              <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-checkbox-marked-circle-outline" size="20" />
              </v-avatar>
              <v-chip size="small" color="primary" variant="tonal" label rounded="md" class="font-weight-medium border-primary-subtle">
                {{ todoStore.activeCount }} Left
              </v-chip>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
              1. To Do List
            </div>
            <div class="text-caption text-lightText line-clamp-2">
              Add tasks &amp; mark as done with 1 tap
            </div>
          </div>

          <div class="d-flex align-center text-primary text-caption font-weight-medium mt-3">
            <span>Open Tasks</span>
            <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
          </div>
        </v-card>
      </v-col>

      <!-- 2. Update Expenses CTA (Red Accent) -->
      <v-col cols="6">
        <v-card
          variant="outlined"
          elevation="0"
          class="card-hover-border pa-3 rounded-lg bg-surface h-100 d-flex flex-column justify-space-between cursor-pointer"
          @click="emit('select-module', 'expenses')"
        >
          <div>
            <div class="d-flex justify-space-between align-center mb-2">
              <v-avatar color="error" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-cash-plus" size="20" />
              </v-avatar>
              <v-chip size="small" color="error" variant="tonal" label rounded="md" class="font-weight-medium border-error-subtle">
                ₹{{ Math.round(expensesStore.thisMonthAmount) }}
              </v-chip>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
              2. Update Expenses
            </div>
            <div class="text-caption text-lightText line-clamp-2">
              Log spending, tags &amp; event groups
            </div>
          </div>

          <div class="d-flex align-center text-error text-caption font-weight-medium mt-3">
            <span>Log Spend</span>
            <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
          </div>
        </v-card>
      </v-col>

      <!-- 3. Family Members CTA -->
      <v-col cols="6">
        <v-card
          variant="outlined"
          elevation="0"
          class="card-hover-border pa-3 rounded-lg bg-surface h-100 d-flex flex-column justify-space-between cursor-pointer mt-1"
          @click="emit('select-module', 'family')"
        >
          <div>
            <div class="d-flex justify-space-between align-center mb-2">
              <v-avatar color="info" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-account-group-outline" size="20" />
              </v-avatar>
              <v-chip size="small" color="info" variant="tonal" label rounded="md" class="font-weight-medium border-info-subtle">
                {{ familyStore.members.length }}
              </v-chip>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
              3. Family Members
            </div>
            <div class="text-caption text-lightText line-clamp-2">
              Add, update &amp; switch impersonation
            </div>
          </div>

          <div class="d-flex align-center text-info text-caption font-weight-medium mt-3">
            <span>Manage Squad</span>
            <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
          </div>
        </v-card>
      </v-col>

      <!-- 4. Recurring Expenses CTA -->
      <v-col cols="6">
        <v-card
          variant="outlined"
          elevation="0"
          class="card-hover-border pa-3 rounded-lg bg-surface h-100 d-flex flex-column justify-space-between cursor-pointer mt-1"
          @click="emit('select-module', 'recurring')"
        >
          <div>
            <div class="d-flex justify-space-between align-center mb-2">
              <v-avatar color="success" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-repeat" size="20" />
              </v-avatar>
              <v-chip size="small" color="success" variant="tonal" label rounded="md" class="font-weight-medium border-success-subtle">
                ₹{{ Math.round(recurringStore.activeMonthlyEstimate) }}/mo
              </v-chip>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
              4. Recurring Expenses
            </div>
            <div class="text-caption text-lightText line-clamp-2">
              Repeating bills &amp; subscriptions
            </div>
          </div>

          <div class="d-flex align-center text-success text-caption font-weight-medium mt-3">
            <span>View Subscriptions</span>
            <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
          </div>
        </v-card>
      </v-col>

      <!-- 5. Shopping List CTA -->
      <v-col cols="6">
        <v-card
          variant="outlined"
          elevation="0"
          class="card-hover-border pa-3 rounded-lg bg-surface h-100 d-flex flex-column justify-space-between cursor-pointer mt-1"
          style="border-left: 4px solid #1677ff !important;"
          @click="emit('select-module', 'shopping')"
        >
          <div>
            <div class="d-flex justify-space-between align-center mb-2">
              <v-avatar color="primary" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-cart-outline" size="20" />
              </v-avatar>
              <v-chip size="small" color="primary" variant="tonal" label rounded="md" class="font-weight-medium border-primary-subtle">
                {{ shoppingStore.pendingCount }} to buy
              </v-chip>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
              5. Shopping List
            </div>
            <div class="text-caption text-lightText line-clamp-2">
              Products, quantities, prices &amp; group tags
            </div>
          </div>

          <div class="d-flex align-center justify-space-between text-caption font-weight-medium mt-3">
            <span class="text-primary font-weight-bold">
              Est: ₹{{ shoppingStore.totalEstimatedCost.toFixed(0) }}
            </span>
            <div class="d-flex align-center text-primary">
              <span>Open List</span>
              <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- 6. Guest List CTA -->
      <v-col cols="6">
        <v-card
          variant="outlined"
          elevation="0"
          class="card-hover-border pa-3 rounded-lg bg-surface h-100 d-flex flex-column justify-space-between cursor-pointer mt-1"
          style="border-left: 4px solid #722ed1 !important;"
          @click="emit('select-module', 'guests')"
        >
          <div>
            <div class="d-flex justify-space-between align-center mb-2">
              <v-avatar color="secondary" variant="tonal" size="36" rounded="lg">
                <v-icon icon="mdi-account-multiple-check-outline" size="20" color="#722ed1" />
              </v-avatar>
              <v-chip size="small" color="secondary" variant="tonal" label rounded="md" class="font-weight-medium border-secondary-subtle">
                {{ guestsStore.totalGuests }} Guests
              </v-chip>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
              6. Guest List
            </div>
            <div class="text-caption text-lightText line-clamp-2">
              Addons, RSVPs, group tags &amp; return gifts
            </div>
          </div>

          <div class="d-flex align-center justify-space-between text-caption font-weight-medium mt-3">
            <span class="font-weight-bold" style="color: #722ed1;">
              {{ guestsStore.totalPartyCount }} Heads
            </span>
            <div class="d-flex align-center" style="color: #722ed1;">
              <span>Open Guests</span>
              <v-icon icon="mdi-arrow-right" size="14" class="ml-1" />
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Mini-Previews Section (UiParentCard Pattern) -->
    <v-card variant="outlined" elevation="0" class="mb-4 rounded-lg bg-surface">
      <v-card-item class="py-3 px-4">
        <div class="d-flex align-center justify-space-between">
          <v-card-title class="text-body-large font-weight-bold text-darkText d-flex align-center">
            <v-icon icon="mdi-clipboard-list-outline" class="mr-2 text-primary" size="18" />
            Quick Tasks to Finish
          </v-card-title>
          <v-btn
            variant="text"
            size="small"
            color="primary"
            class="text-capitalize font-weight-medium"
            @click="emit('select-module', 'todos')"
          >
            View All
          </v-btn>
        </div>
      </v-card-item>
      <v-divider />
      <v-card-text class="pa-4">
        <div v-if="pendingTodosPreview.length === 0" class="text-caption text-lightText py-2 text-center">
          🎉 All tasks completed! Great job.
        </div>

        <div
          v-for="(todo, index) in pendingTodosPreview"
          :key="todo.id"
          class="d-flex align-center py-2"
          :class="{ 'border-b': index < pendingTodosPreview.length - 1 }"
        >
          <v-checkbox-btn
            :model-value="todo.completed"
            color="primary"
            density="compact"
            class="mr-2"
            @update:model-value="todoStore.toggleDone(todo.id)"
          />
          <span class="text-body-2 flex-grow-1 text-truncate text-darkText">{{ todo.title }}</span>
          <v-chip size="x-small" variant="tonal" color="primary" class="ml-2 font-weight-medium">
            {{ todo.category }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- Profile Switcher Dialog -->
    <ProfileSwitcher v-model="profileModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodoStore } from '@/stores/todos'
import { useExpensesStore } from '@/stores/expenses'
import { useFamilyStore } from '@/stores/family'
import { useRecurringStore } from '@/stores/recurring'
import { useShoppingStore } from '@/stores/shopping'
import { useGuestsStore } from '@/stores/guests'
import ProfileSwitcher from '@/components/ProfileSwitcher.vue'
import {
  getCurrentDateString,
  getPendingTodosPreview,
  getBrotherMarriageTotal,
} from '@/services/service.js'

const emit = defineEmits<{
  (e: 'select-module', moduleName: 'todos' | 'expenses' | 'family' | 'recurring' | 'shopping' | 'guests'): void
}>()

const profileModalOpen = ref(false)

const todoStore = useTodoStore()
const expensesStore = useExpensesStore()
const familyStore = useFamilyStore()
const recurringStore = useRecurringStore()
const shoppingStore = useShoppingStore()
const guestsStore = useGuestsStore()

const brotherMarriageTotal = computed(() => getBrotherMarriageTotal(expensesStore))

const currentDateString = computed(() => getCurrentDateString())

const pendingTodosPreview = computed(() => getPendingTodosPreview(todoStore.todos, 3))
</script>
