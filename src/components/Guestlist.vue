<template>
  <div class="guestlist-container">
    <!-- 1. Header Card with Gradient & Quick Stats -->
    <v-card class="mb-4 rounded-lg elevation-0 overflow-hidden bg-surface card-hover-border border">
      <!-- Gradient Header Bar -->
      <div
        class="pa-4 text-white position-relative"
        style="background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);"
      >
        <div class="d-flex justify-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="38" rounded="lg">
              <v-icon icon="mdi-account-multiple-check-outline" size="22" color="white" />
            </v-avatar>
            <div>
              <span class="text-caption text-white-75 text-uppercase font-weight-bold" style="letter-spacing: 0.5px;">
                Guest Tracker
              </span>
              <div class="text-h6 font-weight-bold text-white line-height-1">
                {{ guestsStore.totalGuests }} Guests • {{ guestsStore.totalPartyCount }} Total Heads
              </div>
            </div>
          </div>

          <!-- Add Guest Primary CTA -->
          <v-btn
            color="white"
            variant="flat"
            size="small"
            rounded="lg"
            class="text-primary font-weight-bold text-capitalize"
            prepend-icon="mdi-account-plus"
            @click="openAddGuestDialog"
          >
            + Add
          </v-btn>
        </div>
      </div>

      <!-- Quick Stats Metric Grid (2 Rows x 4 Cols) -->
      <div class="pa-3 px-4">
        <div class="stats-overview-grid">
          <!-- Col 1: Attending -->
          <div class="stat-grid-col pr-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-account-group" size="13" class="text-primary mr-1 flex-shrink-0" />
              <span>Attending</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-primary text-truncate">
              {{ guestsStore.totalConfirmedParty }} <span class="text-caption font-weight-regular text-lightText">heads</span>
            </div>
          </div>

          <!-- Col 2: Confirmed -->
          <div class="stat-grid-col px-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-check-decagram" size="13" class="text-success mr-1 flex-shrink-0" />
              <span>Confirmed</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-success text-truncate">
              {{ guestsStore.confirmedCount }} <span class="text-caption font-weight-regular text-lightText">guests</span>
            </div>
          </div>

          <!-- Col 3: Addon Persons -->
          <div class="stat-grid-col px-2 border-e">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-account-multiple-plus" size="13" class="text-secondary mr-1 flex-shrink-0" />
              <span>Addon Persons</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-secondary text-truncate">
              +{{ totalAddonPersonsCount }} <span class="text-caption font-weight-regular text-lightText">addons</span>
            </div>
          </div>

          <!-- Col 4: Return Gifts -->
          <div class="stat-grid-col pl-2">
            <div class="text-caption text-lightText font-weight-medium text-truncate mb-0.5 d-flex align-center">
              <v-icon icon="mdi-gift-outline" size="13" class="text-warning mr-1 flex-shrink-0" />
              <span>Return Gifts</span>
            </div>
            <div class="text-subtitle-2 font-weight-bold text-warning text-truncate">
              {{ guestsStore.totalReturnGiftsCount }} <span class="text-caption font-weight-regular text-lightText">gifts (₹{{ guestsStore.totalReturnGiftsCost.toLocaleString() }})</span>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- 2. COLLAPSIBLE SEARCH, TAGS & FILTERS PANEL (Mantis Style - Matching ShoppingList) -->
    <v-card
      variant="outlined"
      elevation="0"
      class="mb-3 rounded-lg bg-surface card-hover-border overflow-hidden"
    >
      <div
        class="d-flex align-center justify-space-between pa-3 cursor-pointer select-none filter-header-bar"
        @click="showFiltersPanel = !showFiltersPanel"
      >
        <div class="d-flex align-center flex-wrap gap-2" style="min-width: 0;">
          <v-avatar color="primary" variant="tonal" size="28" rounded="md">
            <v-icon icon="mdi-filter-variant" size="16" />
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
              Search, Tags &amp; Filters
              <v-chip
                v-if="hasActiveFilters"
                size="x-small"
                color="primary"
                variant="flat"
                rounded="pill"
                class="ml-2 font-weight-bold px-2"
              >
                Filtered
              </v-chip>
            </div>
            <div class="text-caption text-lightText" style="font-size: 0.68rem !important;">
              {{ filterSummary }}
            </div>
          </div>
        </div>

        <div class="d-flex align-center">
          <v-btn
            v-if="hasActiveFilters"
            variant="text"
            size="x-small"
            color="error"
            class="mr-1 text-capitalize px-2 font-weight-bold"
            @click.stop="resetFilters"
          >
            Reset
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="lightText"
            :aria-label="showFiltersPanel ? 'Collapse Filters' : 'Expand Filters'"
          >
            <v-icon :icon="showFiltersPanel ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
          </v-btn>
        </div>
      </div>

      <!-- Collapsible Container for Search, Tags, Groups, Gifts & RSVP -->
      <v-expand-transition>
        <div v-if="showFiltersPanel" class="expand-wrapper">
          <div class="px-3 pb-3 pt-1 border-t">
            <!-- Search Input -->
          <v-text-field
            v-model="guestsStore.searchQuery"
            placeholder="Search by guest name, addon companion, phone, tags, gifts, notes..."
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            rounded="lg"
            class="mb-3"
          />

          <!-- Group Category Chips -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
              Guest Group:
            </div>
            <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              <v-chip
                :color="guestsStore.selectedGroup === 'all' ? 'primary' : undefined"
                :variant="guestsStore.selectedGroup === 'all' ? 'flat' : 'outlined'"
                size="small"
                class="font-weight-medium cursor-pointer"
                @click="guestsStore.selectedGroup = 'all'"
              >
                All Groups ({{ guestsStore.totalGuests }})
              </v-chip>

              <v-chip
                v-for="grp in guestsStore.allGroups"
                :key="grp"
                :color="guestsStore.selectedGroup === grp ? 'primary' : undefined"
                :variant="guestsStore.selectedGroup === grp ? 'flat' : 'outlined'"
                size="small"
                class="font-weight-medium cursor-pointer"
                @click="guestsStore.selectedGroup = grp"
              >
                <v-icon :icon="getGuestGroupIcon(grp)" size="14" class="mr-1" />
                {{ grp }}
                <span v-if="guestsStore.groupCountMap[grp]" class="ml-1 opacity-70">
                  ({{ guestsStore.groupCountMap[grp] }})
                </span>
              </v-chip>
            </div>
          </div>

          <!-- Tag Filter Chips Bar -->
          <div class="mb-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption font-weight-bold text-lightText text-uppercase">
                Tags ({{ guestsStore.allTags.length }}):
              </span>
              <span class="text-caption text-lightText" style="font-size: 0.68rem !important;">
                Tap tag to toggle
              </span>
            </div>
            <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              <v-chip
                :color="guestsStore.selectedTags.length === 0 ? 'primary' : undefined"
                :variant="guestsStore.selectedTags.length === 0 ? 'flat' : 'outlined'"
                size="x-small"
                class="font-weight-medium cursor-pointer"
                @click="guestsStore.selectedTags = []; guestsStore.selectedTag = null"
              >
                All Tags
              </v-chip>

              <v-chip
                v-for="tag in guestsStore.allTags"
                :key="tag"
                :color="isTagSelected(tag) ? 'primary' : undefined"
                :variant="isTagSelected(tag) ? 'flat' : 'outlined'"
                size="x-small"
                class="font-weight-medium cursor-pointer"
                @click="guestsStore.toggleTag(tag)"
              >
                <v-icon icon="mdi-tag" size="11" class="mr-0.5" />
                #{{ tag }}
                <span v-if="guestsStore.tagCountMap[tag]" class="ml-1 opacity-70">
                  ({{ guestsStore.tagCountMap[tag] }})
                </span>
              </v-chip>
            </div>
          </div>

          <!-- Return Gift Filter Chips Bar -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
              Return Gifts Filter:
            </div>
            <div class="d-flex align-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              <v-chip
                size="x-small"
                :color="guestsStore.giftFilter === 'all' && !guestsStore.selectedGiftName ? 'warning' : undefined"
                :variant="guestsStore.giftFilter === 'all' && !guestsStore.selectedGiftName ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.giftFilter = 'all'; guestsStore.selectedGiftName = null"
              >
                All ({{ guestsStore.totalGuests }})
              </v-chip>

              <v-chip
                size="x-small"
                :color="guestsStore.giftFilter === 'with_gift' ? 'warning' : undefined"
                :variant="guestsStore.giftFilter === 'with_gift' ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.giftFilter = 'with_gift'; guestsStore.selectedGiftName = null"
              >
                <v-icon icon="mdi-gift" size="11" class="mr-0.5" />
                Has Gifts ({{ guestsStore.guestsWithGiftCount }})
              </v-chip>

              <v-chip
                size="x-small"
                :color="guestsStore.giftFilter === 'without_gift' ? 'warning' : undefined"
                :variant="guestsStore.giftFilter === 'without_gift' ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.giftFilter = 'without_gift'; guestsStore.selectedGiftName = null"
              >
                <v-icon icon="mdi-gift-off-outline" size="11" class="mr-0.5" />
                No Gift ({{ guestsStore.guestsWithoutGiftCount }})
              </v-chip>

              <!-- Specific gift presets filters -->
              <v-chip
                v-for="item in guestsStore.returnGiftsDistribution.slice(0, 4)"
                :key="item.name"
                size="x-small"
                :color="guestsStore.selectedGiftName === item.name ? 'warning' : undefined"
                :variant="guestsStore.selectedGiftName === item.name ? 'flat' : 'outlined'"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.toggleGiftNameFilter(item.name)"
              >
                {{ item.name }} ({{ item.count }})
              </v-chip>
            </div>
          </div>

          <!-- RSVP Status Filter -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
              RSVP Status:
            </div>
            <div class="d-flex align-center gap-1.5 flex-wrap">
              <v-chip
                size="x-small"
                :variant="guestsStore.selectedRsvp === 'all' ? 'flat' : 'tonal'"
                color="primary"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.selectedRsvp = 'all'"
              >
                All RSVPs ({{ guestsStore.totalGuests }})
              </v-chip>
              <v-chip
                size="x-small"
                :variant="guestsStore.selectedRsvp === 'confirmed' ? 'flat' : 'tonal'"
                color="success"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.selectedRsvp = 'confirmed'"
              >
                <v-icon icon="mdi-check-circle" size="12" class="mr-1" />
                Confirmed ({{ guestsStore.confirmedCount }})
              </v-chip>
              <v-chip
                size="x-small"
                :variant="guestsStore.selectedRsvp === 'pending' ? 'flat' : 'tonal'"
                color="warning"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.selectedRsvp = 'pending'"
              >
                <v-icon icon="mdi-clock-outline" size="12" class="mr-1" />
                Pending ({{ guestsStore.pendingCount }})
              </v-chip>
            </div>
          </div>

          <!-- Active Filters Reset Banner (Inside Panel) -->
          <div
            v-if="hasActiveFilters"
            class="d-flex align-center flex-wrap gap-1 pt-2 mt-2 border-t"
          >
            <span class="text-caption text-lightText font-weight-bold mr-1">Active:</span>

            <v-chip
              v-if="guestsStore.searchQuery.trim()"
              size="x-small"
              color="primary"
              variant="flat"
              closable
              @click:close="guestsStore.searchQuery = ''"
            >
              <v-icon icon="mdi-magnify" size="10" class="mr-1" />
              "{{ guestsStore.searchQuery.trim() }}"
            </v-chip>

            <v-chip
              v-for="tag in guestsStore.selectedTags"
              :key="tag"
              size="x-small"
              color="primary"
              variant="flat"
              closable
              @click:close="guestsStore.toggleTag(tag)"
            >
              <v-icon icon="mdi-tag" size="10" class="mr-1" />
              #{{ tag }}
            </v-chip>

            <v-chip
              v-if="guestsStore.giftFilter !== 'all'"
              size="x-small"
              color="warning"
              variant="flat"
              closable
              @click:close="guestsStore.giftFilter = 'all'"
            >
              <v-icon icon="mdi-gift" size="10" class="mr-1" />
              {{ guestsStore.giftFilter === 'with_gift' ? 'Has Gifts' : 'No Gifts' }}
            </v-chip>

            <v-chip
              v-if="guestsStore.selectedGiftName"
              size="x-small"
              color="warning"
              variant="flat"
              closable
              @click:close="guestsStore.selectedGiftName = null"
            >
              <v-icon icon="mdi-gift-outline" size="10" class="mr-1" />
              Gift: {{ guestsStore.selectedGiftName }}
            </v-chip>

            <v-chip
              v-if="guestsStore.selectedGroup !== 'all'"
              size="x-small"
              color="secondary"
              variant="flat"
              closable
              @click:close="guestsStore.selectedGroup = 'all'"
            >
              {{ guestsStore.selectedGroup }}
            </v-chip>

            <v-chip
              v-if="guestsStore.selectedRsvp !== 'all'"
              size="x-small"
              color="success"
              variant="flat"
              closable
              @click:close="guestsStore.selectedRsvp = 'all'"
            >
              RSVP: {{ guestsStore.selectedRsvp }}
            </v-chip>

            <v-btn
              variant="text"
              size="x-small"
              color="error"
              class="font-weight-bold text-caption px-1 ml-auto"
              @click="resetFilters"
            >
              Clear Filters
            </v-btn>
          </div>
        </div>
      </div>
    </v-expand-transition>
    </v-card>

    <!-- Toolbar: View Mode, Details Toggle, Sort & Guests Count (Matching ShoppingList Toolbar) -->
    <div class="d-flex align-center justify-space-between mb-3 px-1 flex-wrap gap-2">
      <div class="text-subtitle-1 font-weight-bold d-flex align-center text-darkText">
        <v-icon icon="mdi-account-group" class="mr-2 text-primary" size="20" />
        {{ listHeaderTitle }}
      </div>

      <div class="d-flex align-center gap-1.5 flex-wrap">
        <!-- View Mode Toggle Menu (Flat vs Grouped by Tag vs Grouped by Category) -->
        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              size="x-small"
              variant="outlined"
              color="primary"
              rounded="lg"
              class="text-capitalize font-weight-medium"
            >
              <v-icon :icon="viewModeIcon" size="13" class="mr-1" />
              {{ viewModeLabel }}
              <v-icon icon="mdi-chevron-down" size="12" class="ml-1" />
            </v-btn>
          </template>
          <v-list density="compact" rounded="lg" elevation="4">
            <v-list-item
              :active="guestsStore.viewMode === 'flat'"
              prepend-icon="mdi-view-headline"
              title="Flat Cards View"
              @click="guestsStore.viewMode = 'flat'"
            />
            <v-list-item
              :active="guestsStore.viewMode === 'grouped_by_tag'"
              prepend-icon="mdi-tag-multiple-outline"
              title="Grouped by Tag"
              @click="guestsStore.viewMode = 'grouped_by_tag'"
            />
            <v-list-item
              :active="guestsStore.viewMode === 'grouped_by_category'"
              prepend-icon="mdi-folder-outline"
              title="Grouped by Category"
              @click="guestsStore.viewMode = 'grouped_by_category'"
            />
          </v-list>
        </v-menu>

        <!-- Toggle Expand All Details Button -->
        <v-btn
          size="x-small"
          :variant="showAllDetails ? 'flat' : 'outlined'"
          :color="showAllDetails ? 'primary' : 'secondary'"
          rounded="lg"
          class="text-capitalize font-weight-medium px-2"
          title="Toggle details for all guests"
          @click="showAllDetails = !showAllDetails"
        >
          <v-icon :icon="showAllDetails ? 'mdi-eye-check-outline' : 'mdi-eye-outline'" size="13" class="mr-1" />
          {{ showAllDetails ? 'Hide Details' : 'Show Details' }}
        </v-btn>

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
              title="Sort guests"
            >
              {{ currentSortLabel }}
              <v-icon icon="mdi-chevron-down" size="12" class="ml-1" />
            </v-btn>
          </template>
          <v-list density="compact" rounded="lg" elevation="4">
            <v-list-item
              :active="guestsStore.sortBy === 'newest'"
              title="Newest Added"
              @click="guestsStore.sortBy = 'newest'"
            />
            <v-list-item
              :active="guestsStore.sortBy === 'name'"
              title="Guest Name (A-Z)"
              @click="guestsStore.sortBy = 'name'"
            />
            <v-list-item
              :active="guestsStore.sortBy === 'party-desc'"
              title="Party Size (Largest First)"
              @click="guestsStore.sortBy = 'party-desc'"
            />
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- 3. Empty State -->
    <v-card
      v-if="guestsStore.filteredGuests.length === 0"
      variant="outlined"
      elevation="0"
      class="pa-8 text-center rounded-lg bg-surface border-dashed"
    >
      <v-avatar color="primary" variant="tonal" size="64" class="mb-3">
        <v-icon icon="mdi-account-search-outline" size="32" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold text-darkText mb-1">
        No Guests Found
      </div>
      <div class="text-caption text-lightText mb-4" style="max-width: 340px; margin: 0 auto;">
        {{ hasActiveFilters ? 'No guests match your active filters or search criteria.' : 'Start building your event guest list with companion addon persons, group tags, and return gifts.' }}
      </div>
      <div class="d-flex justify-center gap-2">
        <v-btn
          v-if="hasActiveFilters"
          variant="outlined"
          size="small"
          rounded="lg"
          @click="resetFilters"
        >
          Reset Filters
        </v-btn>
        <v-btn
          color="primary"
          size="small"
          rounded="lg"
          prepend-icon="mdi-account-plus"
          @click="openAddGuestDialog"
        >
          Add First Guest
        </v-btn>
      </div>
    </v-card>

    <!-- 4. VIEW A: Flat Cards View -->
    <div v-else-if="guestsStore.viewMode === 'flat'">
      <v-slide-y-transition group>
        <v-card
          v-for="guest in guestsStore.filteredGuests"
          :key="guest.id"
          :ripple="false"
          variant="outlined"
          elevation="0"
          class="mb-3 pa-3 rounded-lg bg-surface card-hover-border cursor-pointer"
          @click="toggleGuestExpand(guest.id)"
        >
          <!-- Card Content Wrapper -->
          <div class="d-flex align-start justify-space-between">
            <!-- Left Info Section -->
            <div class="d-flex align-start gap-3 flex-grow-1" style="min-width: 0;">
              <!-- Avatar with Initials -->
              <v-avatar
                color="primary"
                variant="tonal"
                size="32"
                rounded="md"
                class="flex-shrink-0 font-weight-bold"
                style="font-size: 0.75rem;"
              >
                {{ getInitials(guest.name) }}
              </v-avatar>

              <div class="flex-grow-1" style="min-width: 0;">
                <!-- Main Guest Name & Party Headcount Pill -->
                <div class="d-flex align-center flex-wrap gap-1 mb-1">
                  <span class="text-subtitle-1 font-weight-bold text-darkText text-truncate">
                    {{ guest.name }}
                  </span>

                  <!-- Party Size Badge (+N Addons) -->
                  <v-chip
                    size="x-small"
                    variant="tonal"
                    :color="guest.additionalGuests > 0 ? 'primary' : 'secondary'"
                    class="font-weight-bold ml-1"
                  >
                    <v-icon :icon="guest.additionalGuests > 0 ? 'mdi-account-multiple' : 'mdi-account'" size="12" class="mr-1" />
                    {{ guest.additionalGuests > 0 ? `Party of ${guest.additionalGuests + 1} (+${guest.additionalGuests})` : 'Solo (1)' }}
                  </v-chip>
                </div>

                <!-- Group category & RSVP status badge -->
                <div class="d-flex align-center gap-1.5 flex-wrap mb-1.5">
                  <v-chip
                    size="x-small"
                    variant="flat"
                    color="containerBg"
                    class="font-weight-medium text-darkText border"
                  >
                    <v-icon :icon="getGuestGroupIcon(guest.group)" size="12" class="mr-1 text-primary" />
                    {{ guest.group || 'General' }}
                  </v-chip>

                  <v-chip
                    size="x-small"
                    variant="flat"
                    :color="getRsvpColor(guest.rsvpStatus)"
                    class="font-weight-bold text-capitalize"
                  >
                    <v-icon :icon="getRsvpIcon(guest.rsvpStatus)" size="12" class="mr-1" />
                    {{ guest.rsvpStatus }}
                  </v-chip>
                </div>

                <!-- Addon Persons Chips ("i can add guest name & addon person along with it") -->
                <div
                  v-if="guest.accompanyingPersons && guest.accompanyingPersons.length > 0"
                  class="d-flex align-center gap-1 flex-wrap mt-1 mb-1"
                >
                  <span class="text-caption text-lightText font-weight-medium mr-1" style="font-size: 0.72rem;">
                    Addons:
                  </span>
                  <v-chip
                    v-for="(person, pIdx) in guest.accompanyingPersons"
                    :key="pIdx"
                    size="x-small"
                    variant="tonal"
                    color="secondary"
                    class="font-weight-medium"
                  >
                    <v-icon icon="mdi-account" size="10" class="mr-1" />
                    <span>{{ person.name }}</span>
                    <span v-if="person.relation" class="ml-1 opacity-70">({{ person.relation }})</span>
                  </v-chip>
                </div>

                <!-- Grouping Tags Chips -->
                <div
                  v-if="guest.tags && guest.tags.length > 0"
                  class="d-flex align-center gap-1 flex-wrap mt-1"
                >
                  <v-chip
                    v-for="tag in guest.tags"
                    :key="tag"
                    size="x-small"
                    variant="outlined"
                    color="primary"
                    class="font-weight-medium cursor-pointer"
                    @click.stop="guestsStore.toggleTag(tag)"
                  >
                    <v-icon icon="mdi-tag" size="10" class="mr-0.5" />
                    #{{ tag }}
                  </v-chip>
                </div>

                <!-- FEATURE: RETURN GIFTS SECTION (1 or more gifts same as tags) -->
                <div class="d-flex align-center gap-1.5 flex-wrap mt-2 pt-1 border-t">
                  <span class="text-caption text-lightText font-weight-bold mr-1" style="font-size: 0.72rem;">
                    <v-icon icon="mdi-gift-outline" size="12" class="mr-0.5 text-warning" />
                    Return Gifts ({{ guest.returnGifts?.length || 0 }}):
                  </span>

                  <!-- Return Gift Chips (Name & Price) -->
                  <v-chip
                    v-for="(gift, gIdx) in (guest.returnGifts || [])"
                    :key="gIdx"
                    size="x-small"
                    variant="tonal"
                    color="warning"
                    class="font-weight-medium"
                  >
                    <v-icon icon="mdi-gift" size="11" class="mr-1 text-warning" />
                    <span>{{ gift.name }}</span>
                    <span class="ml-1 font-weight-bold text-darkText">(₹{{ Number(gift.price || 0).toLocaleString() }})</span>
                    <v-btn
                      icon="mdi-close"
                      variant="text"
                      size="x-small"
                      density="compact"
                      class="ml-1 text-lightText hover-error"
                      title="Remove this return gift"
                      @click.stop="removeGuestGift(guest.id, gIdx)"
                    />
                  </v-chip>

                  <!-- + Add Gift Quick Button -->
                  <v-chip
                    size="x-small"
                    variant="outlined"
                    color="warning"
                    class="font-weight-medium cursor-pointer"
                    @click.stop="openQuickAddGift(guest)"
                  >
                    <v-icon icon="mdi-plus" size="11" class="mr-0.5" />
                    Add Gift
                  </v-chip>
                </div>

                <!-- Return Gift Handed Over / Given Switch Row -->
                <div
                  v-if="guest.returnGifts && guest.returnGifts.length > 0"
                  class="d-flex align-center justify-space-between mt-1.5 cursor-pointer"
                  @click.stop="guestsStore.toggleReturnGiftGiven(guest.id)"
                >
                  <div class="d-flex align-center">
                    <v-icon
                      :icon="guest.returnGiftGiven ? 'mdi-gift-check' : 'mdi-gift-outline'"
                      :color="guest.returnGiftGiven ? 'success' : 'lightText'"
                      class="mr-1"
                      size="14"
                    />
                    <span
                      class="font-weight-regular"
                      style="font-size: 0.7rem; line-height: 1.2;"
                      :class="guest.returnGiftGiven ? 'text-success' : 'text-darkText'"
                    >
                      {{ guest.returnGiftGiven ? 'Return Gift Handed Over ✓' : 'Mark Return Gift Handed Over' }}
                    </span>
                  </div>
                  <v-switch
                    :model-value="Boolean(guest.returnGiftGiven)"
                    color="success"
                    density="compact"
                    hide-details
                    @click.stop
                    @update:model-value="guestsStore.toggleReturnGiftGiven(guest.id)"
                  />
                </div>

                <!-- Expandable Details (Phone, Email, Notes, Full Addon Management) -->
                <v-expand-transition>
                  <div v-if="isGuestExpanded(guest.id)" class="expand-wrapper">
                    <div class="mt-2 pt-2 border-t">
                      <!-- Phone Contact -->
                      <div v-if="guest.phone" class="d-flex align-center gap-1 text-lightText mb-1">
                        <v-icon icon="mdi-phone" size="14" class="text-primary flex-shrink-0" />
                        <span class="text-caption font-weight-medium text-darkText">Phone:</span>
                        <a :href="`tel:${guest.phone}`" class="text-primary font-weight-bold text-caption text-decoration-none" @click.stop>
                          {{ guest.phone }}
                        </a>
                      </div>

                      <!-- Email Contact -->
                      <div v-if="guest.email" class="d-flex align-center gap-1 text-lightText mb-1">
                        <v-icon icon="mdi-email-outline" size="14" class="text-secondary flex-shrink-0" />
                        <span class="text-caption font-weight-medium text-darkText">Email:</span>
                        <a :href="`mailto:${guest.email}`" class="text-darkText text-caption text-decoration-none" @click.stop>
                          {{ guest.email }}
                        </a>
                      </div>

                      <!-- Notes -->
                      <div v-if="guest.notes" class="pa-2 rounded-md bg-containerBg mt-1 text-caption text-darkText font-italic">
                        <v-icon icon="mdi-note-text-outline" size="13" class="text-lightText mr-1" />
                        {{ guest.notes }}
                      </div>

                      <!-- Quick Inline Add Person / Edit CTA -->
                      <div class="mt-2 d-flex align-center gap-2">
                        <v-btn
                          size="x-small"
                          variant="tonal"
                          color="primary"
                          prepend-icon="mdi-account-edit"
                          class="text-capitalize rounded-md"
                          @click.stop="openEditGuestDialog(guest)"
                        >
                          Edit Guest &amp; Addons
                        </v-btn>
                        <v-btn
                          size="x-small"
                          variant="tonal"
                          color="warning"
                          prepend-icon="mdi-gift-outline"
                          class="text-capitalize rounded-md"
                          @click.stop="openQuickAddGift(guest)"
                        >
                          + Add Return Gift
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </v-expand-transition>
              </div>
            </div>

            <!-- Right Side Action Menu -->
            <div class="text-right ml-2 flex-shrink-0" @click.stop>
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
                    prepend-icon="mdi-pencil-outline"
                    title="Edit Guest & Addons"
                    @click="openEditGuestDialog(guest)"
                  />
                  <v-list-item
                    prepend-icon="mdi-gift-outline"
                    title="Add Return Gift"
                    @click="openQuickAddGift(guest)"
                  />
                  <v-list-item
                    :prepend-icon="guest.rsvpStatus === 'confirmed' ? 'mdi-clock-outline' : 'mdi-check-circle-outline'"
                    :title="guest.rsvpStatus === 'confirmed' ? 'Mark Pending' : 'Mark Confirmed'"
                    @click="toggleGuestRsvp(guest)"
                  />
                  <v-divider class="my-1" />
                  <v-list-item
                    prepend-icon="mdi-delete-outline"
                    title="Delete Guest"
                    class="text-error"
                    @click="confirmDeleteGuest(guest)"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-card>
      </v-slide-y-transition>
    </div>

    <!-- 5. VIEW B: Grouped by Tag View (Tagging Feature for Grouping) -->
    <div v-else-if="guestsStore.viewMode === 'grouped_by_tag'">
      <div
        v-for="tagGroup in guestsStore.guestsGroupedByTag"
        :key="tagGroup.tag"
        class="mb-4"
      >
        <!-- Tag Header Bar -->
        <div class="d-flex align-center justify-space-between mb-2 px-1">
          <div class="d-flex align-center gap-2">
            <v-chip color="primary" variant="flat" size="small" class="font-weight-bold">
              <v-icon icon="mdi-tag" size="12" class="mr-1" />
              #{{ tagGroup.tag }}
            </v-chip>
            <span class="text-caption font-weight-bold text-darkText">
              {{ tagGroup.count }} {{ tagGroup.count === 1 ? 'Guest' : 'Guests' }}
            </span>
          </div>
          <span class="text-caption text-lightText font-weight-medium">
            {{ tagGroup.totalParty }} Total Heads
          </span>
        </div>

        <!-- Tag Guest Cards -->
        <v-card
          v-for="guest in tagGroup.guests"
          :key="guest.id"
          :ripple="false"
          variant="outlined"
          elevation="0"
          class="mb-2 pa-3 rounded-lg bg-surface card-hover-border"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2" style="min-width: 0;">
              <v-avatar color="primary" variant="tonal" size="28" rounded="md" class="font-weight-bold" style="font-size: 0.68rem;">
                {{ getInitials(guest.name) }}
              </v-avatar>
              <div class="text-truncate">
                <div class="text-subtitle-2 font-weight-bold text-darkText text-truncate">
                  {{ guest.name }}
                  <span class="text-primary font-weight-bold ml-1">+{{ guest.additionalGuests || 0 }}</span>
                </div>
                <div class="text-caption text-lightText d-flex align-center gap-1 flex-wrap">
                  <span>{{ guest.group }}</span>
                  <span>•</span>
                  <span :class="getRsvpTextColor(guest.rsvpStatus)" class="font-weight-medium text-capitalize">
                    {{ guest.rsvpStatus }}
                  </span>
                  <span v-if="guest.returnGifts && guest.returnGifts.length > 0">
                    • <v-icon icon="mdi-gift" size="11" class="text-warning mr-0.5" />{{ guest.returnGifts.length }} gifts
                  </span>
                </div>
              </div>
            </div>

            <!-- Edit, Gift & Delete Quick Icons -->
            <div class="d-flex align-center" @click.stop>
              <v-btn icon="mdi-gift-outline" variant="text" size="small" color="warning" title="Add Return Gift" @click="openQuickAddGift(guest)" />
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" @click="openEditGuestDialog(guest)" />
              <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDeleteGuest(guest)" />
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- 6. VIEW C: Grouped by Category View -->
    <div v-else-if="guestsStore.viewMode === 'grouped_by_category'">
      <div
        v-for="catGroup in guestsStore.guestsGroupedByCategory"
        :key="catGroup.group"
        class="mb-4"
      >
        <!-- Category Header Bar -->
        <div class="d-flex align-center justify-space-between mb-2 px-1">
          <div class="d-flex align-center gap-2">
            <v-chip color="secondary" variant="flat" size="small" class="font-weight-bold">
              <v-icon :icon="getGuestGroupIcon(catGroup.group)" size="12" class="mr-1" />
              {{ catGroup.group }}
            </v-chip>
            <span class="text-caption font-weight-bold text-darkText">
              {{ catGroup.count }} {{ catGroup.count === 1 ? 'Guest' : 'Guests' }}
            </span>
          </div>
          <span class="text-caption text-lightText font-weight-medium">
            {{ catGroup.totalParty }} Total Heads
          </span>
        </div>

        <!-- Category Guest Cards -->
        <v-card
          v-for="guest in catGroup.guests"
          :key="guest.id"
          :ripple="false"
          variant="outlined"
          elevation="0"
          class="mb-2 pa-3 rounded-lg bg-surface card-hover-border"
        >
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2" style="min-width: 0;">
              <v-avatar color="secondary" variant="tonal" size="28" rounded="md" class="font-weight-bold" style="font-size: 0.68rem;">
                {{ getInitials(guest.name) }}
              </v-avatar>
              <div class="text-truncate">
                <div class="text-subtitle-2 font-weight-bold text-darkText text-truncate">
                  {{ guest.name }}
                  <span class="text-secondary font-weight-bold ml-1">+{{ guest.additionalGuests || 0 }}</span>
                </div>
                <div class="text-caption text-lightText d-flex align-center gap-1 flex-wrap">
                  <span :class="getRsvpTextColor(guest.rsvpStatus)" class="font-weight-medium text-capitalize">
                    {{ guest.rsvpStatus }}
                  </span>
                  <span v-if="guest.returnGifts && guest.returnGifts.length > 0">
                    • <v-icon icon="mdi-gift" size="11" class="text-warning mr-0.5" />{{ guest.returnGifts.length }} gifts
                  </span>
                  <span v-if="guest.tags && guest.tags.length > 0">
                    • {{ guest.tags.map(t => '#' + t).join(', ') }}
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex align-center" @click.stop>
              <v-btn icon="mdi-gift-outline" variant="text" size="small" color="warning" title="Add Return Gift" @click="openQuickAddGift(guest)" />
              <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="primary" @click="openEditGuestDialog(guest)" />
              <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="confirmDeleteGuest(guest)" />
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 7. ADD / EDIT GUEST MODAL DIALOG                                 -->
    <!-- ================================================================= -->
    <v-dialog v-model="guestDialog" max-width="580" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="tonal" size="34" class="mr-3">
              <v-icon :icon="isEditing ? 'mdi-account-edit' : 'mdi-account-plus'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditing ? 'Edit Guest & Details' : 'Add New Guest' }}
              </div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="guestDialog = false"
          />
        </v-card-title>

        <v-divider />

        <!-- Form Body -->
        <v-card-text class="pa-4" style="max-height: 75vh;">
          <v-form ref="guestFormRef" @submit.prevent="saveGuest">
            <!-- SECTION 1: GUEST NAME WITH AUTOCOMPLETE / AUTO-CORRECT -->
            <div class="mb-3">
              
              <v-combobox
                v-model="guestForm.name"
                :items="guestsStore.knownGuestNames"
                label="Guest / Family Name *"
                placeholder="Type or select guest name (e.g. Vikram Sharma)"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-account"
                clearable
                :rules="[(v) => !!(typeof v === 'string' ? v.trim() : v) || 'Guest name is required']"
                @update:model-value="onGuestNameChange"
              >
                <template #prepend-item>
                  <div class="px-3 py-1 text-caption text-lightText font-weight-bold border-b bg-containerBg">
                    Saved Guests &amp; Contacts (Autocomplete)
                  </div>
                </template>
              </v-combobox>

              <!-- Quick Chip Suggestions for 1-Tap Fill -->
              <div v-if="recentSuggestions.length > 0" class="d-flex align-center gap-1 flex-wrap mt-1">
                <span class="text-caption text-lightText" style="font-size: 0.68rem;">Suggestions:</span>
                <v-chip
                  v-for="name in recentSuggestions"
                  :key="name"
                  size="x-small"
                  variant="tonal"
                  color="primary"
                  class="cursor-pointer"
                  @click="guestForm.name = name; onGuestNameChange(name)"
                >
                  {{ name }}
                </v-chip>
              </div>
            </div>

            <!-- SECTION 2: ADDON PERSONS (Accompanying / Companions) -->
            <div class="mb-4 pa-3 rounded-lg bg-containerBg border">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center gap-1">
                  <v-icon icon="mdi-account-multiple-plus" size="18" class="text-primary" />
                  <span class="text-subtitle-2 font-weight-bold text-darkText">
                    Addons
                  </span>
                </div>

                <!-- Live Headcount Pill -->
                <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">
                  Party of {{ calculatedTotalParty }}
                </v-chip>
              </div>

              <!-- Quick Presets for Additional Guests -->
              <div class="d-flex align-center gap-1.5 flex-wrap mb-3">
                <span class="text-caption font-weight-medium text-darkText mr-1">Count:</span>
                <v-btn
                  v-for="cnt in [0, 1, 2, 3, 4, 5]"
                  :key="cnt"
                  size="x-small"
                  :variant="guestForm.additionalGuests === cnt ? 'flat' : 'outlined'"
                  :color="guestForm.additionalGuests === cnt ? 'primary' : 'secondary'"
                  rounded="md"
                  class="font-weight-bold"
                  @click="setAdditionalCount(cnt)"
                >
                  {{ cnt === 0 ? 'Solo (+0)' : `+${cnt}` }}
                </v-btn>
              </div>

              <!-- Dynamic Addon Persons List -->
              <div
                v-for="(person, pIdx) in guestForm.accompanyingPersons"
                :key="pIdx"
                class="d-flex align-center gap-2 mb-2 pa-2 rounded-lg bg-surface border"
              >
                <!-- Addon Person Name (with Autocomplete) -->
                <v-combobox
                  v-model="person.name"
                  :items="guestsStore.knownGuestNames"
                  :label="`Addon Person #${pIdx + 1} Name`"
                  placeholder="e.g. Ananya Sharma"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                  class="flex-grow-1"
                />

                <!-- Relation Selector -->
                <v-combobox
                  v-model="person.relation"
                  :items="['Spouse', 'Child', 'Parent', 'Sibling', 'Friend', 'Partner', 'Relative', 'Colleague']"
                  label="Relation"
                  placeholder="Relation"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                  style="max-width: 140px;"
                />

                <!-- Remove Row Button -->
                <v-btn
                  icon="mdi-trash-can-outline"
                  variant="text"
                  color="error"
                  size="small"
                  title="Remove addon person"
                  @click="removeAccompanyingPerson(pIdx)"
                />
              </div>

              <!-- Button to Add Another Addon Person -->
              <v-btn
                variant="tonal"
                color="primary"
                size="small"
                block
                rounded="lg"
                prepend-icon="mdi-plus"
                class="font-weight-bold text-capitalize mt-2"
                @click="addAccompanyingPerson"
              >
                + Add Addon Person
              </v-btn>
            </div>

            <!-- SECTION 3: RETURN GIFTS (1 or more gifts same as tags) -->
            <div class="mb-4 pa-3 rounded-lg bg-containerBg border">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="d-flex align-center gap-1">
                  <v-icon icon="mdi-gift-outline" size="18" class="text-warning" />
                  <span class="text-subtitle-2 font-weight-bold text-darkText">
                    Return Gifts ({{ guestForm.returnGifts.length }})
                  </span>
                </div>

                <!-- Live Total Value Badge -->
                <v-chip size="x-small" color="warning" variant="flat" class="font-weight-bold">
                  Total: ₹{{ formReturnGiftsTotal.toLocaleString() }}
                </v-chip>
              </div>

              <div class="text-caption text-lightText mb-2">
                Guest can have 1 or more return gifts (same as tags). Click presets or add custom.
              </div>

              <!-- Quick 1-Tap Preset Gifts (Just like Quick Tags!) -->
              <div class="mb-3">
                <div class="text-caption font-weight-medium text-darkText mb-1" style="font-size: 0.72rem;">
                  Quick Add Preset Gifts:
                </div>
                <div class="d-flex align-center gap-1 flex-wrap">
                  <v-chip
                    v-for="preset in guestsStore.defaultGiftPresets"
                    :key="preset.name"
                    size="x-small"
                    variant="tonal"
                    color="warning"
                    class="cursor-pointer font-weight-medium"
                    @click="addPresetGiftToForm(preset)"
                  >
                    <v-icon icon="mdi-plus" size="10" class="mr-0.5" />
                    {{ preset.name }} (₹{{ preset.price }})
                  </v-chip>
                </div>
              </div>

              <!-- List of Added Return Gifts -->
              <div
                v-for="(gift, gIdx) in guestForm.returnGifts"
                :key="gIdx"
                class="d-flex align-center gap-2 mb-2 pa-2 rounded-lg bg-surface border"
              >
                <!-- Gift Name with Autocomplete from Known Gifts -->
                <v-combobox
                  v-model="gift.name"
                  :items="guestsStore.knownGiftNames"
                  :label="`Gift #${gIdx + 1} Name`"
                  placeholder="e.g. Silver Coin (10g)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                  class="flex-grow-1"
                />

                <!-- Price Field -->
                <v-text-field
                  v-model.number="gift.price"
                  label="Price (₹)"
                  placeholder="0"
                  type="number"
                  min="0"
                  step="50"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                  style="max-width: 130px;"
                  prepend-inner-icon="mdi-currency-inr"
                />

                <!-- Remove Gift Button -->
                <v-btn
                  icon="mdi-trash-can-outline"
                  variant="text"
                  color="error"
                  size="small"
                  title="Remove gift"
                  @click="removeGiftFromForm(gIdx)"
                />
              </div>

              <!-- Add Custom Gift Button -->
              <v-btn
                variant="tonal"
                color="warning"
                size="small"
                block
                rounded="lg"
                prepend-icon="mdi-plus"
                class="font-weight-bold text-capitalize mt-2"
                @click="addBlankGiftToForm"
              >
                + Add Return Gift
              </v-btn>
            </div>

            <!-- SECTION 4: TAGGING FEATURE FOR GROUPING -->
            <div class="mb-4">
              <div class="text-subtitle-2 font-weight-bold text-darkText mb-2 d-flex align-center">
                <v-icon icon="mdi-tag-multiple-outline" size="18" class="mr-1 text-primary" />
                Group Category &amp; Tags
              </div>

              <v-row density="compact">
                <!-- Group Category -->
                <v-col cols="12" sm="6">
                  <v-combobox
                    v-model="guestForm.group"
                    :items="guestsStore.allGroups"
                    label="Group Category *"
                    placeholder="Select or type category"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-folder-outline"
                    :rules="[(v) => !!v || 'Group category is required']"
                  />
                </v-col>

                <!-- RSVP Status -->
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="guestForm.rsvpStatus"
                    :items="[
                      { title: 'Confirmed', value: 'confirmed' },
                      { title: 'Pending', value: 'pending' },
                      { title: 'Declined', value: 'declined' },
                    ]"
                    item-title="title"
                    item-value="value"
                    label="RSVP Status *"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    prepend-inner-icon="mdi-check-circle-outline"
                  />
                </v-col>
              </v-row>

              <!-- Tags Multi-Selector (Custom Tagging feature) -->
              <div class="mt-1">
                <v-combobox
                  v-model="guestForm.tags"
                  :items="guestsStore.allTags"
                  label="Tags for Grouping (Type & press Enter for custom tags)"
                  placeholder="Select tags or type custom (e.g. VIP, Outstation)"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  prepend-inner-icon="mdi-tag-outline"
                />

                <!-- Quick Suggested Tag Toggles -->
                <div class="d-flex align-center gap-1 flex-wrap mt-1">
                  <span class="text-caption text-lightText" style="font-size: 0.68rem;">Quick Tags:</span>
                  <v-chip
                    v-for="tag in ['VIP', 'Family Event', 'Friends', 'Outstation', 'Vegetarian', 'Hotel Needed', 'College']"
                    :key="tag"
                    size="x-small"
                    :variant="isTagInForm(tag) ? 'flat' : 'outlined'"
                    color="primary"
                    class="cursor-pointer"
                    @click="toggleFormTag(tag)"
                  >
                    <v-icon :icon="isTagInForm(tag) ? 'mdi-check' : 'mdi-plus'" size="10" class="mr-0.5" />
                    {{ tag }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- SECTION 5: CONTACT & NOTES (Optional) -->
            <v-expansion-panels variant="accordion" class="mb-2">
              <v-expansion-panel elevation="0" class="border rounded-lg">
                <v-expansion-panel-title class="py-2 text-caption font-weight-bold text-darkText">
                  <v-icon icon="mdi-card-account-phone-outline" size="16" class="mr-2 text-primary" />
                  Additional Details (Phone, Email, Notes)
                </v-expansion-panel-title>
                <v-expansion-panel-text eager>
                  <v-row density="compact" class="pt-2">
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="guestForm.phone"
                        label="Phone Number"
                        placeholder="+91 98765 43210"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        prepend-inner-icon="mdi-phone"
                      />
                    </v-col>

                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="guestForm.email"
                        label="Email Address"
                        placeholder="guest@example.com"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        prepend-inner-icon="mdi-email-outline"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-textarea
                        v-model="guestForm.notes"
                        label="Notes &amp; Special Arrangements"
                        placeholder="e.g. Arriving Friday evening, requires ground-floor room"
                        variant="outlined"
                        density="comfortable"
                        rows="2"
                        rounded="lg"
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Dialog Footer Actions -->
        <v-card-actions class="pa-4 bg-surface d-flex justify-space-between">
          <v-btn
            variant="outlined"
            rounded="lg"
            color="secondary"
            class="text-capitalize"
            @click="guestDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            class="text-capitalize font-weight-bold px-4"
            prepend-icon="mdi-content-save"
            @click="saveGuest"
          >
            {{ isEditing ? 'Save Changes' : 'Add Guest' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ================================================================= -->
    <!-- 8. QUICK ADD RETURN GIFT MODAL (Inline from Card)                 -->
    <!-- ================================================================= -->
    <v-dialog v-model="quickAddGiftDialog" max-width="480">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="d-flex align-center justify-space-between pt-4 px-4">
          <div class="d-flex align-center">
            <v-avatar color="warning" variant="tonal" size="36" rounded="lg" class="mr-2">
              <v-icon icon="mdi-gift-outline" size="22" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold text-darkText">Add Return Gift</div>
              <div class="text-caption text-lightText font-weight-medium">
                For: <span class="text-primary font-weight-bold">{{ targetGuestForGift?.name }}</span>
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="quickAddGiftDialog = false" />
        </v-card-title>

        <v-card-text class="px-4 py-2">
          <!-- Presets for 1-Tap Addition -->
          <div class="text-caption font-weight-bold text-darkText mb-1.5">
            Quick Add from Presets (1 Tap):
          </div>
          <div class="d-flex align-center gap-1.5 flex-wrap mb-3">
            <v-chip
              v-for="preset in guestsStore.defaultGiftPresets"
              :key="preset.name"
              size="small"
              variant="tonal"
              color="warning"
              class="cursor-pointer font-weight-medium"
              @click="assignPresetGiftToTarget(preset)"
            >
              <v-icon icon="mdi-plus" size="12" class="mr-1" />
              {{ preset.name }} (₹{{ preset.price }})
            </v-chip>
          </div>

          <v-divider class="my-3" />

          <!-- Custom Gift Form -->
          <div class="text-caption font-weight-bold text-darkText mb-2">
            Or Type Custom Return Gift:
          </div>
          <v-combobox
            v-model="quickGiftForm.name"
            :items="guestsStore.knownGiftNames"
            label="Gift Name *"
            placeholder="e.g. Royal Mithai Box"
            variant="outlined"
            density="comfortable"
            rounded="md"
            class="mb-2"
          />
          <v-text-field
            v-model.number="quickGiftForm.price"
            label="Price (₹)"
            placeholder="0"
            type="number"
            min="0"
            step="50"
            variant="outlined"
            density="comfortable"
            rounded="md"
            prepend-inner-icon="mdi-currency-inr"
          />
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-1 d-flex justify-end gap-2">
          <v-btn variant="outlined" rounded="lg" color="secondary" @click="quickAddGiftDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            rounded="lg"
            class="font-weight-bold text-capitalize"
            prepend-icon="mdi-gift-outline"
            :disabled="!quickGiftForm.name || !quickGiftForm.name.trim()"
            @click="saveQuickCustomGift"
          >
            Add Gift
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 9. DELETE CONFIRMATION DIALOG -->
    <v-dialog v-model="deleteConfirmDialog" max-width="400">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="d-flex align-center pt-4 px-4">
          <v-avatar color="error" variant="tonal" size="36" rounded="lg" class="mr-2">
            <v-icon icon="mdi-alert-outline" size="20" />
          </v-avatar>
          <span class="text-subtitle-1 font-weight-bold text-darkText">Delete Guest?</span>
        </v-card-title>
        <v-card-text class="px-4 py-2 text-body-2 text-lightText">
          Are you sure you want to remove <strong>{{ guestToDelete?.name }}</strong>? This will remove all addon persons and details.
        </v-card-text>
        <v-card-actions class="px-4 pb-4 pt-2 d-flex justify-end gap-2">
          <v-btn variant="outlined" rounded="lg" color="secondary" @click="deleteConfirmDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" variant="flat" rounded="lg" class="font-weight-bold" @click="executeDeleteGuest">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGuestsStore } from '@/stores/guests'
import { useModalBack } from '@/composables/useModalBack'
import type { GuestItem, AccompanyingPerson, ReturnGift, RsvpStatus } from '@/types'
import {
  getInitials,
  getRsvpColor,
  getRsvpIcon,
  getGuestGroupIcon,
  createDefaultGuestForm,
  createEditGuestForm,
  syncAccompanyingPersons,
  sanitizeAccompanyingPersons,
  sanitizeReturnGifts,
  calculateGuestGiftsTotal,
} from '@/services/service.js'

const guestsStore = useGuestsStore()

// Collapsible filter panel state & helpers (matching ShoppingList pattern)
const showFiltersPanel = ref(false)

const hasActiveFilters = computed(() => {
  return (
    guestsStore.activeFiltersCount > 0 ||
    !!guestsStore.searchQuery.trim()
  )
})

const filterSummary = computed(() => {
  const parts: string[] = []
  if (guestsStore.searchQuery.trim()) parts.push(`Query: "${guestsStore.searchQuery.trim()}"`)
  if (guestsStore.selectedGroup !== 'all') parts.push(`Group: ${guestsStore.selectedGroup}`)
  if (guestsStore.selectedTags.length > 0) {
    parts.push(`Tags: ${guestsStore.selectedTags.map((t) => '#' + t).join(', ')}`)
  } else if (guestsStore.selectedTag) {
    parts.push(`Tag: #${guestsStore.selectedTag}`)
  }
  if (guestsStore.giftFilter !== 'all') {
    parts.push(guestsStore.giftFilter === 'with_gift' ? 'Has Gifts' : 'No Gifts')
  }
  if (guestsStore.selectedGiftName) {
    parts.push(`Gift: ${guestsStore.selectedGiftName}`)
  }
  if (guestsStore.selectedRsvp !== 'all') {
    parts.push(`RSVP: ${guestsStore.selectedRsvp}`)
  }
  return parts.length > 0 ? parts.join(' • ') : 'Showing all guests'
})

function resetFilters() {
  guestsStore.resetAllFilters()
}

const listHeaderTitle = computed(() => {
  if (guestsStore.searchQuery.trim()) {
    return `Results for "${guestsStore.searchQuery.trim()}" (${guestsStore.filteredGuests.length})`
  }
  if (guestsStore.selectedTags.length > 0) {
    return `Tagged: ${guestsStore.selectedTags.map((t) => '#' + t).join(', ')} (${guestsStore.filteredGuests.length})`
  }
  if (guestsStore.selectedGroup !== 'all') {
    return `${guestsStore.selectedGroup} (${guestsStore.filteredGuests.length})`
  }
  if (guestsStore.selectedRsvp === 'confirmed') {
    return `Confirmed Guests (${guestsStore.filteredGuests.length})`
  }
  if (guestsStore.selectedRsvp === 'pending') {
    return `Pending RSVPs (${guestsStore.filteredGuests.length})`
  }
  if (guestsStore.giftFilter === 'with_gift') {
    return `Guests with Gifts (${guestsStore.filteredGuests.length})`
  }
  return `All Guests (${guestsStore.filteredGuests.length})`
})

const currentSortLabel = computed(() => {
  switch (guestsStore.sortBy) {
    case 'name':
      return 'Name (A-Z)'
    case 'party-desc':
      return 'Party Size'
    default:
      return 'Newest'
  }
})

// View toggles
const showAllDetails = ref(false)
const expandedGuestIds = ref<Set<string>>(new Set())

function toggleGuestExpand(id: string) {
  const next = new Set(expandedGuestIds.value)
  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }
  expandedGuestIds.value = next
}

function isGuestExpanded(id: string) {
  return showAllDetails.value || expandedGuestIds.value.has(id)
}

const totalAddonPersonsCount = computed(() => {
  return guestsStore.guests.reduce((sum, g) => sum + (Number(g.additionalGuests) || 0), 0)
})

const viewModeLabel = computed(() => {
  switch (guestsStore.viewMode) {
    case 'grouped_by_tag':
      return 'Grouped by Tag'
    case 'grouped_by_category':
      return 'Grouped by Category'
    default:
      return 'Flat Cards'
  }
})

const viewModeIcon = computed(() => {
  switch (guestsStore.viewMode) {
    case 'grouped_by_tag':
      return 'mdi-tag-multiple-outline'
    case 'grouped_by_category':
      return 'mdi-folder-outline'
    default:
      return 'mdi-view-headline'
  }
})

function isTagSelected(tag: string) {
  return guestsStore.selectedTags.includes(tag) || guestsStore.selectedTag === tag
}

function getRsvpTextColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'text-success'
    case 'pending':
      return 'text-warning'
    case 'declined':
      return 'text-error'
    default:
      return 'text-lightText'
  }
}

// ============================================================================
// Form Dialog State
// ============================================================================
const guestDialog = ref(false)
const deleteConfirmDialog = ref(false)
const quickAddGiftDialog = ref(false)
const isEditing = ref(false)
const editingGuestId = ref<string | null>(null)
const guestToDelete = ref<GuestItem | null>(null)
const targetGuestForGift = ref<GuestItem | null>(null)
const guestFormRef = ref<any>(null)

useModalBack(guestDialog, 'guestFormModal')
useModalBack(deleteConfirmDialog, 'deleteGuestModal')
useModalBack(quickAddGiftDialog, 'quickAddGiftModal')

const guestForm = ref({
  name: '',
  phone: '',
  email: '',
  group: 'Family',
  tags: [] as string[],
  rsvpStatus: 'confirmed' as RsvpStatus,
  additionalGuests: 0,
  accompanyingPersons: [] as AccompanyingPerson[],
  returnGifts: [] as ReturnGift[],
  notes: '',
})

const quickGiftForm = ref({
  name: '',
  price: 0,
})

const calculatedTotalParty = computed(() => {
  return (Number(guestForm.value.additionalGuests) || 0) + 1
})

const formReturnGiftsTotal = computed(() => {
  return calculateGuestGiftsTotal(guestForm.value.returnGifts)
})

const recentSuggestions = computed(() => {
  return guestsStore.knownGuestNames.slice(0, 5)
})

function onGuestNameChange(val: string) {
  if (!val || typeof val !== 'string') return
  const trimmed = val.trim().toLowerCase()
  // Check if there is an existing guest with this name to offer helpful pre-fill
  const match = guestsStore.guests.find((g) => g.name.toLowerCase() === trimmed)
  if (match && !isEditing.value) {
    if (match.group) guestForm.value.group = match.group
    if (Array.isArray(match.tags) && match.tags.length > 0) guestForm.value.tags = [...match.tags]
    if (match.phone && !guestForm.value.phone) guestForm.value.phone = match.phone
    if (Array.isArray(match.returnGifts) && match.returnGifts.length > 0 && guestForm.value.returnGifts.length === 0) {
      guestForm.value.returnGifts = match.returnGifts.map((g) => ({ ...g }))
    }
  }
}

function isTagInForm(tag: string) {
  return Array.isArray(guestForm.value.tags) && guestForm.value.tags.includes(tag)
}

function toggleFormTag(tag: string) {
  if (!Array.isArray(guestForm.value.tags)) {
    guestForm.value.tags = []
  }
  const idx = guestForm.value.tags.indexOf(tag)
  if (idx === -1) {
    guestForm.value.tags.push(tag)
  } else {
    guestForm.value.tags.splice(idx, 1)
  }
}

// ============================================================================
// Accompanying / Addon Persons Helpers
// ============================================================================
function setAdditionalCount(count: number) {
  guestForm.value.additionalGuests = count
  guestForm.value.accompanyingPersons = syncAccompanyingPersons(
    guestForm.value.accompanyingPersons,
    count
  )
}

function addAccompanyingPerson() {
  guestForm.value.accompanyingPersons.push({
    name: '',
    relation: guestForm.value.accompanyingPersons.length === 0 ? 'Spouse' : 'Child',
  })
  guestForm.value.additionalGuests = guestForm.value.accompanyingPersons.length
}

function removeAccompanyingPerson(index: number) {
  guestForm.value.accompanyingPersons.splice(index, 1)
  guestForm.value.additionalGuests = guestForm.value.accompanyingPersons.length
}

// ============================================================================
// Return Gifts Helpers
// ============================================================================
function addPresetGiftToForm(preset: { name: string; price: number }) {
  guestForm.value.returnGifts.push({
    name: preset.name,
    price: preset.price,
  })
}

function addBlankGiftToForm() {
  guestForm.value.returnGifts.push({
    name: '',
    price: 0,
  })
}

function removeGiftFromForm(index: number) {
  guestForm.value.returnGifts.splice(index, 1)
}

// Quick Add Gift directly on any Guest Card
function openQuickAddGift(guest: GuestItem) {
  targetGuestForGift.value = guest
  quickGiftForm.value = {
    name: '',
    price: 0,
  }
  quickAddGiftDialog.value = true
}

async function assignPresetGiftToTarget(preset: { name: string; price: number }) {
  if (!targetGuestForGift.value) return
  await guestsStore.addReturnGiftToGuest(targetGuestForGift.value.id, {
    name: preset.name,
    price: preset.price,
  })
  quickAddGiftDialog.value = false
}

async function saveQuickCustomGift() {
  if (!targetGuestForGift.value || !quickGiftForm.value.name) return
  await guestsStore.addReturnGiftToGuest(targetGuestForGift.value.id, {
    name: quickGiftForm.value.name.trim(),
    price: Number(quickGiftForm.value.price) || 0,
  })
  quickAddGiftDialog.value = false
}

async function removeGuestGift(guestId: string, giftIndex: number) {
  await guestsStore.removeReturnGiftFromGuest(guestId, giftIndex)
}

// ============================================================================
// Open Add / Edit Dialogs
// ============================================================================
function openAddGuestDialog() {
  isEditing.value = false
  editingGuestId.value = null
  guestForm.value = {
    name: '',
    phone: '',
    email: '',
    group: 'Family',
    tags: ['Family Event'],
    rsvpStatus: 'confirmed',
    additionalGuests: 0,
    accompanyingPersons: [],
    returnGifts: [],
    notes: '',
  }
  guestDialog.value = true
}

function openEditGuestDialog(guest: GuestItem) {
  isEditing.value = true
  editingGuestId.value = guest.id
  const editData = createEditGuestForm(guest)
  guestForm.value = {
    name: editData.name,
    phone: editData.phone,
    email: editData.email,
    group: editData.group || 'Family',
    tags: Array.isArray(editData.tags) ? [...editData.tags] : [],
    rsvpStatus: editData.rsvpStatus || 'confirmed',
    additionalGuests: editData.additionalGuests || 0,
    accompanyingPersons: Array.isArray(editData.accompanyingPersons)
      ? editData.accompanyingPersons.map((p) => ({ ...p }))
      : [],
    returnGifts: Array.isArray(editData.returnGifts) ? [...editData.returnGifts] : [],
    notes: editData.notes || '',
  }
  guestDialog.value = true
}

async function saveGuest() {
  const formValidation = await guestFormRef.value?.validate()
  if (formValidation && !formValidation.valid) {
    return
  }

  const sanitizedCompanions = sanitizeAccompanyingPersons(guestForm.value.accompanyingPersons)
  const sanitizedGifts = sanitizeReturnGifts(guestForm.value.returnGifts)
  const additionalCount = Math.max(
    Number(guestForm.value.additionalGuests) || 0,
    sanitizedCompanions.length
  )

  const rawName = guestForm.value.name
  const cleanName = (typeof rawName === 'string' ? rawName : (rawName as any)?.value || '').trim()

  const payload = {
    name: cleanName,
    phone: (guestForm.value.phone || '').trim(),
    email: (guestForm.value.email || '').trim(),
    group: guestForm.value.group || 'General',
    tags: Array.isArray(guestForm.value.tags)
      ? guestForm.value.tags.map((t) => (typeof t === 'string' ? t.trim() : (t as any).value || '')).filter(Boolean)
      : [],
    rsvpStatus: guestForm.value.rsvpStatus || 'confirmed',
    additionalGuests: additionalCount,
    accompanyingPersons: sanitizedCompanions,
    returnGifts: sanitizedGifts,
    notes: (guestForm.value.notes || '').trim(),
  }

  if (isEditing.value && editingGuestId.value) {
    await guestsStore.updateGuest(editingGuestId.value, payload)
  } else {
    await guestsStore.addGuest(payload)
  }

  guestDialog.value = false
}

async function toggleGuestRsvp(guest: GuestItem) {
  const nextStatus: RsvpStatus = guest.rsvpStatus === 'confirmed' ? 'pending' : 'confirmed'
  await guestsStore.updateGuest(guest.id, { rsvpStatus: nextStatus })
}

function confirmDeleteGuest(guest: GuestItem) {
  guestToDelete.value = guest
  deleteConfirmDialog.value = true
}

async function executeDeleteGuest() {
  if (guestToDelete.value) {
    await guestsStore.deleteGuest(guestToDelete.value.id)
    guestToDelete.value = null
  }
  deleteConfirmDialog.value = false
}
</script>
