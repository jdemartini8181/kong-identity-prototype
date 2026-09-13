<template>
  <div class="learn-about-identity-content">
    <h1>Learn about identity</h1>
    <p>
      Before you start using Kong Identity, it's helpful to understand how its core building blocks work together:
    </p>

    <h2>Principals</h2>
    <p>
      Represent applications, services, and workloads that authenticate to your APIs. When you create a principal, you'll also configure how it authenticates and optionally add metadata that can be used to drive gateway policies and behavior.
    </p>
    <ul>
      <li>
        <strong>Authentication</strong> – Defines how a principal is recognized, including API keys, basic auth, OAuth 2.0, and OpenID Connect (OIDC).
      </li>
      <li>
        <strong>Metadata</strong> – Stores information about a principal that can be used to drive gateway policies and behavior.
      </li>
    </ul>

    <h2>Authorization servers</h2>
    <p>
      Issue and validate access tokens for OAuth 2.0 and OpenID Connect (OIDC) authentication flows. When you create an authorization server, you'll also configure scopes, claims, and clients.
    </p>
    <ul>
      <li>
        <strong>Scopes</strong> – Define what access a client can request when obtaining an access token.
      </li>
      <li>
        <strong>Claims</strong> – Represent information included in access tokens that APIs can use to make authorization decisions.
      </li>
      <li>
        <strong>Clients</strong> – Applications or services that request tokens from an authorization server.
      </li>
    </ul>

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
        <a href="#" @click.prevent="emit('navigate', 'authorization-servers')">
          <div class="related-item">
            <LockIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Authorization servers
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { LinkedServicesIcon, LockIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.learn-about-identity-content {
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
