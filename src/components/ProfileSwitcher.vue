<template>
  <v-dialog :model-value="modelValue" max-width="480" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="rounded-lg pa-4 profile-switcher-card bg-surface" elevation="0" variant="flat">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="36" rounded="lg" class="mr-2">
            <v-icon icon="mdi-account-switch-outline" size="22" color="primary" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold text-darkText">Switch Active Profile</div>
          </div>
        </div>

        <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('update:modelValue', false)" />
      </div>

      <v-divider class="mb-4" />

      <!-- Profile Cards Grid -->
      <div class="text-label-small font-weight-medium mb-2 text-lightText text-uppercase">
        Select Profile to Impersonate
      </div>

      <v-row density="compact" class="mb-3">
        <v-col
          v-for="member in familyStore.members"
          :key="member.id"
          cols="6"
        >
          <v-card
            variant="outlined"
            elevation="0"
            class="pa-3 rounded-lg profile-card text-center transition-all cursor-pointer bg-surface"
            :class="{
              'active-profile-card': familyStore.activeMemberId === member.id,
              'card-hover-border': familyStore.activeMemberId !== member.id,
            }"
            @click="selectProfile(member.id)"
          >
            <!-- Avatar with Active Badge -->
            <div class="position-relative d-inline-block mb-2">
              <v-avatar
                :color="member.avatarColor || 'primary'"
                variant="flat"
                size="50"
                rounded="lg"
                class="text-white"
                :style="{ backgroundColor: member.avatarColor || '#6366F1' }"
              >
                <v-icon :icon="member.avatarIcon || 'mdi-account'" size="28" color="white" />
              </v-avatar>

              <v-avatar
                v-if="familyStore.activeMemberId === member.id"
                color="success"
                size="18"
                class="active-badge"
              >
                <v-icon icon="mdi-check" size="12" color="white" />
              </v-avatar>
            </div>

            <!-- Member Name & Role -->
            <div class="text-subtitle-2 font-weight-bold text-truncate text-darkText">
              {{ member.name }}
            </div>
            <v-chip size="x-small" color="primary" variant="tonal" label class="mt-1 font-weight-medium">
              {{ member.role }}
            </v-chip>

            <!-- Active Status / Personal Spend -->
            <div class="mt-2 pt-2 border-t text-caption">
              <span v-if="familyStore.activeMemberId === member.id" class="text-success font-weight-medium">
                ✓ Active Now
              </span>
              <span v-else class="text-lightText">
                Tap to switch
              </span>
            </div>
          </v-card>
        </v-col>
      </v-row>


      <v-card-actions class="px-0 pt-3">
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          rounded="lg"
          block
          class="text-capitalize font-weight-medium"
          @click="$emit('update:modelValue', false)"
        >
          Done
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useFamilyStore } from '@/stores/family'
import { switchProfile } from '@/services/service.js'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'profile-changed', memberId: string): void
}>()

const familyStore = useFamilyStore()

function selectProfile(memberId: string) {
  emit('profile-changed', memberId)
  switchProfile(familyStore, memberId)
}
</script>
