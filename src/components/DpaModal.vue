<template>
  <KModal
    :visible="true"
    :z-index="10000"
    title="We've updated our Data Protection Addendum"
    action-button-text="Accept"
    :action-button-disabled="!accepted"
    cancel-button-text="Not now"
    max-width="640px"
    data-testid="dpa-modal"
    @cancel="emit('dismiss')"
    @proceed="emit('accept')"
  >
    <div class="dpa-body">
      <p class="dpa-body-text">{{ props.description }}</p>
      <a class="dpa-link" href="#" target="_blank">Read the Data Protection Addendum</a>
      <KCheckbox
        v-model="accepted"
        label="I acknowledge and agree to the updated Data Protection Addendum."
      />
    </div>
  </KModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { KModal, KCheckbox } from '@kong/kongponents'

const accepted = ref(false)

const props = withDefaults(defineProps<{
  description?: string
}>(), {
  description: "Accept the updated Data Protection Addendum to enable basic auth for principals in your organization.",
})

const emit = defineEmits<{
  (e: 'accept'): void
  (e: 'dismiss'): void
}>()
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.dpa-body {
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
}

.dpa-body-text {
  color: $kui-color-text-neutral-strong;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;

  strong {
    color: $kui-color-text;
    font-weight: $kui-font-weight-semibold;
  }
}

.dpa-link {
  color: $kui-color-text-primary;
  font-size: $kui-font-size-30;
  text-decoration: underline;

  &:hover {
    color: $kui-color-text-primary-strong;
  }
}
</style>
