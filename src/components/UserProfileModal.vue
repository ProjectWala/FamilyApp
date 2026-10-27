<template>
  <v-dialog
    :model-value="modelValue"
    max-width="500"
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="user-profile-modal rounded-xl pa-0 bg-surface overflow-hidden" elevation="16">
      <!-- Top Profile Banner -->
      <div class="profile-header-banner pa-5 bg-primary text-white position-relative">
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="text-caption text-uppercase tracking-wider font-weight-bold text-white opacity-80" style="font-size: 0.7rem;">
            Account Details
          </span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            aria-label="Close dialog"
            @click="$emit('update:modelValue', false)"
          />
        </div>

        <!-- User Identity Row -->
        <div class="d-flex align-center">
          <div class="position-relative mr-3">
            <v-avatar
              size="56"
              class="elevation-3 text-white font-weight-bold text-h6"
              :style="{ backgroundColor: form.avatarColor || '#1677ff' }"
            >
              <v-icon v-if="!authStore.displayName" icon="mdi-account" size="32" color="white" />
              <span v-else>{{ authStore.userInitials }}</span>
            </v-avatar>
            <v-avatar
              color="success"
              size="16"
              class="active-dot-badge position-absolute"
              style="bottom: 0; right: 0; border: 2px solid white;"
            />
          </div>

          <div style="min-width: 0;">
            <div class="text-h6 font-weight-bold text-white text-truncate line-height-1 mb-1">
              {{ authStore.displayName }}
            </div>
            <div class="text-caption text-white opacity-90 text-truncate d-flex align-center">
              <v-icon icon="mdi-email-check-outline" size="14" class="mr-1" />
              {{ authStore.user?.email || 'Authenticated User' }}
            </div>
            <div class="d-flex align-center gap-1 mt-1">
              <v-chip size="x-small" color="white" variant="flat" class="text-primary font-weight-bold">
                {{ authStore.user?.role || 'Member' }}
              </v-chip>
              <v-chip size="x-small" color="white" variant="outlined" class="text-white opacity-90 font-weight-medium">
                Cloud Synced
              </v-chip>
            </div>
          </div>
        </div>
      </div>

      <v-card-text class="pa-5">
        <!-- Success Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-3 text-caption"
            closable
            @click:close="successMessage = ''"
          >
            {{ successMessage }}
          </v-alert>
        </v-slide-y-transition>

        <!-- Error Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-3 text-caption"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
        </v-slide-y-transition>

        <!-- Edit Profile Form -->
        <div class="text-label-small font-weight-bold text-darkText mb-2 text-uppercase" style="font-size: 0.72rem;">
          Edit Personal Information
        </div>

        <v-form @submit.prevent="handleSaveProfile">
          <v-text-field
            v-model="form.name"
            label="Full Name"
            placeholder="Your name"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            class="mb-3"
          />

          <v-row density="compact" class="mb-1">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.mobile"
                label="Mobile Number"
                placeholder="e.g. 9876543210"
                prepend-inner-icon="mdi-phone-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.role"
                label="Family Role"
                :items="familyRoles"
                prepend-inner-icon="mdi-account-badge-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
              />
            </v-col>
          </v-row>

          <!-- Avatar Color Selection -->
          <div class="mb-4">
            <div class="text-caption font-weight-medium text-darkText mb-1.5">
              Avatar Accent Color:
            </div>
            <div class="d-flex align-center gap-2">
              <div
                v-for="c in colorPalette"
                :key="c"
                class="color-picker-dot cursor-pointer"
                :style="{ backgroundColor: c }"
                :class="{ 'color-selected': form.avatarColor === c }"
                @click="form.avatarColor = c"
              >
                <v-icon
                  v-if="form.avatarColor === c"
                  icon="mdi-check"
                  size="14"
                  color="white"
                />
              </div>
            </div>
          </div>

          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            rounded="lg"
            block
            class="font-weight-bold text-capitalize mb-4"
            :loading="authStore.isLoading"
          >
            <v-icon icon="mdi-content-save-outline" class="mr-1" />
            Save Profile Changes
          </v-btn>
        </v-form>

        <v-divider class="my-4" />

        <!-- Acting Household Profile Sync Info -->
        <div class="pa-3 rounded-lg bg-containerBg mb-4 border">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-caption font-weight-bold text-darkText d-flex align-center">
              <v-icon icon="mdi-account-switch" size="16" class="mr-1 text-primary" />
              Active Acting Member
            </span>
            <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">
              {{ familyStore.activeMember.name }}
            </v-chip>
          </div>
          <div class="text-caption text-lightText" style="font-size: 0.72rem;">
            Tasks, grocery items, and expenses default to this family persona.
          </div>
          <v-btn
            variant="text"
            color="primary"
            size="x-small"
            class="px-0 mt-1 font-weight-bold text-capitalize"
            @click="openFamilySwitcher"
          >
            Change Acting Profile →
          </v-btn>
        </div>

        <!-- Danger Zone / Logout -->
        <div class="logout-section">
          <div v-if="!confirmLogout">
            <v-btn
              color="error"
              variant="tonal"
              block
              size="large"
              rounded="lg"
              class="font-weight-bold text-capitalize"
              @click="confirmLogout = true"
            >
              <v-icon icon="mdi-logout" class="mr-1.5" />
              Log Out of Account
            </v-btn>
          </div>

          <!-- Logout Confirmation Prompt -->
          <div v-else class="pa-3 rounded-lg bg-lighterror border-error text-center">
            <div class="text-caption font-weight-bold text-error mb-1">
              Are you sure you want to log out?
            </div>
            <div class="text-caption text-lightText mb-3" style="font-size: 0.72rem;">
              You will need to sign in again to sync cloud changes.
            </div>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                color="secondary"
                size="small"
                rounded="lg"
                class="flex-grow-1 text-capitalize"
                @click="confirmLogout = false"
              >
                Cancel
              </v-btn>
              <v-btn
                color="error"
                variant="flat"
                size="small"
                rounded="lg"
                class="flex-grow-1 text-capitalize font-weight-bold"
                :loading="authStore.isLoading"
                @click="handleLogout"
              >
                Confirm Log Out
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'open-family-switcher'): void
  (e: 'logged-out'): void
}>()

const authStore = useAuthStore()
const familyStore = useFamilyStore()

const confirmLogout = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const form = reactive({
  name: '',
  mobile: '',
  role: 'Member',
  avatarColor: '#1677ff',
})

const familyRoles = [
  'Primary / Organizer',
  'Spouse / Partner',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Relative',
  'Guest Member',
]

const colorPalette = [
  '#1677ff',
  '#52c41a',
  '#722ed1',
  '#fa8c16',
  '#eb2f96',
  '#13c2c2',
  '#f5222d',
]

// Sync form with auth store on open
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      confirmLogout.value = false
      successMessage.value = ''
      errorMessage.value = ''
      if (authStore.user) {
        form.name = authStore.user.name || ''
        form.mobile = authStore.user.mobile || ''
        form.role = authStore.user.role || 'Member'
        form.avatarColor = authStore.user.avatarColor || '#1677ff'
      }
    }
  },
  { immediate: true }
)

async function handleSaveProfile() {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.updateProfile({
      name: form.name,
      mobile: form.mobile,
      role: form.role,
      avatarColor: form.avatarColor,
    })
    successMessage.value = 'Profile updated successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 2500)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to update profile'
  }
}

function openFamilySwitcher() {
  emit('update:modelValue', false)
  setTimeout(() => {
    emit('open-family-switcher')
  }, 100)
}

async function handleLogout() {
  await authStore.signOut()
  emit('logged-out')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.color-picker-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.color-picker-dot:hover {
  transform: scale(1.15);
}

.color-selected {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
  transform: scale(1.1);
}
</style>
