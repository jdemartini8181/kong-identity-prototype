<template>
  <div class="claims-content">
    <h1>Claims</h1>
    <p>
      Claims are name and value pairs inside tokens. They contain fine-grained data about the subject or the access being granted. For example, a user might add claims such as:
    </p>
    <ul>
      <li>
        <strong>Name:</strong> role – <strong>Value:</strong> payment-service
      </li>
      <li>
        <strong>Name:</strong> env – <strong>Value:</strong> prod
      </li>
    </ul>
    <p>
      Claims enable your APIs to make detailed, attribute-based decisions about what a client is allowed to do.
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
import { LockIcon, RuleIcon, BadgeIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.claims-content {
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
