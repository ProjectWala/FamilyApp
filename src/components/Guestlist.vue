<template>
  <div class="guestlist-container">
    <!-- Top-Level Tab Switcher: Guests, Events, Invites -->
    <v-card class="mb-4 rounded-lg elevation-0 bg-surface border overflow-hidden">
      <v-tabs
        v-model="guestSectionTab"
        color="primary"
        grow
        height="44"
        class="guestlist-nav-tabs"
      >
        <v-tab value="guests" class="font-weight-bold text-capitalize">
          <span class="tab-head-content">
            <v-icon icon="mdi-account-multiple-check-outline" size="18" />
            <span class="tab-head-label">Guests</span>
            <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold tab-head-chip">
              {{ guestsStore.totalGuests }}
            </v-chip>
          </span>
        </v-tab>
        <v-tab value="events" class="font-weight-bold text-capitalize">
          <span class="tab-head-content">
            <v-icon icon="mdi-calendar-star-outline" size="18" />
            <span class="tab-head-label">Events</span>
            <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-bold tab-head-chip">
              {{ eventsStore.totalEvents }}
            </v-chip>
          </span>
        </v-tab>
        <v-tab value="invites" class="font-weight-bold text-capitalize">
          <span class="tab-head-content">
            <v-icon icon="mdi-email-outline" size="18" />
            <span class="tab-head-label">Invites</span>
            <v-chip size="x-small" variant="tonal" color="success" class="font-weight-bold tab-head-chip">
              {{ totalInvitesAcrossEvents }}
            </v-chip>
          </span>
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- TAB 1: GUESTS (Only Name of Guests) -->
    <div v-show="guestSectionTab === 'guests'">
      <Guests @add-guest="openAddGuestDialog" />
    </div>

    <!-- TAB 2: EVENTS (Name of Events with Type, Date, Venue, Time) -->
    <div v-show="guestSectionTab === 'events'">
      <Events mode="events" @switch-to-invites="handleSwitchToInvites" />
    </div>

    <!-- TAB 3: INVITES (Delegated to Invites component) -->
    <div v-show="guestSectionTab === 'invites'">
      <Invites
        ref="invitesRef"
        v-model:selected-event-id="selectedEventForInvites"
        @go-to-events="guestSectionTab = 'events'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Guests from '@/components/Guests.vue'
import Events from '@/components/Events.vue'
import Invites from '@/components/Invites.vue'
import { useGuestsStore } from '@/stores/guests'
import { useEventsStore } from '@/stores/events'

const guestsStore = useGuestsStore()
const eventsStore = useEventsStore()

const guestSectionTab = ref<'guests' | 'events' | 'invites'>('guests')
const selectedEventForInvites = ref<string | null>(eventsStore.events[0]?.id || null)
const invitesRef = ref<InstanceType<typeof Invites> | null>(null)

const totalInvitesAcrossEvents = computed(() => {
  return eventsStore.events.reduce((sum, e) => sum + (e.invitedGuests?.length || 0), 0)
})

function handleSwitchToInvites(eventId: string) {
  selectedEventForInvites.value = eventId
  guestSectionTab.value = 'invites'
  invitesRef.value?.selectEvent(eventId)
}

function openAddGuestDialog() {
  invitesRef.value?.openAddGuestDialog()
}
</script>

<style scoped>
.guestlist-nav-tabs {
  height: 44px !important;
  min-height: 44px !important;
}

.guestlist-nav-tabs :deep(.v-slide-group__container),
.guestlist-nav-tabs :deep(.v-slide-group__content) {
  height: 44px !important;
  align-items: center !important;
}

.guestlist-nav-tabs :deep(.v-tab) {
  height: 44px !important;
  min-height: 44px !important;
  padding: 0 8px !important;
}

.guestlist-nav-tabs :deep(.v-tab .v-btn__content) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
  line-height: 1 !important;
}

.tab-head-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  line-height: 1;
  vertical-align: middle;
}

.tab-head-label {
  line-height: 1;
  display: inline-flex;
  align-items: center;
}

.tab-head-chip {
  height: 18px !important;
  min-height: 18px !important;
  padding: 0 6px !important;
  display: inline-flex !important;
  align-items: center !important;
  line-height: 1 !important;
}
</style>
