<template>
  <div class="metadata-content">
    <h1>Metadata</h1>
    <p>
      Metadata is a collection of key-value pairs attached to a principal.
    </p>
    <p>
      You can use metadata to drive gateway behavior and policy decisions. For example, metadata can be used to control access, apply rate limits, or conditionally execute plugins based on attributes such as business unit, environment, or service tier.
    </p>

    <h2>Related</h2>
    <ul class="related-list">
      <li>
        <a href="#" @click.prevent="emit('navigate', 'principals')">
          <div class="related-item">
            <LinkedServicesIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Principals
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'authentication')">
          <div class="related-item">
            <AccountTreeIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Authentication
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { LinkedServicesIcon, AccountTreeIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.metadata-content {
  h1 {
    font-size: $kui-font-size-60;
    font-weight: $kui-font-weight-semibold;
    margin-bottom: $kui-space-50;
    margin-top: $kui-space-0;
  }

  p {
    color: $kui-color-text-neutral-strong;
    font-size: $kui-font-size-30;
    line-height: $kui-line-height-40;
    margin-bottom: $kui-space-50;
    margin-top: $kui-space-50;
  }

  h2 {
    font-size: $kui-font-size-40;
    font-weight: $kui-font-weight-semibold;
    margin-bottom: $kui-space-30;
    margin-top: $kui-space-70;
  }

  .related-list {
    list-style: none;
    margin-top: $kui-space-50;
    padding-left: $kui-space-0;

    li a {
      color: inherit;
      display: flex;
      text-decoration: none;

      &:hover {
        background-color: $kui-color-background-neutral-weakest;
        border-radius: $kui-border-radius-20;
      }
    }

    .related-item {
      align-items: center;
      display: flex;
      font-size: $kui-font-size-30;
      font-weight: $kui-font-weight-medium;
      gap: $kui-space-30;
      padding: $kui-space-50;
    }
  }
}
</style>
