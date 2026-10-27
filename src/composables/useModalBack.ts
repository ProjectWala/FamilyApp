import { watch, onMounted, onUnmounted, type Ref } from 'vue'

let isHandlingPopState = false

/**
 * Synchronizes a modal/drawer boolean ref with browser history.
 * - When the modal opens, it pushes a state to browser history.
 * - If the user presses the phone's physical back button or browser back,
 *   the modal closes without navigating away from the current component.
 * - If the modal closes via UI (e.g. Cancel/Save/X), it cleanly pops the history state.
 */
export function useModalBack(isOpenRef: Ref<boolean>, modalName: string = 'modal') {
  let hasPushed = false

  watch(isOpenRef, (isOpen) => {
    if (isOpen) {
      if (!hasPushed && !isHandlingPopState) {
        window.history.pushState({ modalOpen: true, modalName }, '')
        hasPushed = true
      }
    } else {
      if (hasPushed && !isHandlingPopState) {
        hasPushed = false
        window.history.back()
      }
    }
  })

  const onPopState = () => {
    if (isOpenRef.value && hasPushed) {
      isHandlingPopState = true
      isOpenRef.value = false
      hasPushed = false
      setTimeout(() => {
        isHandlingPopState = false
      }, 50)
    }
  }

  onMounted(() => {
    window.addEventListener('popstate', onPopState)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', onPopState)
    if (hasPushed && !isHandlingPopState) {
      hasPushed = false
      window.history.back()
    }
  })
}
