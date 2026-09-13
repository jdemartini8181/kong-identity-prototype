<template>
  <div class="auth-server-view">
    <div v-if="!authServer" class="auth-server-loading">
      <KSkeletonBox height="2" width="10" />
      <KSkeleton />
    </div>
    <template v-else>
      <AppPageHeader
        :title="authServer.name"
        :breadcrumbs="breadcrumbs"
      >
        <template #actions>
          <LaunchLearningHubThroughBookIcon learning-hub-path="/global/learning-hub/identity" />
          <KDropdown
            data-testid="auth-server-actions-dropdown"
            :kpop-attributes="{ placement: 'bottom-end' }"
          >
            <KButton data-testid="auth-server-actions-dropdown-trigger">
              Actions
              <ChevronDownIcon decorative />
            </KButton>
            <template #items>
              <KDropdownItem
                data-testid="edit-auth-server"
                :item="{ label: 'Edit', to: { name: 'auth-server-edit', params: { id } } }"
              />
              <KDropdownItem
                danger
                data-testid="delete-auth-server"
                has-divider
                @click="deleteModalVisible = true"
              >
                Delete
              </KDropdownItem>
            </template>
          </KDropdown>
        </template>
      </AppPageHeader>

      <AppAboutSection
        class="auth-server-about-section"
        data-testid="auth-server-about-section"
        :description="authServer.description"
        title="Auth server"
      >
        <template v-if="formattedCreatedAt" #actions>
          <div class="auth-server-about-item-container created-at">
            Created: <span>{{ formattedCreatedAt }}</span>
          </div>
        </template>

        <KCopy
          badge
          badge-label="ID:"
          :text="authServer.id"
        />

        <div class="issuer-url-container">
          <span>
            <KLabel
              class="issuer-url-label"
              info="The base URL of the authorization server that issues tokens."
            >
              Issuer URL
            </KLabel>:
          </span>
          <KCopy badge :text="authServer.issuer" />
        </div>

        <KCopy
          badge
          badge-label="Audience:"
          :text="authServer.audience"
        />

        <KCopy
          v-if="authServer.metadata_uri"
          badge
          badge-label="Metadata URI:"
          :text="authServer.metadata_uri"
        />
      </AppAboutSection>

      <KTabs
        v-model="activeTab"
        :tabs="tabs"
      />

      <div class="tab-content">
        <AuthServerOverview
          v-if="activeTab === '#auth-server-overview'"
          :auth-server-id="id"
        />
        <AuthServerConfig
          v-else-if="activeTab === '#auth-server-configuration'"
          :auth-server="authServer"
        />
      </div>
    </template>

    <DeleteAuthServerModal
      v-if="authServer && deleteModalVisible"
      :auth-server="authServer"
      @close="deleteModalVisible = false"
      @deleted="router.push({ name: 'auth-servers-list' })"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon } from '@kong/icons'
import { KButton, KDropdown, KDropdownItem, KSkeleton, KSkeletonBox, KTabs, KCopy, KLabel } from '@kong/kongponents'
import { format } from 'date-fns'
import type { Tab } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import AppAboutSection from '@/components/AppAboutSection.vue'
import AuthServerOverview from '@/components/auth-servers/AuthServerOverview.vue'
import AuthServerConfig from '@/components/auth-servers/AuthServerConfig.vue'
import DeleteAuthServerModal from '@/components/auth-servers/DeleteAuthServerModal.vue'
import LaunchLearningHubThroughBookIcon from '@/components/LaunchLearningHubThroughBookIcon.vue'
import { useAuthServerStore } from '@/composables/useAuthServerStore'

const route = useRoute()
const router = useRouter()
const store = useAuthServerStore()

const id = computed(() => route.params.id as string)
const authServer = computed(() => store.getById(id.value))

const breadcrumbs = computed(() => [
  { key: 'identity', text: 'Identity', to: { name: 'auth-servers-list' } },
  { key: 'auth-servers', text: 'Auth servers', to: { name: 'auth-servers-list' } },
  { key: 'current', text: authServer.value?.name || id.value },
])

const formattedCreatedAt = computed(() => {
  if (!authServer.value?.created_at) return ''
  try {
    return format(new Date(authServer.value.created_at), 'MMM d, yyyy, h:mm a')
  } catch {
    return authServer.value.created_at
  }
})

const tabs: Tab[] = [
  { hash: '#auth-server-overview', title: 'Overview' },
  { hash: '#auth-server-configuration', title: 'Configuration' },
]

const activeTab = ref<string>(
  route.name === 'auth-server-configuration' ? '#auth-server-configuration' : '#auth-server-overview',
)

const deleteModalVisible = ref(false)
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.auth-server-loading {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.auth-server-about-section {
  margin-bottom: $kui-space-70;

  :deep(.about-section-content) {
    align-items: center;
  }

  .auth-server-about-item-container {
    align-items: center;
    display: flex;
    gap: $kui-space-40;
  }

  .created-at {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    gap: $kui-space-20;
    line-height: $kui-line-height-20;
  }

  .issuer-url-container {
    display: flex;
    gap: $kui-space-20;
  }

  .issuer-url-label {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    font-weight: $kui-font-weight-regular;
    line-height: $kui-line-height-20;
    margin-bottom: $kui-space-0;
  }
}

.tab-content {
  margin-top: $kui-space-70;
}
</style>
