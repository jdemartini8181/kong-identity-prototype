import { ref } from 'vue'

// Module-level singleton — shared across all component instances
const dpaAccepted = ref(false)
const showDpaModal = ref(false)
const isOrgAdmin = ref(true)

export function useDpaState() {
  return {
    dpaAccepted,
    showDpaModal,
    isOrgAdmin,
    acceptDpa: () => {
      dpaAccepted.value = true
      showDpaModal.value = false
    },
    openModal: () => {
      showDpaModal.value = true
    },
    dismissModal: () => {
      showDpaModal.value = false
    },
  }
}
