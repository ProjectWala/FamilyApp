<template>
  <div class="guests-component" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <!-- Header Summary Card with Royal Event Gradient -->
    <v-card class="mb-4 rounded-lg elevation-0 overflow-hidden bg-surface card-hover-border border">
      <!-- Gradient Header Bar -->
      <div
        class="pa-4 text-white position-relative"
        style="background: linear-gradient(135deg, #722ed1 0%, #1677ff 100%);"
      >
        <div class="d-flex justify-space-between align-center flex-wrap gap-2">
          <div class="d-flex align-center gap-2">
            <v-avatar color="white" variant="tonal" size="38" rounded="lg">
              <v-icon icon="mdi-account-multiple-check-outline" size="22" color="white" />
            </v-avatar>
            <div>
              <span class="text-caption text-white-75 text-uppercase font-weight-bold">Guest Directory</span>
              <div class="text-h6 font-weight-bold text-white line-height-1">
                {{ guestsStore.totalGuests }} Invitations • {{ guestsStore.totalPartyCount }} Total Heads
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
            Add New Guest
          </v-btn>
        </div>
      </div>

      <!-- Quick Stats Metric Pills -->
      <div class="pa-4">
        <v-row density="compact">
          <!-- Total Party Count (+1, +2 included) -->
          <v-col cols="6" sm="3">
            <div class="pa-2 px-3 rounded-lg bg-lightprimary border border-primary-subtle d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-lightText font-weight-medium">Attending</div>
                <div class="text-subtitle-1 font-weight-bold text-primary">
                  {{ guestsStore.totalConfirmedParty }} <span class="text-caption font-weight-regular text-lightText">persons</span>
                </div>
              </div>
              <v-avatar color="primary" variant="tonal" size="32" rounded="md">
                <v-icon icon="mdi-account-group" size="18" />
              </v-avatar>
            </div>
          </v-col>

          <!-- Confirmed RSVPs -->
          <v-col cols="6" sm="3">
            <div class="pa-2 px-3 rounded-lg bg-lightsuccess border border-success-subtle d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-lightText font-weight-medium">Confirmed</div>
                <div class="text-subtitle-1 font-weight-bold text-success">
                  {{ guestsStore.confirmedCount }} <span class="text-caption font-weight-regular text-lightText">guests</span>
                </div>
              </div>
              <v-avatar color="success" variant="tonal" size="32" rounded="md">
                <v-icon icon="mdi-check-decagram" size="18" />
              </v-avatar>
            </div>
          </v-col>

          <!-- Return Gifts Count -->
          <v-col cols="6" sm="3">
            <div class="pa-2 px-3 rounded-lg bg-lightwarning border border-warning-subtle d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-lightText font-weight-medium">Return Gifts</div>
                <div class="text-subtitle-1 font-weight-bold text-warning">
                  {{ guestsStore.totalReturnGiftsCount }} <span class="text-caption font-weight-regular text-lightText">items</span>
                </div>
              </div>
              <v-avatar color="warning" variant="tonal" size="32" rounded="md">
                <v-icon icon="mdi-gift-outline" size="18" />
              </v-avatar>
            </div>
          </v-col>

          <!-- Return Gifts Total Cost -->
          <v-col cols="6" sm="3">
            <div class="pa-2 px-3 rounded-lg bg-lightsecondary border border-secondary-subtle d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-lightText font-weight-medium">Gift Budget</div>
                <div class="text-subtitle-1 font-weight-bold text-secondary">
                  ₹{{ guestsStore.totalReturnGiftsCost.toLocaleString() }}
                </div>
              </div>
              <v-avatar color="secondary" variant="tonal" size="32" rounded="md">
                <v-icon icon="mdi-currency-inr" size="18" />
              </v-avatar>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card>

    <!-- Search & Filters Card -->
    <v-card variant="outlined" elevation="0" class="mb-4 rounded-lg bg-surface pa-3">
      <!-- Search Input -->
      <v-text-field
        v-model="guestsStore.searchQuery"
        placeholder="Search guest name, phone, family members, or gifts..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        rounded="lg"
        class="mb-3"
      />

      <!-- Group Category Chips (Horizontal Scrollable) -->
      <div class="d-flex align-center gap-1 overflow-x-auto pb-1 mb-2 no-scrollbar">
        <v-chip
          :color="guestsStore.selectedGroup === 'all' ? 'primary' : undefined"
          :variant="guestsStore.selectedGroup === 'all' ? 'flat' : 'outlined'"
          size="small"
          class="font-weight-medium cursor-pointer flex-shrink-0"
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
          class="font-weight-medium cursor-pointer flex-shrink-0"
          @click="guestsStore.selectedGroup = grp"
        >
          <v-icon :icon="getGuestGroupIcon(grp)" size="14" class="mr-1" />
          {{ grp }}
          <span v-if="guestsStore.groupCountMap[grp]" class="ml-1 opacity-70">
            ({{ guestsStore.groupCountMap[grp] }})
          </span>
        </v-chip>
      </div>

      <!-- Secondary Filters: RSVP status, ShowDetails, and Filters & Tags button -->
      <div class="d-flex align-center justify-space-between flex-wrap gap-2 pt-2 border-t">
        <!-- RSVP Status filter -->
        <div class="d-flex align-center gap-1 flex-wrap">
          <span class="text-caption text-lightText font-weight-medium mr-1">RSVP:</span>
          <v-chip
            size="x-small"
            :variant="guestsStore.selectedRsvp === 'all' ? 'flat' : 'tonal'"
            color="primary"
            class="cursor-pointer"
            @click="guestsStore.selectedRsvp = 'all'"
          >
            All
          </v-chip>
          <v-chip
            size="x-small"
            :variant="guestsStore.selectedRsvp === 'confirmed' ? 'flat' : 'tonal'"
            color="success"
            class="cursor-pointer"
            @click="guestsStore.selectedRsvp = 'confirmed'"
          >
            Confirmed ({{ guestsStore.confirmedCount }})
          </v-chip>
          <v-chip
            size="x-small"
            :variant="guestsStore.selectedRsvp === 'pending' ? 'flat' : 'tonal'"
            color="warning"
            class="cursor-pointer"
            @click="guestsStore.selectedRsvp = 'pending'"
          >
            Pending ({{ guestsStore.pendingCount }})
          </v-chip>
        </div>

        <!-- Action Controls: Show Details Toggle & Swipable Filters/Tags Sidebar Trigger -->
        <div class="d-flex align-center gap-1.5 flex-wrap">
          <!-- Toggle ShowDetails Button -->
          <v-btn
            size="x-small"
            :variant="showDetails ? 'flat' : 'outlined'"
            :color="showDetails ? 'primary' : 'secondary'"
            rounded="lg"
            class="text-capitalize font-weight-medium px-2"
            title="Toggle individual details (Phone, notes, tags)"
            @click="showDetails = !showDetails"
          >
            <v-icon :icon="showDetails ? 'mdi-eye-check-outline' : 'mdi-eye-outline'" size="13" class="mr-1" />
            Show Details
          </v-btn>

          <!-- Swipable Sidebar Drawer Trigger -->
          <v-btn
            size="x-small"
            :variant="guestsStore.activeFiltersCount > 0 ? 'flat' : 'outlined'"
            color="primary"
            rounded="lg"
            class="text-capitalize font-weight-bold px-2"
            prepend-icon="mdi-tune-variant"
            title="Open filters & tags sidebar (Swipe left)"
            @click="filterDrawer = true"
          >
            Filters &amp; Tags
            <v-badge
              v-if="guestsStore.activeFiltersCount > 0"
              :content="guestsStore.activeFiltersCount"
              color="error"
              inline
              class="ml-1"
            />
          </v-btn>
        </div>
      </div>

      <!-- Active Filters Summary Banner (When tags or return gift filters are engaged) -->
      <div
        v-if="guestsStore.activeFiltersCount > 0"
        class="d-flex align-center flex-wrap gap-1 pt-2 mt-2 border-t"
      >
        <span class="text-caption text-lightText font-weight-bold mr-1">Active:</span>

        <!-- Return Gift Filter Tag -->
        <v-chip
          v-if="guestsStore.giftFilter !== 'all'"
          size="x-small"
          color="warning"
          variant="flat"
          closable
          @click:close="guestsStore.giftFilter = 'all'"
        >
          <v-icon icon="mdi-gift" size="10" class="mr-1" />
          {{ guestsStore.giftFilter === 'with_gift' ? 'Has Return Gift' : 'No Return Gift' }}
        </v-chip>

        <!-- Specific Return Gift Item Filter -->
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

        <!-- Active Tag Chips -->
        <v-chip
          v-for="tag in activeTagsList"
          :key="tag"
          size="x-small"
          color="primary"
          variant="flat"
          closable
          @click:close="toggleTagFilter(tag)"
        >
          <v-icon icon="mdi-tag" size="10" class="mr-1" />
          #{{ tag }}
        </v-chip>

        <!-- Clear All Action -->
        <v-btn
          variant="text"
          size="x-small"
          color="error"
          class="font-weight-bold text-caption px-1 ml-auto"
          @click="resetFilters"
        >
          Clear All
        </v-btn>
      </div>
    </v-card>

    <!-- Empty State -->
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
      <div class="text-caption text-lightText mb-4" style="max-width: 320px; margin: 0 auto;">
        No guest matches your search or active filter criteria. Try resetting filters or add a new guest.
      </div>
      <div class="d-flex justify-center gap-2">
        <v-btn
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
          Add Guest
        </v-btn>
      </div>
    </v-card>

    <!-- Guests List (Expenses List Design Reference) -->
    <v-slide-y-transition group>
      <v-card
        v-for="guest in guestsStore.filteredGuests"
        :key="guest.id"
        variant="outlined"
        elevation="0"
        :ripple="false"
        class="mb-3 pa-3 rounded-lg bg-surface card-hover-border cursor-pointer no-ripple"
        @click="toggleGuestExpand(guest.id)"
      >
        <div class="d-flex align-start justify-space-between">
          <!-- Guest Info (Left Icon Removed) -->
          <div class="flex-grow-1" style="min-width: 0;">
            <!-- Guest Name and +<number of persons> -->
            <div class="text-subtitle-2 font-weight-bold text-truncate text-darkText">
              {{ guest.name }}
              <span class="text-primary font-weight-bold ml-1">+{{ guest.additionalGuests || 0 }}</span>
            </div>

            <!-- Group, and RSVP status -->
            <div class="d-flex align-center gap-1 text-lightText flex-wrap">
              <span class="font-weight-medium text-darkText app-member-text">
                {{ guest.group }}
              </span>
              <span class="date-sep">•</span>
              <span
                class="font-weight-bold text-capitalize app-date-text"
                :class="{
                  'text-success': guest.rsvpStatus === 'confirmed',
                  'text-warning': guest.rsvpStatus === 'pending',
                  'text-error': guest.rsvpStatus === 'declined'
                }"
              >
                {{ guest.rsvpStatus }}
              </span>
            </div>

            <!-- Return Gifts Section: ONLY Name of return gift & Add Gift button (No Price) -->
            <div class="d-flex align-center gap-1 mt-1.5 flex-wrap">
              <!-- Return Gift Chips (Name Only) -->
              <v-chip
                v-for="(gift, gIdx) in guest.returnGifts"
                :key="gIdx"
                size="x-small"
                variant="tonal"
                color="warning"
                label
                rounded="md"
                class="font-weight-medium"
              >
                <v-icon icon="mdi-gift-outline" size="10" class="mr-1" />
                <span>{{ gift.name }}</span>
                <v-btn
                  icon="mdi-close"
                  variant="text"
                  size="x-small"
                  density="compact"
                  class="ml-1 text-lightText hover-error"
                  title="Remove gift"
                  @click.stop="removeGift(guest.id, gIdx)"
                />
              </v-chip>

              <!-- + Add Gift Button -->
              <v-chip
                size="x-small"
                variant="outlined"
                color="warning"
                label
                rounded="md"
                class="font-weight-medium cursor-pointer"
                @click.stop="openAddGiftQuickDialog(guest)"
              >
                <v-icon icon="mdi-plus" size="11" class="mr-0.5" />
                Add Gift
              </v-chip>
            </div>

            <!-- Toggle for marking 'Return gift given' (Copied appearance & theme from Sidebar Theme Toggle) -->
            <div
              class="d-flex align-center justify-space-between mt-2 pa-2 px-3 border rounded-lg return-gift-toggle-row cursor-pointer"
              :class="guest.returnGiftGiven ? 'bg-lightprimary border-primary-subtle' : 'bg-containerBg'"
              @click.stop="guestsStore.toggleReturnGiftGiven(guest.id)"
            >
              <div class="d-flex align-center">
                <v-icon
                  :icon="guest.returnGiftGiven ? 'mdi-gift' : 'mdi-gift-outline'"
                  :color="guest.returnGiftGiven ? 'primary' : 'lightText'"
                  class="mr-2"
                  size="20"
                />
                <span
                  class="text-body-2 font-weight-medium"
                  :class="guest.returnGiftGiven ? 'text-primary font-weight-bold' : 'text-darkText'"
                >
                  {{ guest.returnGiftGiven ? 'Return Gift Given' : 'Return Gift' }}
                </span>
              </div>
              <v-switch
                :model-value="Boolean(guest.returnGiftGiven)"
                color="primary"
                density="compact"
                hide-details
                @click.stop
                @update:model-value="guestsStore.toggleReturnGiftGiven(guest.id)"
              />
            </div>

            <!-- Individual Guest Card Details (Phone Number, Tags, Email, Party Members, Notes) - Toggled by ShowDetails or clicking card -->
            <v-expand-transition>
              <div v-if="isGuestExpanded(guest.id)" class="guest-details-box mt-2 pt-2 border-t">
                <!-- Phone Number -->
                <div v-if="guest.phone" class="d-flex align-center gap-1 text-lightText mb-1 flex-wrap">
                  <v-icon icon="mdi-phone" size="13" class="text-primary flex-shrink-0" />
                  <span class="text-caption font-weight-medium text-darkText">Phone:</span>
                  <a
                    :href="`tel:${guest.phone}`"
                    class="text-primary font-weight-bold text-decoration-none text-caption"
                    @click.stop
                  >
                    {{ guest.phone }}
                  </a>
                </div>

                <!-- Email if available -->
                <div v-if="guest.email" class="d-flex align-center gap-1 text-lightText mb-1 flex-wrap">
                  <v-icon icon="mdi-email-outline" size="13" class="text-lightText flex-shrink-0" />
                  <span class="text-caption font-weight-medium text-darkText">Email:</span>
                  <a
                    :href="`mailto:${guest.email}`"
                    class="text-lightText text-decoration-none text-caption"
                    @click.stop
                  >
                    {{ guest.email }}
                  </a>
                </div>

                <!-- Tags Chips -->
                <div v-if="guest.tags && guest.tags.length > 0" class="d-flex align-center gap-1 mb-1 flex-wrap">
                  <span class="text-caption text-lightText font-weight-medium mr-1">Tags:</span>
                  <v-chip
                    v-for="tag in guest.tags"
                    :key="tag"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                    label
                    rounded="md"
                    class="font-weight-medium cursor-pointer"
                    @click.stop="toggleTagFilter(tag)"
                  >
                    <v-icon icon="mdi-tag" size="10" class="mr-1" />
                    {{ tag }}
                  </v-chip>
                </div>

                <!-- Accompanying Persons list if any -->
                <div v-if="guest.accompanyingPersons && guest.accompanyingPersons.length > 0" class="text-caption text-lightText mb-1">
                  <span class="font-weight-bold text-darkText">Party Members: </span>
                  <span v-for="(person, pIdx) in guest.accompanyingPersons" :key="pIdx">
                    {{ person.name }}<span v-if="person.relation"> ({{ person.relation }})</span><span v-if="pIdx < guest.accompanyingPersons.length - 1">, </span>
                  </span>
                </div>

                <!-- Notes Snippet (SHOW NOTES IN THE LAST) -->
                <div v-if="guest.notes" class="d-flex align-start gap-1 pa-2 rounded-md bg-containerBg mt-1.5 text-caption text-darkText font-italic">
                  <v-icon icon="mdi-note-text-outline" size="14" class="text-lightText mr-1 mt-0.5 flex-shrink-0" />
                  <span>{{ guest.notes }}</span>
                </div>
              </div>
            </v-expand-transition>
          </div>

          <!-- Right Side Actions Menu (ALIGNED TO TOP) -->
          <div class="text-right ml-2 flex-shrink-0 align-self-start" @click.stop>
            <!-- 3-dots dropdown menu aligned to top -->
            <v-menu location="bottom end">
              <template #activator="{ props: menuProps }">
                <v-btn
                  v-bind="menuProps"
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  color="lightText"
                  aria-label="Guest options"
                  class="mt-n1 mr-n1"
                  @click.stop
                />
              </template>
              <v-list density="compact" rounded="lg" elevation="4">
                <v-list-item
                  prepend-icon="mdi-pencil-outline"
                  title="Edit Guest"
                  @click="openEditGuestDialog(guest)"
                />
                <v-list-item
                  prepend-icon="mdi-gift-outline"
                  title="Add Return Gift"
                  @click="openAddGiftQuickDialog(guest)"
                />
                <v-list-item
                  :prepend-icon="guest.returnGiftGiven ? 'mdi-gift-off-outline' : 'mdi-gift-check-outline'"
                  :title="guest.returnGiftGiven ? 'Mark Gift Not Given' : 'Mark Return Gift Given'"
                  @click="guestsStore.toggleReturnGiftGiven(guest.id)"
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

    <!-- ADD / EDIT GUEST MODAL DIALOG -->
    <v-dialog v-model="guestDialog" max-width="600" persistent scrollable>
      <v-card class="rounded-xl overflow-hidden">
        <!-- Dialog Header -->
        <v-card-title class="pa-4 bg-primary text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-avatar color="white" variant="tonal" size="34" class="mr-3">
              <v-icon :icon="isEditing ? 'mdi-account-edit' : 'mdi-account-plus'" size="20" color="white" />
            </v-avatar>
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">
                {{ isEditing ? 'Update Guest & Party' : 'Add New Guest' }}
              </div>
              <div class="text-caption text-white-75" style="font-size: 0.7rem;">
                Party details, group tags, and return gifts
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
            <!-- 1. Guest Primary Information -->
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-2 d-flex align-center">
              <v-icon icon="mdi-account-outline" size="16" class="mr-1 text-primary" />
              1. Guest Information
            </div>

            <v-row density="compact" class="mb-2">
              <v-col cols="12">
                <v-text-field
                  v-model="guestForm.name"
                  label="Guest / Family Name *"
                  placeholder="e.g. Vikram & Ananya Sharma"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  :rules="[(v) => !!v?.trim() || 'Guest name is required']"
                  required
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="guestForm.phone"
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="guestForm.email"
                  label="Email Address"
                  placeholder="vikram@example.com"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-email-outline"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="guestForm.group"
                  :items="guestsStore.allGroups"
                  label="Group / Category *"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-tag-outline"
                  hint="Select preset or type custom group"
                  persistent-hint
                />
              </v-col>

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
                  density="compact"
                  rounded="lg"
                  prepend-inner-icon="mdi-check-circle-outline"
                />
              </v-col>
            </v-row>

            <v-divider class="my-3" />

            <!-- 2. Accompanying Family Members (+1, +2 feature) -->
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
                <v-icon icon="mdi-account-multiple-plus-outline" size="16" class="mr-1 text-primary" />
                Addon
              </div>
              <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">
                Total: {{ Number(guestForm.additionalGuests) + 1 }}
              </v-chip>
            </div>

            <!-- Quick Party Size Preset Stepper -->
            <div class="pa-3 rounded-lg bg-lightprimary border border-primary-subtle mb-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption font-weight-bold text-darkText">
                  Additional Family Members (guestX +N):
                </span>
                <span class="text-subtitle-2 font-weight-bold text-primary">
                  +{{ guestForm.additionalGuests }}
                </span>
              </div>

              <!-- Quick selection buttons -->
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-btn
                  v-for="n in [0, 1, 2, 3, 4, 5]"
                  :key="n"
                  size="small"
                  :variant="guestForm.additionalGuests === n ? 'flat' : 'outlined'"
                  :color="guestForm.additionalGuests === n ? 'primary' : 'grey'"
                  class="font-weight-bold"
                  rounded="lg"
                  @click="setAdditionalGuestsCount(n)"
                >
                  {{ n === 0 ? 'Solo (+0)' : `+${n}` }}
                </v-btn>
              </div>
            </div>

            <!-- Specific Accompanying Persons Names/Relation List (Optional) -->
            <div v-if="guestForm.additionalGuests > 0" class="mb-3">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-caption font-weight-bold text-darkText">
                  Specify Family Member Names (Optional):
                </span>
                <v-btn
                  size="x-small"
                  variant="text"
                  color="primary"
                  prepend-icon="mdi-plus"
                  class="font-weight-bold"
                  @click="addAccompanyingPersonRow"
                >
                  Add Person
                </v-btn>
              </div>

              <div
                v-for="(person, pIdx) in guestForm.accompanyingPersons"
                :key="pIdx"
                class="d-flex align-center gap-2 mb-2 pa-2 rounded-lg bg-containerBg border"
              >
                <v-text-field
                  v-model="person.name"
                  label="Member Name"
                  placeholder="e.g. Ananya Sharma"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                />
                <v-text-field
                  v-model="person.relation"
                  label="Relation"
                  placeholder="e.g. Spouse / Child"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                  style="max-width: 140px;"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  variant="text"
                  color="error"
                  size="small"
                  @click="removeAccompanyingPersonRow(pIdx)"
                />
              </div>
            </div>

            <v-divider class="my-3" />

            <!-- 3. Return Gifts Array System (name, price) -->
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center">
                <v-icon icon="mdi-gift-outline" size="16" class="mr-1 text-warning" />
                3. Return Gifts (Name &amp; Price Array)
              </div>
              <div class="text-caption font-weight-bold text-warning">
                Total: ₹{{ calculateGuestGiftsTotal(guestForm.returnGifts).toLocaleString() }}
              </div>
            </div>

            <!-- Gift Presets Quick Chips -->
            <div class="mb-2">
              <div class="text-caption text-lightText mb-1" style="font-size: 0.72rem;">
                Click preset gift to add to this guest's array:
              </div>
              <div class="d-flex align-center gap-2 flex-wrap">
                <v-chip
                  v-for="preset in defaultGiftPresets"
                  :key="preset.name"
                  size="small"
                  variant="tonal"
                  color="warning"
                  class="font-weight-medium cursor-pointer px-2"
                  @click="addGiftPreset(preset)"
                >
                  <v-icon icon="mdi-plus" size="14" class="mr-1" />
                  {{ preset.name }} (₹{{ preset.price }})
                </v-chip>
              </div>
            </div>

            <!-- Dynamic Return Gifts Rows -->
            <div class="pa-3 rounded-lg bg-lightwarning border border-warning-subtle mb-3">
              <div v-if="guestForm.returnGifts.length === 0" class="text-caption text-lightText text-center py-2">
                🎁 No return gifts added yet.
              </div>

              <div
                v-for="(gift, gIdx) in guestForm.returnGifts"
                :key="gIdx"
                class="d-flex align-center gap-2 mb-2 pa-2 rounded-lg bg-surface border"
              >
                <v-text-field
                  v-model="gift.name"
                  label="Gift Name"
                  placeholder="e.g. Silver Coin (10g)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                />
                <v-text-field
                  v-model.number="gift.price"
                  type="number"
                  label="Price (₹)"
                  placeholder="2500"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="md"
                  style="max-width: 120px;"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  variant="text"
                  color="error"
                  size="small"
                  @click="removeFormGiftRow(gIdx)"
                />
              </div>

              <v-btn
                block
                variant="outlined"
                color="warning"
                size="small"
                rounded="lg"
                prepend-icon="mdi-plus"
                class="mt-1 font-weight-bold"
                @click="addCustomGiftRow"
              >
                + Add Custom Return Gift
              </v-btn>
            </div>

            <v-divider class="my-3" />

            <!-- 4. Tags & Notes -->
            <div class="text-subtitle-2 font-weight-bold text-darkText mb-2 d-flex align-center">
              <v-icon icon="mdi-tag-multiple-outline" size="16" class="mr-1 text-primary" />
              4. Event Tags &amp; Notes
            </div>

            <v-combobox
              v-model="guestForm.tags"
              :items="defaultSuggestedTags"
              label="Event Tags"
              chips
              multiple
              variant="outlined"
              density="compact"
              rounded="lg"
              class="mb-3"
              hint="e.g. Brother Marriage, VIP, Outstation"
              persistent-hint
            />

            <v-textarea
              v-model="guestForm.notes"
              label="Special Notes / Logistics"
              placeholder="e.g. Flight arrival time, hotel room required, food preferences..."
              variant="outlined"
              density="compact"
              rows="2"
              rounded="lg"
              hide-details
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Dialog Footer Actions -->
        <v-card-actions class="pa-4 bg-containerBg d-flex justify-end gap-2">
          <v-btn
            variant="text"
            color="lightText"
            class="text-capitalize"
            @click="guestDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="font-weight-bold text-capitalize px-4"
            rounded="lg"
            :loading="isSaving"
            @click="saveGuest"
          >
            {{ isEditing ? 'Update Guest' : 'Save Guest' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- QUICK ADD RETURN GIFT DIALOG -->
    <v-dialog v-model="quickGiftDialog" max-width="450">
      <v-card class="rounded-xl overflow-hidden">
        <v-card-title class="pa-4 bg-warning text-white d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon icon="mdi-gift" size="20" class="mr-2" />
            <div>
              <div class="text-subtitle-1 font-weight-bold line-height-1">Add Return Gift</div>
              <div class="text-caption text-white-75" style="font-size: 0.7rem;">
                For {{ activeQuickGuest?.name }}
              </div>
            </div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="quickGiftDialog = false"
          />
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-darkText mb-2">
              Quick Pick from Presets:
            </div>
            <div class="d-flex flex-wrap gap-2">
              <v-chip
                v-for="preset in defaultGiftPresets"
                :key="preset.name"
                size="small"
                variant="tonal"
                color="warning"
                class="cursor-pointer px-2.5"
                @click="applyQuickGiftPreset(preset)"
              >
                {{ preset.name }} (₹{{ preset.price }})
              </v-chip>
            </div>
          </div>

          <v-divider class="my-3" />

          <v-text-field
            v-model="quickGiftName"
            label="Gift Name *"
            placeholder="e.g. Silver Coin (10g)"
            variant="outlined"
            density="compact"
            rounded="lg"
            class="mb-2"
          />

          <v-text-field
            v-model.number="quickGiftPrice"
            type="number"
            label="Price (₹) *"
            placeholder="2500"
            variant="outlined"
            density="compact"
            rounded="lg"
            prepend-inner-icon="mdi-currency-inr"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-3 bg-containerBg d-flex justify-end gap-2">
          <v-btn
            variant="text"
            color="lightText"
            size="small"
            @click="quickGiftDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="warning"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold px-4"
            :disabled="!quickGiftName.trim() || !quickGiftPrice"
            @click="confirmQuickAddGift"
          >
            Add Gift to Guest
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRMATION DIALOG -->
    <v-dialog v-model="deleteConfirmDialog" max-width="400">
      <v-card class="rounded-xl pa-4">
        <div class="d-flex align-center gap-2 mb-2 text-error">
          <v-icon icon="mdi-alert-circle" size="24" />
          <span class="text-subtitle-1 font-weight-bold">Delete Guest</span>
        </div>
        <p class="text-body-2 text-lightText mb-4">
          Are you sure you want to remove <strong>{{ guestToDelete?.name }}</strong> from the guest list?
          This action will also remove assigned return gifts and party data.
        </p>
        <div class="d-flex justify-end gap-2">
          <v-btn
            variant="text"
            color="lightText"
            size="small"
            @click="deleteConfirmDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-bold px-4"
            @click="executeDeleteGuest"
          >
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- SWIPABLE RIGHT SIDEBAR FOR TOGGLING TAGS & FILTERING GUEST BY RETURN GIFT -->
    <v-navigation-drawer
      v-model="filterDrawer"
      location="right"
      temporary
      touchless
      width="320"
      class="guest-filter-drawer bg-surface"
      elevation="16"
      style="overscroll-behavior: contain;"
      @wheel.stop
      @touchmove.stop
    >
      <!-- Drawer Header -->
      <div class="pa-4 bg-primary text-white d-flex align-center justify-space-between flex-shrink-0">
        <div class="d-flex align-center gap-2">
          <v-avatar color="white" variant="tonal" size="32" rounded="md">
            <v-icon icon="mdi-tune-variant" size="18" color="white" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold line-height-1">Filters &amp; Tags</div>
            <div class="text-caption text-white-75" style="font-size: 0.7rem;">
              {{ guestsStore.filteredGuests.length }} of {{ guestsStore.totalGuests }} guests showing
            </div>
          </div>
        </div>
        <div class="d-flex align-center">
          <v-btn
            v-if="guestsStore.activeFiltersCount > 0"
            variant="text"
            size="x-small"
            color="white"
            class="text-caption font-weight-bold mr-1"
            @click="guestsStore.resetAllFilters"
          >
            Reset
          </v-btn>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="filterDrawer = false"
          />
        </div>
      </div>

      <!-- Drawer Body Content -->
      <div
        class="drawer-scroll-body pa-4 overflow-y-auto flex-grow-1"
        style="max-height: calc(100vh - 120px); overscroll-behavior: contain; -webkit-overflow-scrolling: touch;"
        @wheel.stop
        @touchmove.stop
      >
        <!-- Toggle: Show Details Option -->
        <div class="mb-4 pa-3 rounded-lg bg-containerBg border">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <v-icon :icon="showDetails ? 'mdi-eye-check-outline' : 'mdi-eye-outline'" color="primary" size="20" />
              <div>
                <div class="text-caption font-weight-bold text-darkText">Show Details</div>
                <div class="text-caption text-lightText" style="font-size: 0.7rem;">
                  Show phone, notes &amp; tags in cards
                </div>
              </div>
            </div>
            <v-switch
              v-model="showDetails"
              color="primary"
              density="compact"
              hide-details
              inset
            />
          </div>
        </div>

        <!-- Section 1: Toggleable Filter Guest by Return Gift -->
        <div class="mb-4">
          <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center gap-1">
              <v-icon icon="mdi-gift-outline" size="16" class="text-warning" />
              <span>Filter by Return Gift</span>
            </div>
            <v-chip
              v-if="guestsStore.giftFilter !== 'all' || guestsStore.selectedGiftName"
              size="x-small"
              color="warning"
              variant="flat"
            >
              Active
            </v-chip>
          </div>

          <div class="text-caption text-lightText mb-2" style="font-size: 0.72rem;">
            Toggle guests with or without return gifts:
          </div>

          <!-- 3-Segment Filter Buttons -->
          <div class="d-flex gap-1 mb-2">
            <v-btn
              size="small"
              :variant="guestsStore.giftFilter === 'all' ? 'flat' : 'outlined'"
              :color="guestsStore.giftFilter === 'all' ? 'warning' : 'grey'"
              class="flex-grow-1 text-caption font-weight-bold rounded-lg"
              @click="guestsStore.giftFilter = 'all'"
            >
              All ({{ guestsStore.totalGuests }})
            </v-btn>
            <v-btn
              size="small"
              :variant="guestsStore.giftFilter === 'with_gift' ? 'flat' : 'outlined'"
              :color="guestsStore.giftFilter === 'with_gift' ? 'warning' : 'grey'"
              class="flex-grow-1 text-caption font-weight-bold rounded-lg"
              @click="guestsStore.giftFilter = 'with_gift'"
            >
              With Gift ({{ guestsStore.guestsWithGiftCount }})
            </v-btn>
            <v-btn
              size="small"
              :variant="guestsStore.giftFilter === 'without_gift' ? 'flat' : 'outlined'"
              :color="guestsStore.giftFilter === 'without_gift' ? 'warning' : 'grey'"
              class="flex-grow-1 text-caption font-weight-bold rounded-lg"
              @click="guestsStore.giftFilter = 'without_gift'"
            >
              No Gift ({{ guestsStore.guestsWithoutGiftCount }})
            </v-btn>
          </div>

          <!-- Specific Return Gifts Filter (if any assigned in dataset) -->
          <div v-if="guestsStore.returnGiftsDistribution.length > 0" class="mt-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-lightText font-weight-bold" style="font-size: 0.72rem;">
                Filter by specific gift item:
              </span>
              <v-btn
                v-if="guestsStore.selectedGiftName"
                variant="text"
                size="x-small"
                color="warning"
                @click="guestsStore.selectedGiftName = null"
              >
                Clear
              </v-btn>
            </div>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="item in guestsStore.returnGiftsDistribution"
                :key="item.name"
                size="small"
                :variant="guestsStore.selectedGiftName === item.name ? 'flat' : 'tonal'"
                color="warning"
                class="cursor-pointer font-weight-medium"
                @click="guestsStore.toggleGiftNameFilter(item.name)"
              >
                <v-icon
                  :icon="guestsStore.selectedGiftName === item.name ? 'mdi-check' : 'mdi-gift-outline'"
                  size="12"
                  class="mr-1"
                />
                {{ item.name }} ({{ item.count }})
              </v-chip>
            </div>
          </div>
        </div>

        <v-divider class="my-3" />

        <!-- Section 2: Toggling Tags -->
        <div class="mb-4">
          <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center gap-1">
              <v-icon icon="mdi-tag-multiple-outline" size="16" class="text-primary" />
              <span>Toggle Tags</span>
            </div>
            <div class="d-flex align-center gap-1">
              <v-btn
                v-if="guestsStore.selectedTags.length > 0"
                variant="text"
                size="x-small"
                color="primary"
                @click="guestsStore.selectedTags = []"
              >
                Clear
              </v-btn>
            </div>
          </div>

          <div class="text-caption text-lightText mb-2" style="font-size: 0.72rem;">
            Tap any tag to toggle it on/off for instant filtering:
          </div>

          <!-- Tag Toggle Chips -->
          <div class="d-flex flex-wrap gap-1.5">
            <v-chip
              v-for="tag in guestsStore.allTags"
              :key="tag"
              size="small"
              :variant="isTagSelected(tag) ? 'flat' : 'outlined'"
              :color="isTagSelected(tag) ? 'primary' : 'secondary'"
              class="cursor-pointer font-weight-medium"
              rounded="lg"
              @click="toggleTagFilter(tag)"
            >
              <v-icon
                :icon="isTagSelected(tag) ? 'mdi-checkbox-marked-circle' : 'mdi-tag-outline'"
                size="14"
                class="mr-1"
              />
              #{{ tag }}
              <span class="ml-1 opacity-75 text-caption" style="font-size: 0.7rem;">
                ({{ guestsStore.tagCountMap[tag] || 0 }})
              </span>
            </v-chip>
          </div>
        </div>

        <v-divider class="my-3" />

        <!-- Section 3: RSVP Quick Filter -->
        <div class="mb-3">
          <div class="text-subtitle-2 font-weight-bold text-darkText d-flex align-center gap-1 mb-2">
            <v-icon icon="mdi-check-decagram-outline" size="16" class="text-success" />
            <span>RSVP Status</span>
          </div>
          <div class="d-flex flex-wrap gap-1">
            <v-chip
              size="small"
              :variant="guestsStore.selectedRsvp === 'all' ? 'flat' : 'tonal'"
              color="primary"
              class="cursor-pointer"
              @click="guestsStore.selectedRsvp = 'all'"
            >
              All ({{ guestsStore.totalGuests }})
            </v-chip>
            <v-chip
              size="small"
              :variant="guestsStore.selectedRsvp === 'confirmed' ? 'flat' : 'tonal'"
              color="success"
              class="cursor-pointer"
              @click="guestsStore.selectedRsvp = 'confirmed'"
            >
              Confirmed ({{ guestsStore.confirmedCount }})
            </v-chip>
            <v-chip
              size="small"
              :variant="guestsStore.selectedRsvp === 'pending' ? 'flat' : 'tonal'"
              color="warning"
              class="cursor-pointer"
              @click="guestsStore.selectedRsvp = 'pending'"
            >
              Pending ({{ guestsStore.pendingCount }})
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div class="pa-3 bg-containerBg border-t d-flex align-center gap-2">
        <v-btn
          variant="outlined"
          size="small"
          rounded="lg"
          class="flex-grow-1"
          @click="guestsStore.resetAllFilters"
        >
          Reset All
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          rounded="lg"
          class="flex-grow-1 font-weight-bold"
          @click="filterDrawer = false"
        >
          Show {{ guestsStore.filteredGuests.length }} Guests
        </v-btn>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, toRef } from 'vue'
import { useAppStore } from '@/stores/app'
import {
  useGuestsStore,
  defaultGiftPresets,
  defaultSuggestedTags,
} from '@/stores/guests'
import type { GuestItem, ReturnGift } from '@/types'
import {
  getGuestGroupColor,
  getGuestGroupIcon,
  getRsvpColor,
  getRsvpIcon,
  calculateGuestGiftsTotal,
  createDefaultGuestForm,
  createEditGuestForm,
  getInitials,
  syncAccompanyingPersons,
  buildGuestPayload,
  buildReturnGift,
} from '@/services/service.js'
import { useModalBack } from '@/composables/useModalBack'

const appStore = useAppStore()
const guestsStore = useGuestsStore()

onMounted(() => {
  // If previously filtered by declined (which was removed from RSVP UI), reset to all
  if (guestsStore.selectedRsvp === 'declined') {
    guestsStore.selectedRsvp = 'all'
  }
})

// View & Filter Drawer states
const filterDrawer = toRef(appStore, 'rightDrawer')
const showDetails = ref(localStorage.getItem('guests_show_details') === 'true')
const expandedGuestIds = ref<Set<string>>(new Set())
const collapsedGuestIds = ref<Set<string>>(new Set())

watch(showDetails, (val) => {
  localStorage.setItem('guests_show_details', String(val))
  collapsedGuestIds.value.clear()
  expandedGuestIds.value.clear()
})

// Body scroll lock when filterDrawer is open to prevent parallel scrolling
watch(filterDrawer, (open) => {
  if (typeof document !== 'undefined') {
    if (open) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }
})

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
  }
})

function isGuestExpanded(id: string): boolean {
  if (showDetails.value) {
    return !collapsedGuestIds.value.has(id)
  }
  return expandedGuestIds.value.has(id)
}

function toggleGuestExpand(id: string) {
  if (showDetails.value) {
    if (collapsedGuestIds.value.has(id)) {
      collapsedGuestIds.value.delete(id)
    } else {
      collapsedGuestIds.value.add(id)
    }
  } else {
    if (expandedGuestIds.value.has(id)) {
      expandedGuestIds.value.delete(id)
    } else {
      expandedGuestIds.value.add(id)
    }
  }
}

const activeTagsList = computed(() => {
  if (guestsStore.selectedTags.length > 0) return guestsStore.selectedTags
  if (guestsStore.selectedTag) return [guestsStore.selectedTag]
  return []
})

function isTagSelected(tag: string): boolean {
  return guestsStore.selectedTags.includes(tag) || guestsStore.selectedTag === tag
}

function toggleTagFilter(tag: string) {
  guestsStore.toggleTag(tag)
}

function resetFilters() {
  guestsStore.resetAllFilters()
}

// Touch swipe handling for mobile gestures
let touchStartX = 0
let touchStartY = 0

function handleTouchStart(e: TouchEvent) {
  if (filterDrawer.value) return // Don't trigger main gestures while drawer is open
  if (e.touches && e.touches[0]) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }
}

function handleTouchEnd(e: TouchEvent) {
  if (filterDrawer.value) return // Don't trigger main gestures while drawer is open
  if (e.changedTouches && e.changedTouches[0]) {
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const deltaX = touchStartX - touchEndX
    const deltaY = Math.abs(touchStartY - touchEndY)

    // Swipe left (at least 50px horizontally, less than 80px vertically) -> Open sidebar
    if (deltaX > 50 && deltaY < 80) {
      filterDrawer.value = true
    }
    // Swipe right (at least 50px horizontally, less than 80px vertically) -> Close sidebar
    else if (deltaX < -50 && deltaY < 80) {
      if (filterDrawer.value) {
        filterDrawer.value = false
      }
    }
  }
}

// Dialog states
const guestDialog = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const editingGuestId = ref<string | null>(null)
const guestFormRef = ref<any>(null)

// Form state
const guestForm = ref(createDefaultGuestForm())

// Quick Gift Dialog states
const quickGiftDialog = ref(false)
const activeQuickGuest = ref<GuestItem | null>(null)
const quickGiftName = ref('')
const quickGiftPrice = ref<number | ''>('')

// Delete confirmation states
const deleteConfirmDialog = ref(false)
const guestToDelete = ref<GuestItem | null>(null)

// Phone back button history support for dialogs and sidebar drawer
useModalBack(filterDrawer, 'guestFilterDrawer')
useModalBack(guestDialog, 'guestFormDialog')
useModalBack(quickGiftDialog, 'guestGiftDialog')
useModalBack(deleteConfirmDialog, 'guestDeleteDialog')

function openAddGuestDialog() {
  isEditing.value = false
  editingGuestId.value = null
  guestForm.value = createDefaultGuestForm()
  guestDialog.value = true
}

function openEditGuestDialog(guest: GuestItem) {
  isEditing.value = true
  editingGuestId.value = guest.id
  guestForm.value = createEditGuestForm(guest)
  guestDialog.value = true
}

function setAdditionalGuestsCount(count: number) {
  guestForm.value.additionalGuests = count
  guestForm.value.accompanyingPersons = syncAccompanyingPersons(
    guestForm.value.accompanyingPersons,
    count
  )
}

function addAccompanyingPersonRow() {
  guestForm.value.accompanyingPersons.push({ name: '', relation: 'Family' })
  if (guestForm.value.accompanyingPersons.length > guestForm.value.additionalGuests) {
    guestForm.value.additionalGuests = guestForm.value.accompanyingPersons.length
  }
}

function removeAccompanyingPersonRow(index: number) {
  guestForm.value.accompanyingPersons.splice(index, 1)
  if (guestForm.value.additionalGuests > 0) {
    guestForm.value.additionalGuests -= 1
  }
}

function addGiftPreset(preset: { name: string; price: number }) {
  guestForm.value.returnGifts.push({
    name: preset.name,
    price: preset.price,
  })
}

function addCustomGiftRow() {
  guestForm.value.returnGifts.push({
    name: '',
    price: 500,
  })
}

function removeFormGiftRow(index: number) {
  guestForm.value.returnGifts.splice(index, 1)
}

async function saveGuest() {
  if (!guestForm.value.name.trim()) return

  isSaving.value = true
  try {
    const payload = buildGuestPayload(guestForm.value)

    if (isEditing.value && editingGuestId.value) {
      await guestsStore.updateGuest(editingGuestId.value, payload)
    } else {
      await guestsStore.addGuest(payload)
    }
    guestDialog.value = false
  } catch (err) {
    console.error('Error saving guest:', err)
  } finally {
    isSaving.value = false
  }
}

// Quick Add Gift logic
function openAddGiftQuickDialog(guest: GuestItem) {
  activeQuickGuest.value = guest
  quickGiftName.value = ''
  quickGiftPrice.value = ''
  quickGiftDialog.value = true
}

function applyQuickGiftPreset(preset: { name: string; price: number }) {
  quickGiftName.value = preset.name
  quickGiftPrice.value = preset.price
}

async function confirmQuickAddGift() {
  if (!activeQuickGuest.value || !quickGiftName.value.trim() || !quickGiftPrice.value) return
  const newGift = buildReturnGift(quickGiftName.value, quickGiftPrice.value)
  await guestsStore.addReturnGiftToGuest(activeQuickGuest.value.id, newGift)
  quickGiftDialog.value = false
}

async function removeGift(guestId: string, giftIndex: number) {
  await guestsStore.removeReturnGiftFromGuest(guestId, giftIndex)
}

// Delete logic
function confirmDeleteGuest(guest: GuestItem) {
  guestToDelete.value = guest
  deleteConfirmDialog.value = true
}

async function executeDeleteGuest() {
  if (guestToDelete.value) {
    await guestsStore.deleteGuest(guestToDelete.value.id)
  }
  deleteConfirmDialog.value = false
  guestToDelete.value = null
}
</script>

<style scoped>
.guest-filter-drawer,
.guest-filter-drawer :deep(.v-navigation-drawer__content),
.guest-filter-drawer .drawer-scroll-body {
  overscroll-behavior: contain !important;
  -webkit-overflow-scrolling: touch;
}

.no-ripple,
.no-ripple :deep(.v-ripple__container) {
  display: none !important;
}

.return-gift-toggle-row {
  min-height: 42px !important;
  cursor: pointer;
}

.return-gift-toggle-row :deep(.v-selection-control) {
  min-height: auto;
}
</style>
