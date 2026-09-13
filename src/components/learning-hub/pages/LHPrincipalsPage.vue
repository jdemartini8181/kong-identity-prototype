<template>
  <div class="principals-content">
    <h1>Principals</h1>
    <p>
      Principals represent applications, services, users, and other workloads that authenticate to your APIs.
    </p>
    <p>
      A principal provides a centralized alternative to consumers. Instead of creating and maintaining separate consumers on each gateway, you can create a principal once and use it across multiple gateways in the same region.
    </p>
    <p>
      Principals can be used to authenticate API traffic, share identity across Kong products, and store metadata that can be used to drive gateway policies and behavior.
    </p>

    <h2>Related</h2>
    <ul class="related-list">
      <li>
        <a href="#" @click.prevent="emit('navigate', 'authentication')">
          <div class="related-item">
            <AccountTreeIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Authentication
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'metadata')">
          <div class="related-item">
            <MetadataIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Metadata
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { AccountTreeIcon, MetadataIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.principals-content {
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
