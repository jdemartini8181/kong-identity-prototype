import { ref } from 'vue'

export type LearningHubPage =
  | 'identity'
  | 'learn-about-identity'
  | 'setup-identity'
  | 'principals'
  | 'authentication'
  | 'metadata'
  | 'authorization-servers'
  | 'clients'
  | 'scopes'
  | 'claims'

// Module-level singletons — persists across component mounts
const isOpen = ref(false)
const currentPage = ref<LearningHubPage>('identity')
const pageHistory = ref<LearningHubPage[]>([])

export function useLearningHub() {
  const openTo = (page: LearningHubPage) => {
    pageHistory.value = []
    currentPage.value = page
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const navigateTo = (page: LearningHubPage) => {
    pageHistory.value.push(currentPage.value)
    currentPage.value = page
  }

  const goBack = () => {
    if (pageHistory.value.length > 0) {
      currentPage.value = pageHistory.value.pop()!
    }
  }

  return {
    isOpen,
    currentPage,
    pageHistory,
    openTo,
    close,
    navigateTo,
    goBack,
  }
}
