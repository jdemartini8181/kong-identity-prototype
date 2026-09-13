<template>
  <KButton
    appearance="secondary"
    class="open-learning-hub"
    data-testid="open-learning-hub-through-book-icon-button"
    icon
    @click="handleClick"
  >
    <BookIcon decorative />
  </KButton>
</template>

<script setup lang="ts">
import { BookIcon } from '@kong/icons'
import { KButton } from '@kong/kongponents'
import { useLearningHub, type LearningHubPage } from '@/composables/useLearningHub'

const props = defineProps<{
  learningHubPath: string
}>()

const { openTo } = useLearningHub()

const handleClick = (): void => {
  // Extract page name from path e.g. "/global/learning-hub/identity" → "identity"
  const page = props.learningHubPath.split('/').pop() as LearningHubPage
  openTo(page ?? 'identity')
}
</script>
