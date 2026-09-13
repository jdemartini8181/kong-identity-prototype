<template>
  <KSlideout
    class="learning-hub-slideout"
    :close-on-blur="false"
    :has-overlay="true"
    max-width="520px"
    :offset-top="60"
    :visible="isOpen"
    @close="close"
  >
    <template #title>
      <div class="lh-header">
        <div class="lh-breadcrumbs">
          <BookIcon
            :color="KUI_COLOR_TEXT_DECORATIVE_AQUA"
            :size="16"
            decorative
          />
          <span class="lh-breadcrumb-sep">/</span>
          <button
            v-if="currentPage !== 'identity'"
            class="lh-breadcrumb-link"
            type="button"
            @click="goToIdentity"
          >
            Identity
          </button>
          <span
            v-else
            class="lh-breadcrumb-current"
          >Identity</span>
          <template v-if="currentPage !== 'identity'">
            <span class="lh-breadcrumb-sep">/</span>
            <span class="lh-breadcrumb-current">{{ pageTitles[currentPage] }}</span>
          </template>
        </div>
      </div>
    </template>

    <div class="lh-body">
      <component
        :is="currentPageComponent"
        @navigate="navigateTo"
      />
      <LHHelpful />
      <LHNeedHelp :docs-link="currentDocsLink" />
    </div>
  </KSlideout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KSlideout } from '@kong/kongponents'
import { BookIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA } from '@kong/design-tokens'
import { useLearningHub, type LearningHubPage } from '@/composables/useLearningHub'
import LHHelpful from '@/components/learning-hub/LHHelpful.vue'
import LHNeedHelp from '@/components/learning-hub/LHNeedHelp.vue'
import LHIdentityPage from '@/components/learning-hub/pages/LHIdentityPage.vue'
import LHLearnAboutIdentityPage from '@/components/learning-hub/pages/LHLearnAboutIdentityPage.vue'
import LHSetupIdentityPage from '@/components/learning-hub/pages/LHSetupIdentityPage.vue'
import LHPrincipalsPage from '@/components/learning-hub/pages/LHPrincipalsPage.vue'
import LHAuthenticationPage from '@/components/learning-hub/pages/LHAuthenticationPage.vue'
import LHMetadataPage from '@/components/learning-hub/pages/LHMetadataPage.vue'
import LHAuthorizationServersPage from '@/components/learning-hub/pages/LHAuthorizationServersPage.vue'
import LHClientsPage from '@/components/learning-hub/pages/LHClientsPage.vue'
import LHScopesPage from '@/components/learning-hub/pages/LHScopesPage.vue'
import LHClaimsPage from '@/components/learning-hub/pages/LHClaimsPage.vue'

const { isOpen, currentPage, close, navigateTo } = useLearningHub()

const pageTitles: Record<LearningHubPage, string> = {
  'identity': 'Identity',
  'learn-about-identity': 'Learn about identity',
  'setup-identity': 'Setup identity',
  'principals': 'Principals',
  'authentication': 'Authentication',
  'metadata': 'Metadata',
  'authorization-servers': 'Authorization servers',
  'clients': 'Clients',
  'scopes': 'Scopes',
  'claims': 'Claims',
}

const docsLinks: Record<LearningHubPage, string> = {
  'identity': 'https://developer.konghq.com/kong-identity/',
  'learn-about-identity': 'https://developer.konghq.com/kong-identity/#how-kong-identity-works',
  'setup-identity': 'https://developer.konghq.com/kong-identity/#configure-kong-identity',
  'principals': 'https://developer.konghq.com/kong-identity/',
  'authentication': 'https://developer.konghq.com/kong-identity/',
  'metadata': 'https://developer.konghq.com/kong-identity/',
  'authorization-servers': 'https://developer.konghq.com/kong-identity/',
  'clients': 'https://developer.konghq.com/kong-identity/#how-kong-identity-works',
  'scopes': 'https://developer.konghq.com/kong-identity/#how-kong-identity-works',
  'claims': 'https://developer.konghq.com/kong-identity/#how-kong-identity-works',
}

const pageComponents: Record<LearningHubPage, object> = {
  'identity': LHIdentityPage,
  'learn-about-identity': LHLearnAboutIdentityPage,
  'setup-identity': LHSetupIdentityPage,
  'principals': LHPrincipalsPage,
  'authentication': LHAuthenticationPage,
  'metadata': LHMetadataPage,
  'authorization-servers': LHAuthorizationServersPage,
  'clients': LHClientsPage,
  'scopes': LHScopesPage,
  'claims': LHClaimsPage,
}

const currentPageComponent = computed(() => pageComponents[currentPage.value])
const currentDocsLink = computed(() => docsLinks[currentPage.value])

const goToIdentity = () => {
  navigateTo('identity')
}
</script>

<style lang="scss" scoped>
@use "@kong/design-tokens/tokens/scss/variables" as *;

.lh-header {
  align-items: center;
  display: flex;
  gap: $kui-space-30;
}

.lh-breadcrumbs {
  align-items: center;
  display: flex;
  font-size: $kui-font-size-30;
  gap: $kui-space-20;
}

.lh-breadcrumb-sep {
  color: $kui-color-text-neutral-weak;
}

.lh-breadcrumb-link {
  background: none;
  border: none;
  color: $kui-color-text-primary;
  cursor: pointer;
  font-size: $kui-font-size-30;
  padding: $kui-space-0;

  &:hover {
    text-decoration: underline;
  }
}

.lh-breadcrumb-current {
  color: $kui-color-text-neutral-strong;
  font-weight: $kui-font-weight-medium;
}

.lh-body {
  padding: $kui-space-70;
}
</style>

<style lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

// Non-scoped: target KSlideout internals
.learning-hub-slideout {
  :deep(.slideout-title) {
    font-size: $kui-font-size-30;
  }
}
</style>
