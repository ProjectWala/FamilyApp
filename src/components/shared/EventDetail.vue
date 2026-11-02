<template>
  <v-card
    :elevation="elevation"
    :variant="Number(elevation) > 0 ? undefined : 'outlined'"
    class="event-detail-card mb-4 rounded-lg bg-surface card-hover-border overflow-hidden border"
    :style="{ borderLeft: `5px solid ${event.color || '#1890ff'}` }"
  >
    <!-- Event Header Banner: Clickable to toggle details with smooth transition & no ripple -->
    <div
      class="pa-3 bg-containerBg position-relative event-header-clickable cursor-pointer"
      :ripple="false"
      @click="toggleDetails"
    >
      <!-- Top Row: Category Chip on Left & Dotted Dropdown Menu on Right Top Corner -->
      <div class="d-flex align-center justify-space-between gap-2 mb-1.5">
        <div class="d-flex align-center flex-wrap gap-1.5">
          <!-- Category Chip (Type) -->
          <v-chip
            size="x-small"
            variant="flat"
            :style="{ backgroundColor: event.color || '#1890ff', color: '#fff' }"
            class="font-weight-bold text-uppercase"
          >
            <v-icon :icon="getCategoryIcon(event.category)" size="11" class="mr-1" />
            {{ event.category || 'Celebration' }}
          </v-chip>
        </div>

        <!-- Right Top Corner: Dotted Dropdown Button -->
        <div v-if="showActions" class="d-flex align-center gap-1 flex-shrink-0" @click.stop>
          <v-btn
            v-if="showQuickInvite"
            size="x-small"
            variant="outlined"
            color="primary"
            rounded="lg"
            class="font-weight-medium text-capitalize text-caption px-2"
            prepend-icon="mdi-account-plus"
            @click.stop="onQuickInvite"
          >
            + Quick Invite
          </v-btn>

          <v-menu location="bottom end">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                color="lightText"
                class="top-right-dots-btn"
                title="Event options"
                @click.stop
              />
            </template>
            <v-list density="compact" rounded="lg" elevation="4">
              <v-list-item
                prepend-icon="mdi-email-arrow-right"
                title="Manage Invites & RSVPs"
                @click="onManageInvites"
              />
              <v-list-item
                prepend-icon="mdi-account-multiple-plus"
                title="Invite DB Guests"
                @click="onQuickInvite"
              />
              <v-list-item
                prepend-icon="mdi-share-variant"
                title="Share WhatsApp Invite"
                @click="onShareWhatsApp"
              />
              <v-list-item
                prepend-icon="mdi-pencil-outline"
                title="Edit Event Details"
                @click="onEdit"
              />
              <v-divider class="my-1" />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                title="Delete Event"
                color="error"
                class="text-error"
                @click="onDelete"
              />
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Event Title & Expand Toggle Indicator -->
      <div class="d-flex align-center justify-space-between gap-2 mb-2">
        <div class="text-subtitle-1 font-weight-bold text-darkText line-height-1">
          {{ event.title }}
        </div>
        <v-icon
          :icon="isDetailsVisible ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          size="18"
          color="lightText"
          class="transition-transform"
        />
      </div>

      <!-- EVENT PARAMETERS: Icon + Value only (No "Date & Time" or "Venue" labels) -->
      <div class="d-flex align-center gap-x-4 gap-y-2 flex-wrap text-caption mb-1">
        <!-- Date & Time Icon + Value with "In X days" badge next to it -->
        <div class="d-flex align-center gap-1.5 flex-wrap">
          <div class="d-flex align-center gap-1 font-weight-bold text-darkText">
            <v-icon icon="mdi-calendar-text" size="14" class="text-primary flex-shrink-0" />
            <span>{{ formatEventDate(event.date) }} {{ event.time || '' }}</span>
          </div>

          <!-- "In X days" countdown badge placed right next to Date & Time -->
          <v-chip
            size="x-small"
            variant="tonal"
            :color="getDateBadgeColor(event.date)"
            class="font-weight-medium"
          >
            <v-icon icon="mdi-calendar" size="11" class="mr-1" />
            {{ getRelativeDateLabel(event.date) }}
          </v-chip>
        </div>

        <!-- Venue: Icon + Value only -->
        <div
          class="d-flex align-center gap-1 font-weight-medium text-darkText"
          style="min-width: 0; max-width: 280px;"
        >
          <v-icon icon="mdi-map-marker" size="14" class="text-error flex-shrink-0" />
          <span class="text-truncate">{{ event.location || 'Venue TBA' }}</span>
        </div>
      </div>

      <!-- Event Description if any -->
      <div v-if="event.description" class="text-caption text-lightText mt-1 line-clamp-2">
        {{ event.description }}
      </div>
    </div>

    <!-- Smooth Transition for Tags & Invite Status on Click -->
    <v-expand-transition>
      <div v-show="isDetailsVisible" class="event-details-collapsible border-t" @click.stop>
        <!-- Event Metrics Strip & Quick RSVP Progress -->
        <div v-if="showMetrics" class="pa-3 bg-surface">
          <!-- Tags if present on event -->
          <div v-if="event.tags && event.tags.length > 0" class="d-flex align-center flex-wrap gap-1 mb-2">
            <span class="text-caption text-lightText font-weight-medium mr-1">Tags:</span>
            <v-chip
              v-for="tag in event.tags"
              :key="tag"
              size="x-small"
              variant="tonal"
              color="primary"
              class="font-weight-medium"
            >
              {{ tag }}
            </v-chip>
          </div>

          <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-2">
            <div class="d-flex align-center gap-2 flex-wrap">
              <!-- Total Invited Pill -->
              <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
                <v-icon icon="mdi-account-group" size="12" class="mr-1" />
                {{ event.invitedGuests?.length || 0 }} Invited
              </v-chip>

              <!-- Confirmed Heads -->
              <v-chip size="x-small" variant="flat" color="success" class="font-weight-bold">
                <v-icon icon="mdi-check-circle" size="12" class="mr-1" />
                {{ stats.confirmedCount }} Confirmed ({{ stats.totalHeadcount }} Heads)
              </v-chip>

              <!-- Pending -->
              <v-chip
                v-if="stats.pendingCount > 0"
                size="x-small"
                variant="tonal"
                color="warning"
                class="font-weight-medium"
              >
                <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                {{ stats.pendingCount }} Pending
              </v-chip>

              <!-- Declined -->
              <v-chip
                v-if="stats.declinedCount > 0"
                size="x-small"
                variant="tonal"
                color="error"
                class="font-weight-medium"
              >
                <v-icon icon="mdi-close-circle-outline" size="12" class="mr-1" />
                {{ stats.declinedCount }} Declined
              </v-chip>

              <!-- Invites Sent -->
              <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
                <v-icon icon="mdi-send-check" size="12" class="mr-1" />
                {{ stats.sentCount }}/{{ event.invitedGuests?.length || 0 }} Invites Sent
              </v-chip>
            </div>

            <!-- If in all mode, keep expand option for full guest table -->
            <v-btn
              v-if="mode === 'all' && showGuestsList"
              size="x-small"
              variant="tonal"
              :color="isExpanded ? 'primary' : 'secondary'"
              rounded="lg"
              class="text-capitalize font-weight-bold"
              @click.stop="toggleExpand"
            >
              <v-icon
                :icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                size="16"
                class="mr-1"
              />
              {{ isExpanded ? 'Hide Guest List' : `View Guests (${event.invitedGuests?.length || 0})` }}
            </v-btn>
          </div>

          <!-- RSVP Progress Mini Bar -->
          <div
            v-if="event.invitedGuests && event.invitedGuests.length > 0"
            class="d-flex rounded-pill overflow-hidden mt-1"
            style="height: 6px; background: rgba(0, 0, 0, 0.06);"
          >
            <div
              :style="{
                width: `${(stats.confirmedCount / event.invitedGuests.length) * 100}%`,
                backgroundColor: '#52c41a',
              }"
              title="Confirmed"
            />
            <div
              :style="{
                width: `${(stats.pendingCount / event.invitedGuests.length) * 100}%`,
                backgroundColor: '#faad14',
              }"
              title="Pending"
            />
            <div
              :style="{
                width: `${(stats.declinedCount / event.invitedGuests.length) * 100}%`,
                backgroundColor: '#ff4d4f',
              }"
              title="Declined"
            />
          </div>
        </div>

        <!-- Inline expand if mode is all and showGuestsList -->
        <div v-if="mode === 'all' && showGuestsList && isExpanded" class="border-t bg-surface" @click.stop>
          <div class="pa-3">
            <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-3">
              <div class="text-caption font-weight-bold text-darkText d-flex align-center">
                <v-icon icon="mdi-account-multiple-check" size="16" class="text-primary mr-1" />
                Invited Guests ({{ event.invitedGuests?.length || 0 }} total • {{ stats.totalHeadcount }} attending heads)
              </div>

              <div class="d-flex align-center gap-1">
                <v-btn
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  rounded="md"
                  prepend-icon="mdi-account-plus"
                  @click.stop="onQuickInvite"
                >
                  + Add More from DB
                </v-btn>
              </div>
            </div>

            <div
              v-if="!event.invitedGuests || event.invitedGuests.length === 0"
              class="pa-6 text-center border-dashed rounded-lg bg-containerBg mb-2"
            >
              <v-avatar color="primary" variant="tonal" size="48" class="mb-2">
                <v-icon icon="mdi-account-plus-outline" size="24" />
              </v-avatar>
              <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
                No Guests Invited Yet
              </div>
              <div class="text-caption text-lightText mb-3">
                Add guests directly from your saved database catalog to invite them to this event.
              </div>
              <v-btn
                color="primary"
                size="small"
                rounded="lg"
                prepend-icon="mdi-account-plus"
                @click.stop="onQuickInvite"
              >
                Select Guests from DB
              </v-btn>
            </div>

            <div v-else class="event-guests-list">
              <v-card
                v-for="guest in event.invitedGuests"
                :key="guest.guestId"
                variant="outlined"
                elevation="0"
                class="mb-2 pa-2.5 rounded-lg bg-surface card-hover-border"
              >
                <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                  <div class="d-flex align-center gap-2 flex-grow-1" style="min-width: 0;">
                    <v-avatar
                      size="32"
                      color="primary"
                      variant="tonal"
                      rounded="md"
                      class="font-weight-bold flex-shrink-0"
                      style="font-size: 0.75rem;"
                    >
                      {{ getInitials(guest.name) }}
                    </v-avatar>

                    <div style="min-width: 0;">
                      <div class="d-flex align-center flex-wrap gap-1">
                        <span class="text-subtitle-2 font-weight-bold text-darkText text-truncate">
                          {{ guest.name }}
                        </span>

                        <!-- Persons display badge -->
                        <v-chip
                          size="x-small"
                          variant="tonal"
                          :color="(guest.additionalGuests || 0) > 0 ? 'primary' : 'secondary'"
                          class="font-weight-bold"
                        >
                          <v-icon
                            :icon="(guest.additionalGuests || 0) > 0 ? 'mdi-account-multiple' : 'mdi-account'"
                            size="10"
                            class="mr-0.5"
                          />
                          {{ formatGuestPersonsDisplay(guest.additionalGuests) }}
                        </v-chip>

                        <v-chip
                          v-if="guest.group"
                          size="x-small"
                          variant="flat"
                          color="containerBg"
                          class="border text-caption"
                        >
                          {{ guest.group }}
                        </v-chip>
                      </div>

                      <div
                        class="d-flex align-center gap-2 text-caption text-lightText"
                        style="font-size: 0.7rem;"
                      >
                        <span v-if="guest.phone" class="d-flex align-center">
                          <v-icon icon="mdi-phone" size="11" class="mr-0.5 text-primary" />
                          {{ guest.phone }}
                        </span>
                        <span
                          v-if="guest.email"
                          class="d-flex align-center text-truncate"
                          style="max-width: 140px;"
                        >
                          <v-icon icon="mdi-email-outline" size="11" class="mr-0.5 text-secondary" />
                          {{ guest.email }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex align-center gap-1.5 flex-wrap">
                    <v-menu location="bottom end">
                      <template #activator="{ props: rsvpProps }">
                        <v-chip
                          v-bind="rsvpProps"
                          size="small"
                          variant="flat"
                          :color="getEventRsvpColor(guest.rsvpStatus)"
                          class="font-weight-bold cursor-pointer text-capitalize"
                        >
                          <v-icon :icon="getEventRsvpIcon(guest.rsvpStatus)" size="12" class="mr-1" />
                          {{ guest.rsvpStatus }}
                          <v-icon icon="mdi-chevron-down" size="12" class="ml-1" />
                        </v-chip>
                      </template>
                      <v-list density="compact" rounded="lg" elevation="4">
                        <v-list-item
                          title="Confirmed (Attending)"
                          prepend-icon="mdi-check-circle"
                          class="text-success font-weight-bold"
                          @click="onUpdateGuestRsvp(guest.guestId, 'confirmed')"
                        />
                        <v-list-item
                          title="Pending (Awaiting RSVP)"
                          prepend-icon="mdi-clock-outline"
                          class="text-warning font-weight-bold"
                          @click="onUpdateGuestRsvp(guest.guestId, 'pending')"
                        />
                        <v-list-item
                          title="Declined (Cannot attend)"
                          prepend-icon="mdi-close-circle"
                          class="text-error font-weight-bold"
                          @click="onUpdateGuestRsvp(guest.guestId, 'declined')"
                        />
                        <v-list-item
                          title="Invited (Sent)"
                          prepend-icon="mdi-email-send"
                          class="text-primary font-weight-bold"
                          @click="onUpdateGuestRsvp(guest.guestId, 'invited')"
                        />
                      </v-list>
                    </v-menu>

                  <v-btn
                    v-if="guest.phone"
                    icon="mdi-whatsapp"
                    variant="tonal"
                    size="x-small"
                    color="success"
                    title="Send invitation via WhatsApp"
                    @click.stop="onWhatsAppGuest(guest)"
                  />

                  <v-btn
                    size="x-small"
                    :variant="guest.invitationSent ? 'flat' : 'outlined'"
                    :color="guest.invitationSent ? 'success' : 'secondary'"
                    rounded="md"
                    class="text-capitalize"
                    :title="guest.invitationSent ? 'Invite sent' : 'Mark invite sent'"
                    @click.stop="onToggleInviteSent(guest.guestId)"
                  >
                    <v-icon
                      :icon="guest.invitationSent ? 'mdi-check-all' : 'mdi-send-outline'"
                      size="12"
                      class="mr-1"
                    />
                    {{ guest.invitationSent ? 'Sent' : 'Mark Sent' }}
                  </v-btn>

                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="x-small"
                    color="lightText"
                    title="Remove from this event"
                    @click.stop="onRemoveGuest(guest.guestId, guest.name)"
                  />
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </div>
    </div>
  </v-expand-transition>
</v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { EventItem, EventGuestInvite, EventRsvpStatus } from '@/types'
import { useEventsStore } from '@/stores/events'

interface Props {
  event: EventItem
  mode?: 'events' | 'invites' | 'all'
  elevation?: string | number
  expanded?: boolean
  showActions?: boolean
  showMetrics?: boolean
  showGuestsList?: boolean
  showQuickInvite?: boolean
  initiallyExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'events',
  elevation: 2,
  expanded: false,
  showActions: true,
  showMetrics: true,
  showGuestsList: true,
  showQuickInvite: false,
  initiallyExpanded: false,
})

const emit = defineEmits<{
  (e: 'manage-invites', eventId: string): void
  (e: 'quick-invite', event: EventItem): void
  (e: 'share-whatsapp', event: EventItem): void
  (e: 'edit', event: EventItem): void
  (e: 'delete', event: EventItem): void
  (e: 'whatsapp-guest', event: EventItem, guest: EventGuestInvite): void
  (e: 'remove-guest', eventId: string, guestId: string, guestName: string): void
  (e: 'update-guest-rsvp', eventId: string, guestId: string, status: EventRsvpStatus): void
  (e: 'toggle-invite-sent', eventId: string, guestId: string): void
  (e: 'toggle-expand', eventId: string): void
  (e: 'update:expanded', value: boolean): void
  (e: 'toggle-details', eventId: string): void
}>()

const eventsStore = useEventsStore()

// Controls display & hide of tags & invite status with smooth expand transition
const isDetailsVisible = ref(props.initiallyExpanded || false)

function toggleDetails() {
  isDetailsVisible.value = !isDetailsVisible.value
  emit('toggle-details', props.event.id)
}

// Local expanded state for full guest list
const isExpanded = ref(props.expanded)

watch(
  () => props.expanded,
  (val) => {
    isExpanded.value = val
    if (val) {
      isDetailsVisible.value = true
    }
  }
)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  emit('update:expanded', isExpanded.value)
  emit('toggle-expand', props.event.id)
}

// Compute stats reactively using store helper
const stats = computed(() => {
  return eventsStore.getEventStats(props.event)
})

// Date helpers
function formatEventDate(dateStr?: string): string {
  if (!dateStr) return 'Date TBD'
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return dateStr
  } catch {
    return dateStr
  }
}

function getRelativeDateLabel(dateStr?: string): string {
  if (!dateStr) return 'Upcoming'
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today!'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 1) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
  } catch {
    return 'Upcoming'
  }
}

function getDateBadgeColor(dateStr?: string): string {
  const label = getRelativeDateLabel(dateStr)
  if (label === 'Today!' || label === 'Tomorrow') return 'error'
  if (label.includes('In ')) return 'primary'
  return 'secondary'
}

function getCategoryIcon(cat?: string): string {
  switch (cat) {
    case 'Wedding':
      return 'mdi-ring'
    case 'Reception':
      return 'mdi-glass-cocktail'
    case 'Birthday':
      return 'mdi-cake-variant'
    case 'Anniversary':
      return 'mdi-heart-pulse'
    case 'Housewarming':
      return 'mdi-home-heart'
    case 'Festival / Puja':
      return 'mdi-fire'
    case 'Dinner Party':
      return 'mdi-silverware-fork-knife'
    case 'Baby Shower':
      return 'mdi-baby-carriage'
    case 'Get-Together':
      return 'mdi-account-group'
    default:
      return 'mdi-calendar-star'
  }
}

function formatGuestPersonsDisplay(additionalGuests?: number): string {
  const extra = Number(additionalGuests) || 0
  if (extra <= 0) return 'Solo (1)'
  return `Persons : ${(extra + 1) + extra}`
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function getEventRsvpColor(status?: EventRsvpStatus): string {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'declined':
      return 'error'
    case 'invited':
    default:
      return 'primary'
  }
}

function getEventRsvpIcon(status?: EventRsvpStatus): string {
  switch (status) {
    case 'confirmed':
      return 'mdi-check-circle'
    case 'pending':
      return 'mdi-clock-outline'
    case 'declined':
      return 'mdi-close-circle'
    case 'invited':
    default:
      return 'mdi-email-send'
  }
}

// Action Handlers
function onManageInvites() {
  emit('manage-invites', props.event.id)
}

function onQuickInvite() {
  emit('quick-invite', props.event)
}

function onShareWhatsApp() {
  emit('share-whatsapp', props.event)
}

function onEdit() {
  emit('edit', props.event)
}

function onDelete() {
  emit('delete', props.event)
}

function onWhatsAppGuest(guest: EventGuestInvite) {
  emit('whatsapp-guest', props.event, guest)
}

function onRemoveGuest(guestId: string, guestName: string) {
  emit('remove-guest', props.event.id, guestId, guestName)
}

function onUpdateGuestRsvp(guestId: string, status: EventRsvpStatus) {
  emit('update-guest-rsvp', props.event.id, guestId, status)
}

function onToggleInviteSent(guestId: string) {
  emit('toggle-invite-sent', props.event.id, guestId)
}
</script>

<style scoped>
.event-detail-card,
.event-details-card {
  transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.event-header-clickable {
  user-select: none;
  -webkit-user-select: none;
}

.transition-transform {
  transition: transform 0.25s ease;
}

.top-right-dots-btn {
  margin: -4px -4px 0 0;
}
</style>
