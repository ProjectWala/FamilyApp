<template>
  <div class="login-page-container d-flex align-center justify-center pa-4">
    <v-card class="login-card rounded-xl bg-surface overflow-hidden elevation-12" max-width="520" width="100%">
      <!-- Decorative Brand Banner -->
      <div class="login-header pa-6 bg-primary text-white position-relative text-center">
        <!-- Floating Logo Badge -->
        <div class="d-inline-flex align-center justify-center mb-3">
          <v-avatar color="white" variant="flat" size="52" rounded="xl" class="elevation-4 text-primary">
            <v-icon icon="mdi-home-heart" size="32" color="primary" />
          </v-avatar>
        </div>

        <div class="text-h5 font-weight-bold text-white mb-1 line-height-1">
          Family Life OS
        </div>
        <div class="text-caption text-white opacity-80 font-weight-medium">
          Household &amp; Event Coordination Platform
        </div>

        <!-- Pillar Feature Badges -->
        <div class="d-flex flex-wrap justify-center gap-1 mt-3">
          <v-chip size="x-small" variant="flat" color="white" class="text-primary font-weight-bold">
            <v-icon icon="mdi-cash-multiple" size="12" class="mr-1" />
            Budget &amp; Splits
          </v-chip>
          <v-chip size="x-small" variant="flat" color="white" class="text-primary font-weight-bold">
            <v-icon icon="mdi-checkbox-marked-circle-outline" size="12" class="mr-1" />
            Family Tasks
          </v-chip>
          <v-chip size="x-small" variant="flat" color="white" class="text-primary font-weight-bold">
            <v-icon icon="mdi-account-multiple-check" size="12" class="mr-1" />
            Guest List
          </v-chip>
          <v-chip size="x-small" variant="flat" color="white" class="text-primary font-weight-bold">
            <v-icon icon="mdi-cloud-sync" size="12" class="mr-1" />
            Cloud Sync
          </v-chip>
        </div>
      </div>

      <!-- Tab Navigation (Sign In vs Register) -->
      <div class="px-6 pt-3 pb-0 border-b">
        <v-tabs
          v-model="activeTab"
          color="primary"
          grow
          density="comfortable"
          class="login-tabs"
        >
          <v-tab value="signin" class="text-capitalize font-weight-bold">
            <v-icon icon="mdi-login-variant" size="18" class="mr-1.5" />
            Sign In
          </v-tab>
          <v-tab value="signup" class="text-capitalize font-weight-bold">
            <v-icon icon="mdi-account-plus-outline" size="18" class="mr-1.5" />
            Create Account
          </v-tab>
        </v-tabs>
      </div>

      <v-card-text class="pa-6">
        <!-- Error Notification Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4 text-caption font-weight-medium"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
        </v-slide-y-transition>

        <!-- Success Notification Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4 text-caption font-weight-medium"
          >
            {{ successMessage }}
          </v-alert>
        </v-slide-y-transition>

        <!-- ==================== SIGN IN TAB ==================== -->
        <v-window v-model="activeTab">
          <v-window-item value="signin">
            <v-form ref="signInFormRef" v-model="isSignInValid" @submit.prevent="handleSignIn">
              <!-- Email Address Field with External Label -->
              <div class="mb-3">
                <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center">
                  <span>Email Address</span>
                  <span class="text-error ml-1">*</span>
                </div>
                <v-text-field
                  v-model="signInData.email"
                  placeholder="e.g. admin@gmail.com"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details="auto"
                  autocomplete="email"
                  :rules="[rules.required, rules.email]"
                />
              </div>

              <!-- Password Field with External Label -->
              <div class="mb-3">
                <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <span>Password</span>
                    <span class="text-error ml-1">*</span>
                  </div>
                  <span class="text-caption text-primary cursor-pointer font-weight-bold" @click="fillSampleCredentials">
                    Auto-fill demo?
                  </span>
                </div>
                <v-text-field
                  v-model="signInData.password"
                  placeholder="Enter account password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details="auto"
                  autocomplete="current-password"
                  :rules="[rules.required, rules.min6]"
                  @click:append-inner="showPassword = !showPassword"
                />
              </div>

              <div class="d-flex align-center justify-space-between mb-4">
                <v-checkbox
                  v-model="rememberMe"
                  label="Remember me on this device"
                  color="primary"
                  density="compact"
                  hide-details
                  class="text-caption font-weight-medium"
                />
              </div>

              <v-btn
                type="submit"
                color="primary"
                variant="flat"
                block
                size="large"
                rounded="lg"
                class="font-weight-bold text-capitalize mb-4 elevation-2"
                :loading="authStore.isLoading"
              >
                <v-icon icon="mdi-login" class="mr-2" />
                Sign In to Family Hub
              </v-btn>

              <!-- Quick Multi-User Test Sign-In Profiles -->
              <div class="quick-profiles-box pa-3.5 rounded-xl bg-containerBg mb-3 border">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-caption font-weight-bold text-darkText d-flex align-center">
                    <v-icon icon="mdi-lightning-bolt" size="15" color="warning" class="mr-1" />
                    1-Click Multi-User Test Accounts
                  </span>
                  <span class="text-caption text-lightText" style="font-size: 0.68rem;">Instant switch</span>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <v-btn
                    v-for="profile in multiUserPresets"
                    :key="profile.email"
                    variant="outlined"
                    size="small"
                    rounded="pill"
                    color="primary"
                    class="flex-grow-1 text-capitalize px-3 text-caption font-weight-medium"
                    :disabled="authStore.isLoading"
                    @click="handleQuickLogin(profile)"
                  >
                    <v-avatar size="18" color="primary" class="mr-1.5 text-white">
                      <v-icon :icon="profile.icon" size="12" color="white" />
                    </v-avatar>
                    {{ profile.name.split(' ')[0] }} ({{ profile.role }})
                  </v-btn>
                </div>
              </div>

              <div class="text-center text-caption text-lightText">
                New user?
                <span class="text-primary font-weight-bold cursor-pointer ml-1" @click="activeTab = 'signup'">
                  Create family account
                </span>
              </div>
            </v-form>
          </v-window-item>

          <!-- ==================== SIGN UP TAB ==================== -->
          <v-window-item value="signup">
            <v-form ref="signUpFormRef" v-model="isSignUpValid" @submit.prevent="handleSignUp">
              <div class="mb-3">
                <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center">
                  <span>Full Name</span>
                  <span class="text-error ml-1">*</span>
                </div>
                <v-text-field
                  v-model="signUpData.name"
                  placeholder="e.g. Mohit Sharma"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details="auto"
                  :rules="[rules.required]"
                />
              </div>

              <div class="mb-3">
                <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center">
                  <span>Email Address</span>
                  <span class="text-error ml-1">*</span>
                </div>
                <v-text-field
                  v-model="signUpData.email"
                  placeholder="e.g. mohit@familyapp.io"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details="auto"
                  autocomplete="email"
                  :rules="[rules.required, rules.email]"
                />
              </div>

              <v-row density="compact" class="mb-3">
                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold text-darkText mb-1.5">Mobile Phone</div>
                  <v-text-field
                    v-model="signUpData.mobile"
                    placeholder="e.g. 9876543210"
                    prepend-inner-icon="mdi-phone-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold text-darkText mb-1.5">Family Role</div>
                  <v-select
                    v-model="signUpData.role"
                    :items="familyRoles"
                    prepend-inner-icon="mdi-account-badge-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    hide-details="auto"
                  />
                </v-col>
              </v-row>

              <div class="mb-3">
                <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center">
                  <span>Password</span>
                  <span class="text-error ml-1">*</span>
                </div>
                <v-text-field
                  v-model="signUpData.password"
                  placeholder="At least 6 characters"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details="auto"
                  autocomplete="new-password"
                  :rules="[rules.required, rules.min6]"
                  @click:append-inner="showPassword = !showPassword"
                />
              </div>

              <div class="mb-3">
                <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center">
                  <span>Confirm Password</span>
                  <span class="text-error ml-1">*</span>
                </div>
                <v-text-field
                  v-model="signUpData.confirmPassword"
                  placeholder="Re-enter password"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-check-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details="auto"
                  autocomplete="new-password"
                  :rules="[rules.required, rules.passwordMatch]"
                />
              </div>

              <!-- Avatar Color Choice -->
              <div class="mb-4">
                <div class="text-caption font-weight-medium text-darkText mb-1.5">
                  Pick Persona Accent Color:
                </div>
                <div class="d-flex align-center gap-2">
                  <div
                    v-for="c in colorPalette"
                    :key="c"
                    class="color-picker-dot cursor-pointer"
                    :style="{ backgroundColor: c }"
                    :class="{ 'color-selected': signUpData.avatarColor === c }"
                    @click="signUpData.avatarColor = c"
                  >
                    <v-icon
                      v-if="signUpData.avatarColor === c"
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
                block
                size="large"
                rounded="lg"
                class="font-weight-bold text-capitalize mb-4 elevation-2"
                :loading="authStore.isLoading"
              >
                <v-icon icon="mdi-account-plus" class="mr-2" />
                Register New Account
              </v-btn>

              <div class="text-center text-caption text-lightText">
                Already registered?
                <span class="text-primary font-weight-bold cursor-pointer ml-1" @click="activeTab = 'signin'">
                  Sign In
                </span>
              </div>
            </v-form>
          </v-window-item>
        </v-window>

        <!-- Security & Privacy Footer Note -->
        <div class="mt-4 pt-3 border-t d-flex align-center justify-center text-caption text-lightText" style="font-size: 0.72rem;">
          <v-icon icon="mdi-shield-check-outline" size="14" class="mr-1 text-success" />
          Data segregated and secured per user account via Supabase
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{
  (e: 'login-success'): void
}>()

const authStore = useAuthStore()

const activeTab = ref<'signin' | 'signup'>('signin')
const showPassword = ref(false)
const rememberMe = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

const isSignInValid = ref(false)
const isSignUpValid = ref(false)
const signInFormRef = ref<any>(null)
const signUpFormRef = ref<any>(null)

const signInData = reactive({
  email: '',
  password: '',
})

const signUpData = reactive({
  name: '',
  email: '',
  mobile: '',
  role: 'Primary / Organizer',
  password: '',
  confirmPassword: '',
  avatarColor: '#1677ff',
  avatarIcon: 'mdi-account',
})

const familyRoles = [
  'Primary / Organizer',
  'Spouse / Partner',
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Family Member',
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

const multiUserPresets = [
  { name: 'Mohit Sharma', email: 'admin@gmail.com', role: 'Primary', icon: 'mdi-account-star' },
  { name: 'Aarav Sharma', email: 'aarav.sharma@familyapp.io', role: 'Son', icon: 'mdi-account' },
  { name: 'Diya Patel', email: 'diya.patel@familyapp.io', role: 'Spouse', icon: 'mdi-face-woman' },
]

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Please enter a valid email address',
  min6: (v: string) => (v && v.length >= 6) || 'Password must be at least 6 characters',
  passwordMatch: (v: string) => v === signUpData.password || 'Passwords do not match',
}

function fillSampleCredentials() {
  signInData.email = 'admin@gmail.com'
  signInData.password = 'FamilyPassword2026!'
}

async function handleSignIn() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!signInData.email || !signInData.password) {
    errorMessage.value = 'Please provide both email and password'
    return
  }

  try {
    await authStore.signIn({
      email: signInData.email,
      password: signInData.password,
    })
    successMessage.value = `Welcome back, ${authStore.displayName}!`
    setTimeout(() => {
      emit('login-success')
    }, 400)
  } catch (err: any) {
    errorMessage.value = err.message || 'Login failed. Please verify credentials.'
  }
}

async function handleSignUp() {
  errorMessage.value = ''
  successMessage.value = ''

  if (signUpData.password !== signUpData.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  try {
    await authStore.signUp({
      name: signUpData.name,
      email: signUpData.email,
      password: signUpData.password,
      mobile: signUpData.mobile,
      role: signUpData.role,
      avatarColor: signUpData.avatarColor,
      avatarIcon: signUpData.avatarIcon,
    })

    successMessage.value = `Account created! Welcome, ${signUpData.name}!`
    setTimeout(() => {
      emit('login-success')
    }, 400)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create account.'
  }
}

async function handleQuickLogin(profile: { name: string; email: string; role: string }) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.demoSignIn({
      name: profile.name,
      email: profile.email,
      role: profile.role,
      mobile: '9876543210',
    })

    successMessage.value = `Logged in as ${profile.name}!`
    setTimeout(() => {
      emit('login-success')
    }, 400)
  } catch (err: any) {
    errorMessage.value = err.message || 'Sign in failed.'
  }
}

onMounted(() => {
  // Sync if browser prefilled/autofilled credentials on initial mount
  setTimeout(() => {
    const emailEl = document.querySelector('input[type="email"]') as HTMLInputElement
    const passEl = document.querySelector('input[type="password"]') as HTMLInputElement
    if (emailEl?.value && !signInData.email) {
      signInData.email = emailEl.value
    }
    if (passEl?.value && !signInData.password) {
      signInData.password = passEl.value
    }
  }, 100)
})
</script>

<style scoped>
.login-page-container {
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 10% 20%, rgba(22, 119, 255, 0.08) 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(82, 196, 26, 0.06) 0%, transparent 40%),
              var(--v-theme-background);
}

.login-card {
  border: 1px solid rgba(var(--v-border-color), 0.7);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.12) !important;
}

.color-picker-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.color-picker-dot:hover {
  transform: scale(1.15);
}

.color-selected {
  outline: 2px solid var(--v-theme-primary);
  outline-offset: 2px;
  transform: scale(1.1);
}

/* Ensure browser autofill does not cause awkward background or text contrast */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus),
:deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 1000px #eff6ff inset !important;
  -webkit-text-fill-color: #1e293b !important;
  transition: background-color 5000s ease-in-out 0s;
}

:deep(.v-field__field) {
  align-items: center;
}
</style>
