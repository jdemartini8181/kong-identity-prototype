<template>
  <div class="identity-content">
    <h1>Identity</h1>
    <p>
      Identity helps you manage the applications, services, users, and workloads that authenticate to your APIs and event upstreams.
    </p>
    <p>
      You can create a principal once and use it across multiple gateways and Kong products instead of creating and maintaining separate consumers on individual gateways. Identity centralizes authentication configuration and metadata, making it easier to manage access at scale.
    </p>

    <h2>What is Identity?</h2>
    <p>
      Identity provides a centralized way to manage authenticating entities across your Kong environment.
    </p>
    <p>With Identity, you can:</p>
    <ul>
      <li>Create principals that represent applications, services, users, and workloads</li>
      <li>Configure authentication using API keys, basic auth, OAuth 2.0, or OpenID Connect (OIDC)</li>
      <li>Share identity across Kong Gateway, Event Gateway, and Dev Portal</li>
      <li>Store metadata that can be used to drive gateway policies and behavior</li>
      <li>Reduce duplicate configuration by managing authentication in one place</li>
    </ul>

    <div class="setup-identity">
      <a
        data-testid="learn-about-identity"
        href="#"
        @click.prevent="emit('navigate', 'learn-about-identity')"
      >
        <div class="runtime-icon">
          <DocumentIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
        </div>
        <div class="action-btn">
          Learn about Identity
        </div>
        <ChevronRightIcon :color="KUI_COLOR_TEXT_NEUTRAL" />
      </a>
      <a
        data-testid="setup-identity"
        href="#"
        @click.prevent="emit('navigate', 'setup-identity')"
      >
        <div class="runtime-icon">
          <RocketIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
        </div>
        <div class="action-btn">
          Setup Identity
        </div>
        <ChevronRightIcon :color="KUI_COLOR_TEXT_NEUTRAL" />
      </a>
    </div>

    <h2>Identity entities</h2>
    <ul class="identity-entities-list">
      <li>
        <a href="#" @click.prevent="emit('navigate', 'principals')">
          <div class="identity-entities-item">
            <LinkedServicesIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Principals
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'authentication')">
          <div class="identity-entities-item">
            <AccountTreeIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Authentication
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'metadata')">
          <div class="identity-entities-item">
            <MetadataIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Metadata
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'authorization-servers')">
          <div class="identity-entities-item">
            <LockIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Authorization servers
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'scopes')">
          <div class="identity-entities-item">
            <RuleIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Scopes
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'claims')">
          <div class="identity-entities-item">
            <DataInfoAlertIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Claims
          </div>
        </a>
      </li>
      <li>
        <a href="#" @click.prevent="emit('navigate', 'clients')">
          <div class="identity-entities-item">
            <BadgeIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Clients
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ChevronRightIcon, RocketIcon, DocumentIcon, RuleIcon, DataInfoAlertIcon, BadgeIcon, AccountTreeIcon, LockIcon, LinkedServicesIcon, MetadataIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA, KUI_COLOR_TEXT_NEUTRAL } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.identity-content {
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

  ul:not(.identity-entities-list) {
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

  .setup-identity {
    margin-bottom: $kui-space-80;
    margin-top: $kui-space-50;

    a {
      align-items: center;
      color: inherit;
      display: flex;
      gap: 6px;
      padding: $kui-space-50;
      text-decoration: none;

      &:hover {
        background-color: $kui-color-background-neutral-weakest;
        border-radius: $kui-border-radius-20;
      }

      .runtime-icon {
        flex-shrink: 0;
        margin-right: $kui-space-20;
      }

      .action-btn {
        flex: 1;
        font-size: $kui-font-size-30;
        font-weight: $kui-font-weight-medium;
      }
    }
  }

  .identity-entities-list {
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

    .identity-entities-item {
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
