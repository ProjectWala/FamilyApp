<template>
  <div class="event-list-component">
    <!-- 1. Header Card with Gradient & Quick Stats -->
    <v-card class="mb-4 rounded-lg elevation-0 overflow-hidden bg-surface card-hover-border border">
      <!-- Gradient Header Bar -->
      <div
        class="pa-4 text-white position-relative"
        style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%);"
      >
        <div class="d-flex justify-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="38" rounded="lg">
              <v-icon icon="mdi-calendar-star" size="22" color="white" />
            </v-avatar>
            <div>
              <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
                Event Invitations &amp; Guest Lists
              </span>
              <div class="text-h6 font-weight-bold text-white line-height-1">
                {{ eventsStore.totalEvents }} Events • {{ totalInvitedAcrossEvents }} Total Invites
              </div>
            </div>
          </div>

          <!-- Create Event Primary CTA -->
          <v-btn
            color="white"
            variant="flat"
            size="small"
            rounded="lg"
            class="text-primary font-weight-bold text-capitalize"
            prepend-icon="mdi-calendar-plus"
            @click="openCreateEventDialog"
          >
            + Create Event
          </v-btn>
        </div>
      </div>

      <!-- Quick Stats Metric Grid -->
      <div class="pa-3 px-4">
        <div class="stats-overview-grid">
          <!-- Col 1: Total Events -->
          <div class="stat-grid-col pr-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-calendar-check" size="13" class="text-primary mr-1 flex-shrink-0" />
              <span>Events</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-primary text-truncate">
              {{ eventsStore.totalEvents }} <span class="text-caption font-weight-regular text-lightText">planned</span>
            </div>
          </div>

          <!-- Col 2: Total Invites -->
          <div class="stat-grid-col px-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-email-send-outline" size="13" class="text-secondary mr-1 flex-shrink-0" />
              <span>Invited Guests</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-secondary text-truncate">
              {{ totalInvitedAcrossEvents }} <span class="text-caption font-weight-regular text-lightText">from DB</span>
            </div>
          </div>

          <!-- Col 3: Confirmed Heads -->
          <div class="stat-grid-col px-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-account-check" size="13" class="text-success mr-1 flex-shrink-0" />
              <span>Attending Heads</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-success text-truncate">
              {{ totalConfirmedHeadsAcrossEvents }} <span class="text-caption font-weight-regular text-lightText">confirmed</span>
            </div>
          </div>

          <!-- Col 4: In DB Available -->
          <div class="stat-grid-col pl-2">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-database-check-outline" size="13" class="text-warning mr-1 flex-shrink-0" />
              <span>Saved in DB</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-warning text-truncate">
              {{ guestsStore.totalGuests }} <span class="text-caption font-weight-regular text-lightText">guests ready</span>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- 2. Search, Category Filter & Sort Toolbar -->
    <v-card variant="outlined" elevation="0" class="mb-3 rounded-lg bg-surface card-hover-border overflow-hidden">
      <div class="pa-3">
        <!-- Search Field -->
        <v-text-field
          v-model="eventsStore.searchQuery"
          placeholder="Search events by title, venue, category, or invited guest name..."
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          rounded="lg"
          class="mb-3"
        />

        <!-- Category Filter Chips Bar -->
        <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
          <v-chip
            :color="eventsStore.selectedCategory === 'all' ? 'primary' : undefined"
            :variant="eventsStore.selectedCategory === 'all' ? 'flat' : 'outlined'"
            size="small"
            class="font-weight-medium cursor-pointer"
            @click="eventsStore.selectedCategory = 'all'"
          >
            All Categories ({{ eventsStore.totalEvents }})
          </v-chip>

          <v-chip
            v-for="cat in availableCategories"
            :key="cat"
            :color="eventsStore.selectedCategory === cat ? 'primary' : undefined"
            :variant="eventsStore.selectedCategory === cat ? 'flat' : 'outlined'"
            size="small"
            class="font-weight-medium cursor-pointer"
            @click="eventsStore.selectedCategory = cat"
          >
            <v-icon :icon="getCategoryIcon(cat)" size="14" class="mr-1" />
            {{ cat }}
            <span v-if="categoryCountMap[cat]" class="ml-1 opacity-70">
              ({{ categoryCountMap[cat] }})
            </span>
          </v-chip>
        </div>
      </div>
    </v-card>

    <!-- Toolbar: Sort & Count -->
    <div class="d-flex align-center justify-space-between mb-3 px-1 flex-wrap gap-2">
      <div class="text-subtitle-1 font-weight-bold d-flex align-center text-darkText">
        <v-icon icon="mdi-calendar-clock" class="mr-2 text-primary" size="20" />
        Events List ({{ eventsStore.filteredEvents.length }})
      </div>

      <div class="d-flex align-center gap-2">
        <!-- Sort Menu -->
        <v-menu location="bottom end">
          <template #activator="{ props: sortProps }">
            <v-btn
              v-bind="sortProps"
              size="x-small"
              variant="outlined"
              color="secondary"
              rounded="lg"
              class="text-capitalize font-weight-medium px-2"
              prepend-icon="mdi-sort-variant"
            >
              {{ sortLabel }}
              <v-icon icon="mdi-chevron-down" size="12" class="ml-1" />
            </v-btn>
          </template>
          <v-list density="compact" rounded="lg" elevation="4">
            <v-list-item
              :active="eventsStore.sortBy === 'date-asc'"
              title="Event Date (Earliest first)"
              @click="eventsStore.sortBy = 'date-asc'"
            />
            <v-list-item
              :active="eventsStore.sortBy === 'date-desc'"
              title="Event Date (Latest first)"
              @click="eventsStore.sortBy = 'date-desc'"
            />
            <v-list-item
              :active="eventsStore.sortBy === 'name'"
              title="Event Name (A-Z)"
              @click="eventsStore.sortBy = 'name'"
            />
            <v-list-item
              :active="eventsStore.sortBy === 'guests-count'"
              title="Most Invited Guests"
              @click="eventsStore.sortBy = 'guests-count'"
            />
          </v-list>
        </v-menu>

        <!-- Quick Create Button -->
        <v-btn
          size="x-small"
          variant="tonal"
          color="primary"
          rounded="lg"
          class="font-weight-bold"
          prepend-icon="mdi-plus"
          @click="openCreateEventDialog"
        >
          New Event
        </v-btn>
      </div>
    </div>

    <!-- 3. Empty State -->
    <v-card
      v-if="eventsStore.filteredEvents.length === 0"
      variant="outlined"
      elevation="0"
      class="pa-8 text-center rounded-lg bg-surface border-dashed"
    >
      <v-avatar color="primary" variant="tonal" size="64" class="mb-3">
        <v-icon icon="mdi-calendar-blank-outline" size="32" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold text-darkText mb-1">
        No Events Found
      </div>
      <div class="text-caption text-lightText mb-4" style="max-width: 360px; margin: 0 auto;">
        {{ eventsStore.searchQuery || eventsStore.selectedCategory !== 'all' ? 'No events match your current filter criteria.' : 'Create an event (e.g. Wedding, Birthday, Anniversary) to invite and organize guests saved in your database.' }}
      </div>
      <div class="d-flex justify-center gap-2">
        <v-btn
          v-if="eventsStore.searchQuery || eventsStore.selectedCategory !== 'all'"
          variant="outlined"
          size="small"
          rounded="lg"
          @click="resetEventFilters"
        >
          Reset Filters
        </v-btn>
        <v-btn
          color="primary"
          size="small"
          rounded="lg"
          prepend-icon="mdi-calendar-plus"
          @click="openCreateEventDialog"
        >
          Create First Event
        </v-btn>
      </div>
    </v-card>

    <!-- 4. Events Cards List -->
    <div v-else>
      <v-slide-y-transition group>
        <v-card
          v-for="event in eventsStore.filteredEvents"
          :key="event.id"
          variant="outlined"
          elevation="0"
          class="mb-4 rounded-lg bg-surface card-hover-border overflow-hidden"
          :style="{ borderLeft: `5px solid ${event.color || '#1890ff'}` }"
        >
          <!-- Event Header Banner -->
          <div class="pa-3 border-b bg-containerBg">
            <div class="d-flex align-start justify-space-between gap-2 flex-wrap">
              <div class="flex-grow-1" style="min-width: 0;">
                <div class="d-flex align-center flex-wrap gap-1.5 mb-1">
                  <!-- Category Chip -->
                  <v-chip
                    size="x-small"
                    variant="flat"
                    :style="{ backgroundColor: event.color || '#1890ff', color: '#fff' }"
                    class="font-weight-bold text-uppercase"
                  >
                    <v-icon :icon="getCategoryIcon(event.category)" size="11" class="mr-1" />
                    {{ event.category || 'Celebration' }}
                  </v-chip>

                  <!-- Date Countdown / Status Badge -->
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

                <!-- Event Title -->
                <div class="text-subtitle-1 font-weight-bold text-darkText line-height-1 mb-1">
                  {{ event.title }}
                </div>

                <!-- Date, Time & Venue row -->
                <div class="d-flex align-center flex-wrap gap-2 text-caption text-lightText">
                  <span v-if="event.date" class="d-flex align-center font-weight-medium text-darkText">
                    <v-icon icon="mdi-calendar-text" size="13" class="mr-1 text-primary" />
                    {{ formatEventDate(event.date) }}
                  </span>

                  <span v-if="event.time" class="d-flex align-center">
                    <v-icon icon="mdi-clock-outline" size="13" class="mr-1 text-secondary" />
                    {{ event.time }}
                  </span>

                  <span v-if="event.location" class="d-flex align-center text-truncate" style="max-width: 250px;">
                    <v-icon icon="mdi-map-marker" size="13" class="mr-1 text-error flex-shrink-0" />
                    {{ event.location }}
                  </span>
                </div>

                <!-- Event Description if any -->
                <div v-if="event.description" class="text-caption text-lightText mt-1 line-clamp-2">
                  {{ event.description }}
                </div>
              </div>

              <!-- Top Right Action Menu -->
              <div class="d-flex align-center gap-1 flex-shrink-0">
                <v-btn
                  size="small"
                  variant="flat"
                  color="primary"
                  rounded="lg"
                  class="font-weight-bold text-capitalize text-caption px-2"
                  prepend-icon="mdi-account-plus"
                  @click="openInvitePicker(event)"
                >
                  Invite Guests
                </v-btn>

                <v-menu location="bottom end">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      icon="mdi-dots-vertical"
                      variant="text"
                      size="small"
                      color="lightText"
                    />
                  </template>
                  <v-list density="compact" rounded="lg" elevation="4">
                    <v-list-item
                      prepend-icon="mdi-account-multiple-plus"
                      title="Invite DB Guests"
                      @click="openInvitePicker(event)"
                    />
                    <v-list-item
                      prepend-icon="mdi-share-variant"
                      title="Share WhatsApp Invite"
                      @click="shareEventWhatsApp(event)"
                    />
                    <v-list-item
                      prepend-icon="mdi-pencil-outline"
                      title="Edit Event Details"
                      @click="openEditEventDialog(event)"
                    />
                    <v-divider class="my-1" />
                    <v-list-item
                      prepend-icon="mdi-delete-outline"
                      title="Delete Event"
                      color="error"
                      class="text-error"
                      @click="confirmDeleteEvent(event)"
                    />
                  </v-list>
                </v-menu>
              </div>
            </div>
          </div>

          <!-- Event Metrics Strip & Quick RSVP Progress -->
          <div class="pa-3">
            <!-- Computed Stats for this event -->
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
                  {{ getEventStats(event).confirmedCount }} Confirmed ({{ getEventStats(event).totalHeadcount }} Heads)
                </v-chip>

                <!-- Pending -->
                <v-chip
                  v-if="getEventStats(event).pendingCount > 0"
                  size="x-small"
                  variant="tonal"
                  color="warning"
                  class="font-weight-medium"
                >
                  <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                  {{ getEventStats(event).pendingCount }} Pending
                </v-chip>

                <!-- Declined -->
                <v-chip
                  v-if="getEventStats(event).declinedCount > 0"
                  size="x-small"
                  variant="tonal"
                  color="error"
                  class="font-weight-medium"
                >
                  <v-icon icon="mdi-close-circle-outline" size="12" class="mr-1" />
                  {{ getEventStats(event).declinedCount }} Declined
                </v-chip>

                <!-- Invites Sent -->
                <v-chip
                  size="x-small"
                  variant="tonal"
                  color="secondary"
                  class="font-weight-medium"
                >
                  <v-icon icon="mdi-send-check" size="12" class="mr-1" />
                  {{ getEventStats(event).sentCount }}/{{ event.invitedGuests?.length || 0 }} Invites Sent
                </v-chip>
              </div>

              <!-- Toggle Invited Guests Accordion Button -->
              <v-btn
                size="x-small"
                variant="tonal"
                :color="isEventExpanded(event.id) ? 'primary' : 'secondary'"
                rounded="lg"
                class="text-capitalize font-weight-bold"
                @click="toggleEventExpand(event.id)"
              >
                <v-icon :icon="isEventExpanded(event.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16" class="mr-1" />
                {{ isEventExpanded(event.id) ? 'Hide Guest List' : `View Guests (${event.invitedGuests?.length || 0})` }}
              </v-btn>
            </div>

            <!-- RSVP Progress Mini Bar -->
            <div
              v-if="event.invitedGuests && event.invitedGuests.length > 0"
              class="d-flex rounded-pill overflow-hidden"
              style="height: 6px; background: rgba(0,0,0,0.06);"
            >
              <div
                :style="{
                  width: `${(getEventStats(event).confirmedCount / event.invitedGuests.length) * 100}%`,
                  backgroundColor: '#52c41a'
                }"
                title="Confirmed"
              />
              <div
                :style="{
                  width: `${(getEventStats(event).pendingCount / event.invitedGuests.length) * 100}%`,
                  backgroundColor: '#faad14'
                }"
                title="Pending"
              />
              <div
                :style="{
                  width: `${(getEventStats(event).declinedCount / event.invitedGuests.length) * 100}%`,
                  backgroundColor: '#ff4d4f'
                }"
                title="Declined"
              />
            </div>
          </div>

          <!-- Expandable Invited Guests Section -->
          <v-expand-transition>
            <div v-if="isEventExpanded(event.id)" class="border-t bg-surface">
              <div class="pa-3">
                <!-- Search & Filters inside this event's guest list -->
                <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-3">
                  <div class="text-caption font-weight-bold text-darkText d-flex align-center">
                    <v-icon icon="mdi-account-multiple-check" size="16" class="text-primary mr-1" />
                    Invited Guests ({{ event.invitedGuests.length }} total • {{ getEventStats(event).totalHeadcount }} attending heads)
                  </div>

                  <div class="d-flex align-center gap-1">
                    <v-btn
                      size="x-small"
                      variant="outlined"
                      color="primary"
                      rounded="md"
                      prepend-icon="mdi-account-plus"
                      @click="openInvitePicker(event)"
                    >
                      + Add More from DB
                    </v-btn>
                  </div>
                </div>

                <!-- If no guests invited yet to this event -->
                <div
                  v-if="event.invitedGuests.length === 0"
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
                    @click="openInvitePicker(event)"
                  >
                    Select Guests from DB
                  </v-btn>
                </div>

                <!-- List of Invited Guests for this event -->
                <div v-else class="event-guests-list">
                  <v-card
                    v-for="guest in event.invitedGuests"
                    :key="guest.guestId"
                    variant="outlined"
                    elevation="0"
                    class="mb-2 pa-2.5 rounded-lg bg-surface card-hover-border"
                  >
                    <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                      <!-- Guest Details -->
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

                            <!-- Party size / Headcount badge -->
                            <v-chip
                              size="x-small"
                              variant="tonal"
                              :color="(guest.additionalGuests || 0) > 0 ? 'primary' : 'secondary'"
                              class="font-weight-bold"
                            >
                              <v-icon :icon="(guest.additionalGuests || 0) > 0 ? 'mdi-account-multiple' : 'mdi-account'" size="10" class="mr-0.5" />
                              {{ (guest.additionalGuests || 0) > 0 ? `Party of ${(guest.additionalGuests || 0) + 1} (+${guest.additionalGuests})` : 'Solo (1)' }}
                            </v-chip>

                            <!-- Group badge -->
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

                          <!-- Contact info -->
                          <div class="d-flex align-center gap-2 text-caption text-lightText" style="font-size: 0.7rem;">
                            <span v-if="guest.phone" class="d-flex align-center">
                              <v-icon icon="mdi-phone" size="11" class="mr-0.5 text-primary" />
                              {{ guest.phone }}
                            </span>
                            <span v-if="guest.email" class="d-flex align-center text-truncate" style="max-width: 140px;">
                              <v-icon icon="mdi-email-outline" size="11" class="mr-0.5 text-secondary" />
                              {{ guest.email }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- RSVP & Invitation Controls -->
                      <div class="d-flex align-center gap-1.5 flex-wrap">
                        <!-- RSVP Status Selector Dropdown -->
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
                              @click="setGuestEventRsvp(event.id, guest.guestId, 'confirmed')"
                            />
                            <v-list-item
                              title="Pending (Awaiting RSVP)"
                              prepend-icon="mdi-clock-outline"
                              class="text-warning font-weight-bold"
                              @click="setGuestEventRsvp(event.id, guest.guestId, 'pending')"
                            />
                            <v-list-item
                              title="Declined (Cannot attend)"
                              prepend-icon="mdi-close-circle"
                              class="text-error font-weight-bold"
                              @click="setGuestEventRsvp(event.id, guest.guestId, 'declined')"
                            />
                            <v-list-item
                              title="Invited (Sent)"
                              prepend-icon="mdi-email-send"
                              class="text-primary font-weight-bold"
                              @click="setGuestEventRsvp(event.id, guest.guestId, 'invited')"
                            />
                          </v-list>
                        </v-menu>

                        <!-- WhatsApp Invite Button -->
                        <v-btn
                          v-if="guest.phone"
                          icon="mdi-whatsapp"
                          variant="tonal"
                          size="x-small"
                          color="success"
                          title="Send invitation via WhatsApp"
                          @click="sendWhatsAppInviteToGuest(event, guest)"
                        />

                        <!-- Toggle Invite Sent Status -->
                        <v-btn
                          size="x-small"
                          :variant="guest.invitationSent ? 'flat' : 'outlined'"
                          :color="guest.invitationSent ? 'success' : 'secondary'"
                          rounded="md"
                          class="text-capitalize"
                          :title="guest.invitationSent ? 'Invite sent' : 'Mark invite sent'"
                          @click="eventsStore.toggleGuestInvitationSent(event.id, guest.guestId)"
                        >
                          <v-icon :icon="guest.invitationSent ? 'mdi-check-all' : 'mdi-send-outline'" size="12" class="mr-1" />
                          {{ guest.invitationSent ? 'Sent' : 'Mark Sent' }}
                        </v-btn>

                        <!-- Remove guest from event -->
                        <v-btn
                          icon="mdi-close"
                          variant="text"
                          size="x-small"
                          color="lightText"
                          title="Remove from this event"
                          @click="removeGuestFromEvent(event.id, guest.guestId, guest.name)"
                        />
                      </div>
                    </div>
                  </v-card>
                </div>
              </div>
            </div>
          </v-expand-transition>
        </v-card>
      </v-slide-y-transition>
    </div>

    <!-- ==================================================================== -->
    <!-- DIALOG 1: GUEST PICKER MODAL (Invite DB Guests into Event)           -->
    <!-- ==================================================================== -->
    <v-dialog v-model="invitePickerOpen" max-width="600" scrollable>
      <v-card class="rounded-xl overflow-hidden bg-surface" elevation="10">
        <!-- Dialog Header -->
        <div class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="36" rounded="lg">
              <v-icon icon="mdi-account-multiple-plus" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                Invite Guests from Database
              </div>
              <div class="text-caption text-white-75">
                Target Event: <span class="font-weight-bold text-white">{{ targetEventForInvite?.title }}</span>
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="invitePickerOpen = false" />
        </div>

        <!-- Filter & Search Toolbar in Dialog -->
        <div class="pa-3 border-b bg-containerBg">
          <v-text-field
            v-model="pickerSearchQuery"
            placeholder="Search saved guests by name, phone, group, or tags..."
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            rounded="lg"
            class="mb-2 bg-surface"
          />

          <!-- Group Filter Chips inside Dialog -->
          <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
            <v-chip
              size="x-small"
              :color="pickerGroupFilter === 'all' ? 'primary' : undefined"
              :variant="pickerGroupFilter === 'all' ? 'flat' : 'outlined'"
              class="cursor-pointer font-weight-medium"
              @click="pickerGroupFilter = 'all'"
            >
              All Groups ({{ guestsStore.totalGuests }})
            </v-chip>
            <v-chip
              v-for="grp in guestsStore.allGroups"
              :key="grp"
              size="x-small"
              :color="pickerGroupFilter === grp ? 'primary' : undefined"
              :variant="pickerGroupFilter === grp ? 'flat' : 'outlined'"
              class="cursor-pointer font-weight-medium"
              @click="pickerGroupFilter = grp"
            >
              {{ grp }}
            </v-chip>
          </div>

          <!-- Quick Select Toolbar -->
          <div class="d-flex align-center justify-space-between mt-2 pt-2 border-t">
            <div class="text-caption font-weight-bold text-lightText">
              {{ selectedGuestIds.length }} selected
            </div>
            <div class="d-flex align-center gap-1">
              <v-btn
                size="x-small"
                variant="text"
                color="primary"
                class="font-weight-bold text-capitalize"
                @click="selectAllFilteredGuests"
              >
                Select All Filtered
              </v-btn>
              <v-btn
                v-if="selectedGuestIds.length > 0"
                size="x-small"
                variant="text"
                color="error"
                class="font-weight-bold text-capitalize"
                @click="selectedGuestIds = []"
              >
                Clear
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Scrollable Guest Selection List -->
        <v-card-text class="pa-3" style="max-height: 400px;">
          <!-- Empty database check -->
          <div v-if="guestsStore.guests.length === 0" class="pa-6 text-center text-lightText">
            <v-icon icon="mdi-account-off-outline" size="36" class="mb-2 opacity-50" />
            <div class="text-subtitle-2 font-weight-bold">No Guests in Database</div>
            <div class="text-caption">Add guests in the "All Guests" tab first to invite them.</div>
          </div>

          <!-- Empty filter search check -->
          <div v-else-if="filteredPickerGuests.length === 0" class="pa-6 text-center text-lightText">
            <v-icon icon="mdi-account-search-outline" size="36" class="mb-2 opacity-50" />
            <div class="text-subtitle-2 font-weight-bold">No Matching Guests</div>
            <div class="text-caption">No saved guests match your search criteria.</div>
          </div>

          <!-- List of selectable DB guests -->
          <v-list v-else density="compact" class="pa-0">
            <v-list-item
              v-for="guest in filteredPickerGuests"
              :key="guest.id"
              rounded="lg"
              class="mb-1.5 border"
              :class="{
                'bg-primary-subtle': selectedGuestIds.includes(guest.id),
                'opacity-60': isGuestAlreadyInTargetEvent(guest.id)
              }"
              @click="toggleGuestSelection(guest.id)"
            >
              <template #prepend>
                <v-checkbox-btn
                  :model-value="selectedGuestIds.includes(guest.id) || isGuestAlreadyInTargetEvent(guest.id)"
                  :disabled="isGuestAlreadyInTargetEvent(guest.id)"
                  color="primary"
                  @click.stop="toggleGuestSelection(guest.id)"
                />
              </template>

              <v-list-item-title class="font-weight-bold text-darkText d-flex align-center flex-wrap gap-1">
                <span>{{ guest.name }}</span>
                <v-chip
                  v-if="guest.additionalGuests > 0"
                  size="x-small"
                  variant="tonal"
                  color="secondary"
                  class="ml-1"
                >
                  +{{ guest.additionalGuests }} addon
                </v-chip>
                <v-chip
                  v-if="isGuestAlreadyInTargetEvent(guest.id)"
                  size="x-small"
                  color="success"
                  variant="flat"
                  class="ml-auto font-weight-bold"
                >
                  Already in Event ✓
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle class="text-caption d-flex align-center gap-2 mt-0.5">
                <span v-if="guest.group" class="font-weight-medium text-primary">
                  {{ guest.group }}
                </span>
                <span v-if="guest.phone">
                  {{ guest.phone }}
                </span>
                <span v-if="guest.tags && guest.tags.length > 0" class="text-lightText">
                  #{{ guest.tags.slice(0, 2).join(', #') }}
                </span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <!-- Dialog Footer Action -->
        <v-card-actions class="pa-3 border-t bg-containerBg d-flex justify-space-between">
          <v-btn
            variant="outlined"
            size="small"
            rounded="lg"
            @click="invitePickerOpen = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold px-4"
            prepend-icon="mdi-account-plus"
            :disabled="selectedGuestIds.length === 0"
            @click="confirmAddSelectedGuestsToEvent"
          >
            Add {{ selectedGuestIds.length }} Guests to Event
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ==================================================================== -->
    <!-- DIALOG 2: CREATE / EDIT EVENT MODAL                                  -->
    <!-- ==================================================================== -->
    <v-dialog v-model="eventDialog" max-width="540" persistent>
      <v-card class="rounded-xl overflow-hidden bg-surface" elevation="10">
        <!-- Dialog Header -->
        <div
          class="pa-4 text-white d-flex align-center justify-space-between"
          :style="{ background: `linear-gradient(135deg, ${eventForm.color || '#4f46e5'} 0%, #7c3aed 100%)` }"
        >
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="36" rounded="lg">
              <v-icon :icon="isEditingEvent ? 'mdi-pencil' : 'mdi-calendar-plus'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditingEvent ? 'Edit Event Details' : 'Create New Event' }}
              </div>
              <div class="text-caption text-white-75">
                {{ isEditingEvent ? 'Update event parameters and venue' : 'Plan an occasion and invite saved guests' }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="eventDialog = false" />
        </div>

        <v-card-text class="pa-4">
          <v-form ref="eventFormRef" @submit.prevent="saveEvent">
            <!-- Event Title -->
            <v-text-field
              v-model="eventForm.title"
              label="Event Title *"
              placeholder="e.g. Rahul & Meera Wedding, 25th Anniversary Dinner..."
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
              :rules="[v => !!v || 'Event title is required']"
              required
            />

            <!-- Category & Color row -->
            <v-row dense class="mb-2">
              <v-col cols="12" sm="7">
                <v-select
                  v-model="eventForm.category"
                  :items="defaultEventCategories"
                  label="Occasion Category *"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  @update:model-value="onCategoryChange"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template #prepend>
                        <v-icon :icon="getCategoryIcon((item as any)?.raw || (item as any)?.value || String(item))" size="16" class="mr-2" :color="eventCategoryColors[(item as any)?.raw || (item as any)?.value || String(item)] || 'primary'" />
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" sm="5">
                <div class="d-flex align-center h-100 pb-2">
                  <span class="text-caption font-weight-bold text-lightText mr-2">Color:</span>
                  <input
                    v-model="eventForm.color"
                    type="color"
                    style="width: 38px; height: 38px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer; padding: 2px;"
                    title="Select banner theme color"
                  />
                  <v-chip size="x-small" variant="flat" :style="{ backgroundColor: eventForm.color, color: '#fff' }" class="ml-2 font-weight-bold">
                    Theme
                  </v-chip>
                </div>
              </v-col>
            </v-row>

            <!-- Date & Time Row -->
            <v-row dense class="mb-2">
              <v-col cols="12" sm="7">
                <v-text-field
                  v-model="eventForm.date"
                  type="date"
                  label="Event Date *"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  :rules="[v => !!v || 'Date is required']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="5">
                <v-text-field
                  v-model="eventForm.time"
                  type="time"
                  label="Start Time"
                  placeholder="19:00"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                />
              </v-col>
            </v-row>

            <!-- Location / Venue -->
            <v-text-field
              v-model="eventForm.location"
              label="Location / Venue"
              placeholder="e.g. Royal Palms Banquet Hall, Grand Ballroom, Mumbai"
              prepend-inner-icon="mdi-map-marker-outline"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
            />

            <!-- Description -->
            <v-textarea
              v-model="eventForm.description"
              label="Description / Schedule"
              placeholder="e.g. Welcome drinks at 7:00 PM, dinner buffet from 8:30 PM..."
              rows="2"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              class="mb-3"
            />

            <!-- Additional Notes -->
            <v-textarea
              v-model="eventForm.notes"
              label="Internal Notes / Checklist"
              placeholder="e.g. Arrange valet parking, return gifts ready by 9 PM..."
              rows="2"
              variant="outlined"
              density="comfortable"
              rounded="lg"
            />
          </v-form>
        </v-card-text>

        <!-- Dialog Footer Actions -->
        <v-card-actions class="pa-4 border-t bg-containerBg d-flex justify-space-between">
          <v-btn
            variant="outlined"
            size="small"
            rounded="lg"
            @click="eventDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold px-4"
            prepend-icon="mdi-check"
            @click="saveEvent"
          >
            {{ isEditingEvent ? 'Save Changes' : 'Create Event' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ==================================================================== -->
    <!-- DIALOG 3: DELETE CONFIRMATION                                        -->
    <!-- ==================================================================== -->
    <v-dialog v-model="deleteConfirmOpen" max-width="400">
      <v-card class="rounded-xl pa-4 bg-surface" elevation="10">
        <div class="text-center mb-3">
          <v-avatar color="error" variant="tonal" size="56" class="mb-2">
            <v-icon icon="mdi-delete-alert-outline" size="28" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold text-darkText">
            Delete Event?
          </div>
          <div class="text-caption text-lightText mt-1">
            Are you sure you want to delete <span class="font-weight-bold text-darkText">"{{ eventToDelete?.title }}"</span>? This will also remove the invited guest list for this specific event.
          </div>
        </div>

        <div class="d-flex justify-center gap-2 mt-2">
          <v-btn
            variant="outlined"
            size="small"
            rounded="lg"
            @click="deleteConfirmOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold"
            @click="executeDeleteEvent"
          >
            Yes, Delete Event
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications (e.g. copied invite text) -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="2500"
      location="bottom"
      rounded="lg"
    >
      {{ snackbarText }}
      <template #actions>
        <v-btn color="white" variant="text" size="small" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  useEventsStore,
  defaultEventCategories,
  eventCategoryColors,
} from '@/stores/events'
import { useGuestsStore } from '@/stores/guests'
import type { EventItem, EventGuestInvite, EventRsvpStatus, GuestItem } from '@/types'
import { useModalBack } from '@/composables/useModalBack'

const eventsStore = useEventsStore()
const guestsStore = useGuestsStore()

// Expanded events tracker
const expandedEventIds = ref<string[]>([eventsStore.events[0]?.id].filter(Boolean))

function isEventExpanded(eventId: string) {
  return expandedEventIds.value.includes(eventId)
}

function toggleEventExpand(eventId: string) {
  const idx = expandedEventIds.value.indexOf(eventId)
  if (idx === -1) {
    expandedEventIds.value.push(eventId)
  } else {
    expandedEventIds.value.splice(idx, 1)
  }
}

// Category Helpers
const availableCategories = computed(() => {
  const set = new Set<string>(defaultEventCategories)
  eventsStore.events.forEach((e) => {
    if (e.category) set.add(e.category)
  })
  return Array.from(set)
})

const categoryCountMap = computed(() => {
  const map: Record<string, number> = {}
  eventsStore.events.forEach((e) => {
    const cat = e.category || 'Other'
    map[cat] = (map[cat] || 0) + 1
  })
  return map
})

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

// Stats & Metrics across all events
const totalInvitedAcrossEvents = computed(() => {
  return eventsStore.events.reduce((sum, e) => sum + (e.invitedGuests?.length || 0), 0)
})

const totalConfirmedHeadsAcrossEvents = computed(() => {
  return eventsStore.events.reduce((sum, e) => {
    return sum + eventsStore.getEventStats(e).totalHeadcount
  }, 0)
})

function getEventStats(event: EventItem) {
  return eventsStore.getEventStats(event)
}

// Date formatters
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

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// RSVP Color and Icon
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

const sortLabel = computed(() => {
  switch (eventsStore.sortBy) {
    case 'date-asc':
      return 'Earliest Date'
    case 'date-desc':
      return 'Latest Date'
    case 'name':
      return 'Event Name'
    case 'guests-count':
      return 'Most Guests'
    default:
      return 'Sort'
  }
})

function resetEventFilters() {
  eventsStore.searchQuery = ''
  eventsStore.selectedCategory = 'all'
}

// ============================================================================
// GUEST PICKER (Invite DB Guests to Event)
// ============================================================================
const invitePickerOpen = ref(false)
const targetEventForInvite = ref<EventItem | null>(null)
const pickerSearchQuery = ref('')
const pickerGroupFilter = ref('all')
const selectedGuestIds = ref<string[]>([])

useModalBack(invitePickerOpen, 'eventGuestPickerModal')

function openInvitePicker(event: EventItem) {
  targetEventForInvite.value = event
  pickerSearchQuery.value = ''
  pickerGroupFilter.value = 'all'
  selectedGuestIds.value = []
  invitePickerOpen.value = true
}

function isGuestAlreadyInTargetEvent(guestId: string): boolean {
  if (!targetEventForInvite.value?.invitedGuests) return false
  return targetEventForInvite.value.invitedGuests.some((inv) => inv.guestId === guestId)
}

const filteredPickerGuests = computed(() => {
  return guestsStore.guests.filter((guest) => {
    if (pickerSearchQuery.value.trim()) {
      const q = pickerSearchQuery.value.toLowerCase().trim()
      const nameMatch = guest.name.toLowerCase().includes(q)
      const phoneMatch = guest.phone ? guest.phone.toLowerCase().includes(q) : false
      const groupMatch = guest.group ? guest.group.toLowerCase().includes(q) : false
      const tagMatch = Array.isArray(guest.tags) && guest.tags.some((t) => t.toLowerCase().includes(q))
      if (!nameMatch && !phoneMatch && !groupMatch && !tagMatch) return false
    }

    if (pickerGroupFilter.value !== 'all' && guest.group !== pickerGroupFilter.value) {
      return false
    }

    return true
  })
})

function toggleGuestSelection(guestId: string) {
  if (isGuestAlreadyInTargetEvent(guestId)) return
  const idx = selectedGuestIds.value.indexOf(guestId)
  if (idx === -1) {
    selectedGuestIds.value.push(guestId)
  } else {
    selectedGuestIds.value.splice(idx, 1)
  }
}

function selectAllFilteredGuests() {
  filteredPickerGuests.value.forEach((g) => {
    if (!isGuestAlreadyInTargetEvent(g.id) && !selectedGuestIds.value.includes(g.id)) {
      selectedGuestIds.value.push(g.id)
    }
  })
}

async function confirmAddSelectedGuestsToEvent() {
  if (!targetEventForInvite.value || selectedGuestIds.value.length === 0) return

  await eventsStore.addGuestsToEvent(targetEventForInvite.value.id, selectedGuestIds.value)
  showNotification(`Added ${selectedGuestIds.value.length} guests to ${targetEventForInvite.value.title}!`)
  invitePickerOpen.value = false
}

// Change RSVP for guest in event
async function setGuestEventRsvp(eventId: string, guestId: string, status: EventRsvpStatus) {
  await eventsStore.updateEventGuestInvite(eventId, guestId, { rsvpStatus: status })
}

// Remove guest from event
async function removeGuestFromEvent(eventId: string, guestId: string, guestName: string) {
  await eventsStore.removeGuestFromEvent(eventId, guestId)
  showNotification(`Removed ${guestName} from event`)
}

// ============================================================================
// CREATE & EDIT EVENT DIALOG
// ============================================================================
const eventDialog = ref(false)
const isEditingEvent = ref(false)
const editingEventId = ref<string | null>(null)
const eventFormRef = ref<any>(null)

useModalBack(eventDialog, 'createEditEventModal')

const eventForm = ref<{
  title: string
  category: string
  color: string
  date: string
  time: string
  location: string
  description: string
  notes: string
}>({
  title: '',
  category: 'Anniversary',
  color: '#e040fb',
  date: new Date().toISOString().slice(0, 10),
  time: '19:00',
  location: '',
  description: '',
  notes: '',
})

function onCategoryChange(cat: string) {
  if (eventCategoryColors[cat]) {
    eventForm.value.color = eventCategoryColors[cat]
  }
}

function openCreateEventDialog() {
  isEditingEvent.value = false
  editingEventId.value = null
  eventForm.value = {
    title: '',
    category: 'Wedding',
    color: eventCategoryColors['Wedding'] || '#e91e63',
    date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    time: '18:00',
    location: '',
    description: '',
    notes: '',
  }
  eventDialog.value = true
}

function openEditEventDialog(event: EventItem) {
  isEditingEvent.value = true
  editingEventId.value = event.id
  eventForm.value = {
    title: event.title,
    category: event.category || 'Celebration',
    color: event.color || '#1890ff',
    date: event.date || '',
    time: event.time || '',
    location: event.location || '',
    description: event.description || '',
    notes: event.notes || '',
  }
  eventDialog.value = true
}

async function saveEvent() {
  const valid = await eventFormRef.value?.validate()
  if (valid && !valid.valid) return

  if (!eventForm.value.title.trim()) return

  const payload = {
    title: eventForm.value.title.trim(),
    category: eventForm.value.category || 'Celebration',
    color: eventForm.value.color || '#1890ff',
    date: eventForm.value.date,
    time: eventForm.value.time || '',
    location: (eventForm.value.location || '').trim(),
    description: (eventForm.value.description || '').trim(),
    notes: (eventForm.value.notes || '').trim(),
    invitedGuests: [],
  }

  if (isEditingEvent.value && editingEventId.value) {
    await eventsStore.updateEvent(editingEventId.value, payload)
    showNotification('Event details updated successfully!')
  } else {
    const created = await eventsStore.addEvent(payload)
    expandedEventIds.value.push(created.id)
    showNotification('New event created! Now invite guests.')
  }

  eventDialog.value = false
}

// ============================================================================
// DELETE EVENT
// ============================================================================
const deleteConfirmOpen = ref(false)
const eventToDelete = ref<EventItem | null>(null)

useModalBack(deleteConfirmOpen, 'deleteEventConfirmModal')

function confirmDeleteEvent(event: EventItem) {
  eventToDelete.value = event
  deleteConfirmOpen.value = true
}

async function executeDeleteEvent() {
  if (eventToDelete.value) {
    await eventsStore.deleteEvent(eventToDelete.value.id)
    showNotification(`Deleted event "${eventToDelete.value.title}"`)
    eventToDelete.value = null
  }
  deleteConfirmOpen.value = false
}

// ============================================================================
// WHATSAPP INVITATION & SHARING
// ============================================================================
function shareEventWhatsApp(event: EventItem) {
  const dateFormatted = formatEventDate(event.date)
  const message = `✨ *You're Cordially Invited!* ✨\n\n🎉 *Event:* ${event.title}\n📅 *Date:* ${dateFormatted}${event.time ? ` at ${event.time}` : ''}\n📍 *Venue:* ${event.location || 'To be announced'}\n\n${event.description ? `${event.description}\n\n` : ''}Please RSVP and let us know if you can join us. Looking forward to celebrating together!`

  copyOrShareText(message, 'Event invitation copied to clipboard!')
}

function sendWhatsAppInviteToGuest(event: EventItem, guest: EventGuestInvite) {
  const dateFormatted = formatEventDate(event.date)
  const cleanPhone = (guest.phone || '').replace(/[^0-9]/g, '')
  const message = `Dear *${guest.name}*,\n\nYou and your family are cordially invited to celebrate with us!\n\n🎉 *Event:* ${event.title}\n📅 *Date:* ${dateFormatted}${event.time ? ` at ${event.time}` : ''}\n📍 *Venue:* ${event.location || 'To be shared'}\n\n${event.description ? `${event.description}\n\n` : ''}Kindly confirm your presence.\n\nWarm regards!`

  if (cleanPhone) {
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  } else {
    copyOrShareText(message, `Invitation for ${guest.name} copied to clipboard!`)
  }
}

// Notification Snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

function showNotification(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

function copyOrShareText(text: string, successMsg: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification(successMsg)
    }).catch(() => {
      showNotification('Copied!')
    })
  } else {
    showNotification(successMsg)
  }
}
</script>

<style scoped lang="scss">
.event-list-component {
  width: 100%;
}

.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
}

@media (max-width: 600px) {
  .stats-overview-grid {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 8px;

    .stat-grid-col:nth-child(2) {
      border-right: none !important;
    }

    .stat-grid-col:nth-child(3) {
      border-top: 1px solid rgba(0,0,0,0.06);
      padding-top: 6px;
    }

    .stat-grid-col:nth-child(4) {
      border-top: 1px solid rgba(0,0,0,0.06);
      padding-top: 6px;
    }
  }
}

.card-hover-border {
  transition: all 0.2s ease-in-out;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
