<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="auth-modal-card rounded-xl pa-0 bg-surface overflow-hidden" elevation="16">
      <!-- Decorative Top Header Banner -->
      <div class="auth-card-header pa-5 bg-primary text-white position-relative">
        <div class="d-flex align-center justify-space-between mb-2">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="flat" size="40" rounded="lg" class="mr-3 text-primary elevation-2">
              <v-icon icon="mdi-home-heart" size="24" color="primary" />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold line-height-1 text-white">Family Life OS</div>
              <div class="text-caption text-white opacity-80" style="font-size: 0.72rem;">Household &amp; Event Organizer</div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            aria-label="Close dialog"
            @click="$emit('update:modelValue', false)"
          />
        </div>

        <div class="mt-2 text-white">
          <div class="text-subtitle-1 font-weight-bold">
            {{ activeTab === 'signin' ? 'Welcome Back!' : 'Create Your Account' }}
          </div>
          <div class="text-caption text-white opacity-80">
            {{ activeTab === 'signin' ? 'Sign in to access shared budgets, tasks & lists' : 'Join and coordinate with your family in real-time' }}
          </div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="px-5 pt-3 pb-0 border-b">
        <v-tabs
          v-model="activeTab"
          color="primary"
          grow
          density="comfortable"
          class="auth-tabs"
        >
          <v-tab value="signin" class="text-capitalize font-weight-bold">
            <v-icon icon="mdi-login-variant" size="18" class="mr-1" />
            Sign In
          </v-tab>
          <v-tab value="signup" class="text-capitalize font-weight-bold">
            <v-icon icon="mdi-account-plus-outline" size="18" class="mr-1" />
            Sign Up
          </v-tab>
        </v-tabs>
      </div>

      <v-card-text class="pa-5">
        <!-- Error Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4 text-caption"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
        </v-slide-y-transition>

        <!-- Success Alert -->
        <v-slide-y-transition>
          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            density="compact"
            rounded="lg"
            class="mb-4 text-caption"
          >
            {{ successMessage }}
          </v-alert>
        </v-slide-y-transition>

        <!-- SIGN IN FORM -->
        <v-form
          v-if="activeTab === 'signin'"
          ref="signInFormRef"
          v-model="isSignInValid"
          @submit.prevent="handleSignIn"
        >
          <!-- Email Address Field with External Label -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center">
              <span>Email Address</span>
              <span class="text-error ml-1">*</span>
            </div>
            <v-text-field
              v-model="signInData.email"
              placeholder="e.g. member@family.com"
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
              <span class="text-caption text-primary cursor-pointer font-weight-medium" @click="fillSampleCredentials">
                Use test email?
              </span>
            </div>
            <v-text-field
              v-model="signInData.password"
              placeholder="Enter your password"
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
              label="Remember me"
              color="primary"
              density="compact"
              hide-details
              class="text-caption"
            />
          </div>

          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            block
            size="large"
            rounded="lg"
            class="font-weight-bold text-capitalize mb-4"
            :loading="authStore.isLoading"
          >
            <v-icon icon="mdi-login" class="mr-1" />
            Sign In
          </v-btn>

          <!-- 1-Click Quick Demo Sign In -->
          <div class="demo-accounts-box pa-3 rounded-lg bg-containerBg mb-3 border">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-bold text-darkText d-flex align-center">
                <v-icon icon="mdi-lightning-bolt" size="14" color="warning" class="mr-1" />
                1-Click Quick Test Accounts
              </span>
              <span class="text-caption text-lightText" style="font-size: 0.68rem;">Instant login</span>
            </div>

            <div class="d-flex flex-wrap gap-2">
              <v-btn
                v-for="demo in demoAccounts"
                :key="demo.email"
                variant="outlined"
                size="small"
                rounded="pill"
                color="primary"
                class="demo-account-btn text-capitalize flex-grow-1"
                :disabled="authStore.isLoading"
                @click="handleDemoLogin(demo)"
              >
                <v-avatar size="18" color="primary" class="mr-1 text-white">
                  <v-icon :icon="demo.icon" size="12" color="white" />
                </v-avatar>
                {{ demo.name.split(' ')[0] }} ({{ demo.role }})
              </v-btn>
            </div>
          </div>

          <div class="text-center text-caption text-lightText">
            Don't have an account yet?
            <span class="text-primary font-weight-bold cursor-pointer ml-1" @click="activeTab = 'signup'">
              Create Account
            </span>
          </div>
        </v-form>

        <!-- SIGN UP FORM -->
        <v-form
          v-else
          ref="signUpFormRef"
          v-model="isSignUpValid"
          @submit.prevent="handleSignUp"
        >
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-darkText mb-1.5 d-flex align-center">
              <span>Full Name</span>
              <span class="text-error ml-1">*</span>
            </div>
            <v-text-field
              v-model="signUpData.name"
              placeholder="e.g. Aarav Sharma"
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
              placeholder="e.g. aarav@familyapp.io"
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
              Choose Avatar Accent Color:
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
            class="font-weight-bold text-capitalize mb-4"
            :loading="authStore.isLoading"
          >
            <v-icon icon="mdi-account-plus" class="mr-1" />
            Create My Account
          </v-btn>

          <div class="text-center text-caption text-lightText">
            Already have an account?
            <span class="text-primary font-weight-bold cursor-pointer ml-1" @click="activeTab = 'signin'">
              Sign In
            </span>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  modelValue: boolean
  defaultTab?: 'signin' | 'signup'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'auth-success'): void
}>()

const authStore = useAuthStore()

const activeTab = ref<'signin' | 'signup'>(props.defaultTab || 'signin')
const showPassword = ref(false)
const rememberMe = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

const isSignInValid = ref(false)
const isSignUpValid = ref(false)
const signInFormRef = ref<any>(null)
const signUpFormRef = ref<any>(null)

watch(
  () => props.defaultTab,
  (tab) => {
    if (tab) activeTab.value = tab
  }
)

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      errorMessage.value = ''
      successMessage.value = ''
    }
  }
)

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

const demoAccounts = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@familyapp.io', role: 'Primary', icon: 'mdi-account' },
  { name: 'Diya Patel', email: 'diya.patel@familyapp.io', role: 'Spouse', icon: 'mdi-face-woman' },
  { name: 'Rohan Mehta', email: 'rohan.mehta@familyapp.io', role: 'Son', icon: 'mdi-emoticon-happy-outline' },
]

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Please enter a valid email address',
  min6: (v: string) => (v && v.length >= 6) || 'Password must be at least 6 characters',
  passwordMatch: (v: string) => v === signUpData.password || 'Passwords do not match',
}

function fillSampleCredentials() {
  signInData.email = 'aarav.sharma@familyapp.io'
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
      emit('auth-success')
      emit('update:modelValue', false)
    }, 600)
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
      emit('auth-success')
      emit('update:modelValue', false)
    }, 600)
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to create account.'
  }
}

async function handleDemoLogin(demo: { name: string; email: string; role: string }) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.demoSignIn({
      name: demo.name,
      email: demo.email,
      role: demo.role,
      mobile: '9876543210',
    })

    successMessage.value = `Logged in as ${demo.name}!`
    setTimeout(() => {
      emit('auth-success')
      emit('update:modelValue', false)
    }, 500)
  } catch (err: any) {
    errorMessage.value = err.message || 'Demo sign in failed.'
  }
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

.demo-account-btn {
  font-size: 0.72rem;
  letter-spacing: 0;
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
