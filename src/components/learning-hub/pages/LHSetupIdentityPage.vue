<template>
  <div class="setup-identity-content">
    <h1>Setup identity</h1>
    <p>
      To configure Kong Identity, follow this recommended setup order:
    </p>

    <ol>
      <li>
        <strong>Create a principal</strong>
        <p>Create a principal to represent an application, service, or workload that needs to authenticate with your APIs.</p>
      </li>
      <li>
        <strong>Choose an authentication method</strong>
        <p>Kong Identity supports API keys, basic auth, OAuth 2.0, and OpenID Connect (OIDC).</p>
        <ul>
          <li>For API keys and basic auth, you can configure authentication directly on the principal.</li>
          <li>For OAuth 2.0 and OpenID Connect (OIDC), you must first create an authorization server.</li>
        </ul>
      </li>
      <li>
        <strong>Set up an authorization server, if needed</strong>
        <p>If you're using OAuth 2.0 or OpenID Connect (OIDC), create an authorization server before configuring authentication on the principal.</p>
        <p>When you set up an authorization server, you will also configure:</p>
        <ul>
          <li><strong>Scopes</strong> – Define what access a client can request when obtaining an access token.</li>
          <li><strong>Claims</strong> – Represent information included in access tokens that APIs can use to make authorization decisions.</li>
          <li><strong>Clients</strong> – Applications or services that request access tokens from an authorization server.</li>
        </ul>
      </li>
      <li>
        <strong>Configure authentication</strong>
        <p>Configure how the principal authenticates. Depending on your authentication method, you may need to reference an existing authorization server.</p>
      </li>
      <li>
        <strong>Add metadata (optional)</strong>
        <p>Attach metadata to a principal to drive gateway policies, rate limits, access controls, and other behavior.</p>
      </li>
    </ol>

    <p>
      Kong Identity can be configured in Konnect or by using Terraform. Once configured, principals can authenticate with your APIs and share identity information across Kong Gateway, Event Gateway, and Dev Portal.
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
      <li>
        <a href="#" @click.prevent="emit('navigate', 'metadata')">
          <div class="related-item">
            <MetadataIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" />
            Metadata
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
import { LinkedServicesIcon, AccountTreeIcon, MetadataIcon, LockIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import type { LearningHubPage } from '@/composables/useLearningHub'

const emit = defineEmits<{
  (e: 'navigate', page: LearningHubPage): void
}>()
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.setup-identity-content {
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

  ol {
    padding-left: $kui-space-70;

    > li {
      color: $kui-color-text-neutral-strong;
      font-size: $kui-font-size-30;
      line-height: $kui-line-height-40;
      margin-bottom: $kui-space-70;

      &:last-child {
        margin-bottom: $kui-space-0;
      }

      > strong {
        color: $kui-color-text;
        font-size: $kui-font-size-30;
        font-weight: $kui-font-weight-semibold;
      }

      > p {
        margin-bottom: $kui-space-30;
        margin-top: $kui-space-20;
      }
    }
  }

  ul:not(.related-list) {
    list-style: disc;
    margin-top: $kui-space-30;
    padding-left: $kui-space-60;

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
