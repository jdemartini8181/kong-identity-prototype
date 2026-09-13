<template>
  <div class="learning-hub-helpful">
    <p class="helpful-label">
      {{ showThankYou ? 'Thank you for helping us improve!' : 'Was this helpful' }}
    </p>
    <div v-if="!showThankYou" class="group-icons">
      <button
        aria-label="Not helpful"
        class="helpful-button"
        type="button"
        @click="handleVote(false)"
      >
        <ThumbDownIcon decorative />
      </button>
      <button
        aria-label="Helpful"
        class="helpful-button"
        type="button"
        @click="handleVote(true)"
      >
        <ThumbUpIcon decorative />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ThumbUpIcon, ThumbDownIcon } from '@kong/icons'
import { useLearningHub } from '@/composables/useLearningHub'

const { currentPage } = useLearningHub()
const showThankYou = ref(false)
let timeout: ReturnType<typeof setTimeout>

const handleVote = (_helpful: boolean) => {
  showThankYou.value = true
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    showThankYou.value = false
  }, 10000)
}

watch(currentPage, () => {
  clearTimeout(timeout)
  showThankYou.value = false
})
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.learning-hub-helpful {
  align-items: center;
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  color: $kui-color-text-neutral-strong;
  display: flex;
  font-size: $kui-font-size-30;
  height: 40px;
  justify-content: space-between;
  margin-bottom: $kui-space-80;
  margin-top: $kui-space-80;
  padding: $kui-space-60;

  .helpful-label {
    margin: $kui-space-0;
  }

  .group-icons {
    display: flex;
    gap: 10px;
  }
}

.helpful-button {
  background-color: transparent;
  border: none;
  color: $kui-color-text-neutral;
  cursor: pointer;
  display: block;
  flex-shrink: 0;
  padding: $kui-space-0;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: $kui-color-text-neutral-strong;
  }
}
</style>
