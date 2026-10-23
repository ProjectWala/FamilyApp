<template>
  <div class="family-component">
    <!-- Header Summary Card with Collective Pie Chart for Family Squad Section -->
    <v-card class="mb-4 rounded-lg elevation-0 overflow-hidden bg-surface card-hover-border border">
      <!-- Gradient Header Bar -->
      <div
        class="pa-4 text-white position-relative"
        style="background: var(--v-gradient, linear-gradient(250.38deg, #1677ff 0%, #0958d9 100%));"
      >
        <div class="d-flex justify-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="38" rounded="lg">
              <v-icon icon="mdi-account-group-outline" size="22" color="white" />
            </v-avatar>
            <div>
              <span class="text-caption text-white-75 text-uppercase font-weight-bold">Family Squad</span>
              <div class="text-h6 font-weight-bold text-white line-height-1">
                {{ familyStore.members.length }} Members
              </div>
            </div>
          </div>

          <!-- View toggle between Budget vs Spent & Member Breakdown -->
          <v-btn-toggle
            v-model="squadChartMode"
            mandatory
            density="compact"
            rounded="lg"
            class="squad-toggle"
          >
            <v-btn value="budget" size="x-small" class="text-capitalize px-3 font-weight-medium">
              Budget vs Spent
            </v-btn>
            <v-btn value="members" size="x-small" class="text-capitalize px-3 font-weight-medium">
              Squad Share
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>

      <!-- Collective Chart & Key Metrics -->
      <div class="pa-4">
        <div class="d-flex flex-column flex-sm-row align-center justify-space-around gap-4">
          <!-- Collective Pie Chart -->
          <div class="d-flex flex-column align-center flex-shrink-0">
            <DonutPieChart
              v-if="squadChartMode === 'budget'"
              :slices="squadBudgetVsSpentSlices"
              :size="175"
              :donut-width="26"
              :center-title="`${squadSpentPercent}%`"
              center-subtitle="Utilized"
              :center-color="squadSpentPercent > 100 ? '#ff4d4f' : squadSpentPercent > 80 ? '#faad14' : '#1677ff'"
              :show-legend="true"
              empty-label="No Squad Budget"
            />
            <DonutPieChart
              v-else
              :slices="squadMemberBreakdownSlices"
              :size="175"
              :donut-width="26"
              :center-title="`₹${Math.round(totalFamilySpent)}`"
              center-subtitle="Squad Spend"
              center-color="#1677ff"
              :show-legend="true"
              empty-label="No Spending Yet"
            />
          </div>

          <!-- Collective Key Stat Cards -->
          <div class="d-flex flex-column gap-2 flex-grow-1 w-100" style="max-width: 340px;">
            <div class="pa-2 px-3 rounded-lg bg-lightprimary d-flex align-center justify-space-between border border-primary-subtle">
              <div class="d-flex align-center">
                <v-icon icon="mdi-cash-lock" size="18" class="mr-2 text-primary" />
                <span class="text-caption font-weight-medium text-darkText">Combined Budget</span>
              </div>
              <strong class="text-subtitle-2 font-weight-bold text-primary">₹{{ totalFamilyBudget.toLocaleString() }}</strong>
            </div>

            <div class="pa-2 px-3 rounded-lg bg-lighterror d-flex align-center justify-space-between border border-error-subtle">
              <div class="d-flex align-center">
                <v-icon icon="mdi-credit-card-minus-outline" size="18" class="mr-2 text-error" />
                <span class="text-caption font-weight-medium text-darkText">Total Spent</span>
              </div>
              <strong class="text-subtitle-2 font-weight-bold text-error">₹{{ totalFamilySpent.toLocaleString() }}</strong>
            </div>

            <div
              class="pa-2 px-3 rounded-lg d-flex align-center justify-space-between border"
              :class="totalFamilyOverspent > 0 ? 'bg-lighterror border-error-subtle' : 'bg-lightsuccess border-success-subtle'"
            >
              <div class="d-flex align-center">
                <v-icon
                  :icon="totalFamilyOverspent > 0 ? 'mdi-alert-circle-outline' : 'mdi-shield-check-outline'"
                  size="18"
                  class="mr-2"
                  :class="totalFamilyOverspent > 0 ? 'text-error' : 'text-success'"
                />
                <span class="text-caption font-weight-medium text-darkText">
                  {{ totalFamilyOverspent > 0 ? 'Over Budget' : 'Remaining Balance' }}
                </span>
              </div>
              <strong
                class="text-subtitle-2 font-weight-bold"
                :class="totalFamilyOverspent > 0 ? 'text-error' : 'text-success'"
              >
                ₹{{ (totalFamilyOverspent > 0 ? totalFamilyOverspent : totalFamilyRemaining).toLocaleString() }}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Add Member CTA Button -->
    <v-btn
      block
      color="primary"
      size="large"
      prepend-icon="mdi-account-plus"
      rounded="lg"
      elevation="0"
      class="mb-4 font-weight-medium text-capitalize text-white"
      @click="openAddDialog"
    >
      Add Family Member
    </v-btn>

    <!-- Member List -->
    <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center text-darkText">
      <v-icon icon="mdi-account-heart-outline" class="mr-2 text-primary" size="20" />
      Members &amp; Roles
    </div>

    <div v-if="familyStore.members.length === 0" class="text-center py-8">
      <v-avatar color="surface-variant" size="56" rounded="lg" class="mb-3">
        <v-icon icon="mdi-account-off-outline" size="32" color="primary" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium text-darkText">No family members yet</div>
      <div class="text-body-2 text-lightText">
        Add yourself and your family to allocate expenses and tasks.
      </div>
    </div>

    <!-- Family Member Cards with Individual Pie Charts -->
    <v-slide-y-transition group>
      <v-card
        v-for="member in familyStore.members"
        :key="member.id"
        variant="outlined"
        elevation="0"
        class="mb-3 pa-3 rounded-lg bg-surface card-hover-border"
      >
        <div>
          <!-- Header Row: Avatar, Name, Role & Actions -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center" style="min-width: 0;">
              <v-avatar
                :color="member.avatarColor || 'primary'"
                variant="flat"
                size="42"
                class="mr-3 text-white font-weight-bold flex-shrink-0"
                :style="{ backgroundColor: member.avatarColor || '#6366F1' }"
              >
                <v-icon :icon="member.avatarIcon || 'mdi-account'" size="24" color="white" />
              </v-avatar>

              <div class="text-truncate">
                <div class="d-flex align-center gap-2">
                  <span class="text-subtitle-1 font-weight-bold text-truncate text-darkText">{{ member.name }}</span>
                  <v-chip size="x-small" color="primary" variant="tonal" label class="font-weight-medium">
                    {{ member.role }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Actions: Edit & Delete -->
            <div class="d-flex align-center flex-shrink-0">
              <v-btn
                icon="mdi-pencil-outline"
                size="small"
                variant="text"
                color="primary"
                @click="openEditDialog(member)"
              />
              <v-btn
                icon="mdi-trash-can-outline"
                size="small"
                variant="text"
                color="error"
                :disabled="familyStore.members.length <= 1"
                @click="confirmDelete(member)"
              />
            </div>
          </div>

          <!-- Middle Row: Individual Member Pie Chart & Budget vs Spent Details -->
          <div class="d-flex align-center justify-space-between py-2 px-1 border-t border-b">
            <!-- Mini Donut Pie Chart for Member -->
            <div class="d-flex align-center justify-center flex-shrink-0 mr-3">
              <DonutPieChart
                :slices="getMemberSlices(member)"
                :size="105"
                :donut-width="16"
                :center-title="`${getMemberSpentPercent(member)}%`"
                center-subtitle="Spent"
                :center-color="getMemberSpentPercent(member) > 100 ? '#ff4d4f' : getMemberSpentPercent(member) >= 85 ? '#faad14' : member.avatarColor || '#1677ff'"
                empty-label="₹0"
              />
            </div>

            <!-- Detailed Budget & Spending Breakdown -->
            <div class="flex-grow-1" style="min-width: 0;">
              <div class="d-flex justify-space-between align-center mb-1 text-caption">
                <span class="text-lightText d-flex align-center">
                  <v-icon icon="mdi-cash" size="14" class="mr-1 text-primary" />
                  Budget:
                </span>
                <strong class="text-darkText font-weight-bold">₹{{ getMemberBudget(member).toLocaleString() }}</strong>
              </div>

              <div class="d-flex justify-space-between align-center mb-1 text-caption">
                <span class="text-lightText d-flex align-center">
                  <v-icon icon="mdi-credit-card-outline" size="14" class="mr-1 text-error" />
                  Spent:
                </span>
                <strong class="text-error font-weight-bold">₹{{ getMemberSpent(member.id).toFixed(2) }}</strong>
              </div>

              <div class="d-flex justify-space-between align-center text-caption">
                <span class="text-lightText d-flex align-center">
                  <v-icon
                    :icon="getMemberOverspent(member) > 0 ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline'"
                    size="14"
                    class="mr-1"
                    :class="getMemberOverspent(member) > 0 ? 'text-error' : 'text-success'"
                  />
                  {{ getMemberOverspent(member) > 0 ? 'Over limit:' : 'Remaining:' }}
                </span>
                <strong
                  :class="getMemberOverspent(member) > 0 ? 'text-error font-weight-bold' : 'text-success font-weight-bold'"
                >
                  ₹{{ (getMemberOverspent(member) > 0 ? getMemberOverspent(member) : getMemberRemaining(member)).toFixed(2) }}
                </strong>
              </div>

              <!-- Linear Progress Visual -->
              <v-progress-linear
                :model-value="Math.min(100, getMemberSpentPercent(member))"
                :color="getMemberStatusColor(member)"
                height="5"
                rounded
                class="mt-2"
              />
            </div>
          </div>

          <!-- Bottom Row: Profile Status & Budget Status Chip -->
          <div class="d-flex align-center justify-space-between mt-2 pt-1">
            <v-chip
              v-if="familyStore.activeMemberId === member.id"
              size="x-small"
              color="success"
              variant="flat"
              class="font-weight-bold"
            >
              <v-icon icon="mdi-check-circle" size="12" class="mr-1" />
              Active Profile
            </v-chip>
            <div v-else />

            <v-chip
              size="x-small"
              :color="getMemberStatusColor(member)"
              variant="tonal"
              label
              class="font-weight-medium text-capitalize"
            >
              {{ getMemberSpentPercent(member) > 100 ? 'Over Budget' : getMemberSpentPercent(member) >= 85 ? 'Near Limit' : 'On Track' }}
            </v-chip>
          </div>
        </div>
      </v-card>
    </v-slide-y-transition>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="480" persistent>
      <v-card class="rounded-xl pa-2">
        <v-card-title class="d-flex align-center justify-space-between pt-4 px-4">
          <span class="font-weight-bold">{{ isEditing ? 'Update Family Member' : 'Add Family Member' }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </v-card-title>

        <v-card-text class="pt-2 px-4">
          <v-form @submit.prevent="saveMember">
            <v-text-field
              v-model="form.name"
              label="Member Name *"
              placeholder="e.g. Rahul, Priya, Dad"
              variant="outlined"
              density="comfortable"
              rounded="md"
              class="mb-3"
              prepend-inner-icon="mdi-account"
              :rules="[(v) => !!v || 'Name is required']"
            />

            <v-select
              v-model="form.role"
              :items="roleOptions"
              label="Relationship / Role *"
              variant="outlined"
              density="comfortable"
              rounded="md"
              class="mb-3"
              prepend-inner-icon="mdi-badge-account-outline"
            />

            <v-text-field
              v-model.number="form.monthlyBudget"
              label="Monthly Budget Allowance (₹)"
              placeholder="1000"
              type="number"
              variant="outlined"
              density="comfortable"
              rounded="md"
              class="mb-3"
              prepend-inner-icon="mdi-currency-inr"
            />

            <!-- Live Avatar Preview -->
            <div class="d-flex flex-column align-center justify-center my-3 pa-3 rounded-lg bg-lightsecondary">
              <v-avatar
                size="56"
                variant="flat"
                :style="{ backgroundColor: form.avatarColor || '#6366F1' }"
                class="elevation-2"
              >
                <v-icon :icon="form.avatarIcon || 'mdi-account'" size="32" color="white" />
              </v-avatar>
              <span class="text-caption text-medium-emphasis mt-2">Avatar Preview</span>
            </div>

            <div class="text-caption font-weight-bold mb-2">Avatar Theme Color</div>
            <div class="d-flex gap-2 mb-3 flex-wrap">
              <v-btn
                v-for="color in colorPalette"
                :key="color"
                size="small"
                icon
                elevation="0"
                variant="flat"
                :style="{ backgroundColor: color, color: '#ffffff', border: form.avatarColor === color ? '2px solid #262626' : 'none' }"
                @click="form.avatarColor = color"
              >
                <v-icon v-if="form.avatarColor === color" icon="mdi-check" size="18" color="white" />
              </v-btn>
            </div>

            <div class="text-caption font-weight-bold mb-2">Icon</div>
            <div class="d-flex gap-2 flex-wrap">
              <v-btn
                v-for="icon in iconOptions"
                :key="icon"
                size="small"
                icon
                :variant="form.avatarIcon === icon ? 'flat' : 'outlined'"
                color="primary"
                @click="form.avatarIcon = icon"
              >
                <v-icon :icon="icon" :color="form.avatarIcon === icon ? 'white' : 'primary'" size="20" />
              </v-btn>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn variant="text" rounded="md" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="md"
            class="px-5 font-weight-medium text-capitalize text-white"
            @click="saveMember"
          >
            {{ isEditing ? 'Save Changes' : 'Add Member' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteConfirmOpen" max-width="400">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="font-weight-bold text-h6">
          Remove Member?
        </v-card-title>
        <v-card-text>
          Are you sure you want to remove <strong>{{ memberToDelete?.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteConfirmOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="executeDelete">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFamilyStore } from '@/stores/family'
import { useExpensesStore } from '@/stores/expenses'
import { useModalBack } from '@/composables/useModalBack'
import type { FamilyMember } from '@/types'
import DonutPieChart, { type PieSlice } from '@/components/shared/DonutPieChart.vue'
import {
  getMemberSpent as serviceGetMemberSpent,
  calculateTotalFamilyBudget,
  calculateTotalFamilySpent,
  calculateTotalFamilyRemaining,
  calculateTotalFamilyOverspent,
  calculateSquadSpentPercent,
  getSquadBudgetVsSpentSlices,
  getSquadMemberBreakdownSlices,
  getMemberBudget as serviceGetMemberBudget,
  getMemberRemaining as serviceGetMemberRemaining,
  getMemberOverspent as serviceGetMemberOverspent,
  getMemberSpentPercent as serviceGetMemberSpentPercent,
  getMemberStatusColor as serviceGetMemberStatusColor,
  getMemberSlices as serviceGetMemberSlices,
  createDefaultFamilyMemberForm,
  createEditFamilyMemberForm,
} from '@/services/service.js'

const familyStore = useFamilyStore()
const expensesStore = useExpensesStore()

const squadChartMode = ref<'budget' | 'members'>('budget')

const dialogOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const deleteConfirmOpen = ref(false)
const memberToDelete = ref<FamilyMember | null>(null)

useModalBack(dialogOpen, 'familyDialog')
useModalBack(deleteConfirmOpen, 'familyDeleteDialog')

const roleOptions = ['Primary', 'Spouse', 'Child', 'Parent', 'Sibling', 'Roommate', 'Other']
const colorPalette = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#14B8A6']
const iconOptions = [
  'mdi-account',
  'mdi-face-woman',
  'mdi-emoticon-happy-outline',
  'mdi-account-tie',
  'mdi-account-star',
  'mdi-account-heart',
  'mdi-human-child',
  'mdi-glasses',
]

const form = ref(createDefaultFamilyMemberForm())

// Collective Family Squad calculations using centralized service
const totalFamilyBudget = computed(() => calculateTotalFamilyBudget(familyStore.members))

function getMemberSpent(memberId: string): number {
  return serviceGetMemberSpent(memberId, expensesStore.expenses)
}

const totalFamilySpent = computed(() =>
  calculateTotalFamilySpent(familyStore.members, expensesStore.expenses)
)

const totalFamilyRemaining = computed(() =>
  calculateTotalFamilyRemaining(totalFamilyBudget.value, totalFamilySpent.value)
)

const totalFamilyOverspent = computed(() =>
  calculateTotalFamilyOverspent(totalFamilyBudget.value, totalFamilySpent.value)
)

const squadSpentPercent = computed(() =>
  calculateSquadSpentPercent(totalFamilyBudget.value, totalFamilySpent.value)
)

// Slices for Collective Budget vs Spent view
const squadBudgetVsSpentSlices = computed<PieSlice[]>(() =>
  getSquadBudgetVsSpentSlices(
    totalFamilyBudget.value,
    totalFamilySpent.value,
    totalFamilyRemaining.value,
    totalFamilyOverspent.value
  )
)

// Slices for Collective Squad Share by Member view
const squadMemberBreakdownSlices = computed<PieSlice[]>(() =>
  getSquadMemberBreakdownSlices(
    familyStore.members,
    expensesStore.expenses,
    totalFamilyRemaining.value
  )
)

// Individual Member Helpers mapped to centralized service
function getMemberBudget(member: FamilyMember): number {
  return serviceGetMemberBudget(member)
}

function getMemberRemaining(member: FamilyMember): number {
  return serviceGetMemberRemaining(member, getMemberSpent(member.id))
}

function getMemberOverspent(member: FamilyMember): number {
  return serviceGetMemberOverspent(member, getMemberSpent(member.id))
}

function getMemberSpentPercent(member: FamilyMember): number {
  return serviceGetMemberSpentPercent(member, getMemberSpent(member.id))
}

function getMemberStatusColor(member: FamilyMember): string {
  return serviceGetMemberStatusColor(member, getMemberSpent(member.id))
}

function getMemberSlices(member: FamilyMember): PieSlice[] {
  return serviceGetMemberSlices(member, getMemberSpent(member.id))
}

function openAddDialog() {
  isEditing.value = false
  editingId.value = null
  form.value = createDefaultFamilyMemberForm()
  dialogOpen.value = true
}

function openEditDialog(member: FamilyMember) {
  isEditing.value = true
  editingId.value = member.id
  form.value = createEditFamilyMemberForm(member)
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  editingId.value = null
}

function saveMember() {
  if (!form.value.name.trim()) return

  if (isEditing.value && editingId.value) {
    familyStore.updateMember(editingId.value, {
      name: form.value.name.trim(),
      role: form.value.role,
      monthlyBudget: Number(form.value.monthlyBudget) || 0,
      avatarColor: form.value.avatarColor,
      avatarIcon: form.value.avatarIcon,
    })
  } else {
    familyStore.addMember({
      name: form.value.name.trim(),
      role: form.value.role,
      monthlyBudget: Number(form.value.monthlyBudget) || 0,
      avatarColor: form.value.avatarColor,
      avatarIcon: form.value.avatarIcon,
    })
  }

  closeDialog()
}

function confirmDelete(member: FamilyMember) {
  memberToDelete.value = member
  deleteConfirmOpen.value = true
}

function executeDelete() {
  if (memberToDelete.value) {
    familyStore.deleteMember(memberToDelete.value.id)
  }
  deleteConfirmOpen.value = false
  memberToDelete.value = null
}
</script>
