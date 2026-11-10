<template>
  <div class="events-component event-list-component">
    <!-- =================================================================== -->
    <!-- VIEW MODE 1: EVENTS LIST (or fallback ALL)                          -->
    <!-- =================================================================== -->
    <div v-if="mode === 'events' || mode === 'all'">
      <!-- 1. Header Card with Gradient & Quick Stats -->
      <v-card class="mb-4 rounded-lg elevation-0 overflow-hidden bg-surface card-hover-border border">
        <!-- Gradient Header Bar -->
        <div class="pa-4 text-white position-relative"
          style="background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);">
          <div class="d-flex justify-space-between align-center flex-wrap gap-2">
            <div class="d-flex align-center gap-2">
              <v-avatar color="white" variant="tonal" size="38" rounded="lg">
                <v-icon icon="mdi-calendar-star" size="22" color="white" />
              </v-avatar>
              <div>
                <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
                  Event Planner &amp; Occasions
                </span>
                <div class="text-h6 font-weight-bold text-white line-height-1">
                  {{ eventsStore.totalEvents }} Events Planned • {{ totalInvitedAcrossEvents }} Total Invites
                </div>
              </div>
            </div>

            <!-- Create Event Primary CTA -->
            <v-btn color="white" variant="flat" size="small" rounded="lg"
              class="text-primary font-weight-bold text-capitalize" prepend-icon="mdi-calendar-plus"
              @click="openCreateEventDialog">
              + Create Event
            </v-btn>
          </div>
        </div>


      </v-card>

      <!-- 2. COLLAPSIBLE SEARCH, TAGS & FILTERS PANEL (Matching Invites.vue) -->
      <v-card variant="outlined" elevation="0" class="mb-3 rounded-lg bg-surface card-hover-border overflow-hidden">
        <div class="d-flex align-center justify-space-between pa-3 cursor-pointer select-none filter-header-bar"
          @click="showFiltersPanel = !showFiltersPanel">
          <div class="d-flex align-center flex-wrap gap-2" style="min-width: 0;">
            <v-avatar color="primary" variant="tonal" size="28" rounded="md">
              <v-icon icon="mdi-filter-variant" size="16" />
            </v-avatar>
            <div>
              <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
                Tags &amp; Filters
                <v-chip v-if="hasActiveFilters" size="x-small" color="primary" variant="flat" rounded="pill"
                  class="ml-2 font-weight-bold px-2">
                  Filtered
                </v-chip>
              </div>
              <div class="text-caption text-lightText" style="font-size: 0.68rem !important;">
                {{ filterSummary }}
              </div>
            </div>
          </div>

          <div class="d-flex align-center">
            <v-btn v-if="hasActiveFilters" variant="text" size="x-small" color="error"
              class="mr-1 text-capitalize px-2 font-weight-bold" @click.stop="resetEventFilters">
              Reset
            </v-btn>
            <v-btn icon variant="text" size="small" color="lightText"
              :aria-label="showFiltersPanel ? 'Collapse Filters' : 'Expand Filters'">
              <v-icon :icon="showFiltersPanel ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
            </v-btn>
          </div>
        </div>

        <!-- Collapsible Container for Search, Categories, Timeline & Tags -->
        <v-expand-transition>
          <div v-if="showFiltersPanel" class="expand-wrapper">
            <div class="px-3 pb-3 pt-1 border-t">
              <!-- Search Input -->
              <v-text-field v-model="eventsStore.searchQuery"
                placeholder="Search events by title, venue, category, or invited guest name..."
                prepend-inner-icon="mdi-magnify" density="compact" variant="outlined" hide-details clearable
                rounded="lg" class="mb-3" @click:clear="eventsStore.searchQuery = ''" />

              <!-- Event Category Chips -->
              <div class="mb-3">
                <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
                  Category:
                </div>
                <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                  <v-chip :color="eventsStore.selectedCategory === 'all' ? 'primary' : 'secondary'"
                    :variant="eventsStore.selectedCategory === 'all' ? 'flat' : 'outlined'" size="small"
                    class="font-weight-medium cursor-pointer filter-gray-chip"
                    @click="eventsStore.selectedCategory = 'all'">
                    All Categories ({{ eventsStore.totalEvents }})
                  </v-chip>

                  <v-chip v-for="cat in availableCategories" :key="cat"
                    :color="eventsStore.selectedCategory === cat ? 'primary' : 'secondary'"
                    :variant="eventsStore.selectedCategory === cat ? 'flat' : 'outlined'" size="small"
                    class="font-weight-medium cursor-pointer filter-gray-chip"
                    @click="eventsStore.selectedCategory = cat">
                    <v-icon :icon="getCategoryIcon(cat)" size="14" class="mr-1" />
                    {{ cat }}
                    <span v-if="categoryCountMap[cat]" class="ml-1 opacity-70">
                      ({{ categoryCountMap[cat] }})
                    </span>
                  </v-chip>
                </div>
              </div>

              <!-- Event Timeline Filter (All, Upcoming, This Month, Past) -->
              <div class="mb-3">
                <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
                  Timeline:
                </div>
                <div class="d-flex align-center gap-1.5 flex-wrap">
                  <v-chip size="x-small" :variant="timeframeFilter === 'all' ? 'flat' : 'tonal'" color="primary"
                    class="cursor-pointer font-weight-medium" @click="timeframeFilter = 'all'">
                    All Dates ({{ eventsStore.totalEvents }})
                  </v-chip>
                  <v-chip size="x-small" :variant="timeframeFilter === 'upcoming' ? 'flat' : 'tonal'" color="success"
                    class="cursor-pointer font-weight-medium" @click="timeframeFilter = 'upcoming'">
                    <v-icon icon="mdi-calendar-arrow-right" size="12" class="mr-1" />
                    Upcoming ({{ upcomingEventsCount }})
                  </v-chip>
                  <v-chip size="x-small" :variant="timeframeFilter === 'this_month' ? 'flat' : 'tonal'" color="warning"
                    class="cursor-pointer font-weight-medium" @click="timeframeFilter = 'this_month'">
                    <v-icon icon="mdi-calendar-month" size="12" class="mr-1" />
                    This Month ({{ thisMonthEventsCount }})
                  </v-chip>
                  <v-chip size="x-small" :variant="timeframeFilter === 'past' ? 'flat' : 'tonal'" color="secondary"
                    class="cursor-pointer font-weight-medium" @click="timeframeFilter = 'past'">
                    <v-icon icon="mdi-history" size="12" class="mr-1" />
                    Past ({{ pastEventsCount }})
                  </v-chip>
                </div>
              </div>

              <!-- Tags Filter Chips Bar (if any events have tags) -->
              <div v-if="allEventTags.length > 0" class="mb-3">
                <div class="d-flex align-center justify-space-between mb-1">
                  <span class="text-caption font-weight-bold text-lightText text-uppercase">
                    Tags ({{ allEventTags.length }}):
                  </span>
                  <span class="text-caption text-lightText" style="font-size: 0.68rem !important;">
                    Tap tag to toggle
                  </span>
                </div>
                <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                  <v-chip :color="selectedEventTag === null ? 'primary' : 'secondary'"
                    :variant="selectedEventTag === null ? 'flat' : 'outlined'" size="x-small"
                    class="font-weight-medium cursor-pointer filter-gray-chip" @click="selectedEventTag = null">
                    All Tags
                  </v-chip>

                  <v-chip v-for="tag in allEventTags" :key="tag"
                    :color="selectedEventTag === tag ? 'primary' : 'secondary'"
                    :variant="selectedEventTag === tag ? 'flat' : 'outlined'" size="x-small"
                    class="font-weight-medium cursor-pointer filter-gray-chip"
                    @click="selectedEventTag = selectedEventTag === tag ? null : tag">
                    <v-icon icon="mdi-tag" size="11" class="mr-0.5" />
                    #{{ tag }}
                    <span v-if="eventTagCountMap[tag]" class="ml-1 opacity-70">
                      ({{ eventTagCountMap[tag] }})
                    </span>
                  </v-chip>
                </div>
              </div>

              <!-- Active Filters Reset Banner (Inside Panel) -->
              <div v-if="hasActiveFilters" class="d-flex align-center flex-wrap gap-1 pt-2 mt-2 border-t">
                <span class="text-caption text-lightText font-weight-bold mr-1">Active:</span>

                <v-chip v-if="eventsStore.searchQuery.trim()" size="x-small" color="primary" variant="flat" closable
                  @click:close="eventsStore.searchQuery = ''">
                  <v-icon icon="mdi-magnify" size="10" class="mr-1" />
                  "{{ eventsStore.searchQuery.trim() }}"
                </v-chip>

                <v-chip v-if="eventsStore.selectedCategory !== 'all'" size="x-small" color="primary" variant="flat"
                  closable @click:close="eventsStore.selectedCategory = 'all'">
                  <v-icon :icon="getCategoryIcon(eventsStore.selectedCategory)" size="10" class="mr-1" />
                  Category: {{ eventsStore.selectedCategory }}
                </v-chip>

                <v-chip v-if="timeframeFilter !== 'all'" size="x-small" color="warning" variant="flat" closable
                  @click:close="timeframeFilter = 'all'">
                  <v-icon icon="mdi-calendar-clock" size="10" class="mr-1" />
                  Timeline: {{ timeframeLabel }}
                </v-chip>

                <v-chip v-if="selectedEventTag" size="x-small" color="primary" variant="flat" closable
                  @click:close="selectedEventTag = null">
                  <v-icon icon="mdi-tag" size="10" class="mr-1" />
                  #{{ selectedEventTag }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-expand-transition>
      </v-card>

      <!-- Toolbar: Sort & Count -->
      <div class="d-flex align-center justify-space-between mb-3 px-1 flex-wrap gap-2">
        <div class="text-subtitle-1 font-weight-bold d-flex align-center text-darkText">
          <v-icon icon="mdi-calendar-clock" class="mr-2 text-primary" size="20" />
          Events ({{ displayedFilteredEvents.length }})
        </div>

        <div class="d-flex align-center gap-2">
          <!-- Sort Menu -->
          <v-menu location="bottom end">
            <template #activator="{ props: sortProps }">
              <v-btn v-bind="sortProps" size="x-small" variant="outlined" color="secondary" rounded="lg"
                class="text-capitalize font-weight-medium px-2" prepend-icon="mdi-sort-variant">
                {{ sortLabel }}
                <v-icon icon="mdi-chevron-down" size="12" class="ml-1" />
              </v-btn>
            </template>
            <v-list density="compact" rounded="lg" elevation="4">
              <v-list-item :active="eventsStore.sortBy === 'date-asc'" title="Event Date (Earliest first)"
                @click="eventsStore.sortBy = 'date-asc'" />
              <v-list-item :active="eventsStore.sortBy === 'date-desc'" title="Event Date (Latest first)"
                @click="eventsStore.sortBy = 'date-desc'" />
              <v-list-item :active="eventsStore.sortBy === 'name'" title="Event Name (A-Z)"
                @click="eventsStore.sortBy = 'name'" />
              <v-list-item :active="eventsStore.sortBy === 'guests-count'" title="Most Invited Guests"
                @click="eventsStore.sortBy = 'guests-count'" />
            </v-list>
          </v-menu>

          <!-- Quick Create Button -->
          <v-btn size="x-small" variant="tonal" color="primary" rounded="lg" class="font-weight-bold"
            prepend-icon="mdi-plus" @click="openCreateEventDialog">
            New Event
          </v-btn>
        </div>
      </div>

      <!-- 3. Empty State -->
      <v-card v-if="displayedFilteredEvents.length === 0" variant="outlined" elevation="0"
        class="pa-8 text-center rounded-lg bg-surface border-dashed">
        <v-avatar color="primary" variant="tonal" size="64" class="mb-3">
          <v-icon icon="mdi-calendar-blank-outline" size="32" />
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-darkText mb-1">
          No Events Found
        </div>
        <div class="text-caption text-lightText mb-4" style="max-width: 360px; margin: 0 auto;">
          <span v-if="hasActiveFilters">
            No events match your current filter criteria.
          </span>
          <span v-else>
            Create an event (e.g. Wedding, Birthday, Anniversary) to plan and invite guests from your database.
          </span>
        </div>
        <div class="d-flex justify-center gap-2">
          <v-btn v-if="hasActiveFilters" variant="outlined" size="small" rounded="lg" @click="resetEventFilters">
            Reset Filters
          </v-btn>
          <v-btn color="primary" size="small" rounded="lg" prepend-icon="mdi-calendar-plus"
            @click="openCreateEventDialog">
            Create First Event
          </v-btn>
        </div>
      </v-card>

      <!-- 4. Events Cards List -->
      <div v-else>
        <v-slide-y-transition group>
          <EventDetail v-for="event in displayedFilteredEvents" :key="event.id" :event="event" :mode="mode"
            elevation="2" :expanded="isEventExpanded(event.id)" @manage-invites="goToInvitesTab"
            @quick-invite="openInvitePicker" @share-whatsapp="shareEventWhatsApp" @edit="openEditEventDialog"
            @delete="confirmDeleteEvent" @whatsapp-guest="sendWhatsAppInviteToGuest"
            @remove-guest="removeGuestFromEvent" @toggle-invite-sent="toggleGuestInviteSent"
            @update-guest-rsvp="setGuestEventRsvp" @toggle-expand="toggleEventExpand" />
        </v-slide-y-transition>
      </div>
    </div>

    <!-- =================================================================== -->
    <!-- VIEW MODE 2: INVITES (Invitations & RSVP Management)                -->
    <!-- =================================================================== -->
    <div v-else-if="mode === 'invites'">
      <!-- Invites Top Header Card -->
      <v-card class="mb-4 rounded-lg elevation-0 overflow-hidden bg-surface card-hover-border border">
        <div class="pa-4 text-white position-relative"
          style="background: linear-gradient(135deg, #0284c7 0%, #6366f1 50%, #8b5cf6 100%);">
          <div class="d-flex justify-space-between align-center flex-wrap gap-2">
            <div class="d-flex align-center gap-2">
              <v-avatar color="white" variant="tonal" size="38" rounded="lg">
                <v-icon icon="mdi-email-send-outline" size="22" color="white" />
              </v-avatar>
              <div>
                <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
                  Event Invitations &amp; RSVP Tracking
                </span>
                <div class="text-h6 font-weight-bold text-white line-height-1">
                  {{ totalInvitedAcrossEvents }} Total Guests Invited across {{ eventsStore.totalEvents }} Events
                </div>
              </div>
            </div>

            <v-btn color="white" variant="flat" size="small" rounded="lg"
              class="text-primary font-weight-bold text-capitalize" prepend-icon="mdi-calendar-plus"
              @click="openCreateEventDialog">
              + Create Event
            </v-btn>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div class="pa-3 px-4">
          <div class="stats-overview-grid">
            <div class="stat-grid-col pr-2 border-e">
              <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
                <v-icon icon="mdi-email-check-outline" size="13" class="text-primary mr-1 flex-shrink-0" />
                <span>Invited</span>
              </div>
              <div class="text-subtitle-2 font-weight-bold text-primary text-truncate">
                {{ totalInvitedAcrossEvents }} <span
                  class="text-caption font-weight-regular text-lightText">guests</span>
              </div>
            </div>

            <div class="stat-grid-col px-2 border-e">
              <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
                <v-icon icon="mdi-account-check" size="13" class="text-success mr-1 flex-shrink-0" />
                <span>Confirmed Heads</span>
              </div>
              <div class="text-subtitle-2 font-weight-bold text-success text-truncate">
                {{ totalConfirmedHeadsAcrossEvents }} <span
                  class="text-caption font-weight-regular text-lightText">heads</span>
              </div>
            </div>

            <div class="stat-grid-col px-2 border-e">
              <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
                <v-icon icon="mdi-clock-outline" size="13" class="text-warning mr-1 flex-shrink-0" />
                <span>Pending</span>
              </div>
              <div class="text-subtitle-2 font-weight-bold text-warning text-truncate">
                {{ totalPendingAcrossEvents }} <span
                  class="text-caption font-weight-regular text-lightText">pending</span>
              </div>
            </div>

            <div class="stat-grid-col pl-2">
              <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
                <v-icon icon="mdi-database-check-outline" size="13" class="text-secondary mr-1 flex-shrink-0" />
                <span>In Database</span>
              </div>
              <div class="text-subtitle-2 font-weight-bold text-secondary text-truncate">
                {{ guestsStore.totalGuests }} <span class="text-caption font-weight-regular text-lightText">ready to
                  invite</span>
              </div>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Event Selector Bar -->
      <v-card variant="outlined" elevation="0" class="mb-3 rounded-lg bg-surface card-hover-border">
        <div class="pa-3">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-lightText text-uppercase" style="letter-spacing: 0.5px;">
              Select Event to Manage Invites:
            </span>
            <v-btn size="x-small" variant="text" color="primary" prepend-icon="mdi-plus" class="font-weight-bold"
              @click="openCreateEventDialog">
              New Event
            </v-btn>
          </div>

          <div class="d-flex align-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
            <v-chip v-for="evt in eventsStore.events" :key="evt.id"
              :color="currentActiveEvent?.id === evt.id ? 'primary' : undefined"
              :variant="currentActiveEvent?.id === evt.id ? 'flat' : 'outlined'" size="small"
              class="font-weight-medium cursor-pointer" @click="selectEvent(evt.id)">
              <v-icon :icon="getCategoryIcon(evt.category)" size="13" class="mr-1" />
              {{ evt.title }}
              <v-chip size="x-small" :variant="currentActiveEvent?.id === evt.id ? 'flat' : 'tonal'"
                :color="currentActiveEvent?.id === evt.id ? 'white' : 'primary'" class="ml-1.5 font-weight-bold px-1.5"
                style="height: 18px;">
                {{ evt.invitedGuests?.length || 0 }}
              </v-chip>
            </v-chip>
          </div>
        </div>
      </v-card>

      <!-- If no events exist in store -->
      <v-card v-if="eventsStore.events.length === 0" variant="outlined" elevation="0"
        class="pa-8 text-center rounded-lg bg-surface border-dashed">
        <v-avatar color="primary" variant="tonal" size="64" class="mb-3">
          <v-icon icon="mdi-calendar-blank-outline" size="32" />
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold text-darkText mb-1">
          No Events Created Yet
        </div>
        <div class="text-caption text-lightText mb-4">
          Create an event to start inviting guests from your saved database catalog.
        </div>
        <v-btn color="primary" size="small" rounded="lg" prepend-icon="mdi-calendar-plus"
          @click="openCreateEventDialog">
          Create First Event
        </v-btn>
      </v-card>

      <!-- Active Event Spotlight Card -->
      <div v-else-if="currentActiveEvent">
        <v-card variant="outlined" elevation="0" class="mb-3 rounded-lg bg-surface card-hover-border overflow-hidden"
          :style="{ borderLeft: `5px solid ${currentActiveEvent.color || '#1890ff'}` }">
          <!-- Active Event Details Banner -->
          <div class="pa-3 border-b bg-containerBg">
            <div class="d-flex align-start justify-space-between gap-2 flex-wrap">
              <div class="flex-grow-1" style="min-width: 0;">
                <div class="d-flex align-center flex-wrap gap-1.5 mb-1">
                  <!-- Category Chip -->
                  <v-chip size="x-small" variant="flat"
                    :style="{ backgroundColor: currentActiveEvent.color || '#1890ff', color: '#fff' }"
                    class="font-weight-bold text-uppercase">
                    <v-icon :icon="getCategoryIcon(currentActiveEvent.category)" size="11" class="mr-1" />
                    {{ currentActiveEvent.category || 'Celebration' }}
                  </v-chip>

                  <!-- Countdown -->
                  <v-chip size="x-small" variant="tonal" :color="getDateBadgeColor(currentActiveEvent.date)"
                    class="font-weight-medium">
                    <v-icon icon="mdi-calendar" size="11" class="mr-1" />
                    {{ getRelativeDateLabel(currentActiveEvent.date) }}
                  </v-chip>
                </div>

                <div class="text-subtitle-1 font-weight-bold text-darkText line-height-1 mb-1">
                  {{ currentActiveEvent.title }}
                </div>

                <!-- Prominent Parameters Grid: Type, Date, Venue, Time -->
                <div class="event-params-grid mt-2 pa-2 rounded-lg bg-surface border">
                  <v-row dense class="align-center">
                    <!-- 1. Type -->
                    <v-col cols="6" sm="3" class="py-1">
                      <div class="d-flex align-center">
                        <span class="text-caption text-lightText font-weight-medium mr-1.5">Type:</span>
                        <v-chip size="x-small" variant="flat"
                          :style="{ backgroundColor: currentActiveEvent.color || '#1890ff', color: '#fff' }"
                          class="font-weight-bold text-truncate">
                          <v-icon :icon="getCategoryIcon(currentActiveEvent.category)" size="11" class="mr-1" />
                          {{ currentActiveEvent.category || 'Celebration' }}
                        </v-chip>
                      </div>
                    </v-col>

                    <!-- 2. Date -->
                    <v-col cols="6" sm="3" class="py-1">
                      <div class="d-flex align-center">
                        <span class="text-caption text-lightText font-weight-medium mr-1.5">Date:</span>
                        <span class="text-caption font-weight-bold text-darkText d-flex align-center">
                          <v-icon icon="mdi-calendar-text" size="13" class="mr-1 text-primary" />
                          {{ formatEventDate(currentActiveEvent.date) }}
                        </span>
                      </div>
                    </v-col>

                    <!-- 3. Venue -->
                    <v-col cols="6" sm="3" class="py-1">
                      <div class="d-flex align-center">
                        <span class="text-caption text-lightText font-weight-medium mr-1.5">Venue:</span>
                        <span class="text-caption font-weight-medium text-darkText d-flex align-center text-truncate"
                          style="max-width: 150px;">
                          <v-icon icon="mdi-map-marker" size="13" class="mr-1 text-error flex-shrink-0" />
                          {{ currentActiveEvent.location || 'Venue TBA' }}
                        </span>
                      </div>
                    </v-col>

                    <!-- 4. Time -->
                    <v-col cols="6" sm="3" class="py-1">
                      <div class="d-flex align-center">
                        <span class="text-caption text-lightText font-weight-medium mr-1.5">Time:</span>
                        <span class="text-caption font-weight-medium text-darkText d-flex align-center">
                          <v-icon icon="mdi-clock-outline" size="13" class="mr-1 text-secondary" />
                          {{ currentActiveEvent.time || 'Time TBA' }}
                        </span>
                      </div>
                    </v-col>
                  </v-row>
                </div>

                <div v-if="currentActiveEvent.description" class="text-caption text-lightText mt-1">
                  {{ currentActiveEvent.description }}
                </div>
              </div>

              <!-- Top Right Action CTAs -->
              <div class="d-flex align-center gap-1.5 flex-shrink-0">
                <v-btn size="small" variant="flat" color="primary" rounded="lg"
                  class="font-weight-bold text-capitalize text-caption px-3" prepend-icon="mdi-account-plus"
                  @click="openInvitePicker(currentActiveEvent)">
                  + Invite DB Guests
                </v-btn>

                <v-btn size="small" variant="outlined" color="success" rounded="lg"
                  class="font-weight-bold text-capitalize text-caption px-2" prepend-icon="mdi-whatsapp"
                  @click="shareEventWhatsApp(currentActiveEvent)">
                  Share Invite
                </v-btn>

                <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="lightText" title="Edit Event"
                  @click="openEditEventDialog(currentActiveEvent)" />
              </div>
            </div>
          </div>

          <!-- Event RSVP Summary Strip -->
          <div class="pa-3 border-b">
            <div class="d-flex align-center justify-space-between flex-wrap gap-2 mb-2">
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
                  <v-icon icon="mdi-account-group" size="12" class="mr-1" />
                  {{ currentActiveEvent.invitedGuests?.length || 0 }} Total Invited
                </v-chip>
                <v-chip size="x-small" variant="flat" color="success" class="font-weight-bold">
                  <v-icon icon="mdi-check-circle" size="12" class="mr-1" />
                  {{ getEventStats(currentActiveEvent).confirmedCount }} Confirmed ({{
                    getEventStats(currentActiveEvent).totalHeadcount }} Heads)
                </v-chip>
                <v-chip v-if="getEventStats(currentActiveEvent).pendingCount > 0" size="x-small" variant="tonal"
                  color="warning" class="font-weight-medium">
                  <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                  {{ getEventStats(currentActiveEvent).pendingCount }} Pending
                </v-chip>
                <v-chip v-if="getEventStats(currentActiveEvent).declinedCount > 0" size="x-small" variant="tonal"
                  color="error" class="font-weight-medium">
                  <v-icon icon="mdi-close-circle-outline" size="12" class="mr-1" />
                  {{ getEventStats(currentActiveEvent).declinedCount }} Declined
                </v-chip>
                <v-chip size="x-small" variant="tonal" color="secondary" class="font-weight-medium">
                  <v-icon icon="mdi-send-check" size="12" class="mr-1" />
                  {{ getEventStats(currentActiveEvent).sentCount }}/{{ currentActiveEvent.invitedGuests?.length || 0 }}
                  Sent
                </v-chip>
              </div>
            </div>

            <!-- RSVP Progress Mini Bar -->
            <div v-if="currentActiveEvent.invitedGuests && currentActiveEvent.invitedGuests.length > 0"
              class="d-flex rounded-pill overflow-hidden" style="height: 6px; background: rgba(0,0,0,0.06);">
              <div :style="{
                width: `${(getEventStats(currentActiveEvent).confirmedCount / currentActiveEvent.invitedGuests.length) * 100}%`,
                backgroundColor: '#52c41a'
              }" title="Confirmed" />
              <div :style="{
                width: `${(getEventStats(currentActiveEvent).pendingCount / currentActiveEvent.invitedGuests.length) * 100}%`,
                backgroundColor: '#faad14'
              }" title="Pending" />
              <div :style="{
                width: `${(getEventStats(currentActiveEvent).declinedCount / currentActiveEvent.invitedGuests.length) * 100}%`,
                backgroundColor: '#ff4d4f'
              }" title="Declined" />
            </div>
          </div>

          <!-- Invited Guests Search & Filter Toolbar -->
          <div class="pa-3 bg-containerBg border-b">
            <v-text-field v-model="invitesSearchQuery" placeholder="Search invited guests by name, phone or group..."
              prepend-inner-icon="mdi-magnify" density="compact" variant="outlined" hide-details clearable rounded="lg"
              class="mb-2 bg-surface" @click:clear="invitesSearchQuery = ''" />

            <!-- RSVP Filter Chips -->
            <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              <v-chip size="x-small" :color="invitesRsvpFilter === 'all' ? 'primary' : undefined"
                :variant="invitesRsvpFilter === 'all' ? 'flat' : 'outlined'" class="cursor-pointer font-weight-medium"
                @click="invitesRsvpFilter = 'all'">
                All ({{ currentActiveEvent.invitedGuests?.length || 0 }})
              </v-chip>
              <v-chip size="x-small" :color="invitesRsvpFilter === 'confirmed' ? 'success' : undefined"
                :variant="invitesRsvpFilter === 'confirmed' ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium" @click="invitesRsvpFilter = 'confirmed'">
                Confirmed ({{ getEventStats(currentActiveEvent).confirmedCount }})
              </v-chip>
              <v-chip size="x-small" :color="invitesRsvpFilter === 'pending' ? 'warning' : undefined"
                :variant="invitesRsvpFilter === 'pending' ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium" @click="invitesRsvpFilter = 'pending'">
                Pending ({{ getEventStats(currentActiveEvent).pendingCount }})
              </v-chip>
              <v-chip size="x-small" :color="invitesRsvpFilter === 'declined' ? 'error' : undefined"
                :variant="invitesRsvpFilter === 'declined' ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium" @click="invitesRsvpFilter = 'declined'">
                Declined ({{ getEventStats(currentActiveEvent).declinedCount }})
              </v-chip>
              <v-chip size="x-small" :color="invitesRsvpFilter === 'sent' ? 'secondary' : undefined"
                :variant="invitesRsvpFilter === 'sent' ? 'flat' : 'outlined'" class="cursor-pointer font-weight-medium"
                @click="invitesRsvpFilter = 'sent'">
                Invites Sent ({{ getEventStats(currentActiveEvent).sentCount }})
              </v-chip>
            </div>
          </div>

          <!-- Invited Guests List Section -->
          <div class="pa-3">
            <!-- If no guests at all in this event -->
            <div v-if="currentActiveEvent.invitedGuests?.length === 0"
              class="pa-6 text-center border-dashed rounded-lg bg-containerBg mb-2">
              <v-avatar color="primary" variant="tonal" size="48" class="mb-2">
                <v-icon icon="mdi-account-plus-outline" size="24" />
              </v-avatar>
              <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
                No Guests Invited to This Event Yet
              </div>
              <div class="text-caption text-lightText mb-3">
                Select guests directly from your saved database catalog to invite them.
              </div>
              <v-btn color="primary" size="small" rounded="lg" prepend-icon="mdi-account-plus"
                @click="openInvitePicker(currentActiveEvent)">
                Select Guests from DB
              </v-btn>
            </div>

            <!-- If filtered search returns 0 -->
            <div v-else-if="displayedInvitedGuests.length === 0"
              class="pa-6 text-center border-dashed rounded-lg bg-containerBg mb-2">
              <v-icon icon="mdi-account-search-outline" size="36" color="lightText" class="mb-2" />
              <div class="text-subtitle-2 font-weight-bold text-darkText mb-1">
                No Invited Guests Match
              </div>
              <div class="text-caption text-lightText mb-3">
                No guests match your current search or RSVP filter.
              </div>
              <v-btn variant="outlined" size="small" rounded="lg"
                @click="invitesSearchQuery = ''; invitesRsvpFilter = 'all'">
                Reset Filters
              </v-btn>
            </div>

            <!-- List of Invited Guests for Active Event -->
            <div v-else class="event-guests-list">
              <v-card v-for="guest in displayedInvitedGuests" :key="guest.guestId" variant="outlined" elevation="0"
                class="mb-2 pa-2.5 rounded-lg bg-surface card-hover-border">
                <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                  <!-- Guest Details -->
                  <div class="d-flex align-center gap-2 flex-grow-1" style="min-width: 0;">
                    <v-avatar size="32" color="primary" variant="tonal" rounded="md"
                      class="font-weight-bold flex-shrink-0" style="font-size: 0.75rem;">
                      {{ getInitials(guest.name) }}
                    </v-avatar>

                    <div style="min-width: 0;">
                      <div class="d-flex align-center flex-wrap gap-1">
                        <span class="text-subtitle-2 font-weight-bold text-darkText text-truncate">
                          {{ guest.name }}
                        </span>

                        <!-- Persons display badge -->
                        <v-chip size="x-small" variant="tonal"
                          :color="(guest.additionalGuests || 0) > 0 ? 'primary' : 'secondary'" class="font-weight-bold">
                          <v-icon :icon="(guest.additionalGuests || 0) > 0 ? 'mdi-account-multiple' : 'mdi-account'"
                            size="10" class="mr-0.5" />
                          {{ formatGuestPersonsDisplay(guest.additionalGuests) }}
                        </v-chip>

                        <!-- Group badge -->
                        <v-chip v-if="guest.group" size="x-small" variant="flat" color="containerBg"
                          class="border text-caption">
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
                        <v-chip v-bind="rsvpProps" size="small" variant="flat"
                          :color="getEventRsvpColor(guest.rsvpStatus)"
                          class="font-weight-bold cursor-pointer text-capitalize">
                          <v-icon :icon="getEventRsvpIcon(guest.rsvpStatus)" size="12" class="mr-1" />
                          {{ guest.rsvpStatus }}
                          <v-icon icon="mdi-chevron-down" size="12" class="ml-1" />
                        </v-chip>
                      </template>
                      <v-list density="compact" rounded="lg" elevation="4">
                        <v-list-item title="Confirmed (Attending)" prepend-icon="mdi-check-circle"
                          class="text-success font-weight-bold"
                          @click="setGuestEventRsvp(currentActiveEvent.id, guest.guestId, 'confirmed')" />
                        <v-list-item title="Pending (Awaiting RSVP)" prepend-icon="mdi-clock-outline"
                          class="text-warning font-weight-bold"
                          @click="setGuestEventRsvp(currentActiveEvent.id, guest.guestId, 'pending')" />
                        <v-list-item title="Declined (Cannot attend)" prepend-icon="mdi-close-circle"
                          class="text-error font-weight-bold"
                          @click="setGuestEventRsvp(currentActiveEvent.id, guest.guestId, 'declined')" />
                        <v-list-item title="Invited (Sent)" prepend-icon="mdi-email-send"
                          class="text-primary font-weight-bold"
                          @click="setGuestEventRsvp(currentActiveEvent.id, guest.guestId, 'invited')" />
                      </v-list>
                    </v-menu>

                    <!-- WhatsApp Invite Button -->
                    <v-btn v-if="guest.phone" icon="mdi-whatsapp" variant="tonal" size="x-small" color="success"
                      title="Send invitation via WhatsApp"
                      @click="sendWhatsAppInviteToGuest(currentActiveEvent, guest)" />

                    <!-- Toggle Invite Sent Status -->
                    <v-btn size="x-small" :variant="guest.invitationSent ? 'flat' : 'outlined'"
                      :color="guest.invitationSent ? 'success' : 'secondary'" rounded="md" class="text-capitalize"
                      :title="guest.invitationSent ? 'Invite sent' : 'Mark invite sent'"
                      @click="eventsStore.toggleGuestInvitationSent(currentActiveEvent.id, guest.guestId)">
                      <v-icon :icon="guest.invitationSent ? 'mdi-check-all' : 'mdi-send-outline'" size="12"
                        class="mr-1" />
                      {{ guest.invitationSent ? 'Sent' : 'Mark Sent' }}
                    </v-btn>

                    <!-- Remove guest from event -->
                    <v-btn icon="mdi-close" variant="text" size="x-small" color="lightText"
                      title="Remove from this event"
                      @click="removeGuestFromEvent(currentActiveEvent.id, guest.guestId, guest.name)" />
                  </div>
                </div>
              </v-card>
            </div>
          </div>
        </v-card>
      </div>
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
          <v-text-field v-model="pickerSearchQuery" placeholder="Search saved guests by name, phone, group, or tags..."
            prepend-inner-icon="mdi-magnify" density="compact" variant="outlined" hide-details clearable rounded="lg"
            class="mb-2 bg-surface" @click:clear="pickerSearchQuery = ''" />

          <!-- Group Filter Chips inside Dialog -->
          <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
            <v-chip size="x-small" :color="pickerGroupFilter === 'all' ? 'primary' : undefined"
              :variant="pickerGroupFilter === 'all' ? 'flat' : 'outlined'" class="cursor-pointer font-weight-medium"
              @click="pickerGroupFilter = 'all'">
              All Groups ({{ guestsStore.totalGuests }})
            </v-chip>
            <v-chip v-for="grp in guestsStore.allGroups" :key="grp" size="x-small"
              :color="pickerGroupFilter === grp ? 'primary' : undefined"
              :variant="pickerGroupFilter === grp ? 'flat' : 'outlined'" class="cursor-pointer font-weight-medium"
              @click="pickerGroupFilter = grp">
              {{ grp }}
            </v-chip>
          </div>

          <!-- Quick Select Toolbar -->
          <div class="d-flex align-center justify-space-between mt-2 pt-2 border-t">
            <div class="text-caption font-weight-bold text-lightText">
              {{ selectedGuestIds.length }} selected
            </div>
            <div class="d-flex align-center gap-1">
              <v-btn size="x-small" variant="text" color="primary" class="font-weight-bold text-capitalize"
                @click="selectAllFilteredGuests">
                Select All Filtered
              </v-btn>
              <v-btn v-if="selectedGuestIds.length > 0" size="x-small" variant="text" color="error"
                class="font-weight-bold text-capitalize" @click="selectedGuestIds = []">
                Clear
              </v-btn>
            </div>
          </div>
        </div>

        <!-- Guests Selection List -->
        <v-card-text class="pa-3" style="max-height: 380px;">
          <div v-if="filteredPickerGuests.length === 0" class="pa-6 text-center text-caption text-lightText">
            No guests found matching your search.
          </div>

          <v-list v-else density="compact" class="pa-0">
            <v-list-item v-for="guest in filteredPickerGuests" :key="guest.id"
              class="rounded-lg mb-1 pa-2 border card-hover-border cursor-pointer"
              :class="{ 'bg-primary-lighten-5 border-primary': selectedGuestIds.includes(guest.id) }"
              :disabled="isGuestAlreadyInTargetEvent(guest.id)" @click="toggleGuestSelection(guest.id)">
              <template #prepend>
                <v-checkbox-btn
                  :model-value="isGuestAlreadyInTargetEvent(guest.id) || selectedGuestIds.includes(guest.id)"
                  :disabled="isGuestAlreadyInTargetEvent(guest.id)" color="primary" density="compact" class="mr-2" />
              </template>

              <v-list-item-title class="font-weight-bold text-darkText d-flex align-center flex-wrap gap-1">
                <span>{{ guest.name }}</span>
                <v-chip size="x-small" variant="tonal" color="primary" class="font-weight-bold">
                  {{ formatGuestPersonsDisplay(guest.additionalGuests) }}
                </v-chip>
                <v-chip v-if="guest.group" size="x-small" variant="flat" color="containerBg" class="border">
                  {{ guest.group }}
                </v-chip>
                <v-chip v-if="isGuestAlreadyInTargetEvent(guest.id)" size="x-small" variant="flat" color="success"
                  class="ml-auto font-weight-bold">
                  Already Invited
                </v-chip>
              </v-list-item-title>

              <v-list-item-subtitle class="text-caption text-lightText mt-0.5">
                <span v-if="guest.phone" class="mr-2">📞 {{ guest.phone }}</span>
                <span v-if="guest.email">✉️ {{ guest.email }}</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <!-- Dialog Footer Actions -->
        <v-card-actions class="pa-3 border-t bg-containerBg d-flex justify-space-between align-center">
          <div class="text-caption text-lightText">
            <span class="font-weight-bold text-primary">{{ selectedGuestIds.length }}</span> guests ready to add
          </div>
          <div class="d-flex gap-2">
            <v-btn variant="outlined" size="small" rounded="lg" @click="invitePickerOpen = false">
              Cancel
            </v-btn>
            <v-btn color="primary" variant="flat" size="small" rounded="lg" class="font-weight-bold"
              :disabled="selectedGuestIds.length === 0" @click="confirmAddSelectedGuestsToEvent">
              Add Selected to Event
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ==================================================================== -->
    <!-- DIALOG 2: CREATE / EDIT EVENT MODAL                                  -->
    <!-- ==================================================================== -->
    <v-dialog v-model="eventDialog" max-width="540" persistent @after-leave="dismissActiveKeyboard">
      <v-card class="rounded-xl overflow-hidden bg-surface d-flex flex-column" elevation="10" style="max-height: 92vh;">
        <!-- Sticky Dialog Header -->
        <div class="pa-4 text-white d-flex align-center justify-space-between flex-shrink-0"
          :style="{ background: `linear-gradient(135deg, ${eventForm.color || '#4f46e5'} 0%, #7c3aed 100%)` }">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="36" rounded="lg">
              <v-icon :icon="isEditingEvent ? 'mdi-pencil' : 'mdi-calendar-plus'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditingEvent ? 'Edit Event Details' : 'Create New Event' }}
              </div>
              <div class="text-caption text-white-75">
                {{ isEditingEvent ? 'Update event parameters & venue' : 'Plan an occasion & invite guests' }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="closeEventDialog" />
        </div>

        <!-- Form wrapping scrollable body and sticky actions -->
        <v-form ref="eventFormRef" class="d-flex flex-column flex-grow-1 overflow-hidden"
          @submit.prevent="triggerSaveEvent">
          <!-- Scrollable Body -->
          <v-card-text class="pa-4 overflow-y-auto flex-grow-1">
            <!-- Event Title -->
            <v-text-field v-model="eventForm.title" label="Event Title *"
              placeholder="e.g. Rahul & Meera Wedding, 25th Anniversary Dinner..." variant="outlined"
              density="comfortable" rounded="lg" class="mb-3" :rules="[v => !!v || 'Event title is required']"
              required />

            <!-- Event Type & Color row -->
            <v-row dense class="mb-2">
              <v-col cols="12" sm="7">
                <v-select v-model="eventForm.category" :items="defaultEventCategories" label="Event Type *"
                  variant="outlined" density="comfortable" rounded="lg" @update:model-value="onCategoryChange">
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template #prepend>
                        <v-icon :icon="getCategoryIcon((item as any)?.raw || (item as any)?.value || String(item))"
                          size="16" class="mr-2"
                          :color="eventCategoryColors[(item as any)?.raw || (item as any)?.value || String(item)] || 'primary'" />
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>

              <v-col cols="12" sm="5">
                <div class="d-flex align-center h-100 pb-2">
                  <span class="text-caption font-weight-bold text-lightText mr-2">Color:</span>
                  <input v-model="eventForm.color" type="color"
                    style="width: 38px; height: 38px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer; padding: 2px;"
                    title="Select banner theme color" />
                  <v-chip size="x-small" variant="flat" :style="{ backgroundColor: eventForm.color, color: '#fff' }"
                    class="ml-2 font-weight-bold">
                    Theme
                  </v-chip>
                </div>
              </v-col>
            </v-row>

            <!-- Date & Time Row -->
            <v-row dense class="mb-2">
              <v-col cols="12" sm="7">
                <v-text-field v-model="eventForm.date" type="date" label="Date *" variant="outlined"
                  density="comfortable" rounded="lg" :rules="[v => !!v || 'Date is required']" required />
              </v-col>

              <v-col cols="12" sm="5">
                <v-text-field v-model="eventForm.time" type="time" label="Time" placeholder="19:00" variant="outlined"
                  density="comfortable" rounded="lg" />
              </v-col>
            </v-row>

            <!-- Location / Venue -->
            <v-text-field v-model="eventForm.location" label="Venue *"
              placeholder="e.g. Royal Palms Banquet Hall, Grand Ballroom, Mumbai"
              prepend-inner-icon="mdi-map-marker-outline" variant="outlined" density="comfortable" rounded="lg"
              class="mb-3" />

            <!-- Description -->
            <v-textarea v-model="eventForm.description" label="Description / Schedule"
              placeholder="e.g. Welcome drinks at 7:00 PM, dinner buffet from 8:30 PM..." rows="2" variant="outlined"
              density="comfortable" rounded="lg" class="mb-3" />

            <!-- Notes -->
            <v-textarea v-model="eventForm.notes" label="Internal Notes"
              placeholder="e.g. Stage decoration vendor contact, dress code..." rows="2" variant="outlined"
              density="comfortable" rounded="lg" />
          </v-card-text>

          <!-- Sticky Footer Actions -->
          <v-card-actions class="pa-4 border-t d-flex justify-end gap-2 flex-shrink-0 bg-surface">
            <v-btn variant="outlined" size="small" rounded="lg" @click="closeEventDialog">
              Cancel
            </v-btn>
            <v-btn type="submit" color="primary" variant="flat" size="small" rounded="lg" class="font-weight-bold px-4"
              :loading="isSavingEvent" :disabled="isSavingEvent" @pointerdown.prevent @mousedown.prevent
              @click="triggerSaveEvent">
              {{ isEditingEvent ? 'Save Changes' : 'Create Event' }}
            </v-btn>
          </v-card-actions>
        </v-form>
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
            Are you sure you want to delete <span class="font-weight-bold text-darkText">"{{ eventToDelete?.title
            }}"</span>? This will also remove the invited guest list for this specific event.
          </div>
        </div>

        <div class="d-flex justify-center gap-2 mt-2">
          <v-btn variant="outlined" size="small" rounded="lg" @click="deleteConfirmOpen = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" size="small" rounded="lg" class="font-weight-bold"
            @click="executeDeleteEvent">
            Yes, Delete Event
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar for notifications (e.g. copied invite text) -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500" location="bottom" rounded="lg">
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
import { ref, computed, watch } from 'vue'
import EventDetail from '@/components/shared/EventDetail.vue'
import {
  useEventsStore,
  defaultEventCategories,
  eventCategoryColors,
} from '@/stores/events'
import { useGuestsStore } from '@/stores/guests'
import type { EventItem, EventGuestInvite, EventRsvpStatus } from '@/types'
import { useModalBack } from '@/composables/useModalBack'

interface Props {
  mode?: 'events' | 'invites' | 'all'
  activeEventId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'all',
  activeEventId: null,
})

const emit = defineEmits<{
  (e: 'switch-to-invites', eventId: string): void
  (e: 'update:activeEventId', eventId: string | null): void
}>()

const eventsStore = useEventsStore()
const guestsStore = useGuestsStore()

// Selected Event Tracking
const selectedEventId = ref<string | null>(props.activeEventId)

watch(
  () => props.activeEventId,
  (newVal) => {
    if (newVal !== undefined && newVal !== null) {
      selectedEventId.value = newVal
    }
  }
)

const currentActiveEvent = computed<EventItem | null>(() => {
  if (selectedEventId.value) {
    const found = eventsStore.events.find((e) => e.id === selectedEventId.value)
    if (found) return found
  }
  return eventsStore.events[0] || null
})

function selectEvent(eventId: string | null) {
  selectedEventId.value = eventId
  emit('update:activeEventId', eventId)
}

function goToInvitesTab(eventId: string) {
  selectEvent(eventId)
  emit('switch-to-invites', eventId)
}

// Format party headcount badge Persons : X
function formatGuestPersonsDisplay(additionalGuests?: number) {
  const extra = Number(additionalGuests) || 0
  if (extra <= 0) return 'Solo (1)'
  return `Persons : ${(extra + 1) + extra}`
}

// Expanded events tracker for mode === 'all'
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

const totalPendingAcrossEvents = computed(() => {
  return eventsStore.events.reduce((sum, e) => {
    return sum + eventsStore.getEventStats(e).pendingCount
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

// Collapsible filter panel state (matching Invites.vue)
const showFiltersPanel = ref(false)
const timeframeFilter = ref<'all' | 'upcoming' | 'this_month' | 'past'>('all')
const selectedEventTag = ref<string | null>(null)

const allEventTags = computed(() => {
  const set = new Set<string>()
  eventsStore.events.forEach((e: any) => {
    if (Array.isArray(e.tags)) {
      e.tags.forEach((t: string) => {
        if (t && t.trim()) set.add(t.trim())
      })
    }
  })
  return Array.from(set)
})

const eventTagCountMap = computed(() => {
  const map: Record<string, number> = {}
  eventsStore.events.forEach((e: any) => {
    if (Array.isArray(e.tags)) {
      e.tags.forEach((t: string) => {
        if (t && t.trim()) {
          map[t.trim()] = (map[t.trim()] || 0) + 1
        }
      })
    }
  })
  return map
})

const upcomingEventsCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventsStore.events.filter((e) => {
    if (!e.date) return false
    const d = new Date(e.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() >= today.getTime()
  }).length
})

const thisMonthEventsCount = computed(() => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  return eventsStore.events.filter((e) => {
    if (!e.date) return false
    const d = new Date(e.date)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  }).length
})

const pastEventsCount = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return eventsStore.events.filter((e) => {
    if (!e.date) return false
    const d = new Date(e.date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() < today.getTime()
  }).length
})

const displayedFilteredEvents = computed(() => {
  let list = eventsStore.filteredEvents

  // Filter by tag if selected
  if (selectedEventTag.value) {
    list = list.filter((e: any) => {
      return Array.isArray(e.tags) && e.tags.includes(selectedEventTag.value)
    })
  }

  // Filter by timeframe
  if (timeframeFilter.value !== 'all') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()

    list = list.filter((e) => {
      if (!e.date) return false
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)

      if (timeframeFilter.value === 'upcoming') {
        return d.getTime() >= today.getTime()
      }
      if (timeframeFilter.value === 'past') {
        return d.getTime() < today.getTime()
      }
      if (timeframeFilter.value === 'this_month') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      }
      return true
    })
  }

  return list
})

const hasActiveFilters = computed(() => {
  return (
    !!eventsStore.searchQuery.trim() ||
    eventsStore.selectedCategory !== 'all' ||
    timeframeFilter.value !== 'all' ||
    selectedEventTag.value !== null
  )
})

const timeframeLabel = computed(() => {
  switch (timeframeFilter.value) {
    case 'upcoming':
      return 'Upcoming'
    case 'this_month':
      return 'This Month'
    case 'past':
      return 'Past'
    default:
      return 'All Dates'
  }
})

const filterSummary = computed(() => {
  const parts: string[] = []
  if (eventsStore.searchQuery.trim()) {
    parts.push(`Query: "${eventsStore.searchQuery.trim()}"`)
  }
  if (eventsStore.selectedCategory !== 'all') {
    parts.push(`Category: ${eventsStore.selectedCategory}`)
  }
  if (timeframeFilter.value !== 'all') {
    parts.push(`Timeline: ${timeframeLabel.value}`)
  }
  if (selectedEventTag.value) {
    parts.push(`Tag: #${selectedEventTag.value}`)
  }
  return parts.length > 0 ? parts.join(' • ') : 'Showing all events'
})

function resetEventFilters() {
  eventsStore.searchQuery = ''
  eventsStore.selectedCategory = 'all'
  timeframeFilter.value = 'all'
  selectedEventTag.value = null
}

// Invites mode search and RSVP filter
const invitesSearchQuery = ref('')
const invitesRsvpFilter = ref<'all' | 'confirmed' | 'pending' | 'declined' | 'sent'>('all')

const displayedInvitedGuests = computed(() => {
  const target = currentActiveEvent.value
  if (!target || !Array.isArray(target.invitedGuests)) return []
  return target.invitedGuests.filter((g) => {
    if (invitesSearchQuery.value.trim()) {
      const q = invitesSearchQuery.value.toLowerCase().trim()
      const nameMatch = g.name.toLowerCase().includes(q)
      const phoneMatch = g.phone ? g.phone.toLowerCase().includes(q) : false
      const groupMatch = g.group ? g.group.toLowerCase().includes(q) : false
      if (!nameMatch && !phoneMatch && !groupMatch) return false
    }
    if (invitesRsvpFilter.value === 'confirmed') return g.rsvpStatus === 'confirmed'
    if (invitesRsvpFilter.value === 'pending') return g.rsvpStatus === 'pending'
    if (invitesRsvpFilter.value === 'declined') return g.rsvpStatus === 'declined'
    if (invitesRsvpFilter.value === 'sent') return !!g.invitationSent
    return true
  })
})

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

// Toggle invitation sent for guest in event
async function toggleGuestInviteSent(eventId: string, guestId: string) {
  await eventsStore.toggleGuestInvitationSent(eventId, guestId)
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

function dismissActiveKeyboard() {
  if (typeof document !== 'undefined') {
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur()
    }
    const focused = document.querySelectorAll('input:focus, textarea:focus, [contenteditable="true"]:focus')
    focused.forEach((el) => {
      if (typeof (el as HTMLElement).blur === 'function') {
        (el as HTMLElement).blur()
      }
    })
  }
}

function closeEventDialog() {
  dismissActiveKeyboard()
  eventDialog.value = false
}

watch(eventDialog, (isOpen) => {
  if (!isOpen) {
    dismissActiveKeyboard()
  }
})

const isSavingEvent = ref(false)
let isSubmittingEvent = false
let lastSubmitTime = 0

async function triggerSaveEvent() {
  const now = Date.now()
  // Guard 1: Debounce duplicate invocations (within 1000ms) or when actively saving
  if (isSubmittingEvent || isSavingEvent.value || now - lastSubmitTime < 1000) {
    return
  }

  // Guard 2: Dialog must be open
  if (!eventDialog.value) return

  // Guard 3: Title must be present (otherwise let Vuetify validate and show errors)
  if (!eventForm.value.title.trim()) {
    await eventFormRef.value?.validate()
    return
  }

  isSubmittingEvent = true
  lastSubmitTime = now
  isSavingEvent.value = true

  // Explicitly dismiss active keyboard cleanly
  dismissActiveKeyboard()

  try {
    await saveEvent()
  } finally {
    isSavingEvent.value = false
    setTimeout(() => {
      isSubmittingEvent = false
    }, 800)
  }
}

async function saveEvent() {
  const valid = await eventFormRef.value?.validate()
  if (valid && !valid.valid) return

  const title = eventForm.value.title.trim()
  if (!title) return

  // Consume title immediately to make this function strictly idempotent
  eventForm.value.title = ''

  const payload = {
    title,
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
    selectedEventId.value = created.id
    emit('update:activeEventId', created.id)
    showNotification('New event created! Now invite guests.')
  }

  dismissActiveKeyboard()
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
  const message = `✨ *You're Cordially Invited!* ✨\n\n🎉 *Event:* ${event.title}\n🏷️ *Type:* ${event.category || 'Celebration'}\n📅 *Date:* ${dateFormatted}\n⏰ *Time:* ${event.time || 'TBA'}\n📍 *Venue:* ${event.location || 'To be announced'}\n\n${event.description ? `${event.description}\n\n` : ''}Please RSVP and let us know if you can join us. Looking forward to celebrating together!`

  copyOrShareText(message, 'Event invitation copied to clipboard!')
}

function sendWhatsAppInviteToGuest(event: EventItem, guest: EventGuestInvite) {
  const dateFormatted = formatEventDate(event.date)
  const cleanPhone = (guest.phone || '').replace(/[^0-9]/g, '')
  const message = `Dear *${guest.name}*,\n\nYou and your family are cordially invited to celebrate with us!\n\n🎉 *Event:* ${event.title}\n🏷️ *Type:* ${event.category || 'Celebration'}\n📅 *Date:* ${dateFormatted}\n⏰ *Time:* ${event.time || 'TBA'}\n📍 *Venue:* ${event.location || 'To be shared'}\n\n${event.description ? `${event.description}\n\n` : ''}Kindly confirm your presence.\n\nWarm regards!`

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
.events-component,
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
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      padding-top: 6px;
    }

    .stat-grid-col:nth-child(4) {
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      padding-top: 6px;
    }
  }
}

.card-hover-border {
  transition: all 0.2s ease-in-out;
}

.event-params-grid {
  background: rgba(0, 0, 0, 0.02);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.filter-gray-chip.v-chip--variant-outlined {
  border-color: #8c8c8c !important;
  color: #595959 !important;
}

.filter-gray-chip.v-chip--variant-outlined :deep(.v-icon) {
  color: #8c8c8c !important;
}

:root.v-theme--dark .filter-gray-chip.v-chip--variant-outlined,
.v-theme--dark .filter-gray-chip.v-chip--variant-outlined {
  border-color: #595959 !important;
  color: #bfbfbf !important;
}

:root.v-theme--dark .filter-gray-chip.v-chip--variant-outlined :deep(.v-icon),
.v-theme--dark .filter-gray-chip.v-chip--variant-outlined :deep(.v-icon) {
  color: #bfbfbf !important;
}
</style>
