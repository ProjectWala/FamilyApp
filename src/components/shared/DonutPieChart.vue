<template>
  <div class="donut-pie-container d-flex flex-column align-center">
    <div class="chart-wrapper position-relative" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg
        :viewBox="`0 0 ${size} ${size}`"
        :width="size"
        :height="size"
        class="donut-svg"
      >
        <!-- Empty / Background track -->
        <circle
          v-if="isDonut"
          :cx="cx"
          :cy="cy"
          :r="midRadius"
          fill="none"
          :stroke="trackColor"
          :stroke-width="donutWidth"
          class="track-circle"
        />
        <circle
          v-else
          :cx="cx"
          :cy="cy"
          :r="outerRadius"
          :fill="trackColor"
          class="track-circle"
        />

        <!-- Empty State text if total is 0 -->
        <g v-if="totalValue === 0">
          <text
            :x="cx"
            :y="cy - 2"
            text-anchor="middle"
            dominant-baseline="middle"
            class="empty-text"
            fill="currentColor"
          >
            {{ emptyLabel }}
          </text>
        </g>

        <!-- Slices -->
        <g v-else>
          <path
            v-for="(slice, index) in computedSlices"
            :key="index"
            :d="slice.path"
            :fill="slice.color"
            :class="{ 'slice-hovered': activeIndex === index }"
            class="chart-slice"
            @mouseenter="onSliceHover(index)"
            @mouseleave="onSliceLeave"
            @touchstart.passive="onSliceHover(index)"
          >
            <title>{{ slice.label }}: {{ unit }}{{ slice.value.toLocaleString() }} ({{ slice.percentage }}%)</title>
          </path>
        </g>
      </svg>

      <!-- Donut Hole Content (Center Badge) -->
      <div
        v-if="isDonut"
        class="donut-center d-flex flex-column align-center justify-center text-center"
        :style="{
          width: `${(innerRadius - 4) * 2}px`,
          height: `${(innerRadius - 4) * 2}px`,
          left: `${cx - (innerRadius - 4)}px`,
          top: `${cy - (innerRadius - 4)}px`,
        }"
      >
        <template v-if="displaySlice">
          <v-icon
            v-if="displaySlice.icon"
            :icon="displaySlice.icon"
            size="18"
            :style="{ color: displaySlice.color }"
            class="mb-0"
          />
          <div
            class="text-caption font-weight-bold line-clamp-1 px-1"
            :style="{ color: displaySlice.color, fontSize: size < 130 ? '11px' : '13px' }"
          >
            {{ displaySlice.label }}
          </div>
          <div
            class="font-weight-black line-height-1"
            :style="{ fontSize: size < 130 ? '13px' : '17px' }"
          >
            {{ unit }}{{ Math.round(displaySlice.value).toLocaleString() }}
          </div>
          <div class="text-caption text-medium-emphasis" style="font-size: 10px;">
            {{ displaySlice.percentage }}%
          </div>
        </template>
        <template v-else>
          <v-icon
            v-if="centerIcon"
            :icon="centerIcon"
            size="18"
            class="mb-0"
            :style="{ color: centerColor || 'inherit' }"
          />
          <div
            v-if="centerTitle"
            class="font-weight-black line-height-1"
            :style="{
              fontSize: size < 130 ? '14px' : '18px',
              color: centerColor || 'inherit'
            }"
          >
            {{ centerTitle }}
          </div>
          <div
            v-if="centerSubtitle"
            class="text-caption text-medium-emphasis font-weight-medium line-clamp-1"
            :style="{ fontSize: size < 130 ? '9px' : '11px' }"
          >
            {{ centerSubtitle }}
          </div>
        </template>
      </div>
    </div>

    <!-- Optional Legend -->
    <div
      v-if="showLegend && computedSlices.length > 0"
      class="legend-container mt-3 d-flex flex-wrap justify-center gap-2"
    >
      <div
        v-for="(slice, index) in computedSlices"
        :key="index"
        class="legend-item d-flex align-center cursor-pointer px-2 py-1 rounded"
        :class="{ 'legend-item-active': activeIndex === index }"
        @mouseenter="onSliceHover(index)"
        @mouseleave="onSliceLeave"
      >
        <span
          class="legend-dot mr-1 flex-shrink-0"
          :style="{ backgroundColor: slice.color }"
        />
        <span class="text-caption font-weight-medium text-truncate mr-1" style="max-width: 100px;">
          {{ slice.label }}
        </span>
        <span class="text-caption font-weight-bold">
          {{ unit }}{{ Math.round(slice.value).toLocaleString() }}
        </span>
        <span class="text-caption text-medium-emphasis ml-1" style="font-size: 10px;">
          ({{ slice.percentage }}%)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import { computePieSlices } from '@/services/service.js'

export interface PieSlice {
  id?: string
  label: string
  value: number
  color: string
  icon?: string
  percentage?: number
  path?: string
  startAngle?: number
  endAngle?: number
}

const props = withDefaults(
  defineProps<{
    slices: PieSlice[]
    size?: number
    donutWidth?: number
    centerTitle?: string
    centerSubtitle?: string
    centerIcon?: string
    centerColor?: string
    trackColor?: string
    showLegend?: boolean
    unit?: string
    emptyLabel?: string
  }>(),
  {
    size: 160,
    donutWidth: 24,
    centerTitle: '',
    centerSubtitle: '',
    centerIcon: '',
    centerColor: '',
    trackColor: 'rgba(140, 140, 140, 0.12)',
    showLegend: false,
    unit: '₹',
    emptyLabel: 'No Data',
  }
)

const activeIndex = ref<number | null>(null)

const isDonut = computed(() => props.donutWidth > 0 && props.donutWidth < props.size / 2)
const cx = computed(() => props.size / 2)
const cy = computed(() => props.size / 2)
const padding = 6
const outerRadius = computed(() => props.size / 2 - padding)
const innerRadius = computed(() => (isDonut.value ? outerRadius.value - props.donutWidth : 0))
const midRadius = computed(() => (outerRadius.value + innerRadius.value) / 2)

const totalValue = computed(() => {
  return props.slices.reduce((sum, s) => sum + Math.max(0, s.value || 0), 0)
})

const computedSlices = computed<PieSlice[]>(() => {
  return computePieSlices(
    props.slices,
    totalValue.value,
    outerRadius.value,
    innerRadius.value,
    cx.value,
    cy.value
  )
})

const displaySlice = computed(() => {
  if (activeIndex.value !== null && computedSlices.value[activeIndex.value]) {
    return computedSlices.value[activeIndex.value]
  }
  return null
})

function onSliceHover(index: number) {
  activeIndex.value = index
}

function onSliceLeave() {
  activeIndex.value = null
}
</script>
