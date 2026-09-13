<template>
  <div class="authentication-content">
    <h1>Authentication</h1>
    <p>
      Authentication defines how a principal is recognized when it accesses your APIs.
    </p>
    <p>
      You can configure authentication for a principal using API keys, basic auth, OAuth 2.0, OpenID Connect (OIDC), consumers, and external identity systems. A principal can support multiple authentication methods, making it easier to manage different access patterns and migrate from existing consumer-based configurations.
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
import { LinkedServicesIcon, MetadataIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.authentication-content {
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
