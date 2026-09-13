<template>
  <div class="gateway-plugin-select">
    <AppPageHeader title="Select plugin" :breadcrumbs="breadcrumbs">
      <template #below>
        <span class="header-subtitle">Select a plugin to enable on this gateway.</span>
      </template>
    </AppPageHeader>

    <div class="plugin-select-content">
      <KInput
        v-model.trim="filter"
        class="plugin-search"
        data-testid="plugin-search"
        placeholder="Filter plugins..."
        type="search"
      >
        <template #before>
          <SearchIcon decorative />
        </template>
      </KInput>

      <template v-if="filteredPlugins.length">
        <div
          v-for="category in visibleCategories"
          :key="category.name"
          class="plugin-category"
        >
          <h2 class="category-title">{{ category.label }}</h2>
          <div class="plugin-grid">
            <button
              v-for="plugin in category.plugins"
              :key="plugin.type"
              class="plugin-card"
              :data-testid="`plugin-card-${plugin.type}`"
              type="button"
              @click="selectPlugin(plugin.type)"
            >
              <div class="plugin-card-icon">
                <KeyIcon v-if="plugin.type === 'key-auth'" decorative />
                <LockIcon v-else-if="plugin.type === 'openid-connect'" decorative />
                <ProfileIcon v-else-if="plugin.type === 'basic-auth'" decorative />
              </div>
              <div class="plugin-card-info">
                <div class="plugin-card-name">{{ plugin.label }}</div>
                <div class="plugin-card-description">{{ plugin.description }}</div>
              </div>
            </button>
          </div>
        </div>
      </template>

      <KEmptyState
        v-else
        :action-button-visible="false"
        data-testid="plugin-search-empty"
        icon-variant="search"
      >
        <template #default>
          <h5>No plugins found for "{{ filter }}"</h5>
        </template>
      </KEmptyState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyIcon, LockIcon, ProfileIcon, SearchIcon } from '@kong/icons'
import { KInput, KEmptyState } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import { useApiGatewayStore } from '@/composables/useApiGatewayStore'
import type { GatewayPluginName } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useApiGatewayStore()

const gatewayId = computed(() => route.params.id as string)
const gateway = computed(() => store.getById(gatewayId.value))
const filter = ref('')

const PLUGIN_CATEGORIES: { name: string; label: string; plugins: { type: GatewayPluginName; label: string; description: string }[] }[] = [
  {
    name: 'authentication',
    label: 'Authentication',
    plugins: [
      {
        type: 'key-auth',
        label: 'Key authentication',
        description: 'Protect your services with API key authentication. Consumers authenticate by including a key in the request header or query parameter.',
      },
      {
        type: 'openid-connect',
        label: 'OpenID Connect',
        description: 'Authenticate requests using OpenID Connect. Delegates identity verification to a trusted identity provider using standard OIDC and OAuth 2.0 flows.',
      },
      {
        type: 'basic-auth',
        label: 'Basic auth',
        description: 'Protect your services with HTTP Basic auth. Consumers authenticate with a username and password.',
      },
    ],
  },
]

const filteredPlugins = computed(() => {
  const q = filter.value.toLowerCase()
  if (!q) return PLUGIN_CATEGORIES.flatMap(c => c.plugins)
  return PLUGIN_CATEGORIES.flatMap(c => c.plugins).filter(
    p => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
  )
})

const visibleCategories = computed(() => {
  const q = filter.value.toLowerCase()
  if (!q) return PLUGIN_CATEGORIES
  return PLUGIN_CATEGORIES
    .map(c => ({
      ...c,
      plugins: c.plugins.filter(
        p => p.label.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
      ),
    }))
    .filter(c => c.plugins.length > 0)
})

const breadcrumbs = computed(() => [
  { key: 'api-gateway', text: 'API Gateway', to: { name: 'api-gateway-list' } },
  { key: 'gateway', text: gateway.value?.name ?? gatewayId.value, to: { name: 'api-gateway-plugins', params: { id: gatewayId.value } } },
  { key: 'action', text: 'Select plugin' },
])

const selectPlugin = (pluginType: GatewayPluginName) => {
  router.push({ name: 'gateway-plugin-create', params: { id: gatewayId.value, pluginType } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.gateway-plugin-select {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.header-subtitle {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-30;
}

.plugin-select-content {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.plugin-search {
  max-width: 320px;
}

.plugin-category {
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
}

.category-title {
  color: $kui-color-text;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-semibold;
  line-height: $kui-line-height-40;
  margin: 0;
}

.plugin-grid {
  display: grid;
  gap: $kui-space-40;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.plugin-card {
  align-items: flex-start;
  background: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  cursor: pointer;
  display: flex;
  gap: $kui-space-50;
  padding: $kui-space-60;
  text-align: left;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;

  &:hover {
    border-color: $kui-color-border-primary;
    box-shadow: 0 0 0 1px $kui-color-border-primary;
  }

  .plugin-card-icon {
    align-items: center;
    background: $kui-color-background-neutral-weakest;
    border-radius: $kui-border-radius-30;
    color: $kui-color-text-primary;
    display: flex;
    flex-shrink: 0;
    height: 36px;
    justify-content: center;
    width: 36px;
  }

  .plugin-card-info {
    display: flex;
    flex-direction: column;
    gap: $kui-space-20;
    min-width: 0;
  }

  .plugin-card-name {
    color: $kui-color-text;
    font-size: $kui-font-size-30;
    font-weight: $kui-font-weight-semibold;
    line-height: $kui-line-height-40;
  }

  .plugin-card-description {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    line-height: $kui-line-height-30;
  }
}
</style>
