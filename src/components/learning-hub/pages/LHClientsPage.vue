<template>
  <div class="clients-content">
    <h1>Clients</h1>
    <p>
      Clients are the machines that request access to protected APIs. Each client:
    </p>
    <ul>
      <li>
        Is assigned credentials, like a client ID and secret
      </li>
      <li>
        Requests tokens using specific scopes
      </li>
      <li>
        Receives tokens that contain claims
      </li>
    </ul>
    <p>
      Clients are the foundation of the identity flow. They initiate the request and use the tokens for authentication downstream.
    </p>

    <h2>Related</h2>
    <ul class="related-list">
      <li>
        <a href="#" @click.prevent="emit('navigate', 'authorization-servers')">
          <div class="related-item">
            <LockIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Authorization servers
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'scopes')">
          <div class="related-item">
            <RuleIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Scopes
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'claims')">
          <div class="related-item">
            <DataInfoAlertIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Claims
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { LockIcon, RuleIcon, DataInfoAlertIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.clients-content {
  h1 {
    font-size: $kui-font-size-60;
    font-weight: $kui-font-weight-semibold;
    margin-bottom: $kui-space-50;
    margin-top: $kui-space-0;
  }

  h2 {
    font-size: $kui-font-size-40;
    font-weight: $kui-font-weight-semibold;
    margin-bottom: $kui-space-30;
    margin-top: $kui-space-70;
  }

  ul:not(.related-list) {
    list-style: disc;
    padding-left: $kui-space-70;

    li {
      color: $kui-color-text-neutral-strong;
      font-size: $kui-font-size-30;
      line-height: $kui-line-height-40;
      margin-bottom: $kui-space-10;
      padding-bottom: $kui-space-10;
    }
  }

  p {
    color: $kui-color-text-neutral-strong;
    font-size: $kui-font-size-30;
    line-height: $kui-line-height-40;
    margin-bottom: $kui-space-20;
    margin-top: $kui-space-20;
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
