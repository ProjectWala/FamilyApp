<template>
  <div class="shopping-component">
    <!-- Summary Header Cards (Mantis Style - Matching Expenses Theme) -->
    <v-card
      class="mb-4 pa-4 rounded-lg elevation-0 text-white"
      style="background: var(--v-gradient, linear-gradient(250.38deg, #1677ff 0%, #0958d9 100%));"
    >
      <div class="d-flex justify-space-between align-center mb-1">
        <span class="text-caption text-white-75 text-uppercase font-weight-medium">
          Total Shopping Budget Estimate
        </span>
        <v-avatar color="white" variant="tonal" size="36" rounded="lg">
          <v-icon icon="mdi-cart-outline" size="20" color="white" />
        </v-avatar>
      </div>

      <div class="text-h4 font-weight-bold mb-3">
        ₹{{ shoppingStore.totalEstimatedCost.toFixed(2) }}
      </div>

      <v-divider class="my-2 border-t-white-20" />

      <div class="d-flex justify-space-between align-center text-caption pt-1 text-white-85 flex-wrap gap-2">
        <div class="d-flex align-center gap-3">
          <span>
            To Buy:
            <strong class="text-white font-weight-bold">
              {{ shoppingStore.pendingCount }} items (₹{{ shoppingStore.pendingCost.toFixed(0) }})
            </strong>
          </span>
          <span>•</span>
          <span>
            Bought:
            <strong class="text-white font-weight-bold">{{ shoppingStore.purchasedCount }}</strong>
          </span>
        </div>
      </div>
    </v-card>

    <!-- TAG GROUP BANNER (When Tag Filter is Active - Identical to Expenses Theme) -->
    <v-expand-transition>
      <div v-if="shoppingStore.activeTagFilter" class="expand-wrapper">
        <v-card
          variant="outlined"
          elevation="0"
          class="mb-4 pa-4 rounded-lg bg-surface card-hover-border"
        >
        <div class="d-flex justify-space-between align-start">
          <div class="d-flex align-center">
            <v-avatar color="primary" variant="tonal" size="38" rounded="lg" class="mr-3">
              <v-icon icon="mdi-tag-heart" size="20" />
            </v-avatar>
            <div>
              <div class="text-label-small text-lightText text-uppercase font-weight-medium">
                Grouped Category Products
              </div>
              <div class="text-h6 font-weight-bold text-truncate text-darkText">
                {{ shoppingStore.activeTagFilter }}
              </div>
            </div>
          </div>

          <v-btn
            size="small"
            variant="tonal"
            color="primary"
            icon="mdi-close"
            rounded="lg"
            title="Clear Tag Filter"
            @click="shoppingStore.activeTagFilter = null"
          />
        </div>

        <div class="d-flex align-center justify-space-between mt-3 pt-2 border-t">
          <div>
            <div class="text-caption text-lightText">Category Total</div>
            <div class="text-h5 font-weight-bold text-primary">
              ₹{{ shoppingStore.getTagTotal(shoppingStore.activeTagFilter).toFixed(2) }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-caption text-lightText">Products Count</div>
            <div class="text-subtitle-1 font-weight-bold text-darkText">
              {{ shoppingStore.getTagItemsCount(shoppingStore.activeTagFilter) }} items
            </div>
          </div>
        </div>

        <!-- Quick filter actions -->
        <div class="mt-2 pt-2 border-t d-flex align-center justify-space-between text-caption text-lightText">
          <span>Filtered view active for this group</span>
          <v-btn
            size="x-small"
            variant="text"
            color="primary"
            class="px-1 text-capitalize font-weight-bold"
            @click="shoppingStore.activeTagFilter = null"
          >
            Show All Products
          </v-btn>
        </div>
      </v-card>
    </div>
  </v-expand-transition>

    <!-- Add Product CTA Button -->
    <v-btn
      block
      color="primary"
      size="large"
      prepend-icon="mdi-cart-plus"
      rounded="lg"
      elevation="0"
      class="mb-4 font-weight-medium text-capitalize"
      @click="openAddModal"
    >
      Add New Product
    </v-btn>

    <!-- COLLAPSIBLE TAGS & FILTERS PANEL (Mantis Style) -->
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
              Tags, Priority &amp; Filters
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

      <!-- Collapsible Container for Tags, Priority, and Search -->
      <v-expand-transition>
        <div v-if="showFiltersPanel" class="expand-wrapper">
          <div class="px-3 pb-3 pt-1 border-t">
          <!-- Search input -->
          <v-text-field
            v-model="shoppingStore.searchQuery"
            placeholder="Search products by name, tag, or notes..."
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            clearable
            class="mb-3"
          />

          <!-- 1. Priority Filter Chips -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
              Priority Filter:
            </div>
            <div class="d-flex flex-wrap gap-1.5">
              <v-chip
                size="small"
                :variant="shoppingStore.selectedPriority === 'all' ? 'flat' : 'outlined'"
                :color="shoppingStore.selectedPriority === 'all' ? 'primary' : undefined"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedPriority = 'all'"
              >
                All Priorities
              </v-chip>
              <v-chip
                size="small"
                :variant="shoppingStore.selectedPriority === 'urgent' ? 'flat' : 'tonal'"
                color="error"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedPriority = 'urgent'"
              >
                <v-icon icon="mdi-alert-octagon" size="14" class="mr-1" />
                Urgent
              </v-chip>
              <v-chip
                size="small"
                :variant="shoppingStore.selectedPriority === 'high' ? 'flat' : 'tonal'"
                color="warning"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedPriority = 'high'"
              >
                <v-icon icon="mdi-alert-circle" size="14" class="mr-1" />
                High
              </v-chip>
              <v-chip
                size="small"
                :variant="shoppingStore.selectedPriority === 'medium' ? 'flat' : 'tonal'"
                color="primary"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedPriority = 'medium'"
              >
                <v-icon icon="mdi-arrow-up-circle-outline" size="14" class="mr-1" />
                Medium
              </v-chip>
              <v-chip
                size="small"
                :variant="shoppingStore.selectedPriority === 'low' ? 'flat' : 'tonal'"
                color="success"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedPriority = 'low'"
              >
                <v-icon icon="mdi-arrow-down-circle-outline" size="14" class="mr-1" />
                Low
              </v-chip>
            </div>
          </div>

          <!-- 2. Status Filter (Pending / Bought) -->
          <div class="mb-3">
            <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1">
              Status Filter:
            </div>
            <div class="d-flex flex-wrap gap-1.5">
              <v-chip
                size="small"
                :variant="shoppingStore.selectedStatus === 'all' ? 'flat' : 'outlined'"
                :color="shoppingStore.selectedStatus === 'all' ? 'primary' : undefined"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedStatus = 'all'"
              >
                All Status
              </v-chip>
              <v-chip
                size="small"
                :variant="shoppingStore.selectedStatus === 'pending' ? 'flat' : 'tonal'"
                color="warning"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedStatus = 'pending'"
              >
                <v-icon icon="mdi-clock-outline" size="14" class="mr-1" />
                To Buy ({{ shoppingStore.pendingCount }})
              </v-chip>
              <v-chip
                size="small"
                :variant="shoppingStore.selectedStatus === 'purchased' ? 'flat' : 'tonal'"
                color="success"
                class="font-weight-medium cursor-pointer"
                @click="shoppingStore.selectedStatus = 'purchased'"
              >
                <v-icon icon="mdi-check-circle-outline" size="14" class="mr-1" />
                Purchased ({{ shoppingStore.purchasedCount }})
              </v-chip>
            </div>
          </div>

          <!-- 3. Togglable Group Tags Section (Matching Expenses theme) -->
          <div>
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption font-weight-bold text-lightText text-uppercase">
                Product Group Tags ({{ shoppingStore.allTags.length }}):
              </span>
              <span class="text-caption text-lightText" style="font-size: 0.68rem !important;">
                Tap tag to filter
              </span>
            </div>

            <div class="d-flex flex-wrap gap-1.5">
              <v-chip
                size="small"
                class="filter-tag-chip px-2.5 font-weight-medium cursor-pointer"
                :variant="!shoppingStore.activeTagFilter ? 'flat' : 'outlined'"
                :color="!shoppingStore.activeTagFilter ? 'primary' : undefined"
                rounded="lg"
                @click="shoppingStore.activeTagFilter = null"
              >
                All Tags
              </v-chip>

              <v-chip
                v-for="tag in shoppingStore.allTags"
                :key="tag"
                size="small"
                class="filter-tag-chip px-2.5 font-weight-medium cursor-pointer"
                rounded="lg"
                :color="shoppingStore.activeTagFilter === tag ? 'primary' : undefined"
                :variant="shoppingStore.activeTagFilter === tag ? 'flat' : 'tonal'"
                @click="shoppingStore.activeTagFilter = shoppingStore.activeTagFilter === tag ? null : tag"
              >
                <v-icon icon="mdi-tag-outline" size="13" class="mr-1" />
                {{ tag }}
                <span v-if="shoppingStore.tagCountMap[tag]" class="ml-1 opacity-70">
                  ({{ shoppingStore.tagCountMap[tag] }})
                </span>
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </v-expand-transition>
    </v-card>

    <!-- Toolbar: Sort, Grouping & Items Count -->
    <div class="d-flex align-center justify-space-between mb-3 px-1 flex-wrap gap-2">
      <div class="text-subtitle-1 font-weight-bold d-flex align-center text-darkText">
        <v-icon icon="mdi-format-list-checks" class="mr-2 text-primary" size="20" />
        {{ listHeaderTitle }}
      </div>

      <div class="d-flex align-center gap-2">
        <!-- Sort By Menu -->
        <v-menu location="bottom end">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              size="x-small"
              variant="outlined"
              color="primary"
              rounded="lg"
              prepend-icon="mdi-sort-variant"
              class="text-capitalize"
            >
              {{ currentSortLabel }}
            </v-btn>
          </template>
          <v-list density="compact" class="py-1">
            <v-list-item
              :active="shoppingStore.sortBy === 'priority'"
              @click="shoppingStore.sortBy = 'priority'"
            >
              <v-list-item-title class="text-caption">Priority (Urgent first)</v-list-item-title>
            </v-list-item>
            <v-list-item
              :active="shoppingStore.sortBy === 'price-desc'"
              @click="shoppingStore.sortBy = 'price-desc'"
            >
              <v-list-item-title class="text-caption">Price: High to Low</v-list-item-title>
            </v-list-item>
            <v-list-item
              :active="shoppingStore.sortBy === 'price-asc'"
              @click="shoppingStore.sortBy = 'price-asc'"
            >
              <v-list-item-title class="text-caption">Price: Low to High</v-list-item-title>
            </v-list-item>
            <v-list-item
              :active="shoppingStore.sortBy === 'name'"
              @click="shoppingStore.sortBy = 'name'"
            >
              <v-list-item-title class="text-caption">Product Name (A-Z)</v-list-item-title>
            </v-list-item>
            <v-list-item
              :active="shoppingStore.sortBy === 'newest'"
              @click="shoppingStore.sortBy = 'newest'"
            >
              <v-list-item-title class="text-caption">Newest Added</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

        <!-- View Mode Toggle: Flat vs Grouped by Tag -->
        <v-btn
          size="x-small"
          :variant="viewGroupedByTag ? 'flat' : 'outlined'"
          :color="viewGroupedByTag ? 'primary' : 'secondary'"
          rounded="lg"
          icon="mdi-shape-outline"
          :title="viewGroupedByTag ? 'Switch to flat list' : 'Group products by tag'"
          @click="viewGroupedByTag = !viewGroupedByTag"
        />

        <span class="text-caption text-lightText font-weight-medium">
          {{ shoppingStore.filteredItems.length }} items
        </span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="shoppingStore.filteredItems.length === 0" class="text-center py-8">
      <v-avatar color="surface-variant" size="56" rounded="lg" class="mb-3">
        <v-icon icon="mdi-cart-remove" size="32" color="primary" />
      </v-avatar>
      <div class="text-subtitle-1 font-weight-medium text-darkText">No products found</div>
      <div class="text-body-2 text-lightText">
        {{ hasActiveFilters ? 'No products match your active filters or search.' : 'Tap the button above to add a product to your shopping list!' }}
      </div>
      <v-btn
        v-if="hasActiveFilters"
        variant="tonal"
        size="small"
        color="primary"
        class="mt-3 text-capitalize rounded-lg"
        @click="resetFilters"
      >
        Clear Filters
      </v-btn>
    </div>

    <!-- VIEW A: Flat List of Products -->
    <v-slide-y-transition v-if="!viewGroupedByTag" group>
      <v-card
        v-for="item in shoppingStore.filteredItems"
        :key="item.id"
        variant="outlined"
        elevation="0"
        class="mb-3 pa-3 rounded-lg bg-surface card-hover-border shopping-item-card"
        :class="{ 'shopping-item-purchased': item.isPurchased }"
      >
        <div class="d-flex align-center">
          <!-- Purchase Checkbox Button -->
          <div class="mr-3 flex-shrink-0">
            <v-btn
              :icon="item.isPurchased ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'"
              variant="text"
              size="small"
              :color="item.isPurchased ? 'success' : 'lightText'"
              :title="item.isPurchased ? 'Mark as to-buy' : 'Mark as purchased'"
              @click.stop="shoppingStore.togglePurchased(item.id)"
            />
          </div>

          <!-- Product Details -->
          <div class="flex-grow-1" style="min-width: 0;">
            <!-- Title & Priority -->
            <div class="d-flex align-center justify-space-between flex-wrap gap-1">
              <div
                class="text-subtitle-2 font-weight-bold text-truncate product-title-text"
                :class="{ 'text-decoration-line-through text-lightText': item.isPurchased }"
                :title="item.productName"
              >
                {{ item.productName }}
              </div>

              <!-- Priority Flag Badge -->
              <v-chip
                size="x-small"
                :color="getPriorityColor(item.priority)"
                variant="tonal"
                class="font-weight-bold flex-shrink-0"
              >
                <v-icon :icon="getPriorityIcon(item.priority)" size="11" class="mr-1" />
                {{ item.priority.toUpperCase() }}
              </v-chip>
            </div>

            <!-- Price & Quantity Breakdown -->
            <div class="d-flex align-center gap-2 mt-1 text-caption text-lightText flex-wrap">
              <span class="font-weight-bold text-darkText font-mono">
                Qty: {{ item.quantity }}
              </span>
              <span>•</span>
              <span>₹{{ Number(item.price).toFixed(2) }} / unit</span>
              <span v-if="item.memberId" class="d-inline-flex align-center">
                <span>•</span>
                <v-avatar
                  v-if="getMember(item.memberId)"
                  size="14"
                  variant="flat"
                  :style="{ backgroundColor: getMember(item.memberId)?.avatarColor || '#6366F1' }"
                  class="ml-1 mr-1"
                >
                  <v-icon :icon="getMember(item.memberId)?.avatarIcon || 'mdi-account'" size="9" color="white" />
                </v-avatar>
                <span class="text-darkText font-weight-medium">{{ getMemberName(item.memberId) }}</span>
              </span>
            </div>

            <!-- Product Tags -->
            <div v-if="item.tags && item.tags.length > 0" class="d-flex align-center gap-1 mt-1.5 flex-wrap">
              <v-chip
                v-for="tag in item.tags"
                :key="tag"
                size="x-small"
                variant="tonal"
                color="primary"
                label
                rounded="md"
                class="font-weight-medium cursor-pointer"
                title="Filter by this tag"
                @click.stop="shoppingStore.activeTagFilter = tag"
              >
                <v-icon icon="mdi-tag" size="10" class="mr-1" />
                {{ tag }}
              </v-chip>
            </div>

            <!-- Notes -->
            <div v-if="item.notes" class="text-caption text-lightText mt-1 text-truncate">
              {{ item.notes }}
            </div>
          </div>

          <!-- Total Cost and Actions -->
          <div class="text-right ml-3 flex-shrink-0">
            <div
              class="text-subtitle-1 font-weight-bold font-mono"
              :class="item.isPurchased ? 'text-success' : 'text-primary'"
            >
              ₹{{ ((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2) }}
            </div>

            <div class="d-flex align-center justify-end mt-1">
              <v-btn
                icon="mdi-pencil-outline"
                size="x-small"
                variant="text"
                color="primary"
                title="Edit Product"
                @click="openEditModal(item)"
              />
              <v-btn
                icon="mdi-trash-can-outline"
                size="x-small"
                variant="text"
                color="error"
                title="Delete Product"
                @click="confirmDeleteItem(item)"
              />
            </div>
          </div>
        </div>
      </v-card>
    </v-slide-y-transition>

    <!-- VIEW B: Grouped by Tag Cards -->
    <div v-else>
      <div
        v-for="(groupItems, tagName) in shoppingStore.groupedByTag"
        :key="tagName"
        class="mb-4"
      >
        <div class="d-flex align-center justify-space-between mb-2 px-1">
          <div class="d-flex align-center gap-1.5">
            <v-chip size="small" color="primary" variant="flat" class="font-weight-bold">
              <v-icon icon="mdi-tag" size="12" class="mr-1" />
              {{ tagName }}
            </v-chip>
            <span class="text-caption text-lightText font-weight-medium">
              {{ groupItems.length }} products
            </span>
          </div>

          <span class="text-caption font-weight-bold text-darkText font-mono">
            ₹{{ groupItems.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0).toFixed(2) }}
          </span>
        </div>

        <v-card
          v-for="item in groupItems"
          :key="item.id"
          variant="outlined"
          elevation="0"
          class="mb-2.5 pa-3 rounded-lg bg-surface card-hover-border shopping-item-card"
          :class="{ 'shopping-item-purchased': item.isPurchased }"
        >
          <div class="d-flex align-center">
            <div class="mr-3 flex-shrink-0">
              <v-btn
                :icon="item.isPurchased ? 'mdi-checkbox-marked-circle' : 'mdi-checkbox-blank-circle-outline'"
                variant="text"
                size="small"
                :color="item.isPurchased ? 'success' : 'lightText'"
                @click.stop="shoppingStore.togglePurchased(item.id)"
              />
            </div>

            <div class="flex-grow-1" style="min-width: 0;">
              <div class="d-flex align-center justify-space-between flex-wrap gap-1">
                <span
                  class="text-subtitle-2 font-weight-bold text-truncate"
                  :class="{ 'text-decoration-line-through text-lightText': item.isPurchased }"
                >
                  {{ item.productName }}
                </span>
                <v-chip
                  size="x-small"
                  :color="getPriorityColor(item.priority)"
                  variant="tonal"
                  class="font-weight-bold flex-shrink-0"
                >
                  {{ item.priority.toUpperCase() }}
                </v-chip>
              </div>

              <div class="d-flex align-center gap-2 mt-1 text-caption text-lightText flex-wrap">
                <span class="font-weight-bold text-darkText">Qty: {{ item.quantity }}</span>
                <span>•</span>
                <span>₹{{ Number(item.price).toFixed(2) }} / unit</span>
              </div>
            </div>

            <div class="text-right ml-3 flex-shrink-0">
              <div class="text-subtitle-2 font-weight-bold font-mono text-primary">
                ₹{{ ((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2) }}
              </div>
              <div class="d-flex align-center justify-end">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="x-small"
                  variant="text"
                  color="primary"
                  @click="openEditModal(item)"
                />
                <v-btn
                  icon="mdi-trash-can-outline"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="confirmDeleteItem(item)"
                />
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Quick Batch Actions: Clear Completed -->
    <div
      v-if="shoppingStore.purchasedCount > 0"
      class="mt-4 pt-2 text-center"
    >
      <v-btn
        variant="tonal"
        color="secondary"
        size="small"
        prepend-icon="mdi-check-all"
        rounded="lg"
        class="text-capitalize font-weight-medium"
        @click="shoppingStore.clearPurchased()"
      >
        Clear {{ shoppingStore.purchasedCount }} Purchased Items
      </v-btn>
    </div>

    <!-- ================================================================= -->
    <!-- ADD / EDIT PRODUCT DIALOG (With Autocomplete & DB Auto-Save)      -->
    <!-- ================================================================= -->
    <v-dialog v-model="dialogOpen" max-width="500" persistent>
      <v-card class="rounded-lg pa-2">
        <v-card-title class="d-flex align-center justify-space-between pt-4 px-4">
          <div class="d-flex align-center">
            <v-avatar color="primary" variant="tonal" size="32" rounded="lg" class="mr-2">
              <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-cart-plus'" size="18" />
            </v-avatar>
            <span class="font-weight-bold text-darkText">
              Add/Edit Product
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </v-card-title>

        <v-card-text class="pt-2 px-4 pb-0">
          <v-form ref="formRef" @submit.prevent="submitProduct">
            <!-- 1. PRODUCT NAME WITH AUTOCOMPLETE (Saved from DB) -->
            <div class="mb-3">
              <v-combobox
                v-model="form.productName"
                :items="shoppingStore.catalogProductNames"
                label="Product Name *"
                placeholder="Choose or type new product name (e.g. Olive Oil 1L)"
                variant="outlined"
                density="comfortable"
                rounded="md"
                prepend-inner-icon="mdi-cart-outline"
                clearable
                :rules="[(v) => !!v || 'Product name is required']"
                @update:model-value="onProductNameChange"
              >
                <template #prepend-item>
                  <div class="px-3 py-1 text-caption text-lightText font-weight-bold border-b bg-containerBg">
                    Saved Products (Autocomplete)
                  </div>
                </template>
              </v-combobox>
            </div>

            <!-- 2. PRICE & QUANTITY INPUTS -->
            <v-row density="compact" class="mb-1">
              <v-col cols="6">
                <v-text-field
                  v-model.number="form.price"
                  label="Price (₹) *"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                  variant="outlined"
                  density="comfortable"
                  rounded="md"
                  prepend-inner-icon="mdi-currency-inr"
                  :rules="[(v) => (v !== null && v >= 0) || 'Enter valid price']"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="form.quantity"
                  label="Quantity *"
                  placeholder="1"
                  type="number"
                  step="1"
                  min="1"
                  variant="outlined"
                  density="comfortable"
                  rounded="md"
                  prepend-inner-icon="mdi-numeric"
                  :rules="[(v) => (v !== null && v > 0) || 'Quantity must be at least 1']"
                />
              </v-col>
            </v-row>

            <!-- Live Total Preview Box -->
            <div class="pa-2 px-3 mb-3 rounded-md bg-containerBg border d-flex align-center justify-space-between">
              <span class="text-caption text-lightText font-weight-medium">Calculated Subtotal:</span>
              <span class="text-subtitle-2 font-weight-bold text-primary font-mono">
                ₹{{ ((Number(form.price) || 0) * (Number(form.quantity) || 1)).toFixed(2) }}
              </span>
            </div>

            <!-- 3. PRIORITY FLAG SELECTOR -->
            <div class="mb-3">
              <div class="text-caption font-weight-bold text-lightText text-uppercase mb-1.5">
                Priority Flag:
              </div>
              <v-btn-toggle
                v-model="form.priority"
                mandatory
                density="compact"
                color="primary"
                rounded="lg"
                class="w-100 d-flex priority-toggle-group"
              >
                <v-btn
                  value="urgent"
                  size="x-small"
                  class="flex-grow-1 font-weight-bold px-1"
                  :color="form.priority === 'urgent' ? 'error' : undefined"
                >
                  <v-icon icon="mdi-alert-octagon" size="13" class="mr-0.5" />
                  Urgent
                </v-btn>
                <v-btn
                  value="high"
                  size="x-small"
                  class="flex-grow-1 font-weight-bold px-1"
                  :color="form.priority === 'high' ? 'warning' : undefined"
                >
                  <v-icon icon="mdi-alert-circle" size="13" class="mr-0.5" />
                  High
                </v-btn>
                <v-btn
                  value="medium"
                  size="x-small"
                  class="flex-grow-1 font-weight-bold px-1"
                  :color="form.priority === 'medium' ? 'primary' : undefined"
                >
                  <v-icon icon="mdi-arrow-up-circle-outline" size="13" class="mr-0.5" />
                  Medium
                </v-btn>
                <v-btn
                  value="low"
                  size="x-small"
                  class="flex-grow-1 font-weight-bold px-1"
                  :color="form.priority === 'low' ? 'success' : undefined"
                >
                  <v-icon icon="mdi-arrow-down-circle-outline" size="13" class="mr-0.5" />
                  Low
                </v-btn>
              </v-btn-toggle>
            </div>

            <!-- 4. TAGGING FEATURE (To group products - matching Expenses theme) -->
            <div class="mb-3">
              <v-combobox
                v-model="form.tags"
                :items="shoppingStore.allTags"
                label="Product Tags / Category Group"
                placeholder="Type tag & press enter (e.g. Groceries, Dairy)"
                multiple
                chips
                closable-chips
                variant="outlined"
                density="comfortable"
                rounded="lg"
                prepend-inner-icon="mdi-tag-multiple-outline"
                persistent-hint
              />

              <!-- Quick Tag Suggestions -->
              <div class="d-flex align-center gap-1 mt-2 flex-wrap text-caption">
                <span class="text-medium-emphasis">Tags:</span>
                <v-chip
                  v-for="sug in suggestedQuickTags"
                  :key="sug"
                  size="x-small"
                  variant="outlined"
                  color="primary"
                  class="cursor-pointer"
                  @click="addSuggestedTag(sug)"
                >
                  + {{ sug }}
                </v-chip>
              </div>
            </div>

            <!-- 5. ASSIGNED MEMBER -->
            <v-select
              v-model="form.memberId"
              :items="familyOptions"
              item-title="name"
              item-value="id"
              label="Assigned To / Added By"
              variant="outlined"
              density="comfortable"
              rounded="md"
              prepend-inner-icon="mdi-account"
              class="mb-3"
            />

            <!-- 6. OPTIONAL NOTES -->
            <v-textarea
              v-model="form.notes"
              label="Notes (Optional)"
              placeholder="e.g. Preferred brand, aisle number, or size"
              rows="2"
              variant="outlined"
              density="comfortable"
              rounded="md"
              auto-grow
              hide-details="auto"
              class="mb-1"
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 pt-0">
          <v-spacer />
          <v-btn variant="text" rounded="md" @click="closeDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            rounded="md"
            class="px-4 font-weight-bold"
            @click="submitProduct"
          >
            {{ isEditing ? 'Save Changes' : 'Add to List' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteConfirmOpen" max-width="400">
      <v-card class="rounded-lg pa-3">
        <v-card-title class="d-flex align-center text-subtitle-1 font-weight-bold">
          <v-icon icon="mdi-alert-circle-outline" color="error" class="mr-2" />
          Delete Product?
        </v-card-title>
        <v-card-text class="py-2 text-body-2 text-lightText">
          Are you sure you want to remove
          <strong class="text-darkText">{{ itemToDelete?.productName }}</strong>
          from the shopping list?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" size="small" @click="deleteConfirmOpen = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" size="small" rounded="md" @click="executeDeleteItem">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useShoppingStore } from '@/stores/shopping'
import { useFamilyStore } from '@/stores/family'
import type { ShoppingItem, ShoppingPriority } from '@/types'
import {
  getShoppingPriorityColor,
  getShoppingPriorityIcon,
} from '@/services/service.js'

const shoppingStore = useShoppingStore()
const familyStore = useFamilyStore()

const showFiltersPanel = ref(false)
const viewGroupedByTag = ref(false)
const dialogOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref<any>(null)

const deleteConfirmOpen = ref(false)
const itemToDelete = ref<ShoppingItem | null>(null)

// Form State
const defaultForm = {
  productName: '',
  price: 0,
  quantity: 1,
  priority: 'medium' as ShoppingPriority,
  tags: [] as string[],
  memberId: '',
  notes: '',
}

const form = reactive({ ...defaultForm })

const suggestedQuickTags = [
  'Groceries',
  'Pantry',
  'Household',
  'Dairy',
  'Produce',
  'Bakery',
  'Snacks',
  'Beverages',
]

const familyOptions = computed(() => {
  return familyStore.members.map((m) => ({
    id: m.id,
    name: m.name,
  }))
})

// Auto-fill price and tag if user picks an existing catalog item
function onProductNameChange(val: string | null) {
  if (!val) return
  const clean = val.trim().toLowerCase()
  const found = shoppingStore.catalogProducts.find((p) => p.name.trim().toLowerCase() === clean)
  if (found) {
    if (typeof found.defaultPrice === 'number' && found.defaultPrice > 0 && !form.price) {
      form.price = found.defaultPrice
    }
    if (found.defaultTag && (!form.tags || form.tags.length === 0)) {
      form.tags = [found.defaultTag]
    }
  }
}

function addSuggestedTag(tag: string) {
  if (!form.tags) form.tags = []
  if (!form.tags.includes(tag)) {
    form.tags.push(tag)
  }
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  Object.assign(form, {
    productName: '',
    price: 0,
    quantity: 1,
    priority: 'medium',
    tags: shoppingStore.activeTagFilter ? [shoppingStore.activeTagFilter] : ['Groceries'],
    memberId: familyStore.activeMember.id,
    notes: '',
  })
  dialogOpen.value = true
}

function openEditModal(item: ShoppingItem) {
  isEditing.value = true
  editingId.value = item.id
  Object.assign(form, {
    productName: item.productName,
    price: item.price,
    quantity: item.quantity,
    priority: item.priority,
    tags: Array.isArray(item.tags) ? [...item.tags] : [],
    memberId: item.memberId || familyStore.activeMember.id,
    notes: item.notes || '',
  })
  dialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  isEditing.value = false
  editingId.value = null
}

async function submitProduct() {
  if (!form.productName || !form.productName.trim()) {
    return
  }

  const payload = {
    productName: form.productName.trim(),
    price: Number(form.price) || 0,
    quantity: Math.max(1, Number(form.quantity) || 1),
    priority: form.priority,
    tags: Array.isArray(form.tags) ? form.tags.map((t) => t.trim()).filter(Boolean) : [],
    memberId: form.memberId || familyStore.activeMember.id,
    notes: form.notes?.trim() || '',
    isPurchased: false,
  }

  if (isEditing.value && editingId.value) {
    await shoppingStore.updateShoppingItem(editingId.value, payload)
  } else {
    await shoppingStore.addShoppingItem(payload)
  }

  closeDialog()
}

function confirmDeleteItem(item: ShoppingItem) {
  itemToDelete.value = item
  deleteConfirmOpen.value = true
}

async function executeDeleteItem() {
  if (itemToDelete.value) {
    await shoppingStore.deleteShoppingItem(itemToDelete.value.id)
    deleteConfirmOpen.value = false
    itemToDelete.value = null
  }
}

// Filter helpers
const hasActiveFilters = computed(() => {
  return (
    !!shoppingStore.activeTagFilter ||
    shoppingStore.selectedPriority !== 'all' ||
    shoppingStore.selectedStatus !== 'all' ||
    !!shoppingStore.searchQuery.trim()
  )
})

const filterSummary = computed(() => {
  const parts: string[] = []
  if (shoppingStore.activeTagFilter) parts.push(`Tag: "${shoppingStore.activeTagFilter}"`)
  if (shoppingStore.selectedPriority !== 'all') parts.push(`Priority: ${shoppingStore.selectedPriority}`)
  if (shoppingStore.selectedStatus !== 'all') parts.push(`Status: ${shoppingStore.selectedStatus}`)
  if (shoppingStore.searchQuery.trim()) parts.push(`Query: "${shoppingStore.searchQuery.trim()}"`)
  return parts.length > 0 ? parts.join(' • ') : 'Showing all products'
})

function resetFilters() {
  shoppingStore.activeTagFilter = null
  shoppingStore.selectedPriority = 'all'
  shoppingStore.selectedStatus = 'all'
  shoppingStore.searchQuery = ''
}

const listHeaderTitle = computed(() => {
  if (shoppingStore.activeTagFilter) {
    return `Products in "${shoppingStore.activeTagFilter}"`
  }
  if (shoppingStore.selectedPriority !== 'all') {
    return `${shoppingStore.selectedPriority.toUpperCase()} Priority Products`
  }
  if (shoppingStore.selectedStatus === 'pending') {
    return 'To Buy (Pending)'
  }
  if (shoppingStore.selectedStatus === 'purchased') {
    return 'Purchased Products'
  }
  return 'All Shopping Products'
})

const currentSortLabel = computed(() => {
  switch (shoppingStore.sortBy) {
    case 'priority':
      return 'Priority'
    case 'price-desc':
      return 'Price: High'
    case 'price-asc':
      return 'Price: Low'
    case 'name':
      return 'Name (A-Z)'
    case 'newest':
      return 'Newest'
    default:
      return 'Sort'
  }
})

function getPriorityColor(priority: string) {
  return getShoppingPriorityColor(priority)
}

function getPriorityIcon(priority: string) {
  return getShoppingPriorityIcon(priority)
}

function getMember(id?: string) {
  if (!id) return undefined
  return familyStore.members.find((m) => m.id === id)
}

function getMemberName(id?: string) {
  const m = getMember(id)
  return m ? m.name : 'Family'
}
</script>

<style scoped lang="scss">
.shopping-component {
  max-width: 100%;
}

.shopping-item-card {
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.5) !important;
  }
}

.shopping-item-purchased {
  opacity: 0.75;
  background-color: rgba(var(--v-theme-surface-variant), 0.2) !important;
}

.font-mono {
  font-family: 'Roboto Mono', monospace, sans-serif !important;
}

.priority-toggle-group {
  width: 100%;
  display: flex !important;

  :deep(.v-btn) {
    flex: 1 1 0 !important;
    min-width: 0 !important;
    padding-left: 2px !important;
    padding-right: 2px !important;
    text-transform: capitalize !important;
    letter-spacing: 0 !important;
    font-size: 0.72rem !important;

    .v-btn__content {
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      padding: 0 !important;
    }

    .v-icon {
      font-size: 13px !important;
      margin-right: 2px !important;
    }
  }
}
</style>
