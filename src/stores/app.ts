import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useAppStore = defineStore('app', () => {
  const leftDrawer = ref(false)
  const rightDrawer = ref(false)

  // Ensure only one sidebar/drawer is open at any time
  watch(leftDrawer, (open) => {
    if (open && rightDrawer.value) {
      rightDrawer.value = false
    }
  })

  watch(rightDrawer, (open) => {
    if (open && leftDrawer.value) {
      leftDrawer.value = false
    }
  })

  function toggleLeftDrawer() {
    if (!leftDrawer.value) {
      rightDrawer.value = false
      leftDrawer.value = true
    } else {
      leftDrawer.value = false
    }
  }

  function toggleRightDrawer() {
    if (!rightDrawer.value) {
      leftDrawer.value = false
      rightDrawer.value = true
    } else {
      rightDrawer.value = false
    }
  }

  function closeAllDrawers() {
    leftDrawer.value = false
    rightDrawer.value = false
  }

  return {
    leftDrawer,
    rightDrawer,
    toggleLeftDrawer,
    toggleRightDrawer,
    closeAllDrawers,
  }
})
