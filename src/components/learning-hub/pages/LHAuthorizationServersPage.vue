<template>
  <div class="authorization-servers-content">
    <h1>Authorization servers</h1>
    <p>
      Authorization servers issue and validate access tokens for OAuth 2.0 and OpenID Connect (OIDC) authentication flows.
    </p>
    <p>
      An authorization server controls how clients authenticate, which scopes can be requested, and what information is included in issued tokens.
    </p>

    <h2>Related</h2>
    <ul class="related-list">
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
      <li>
        <a href="#" @click.prevent="emit('navigate', 'clients')">
          <div class="related-item">
            <BadgeIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Clients
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { RuleIcon, DataInfoAlertIcon, BadgeIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.authorization-servers-content {
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

  p {
    color: $kui-color-text-neutral-strong;
    font-size: $kui-font-size-30;
    line-height: $kui-line-height-40;
    margin-bottom: $kui-space-50;
    margin-top: $kui-space-50;
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
