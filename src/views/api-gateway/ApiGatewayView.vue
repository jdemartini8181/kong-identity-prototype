<template>
  <div class="api-gateway-view">
    <div v-if="!gateway" class="api-gateway-loading">
      <KSkeletonBox height="2" width="10" />
      <KSkeleton />
    </div>

    <template v-else>
      <AppPageHeader :title="gateway.name" :breadcrumbs="breadcrumbs">
        <template #actions>
          <KDropdown :kpop-attributes="{ placement: 'bottom-end' }">
            <KButton>
              Actions
              <ChevronDownIcon decorative />
            </KButton>
            <template #items>
              <KDropdownItem
                :item="{ label: 'Edit', to: { name: 'api-gateway-edit', params: { id } } }"
              />
              <KDropdownItem danger has-divider @click="deleteModalVisible = true">
                Delete
              </KDropdownItem>
            </template>
          </KDropdown>
        </template>
      </AppPageHeader>

      <KTabs v-model="activeTab" :tabs="tabs" @change="handleTabChange" />

      <div class="tab-content">

        <!-- ── Overview ──────────────────────────────────────────── -->
        <div v-if="activeTab === '#overview'" class="overview-tab">
          <AppAboutSection
            class="gateway-about"
            :description="gateway.description"
            title="About this gateway"
          >
            <template v-if="formattedCreatedAt || formattedUpdatedAt" #actions>
              <div class="about-dates">
                <span v-if="formattedCreatedAt" class="about-date">Created: {{ formattedCreatedAt }}</span>
                <span v-if="formattedUpdatedAt" class="about-date">Modified: {{ formattedUpdatedAt }}</span>
              </div>
            </template>

            <div class="context-card-badges">
              <KCopy badge badge-label="Name:" :text="gateway.name" truncate />
              <KCopy badge badge-label="ID:" :text="gateway.id" truncate />
              <div class="context-card-labels">
                <span class="sub-label">Type:</span>
                <KBadge appearance="neutral">{{ CLUSTER_TYPE_LABELS[gateway.cluster_type] }}</KBadge>
              </div>
              <div v-if="gateway.labels && Object.keys(gateway.labels).length" class="context-card-labels">
                <span class="sub-label">Labels:</span>
                <div class="labels-row">
                  <KBadge
                    v-for="(val, key) in gateway.labels"
                    :key="key"
                    appearance="neutral"
                  >{{ key }}:{{ val }}</KBadge>
                </div>
              </div>
            </div>
          </AppAboutSection>
        </div>

        <!-- ── Data Plane Nodes ──────────────────────────────────── -->
        <div v-else-if="activeTab === '#data-plane-nodes'" class="sub-tab">
          <EntityBaseTable
            :headers="dataPlaneNodeHeaders"
            :fetcher="dataPlaneNodesFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            data-testid="data-plane-nodes-table"
            empty-state-title="No data plane nodes"
            empty-state-message="Connect a data plane node to this gateway to get started."
          >
            <template #hostname="{ row }">
              <span class="entity-name">{{ row.hostname }}</span>
            </template>
            <template #version="{ row }">
              <KBadge appearance="neutral">{{ row.version }}</KBadge>
            </template>
            <template #status="{ row }">
              <KBadge :appearance="row.status === 'connected' ? 'success' : 'danger'">
                {{ row.status === 'connected' ? 'Connected' : 'Disconnected' }}
              </KBadge>
            </template>
            <template #last_seen="{ row }">
              {{ formatDate(row.last_seen) }}
            </template>
          </EntityBaseTable>
        </div>

        <!-- ── Services ──────────────────────────────────────────── -->
        <div v-else-if="activeTab === '#services'" class="sub-tab">
          <div class="sub-tab-header">
            <KInput
              v-model.trim="subEntityFilter"
              placeholder="Search services..."
              type="search"
              @update:model-value="subEntityCacheKey++"
            >
              <template #before>
                <SearchIcon decorative />
              </template>
            </KInput>
            <KButton @click="router.push({ name: 'gateway-service-create', params: { id } })">
              <AddIcon decorative />
              New service
            </KButton>
          </div>
          <EntityBaseTable
            :headers="serviceHeaders"
            :fetcher="servicesFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            data-testid="services-table"
            empty-state-title="No services"
            empty-state-message="Add a service to start routing traffic through this gateway."
          >
            <template #name="{ row }">
              <span class="entity-name">{{ row.name }}</span>
            </template>
            <template #upstream="{ row }">
              <span class="upstream-text">{{ row.protocol }}://{{ row.host }}:{{ row.port }}{{ row.path ?? '' }}</span>
            </template>
            <template #enabled="{ row }">
              <KBadge :appearance="row.enabled ? 'success' : 'neutral'">
                {{ row.enabled ? 'Enabled' : 'Disabled' }}
              </KBadge>
            </template>
            <template #tags="{ row }">
              <div v-if="row.tags?.length" class="tags-cell">
                <KBadge v-for="tag in row.tags" :key="tag" appearance="neutral">{{ tag }}</KBadge>
              </div>
              <span v-else class="cell-empty">—</span>
            </template>
            <template #action-items="{ row }">
              <KDropdownItem @click="router.push({ name: 'gateway-service-edit', params: { id, serviceId: row.id } })">
                Edit
              </KDropdownItem>
              <KDropdownItem danger has-divider @click="confirmDeleteSubEntity('service', row)">
                Delete
              </KDropdownItem>
            </template>
          </EntityBaseTable>
        </div>

        <!-- ── Routes ────────────────────────────────────────────── -->
        <div v-else-if="activeTab === '#routes'" class="sub-tab">
          <div class="sub-tab-header">
            <KInput
              v-model.trim="subEntityFilter"
              placeholder="Search routes..."
              type="search"
              @update:model-value="subEntityCacheKey++"
            >
              <template #before>
                <SearchIcon decorative />
              </template>
            </KInput>
            <KButton @click="router.push({ name: 'gateway-route-create', params: { id } })">
              <AddIcon decorative />
              New route
            </KButton>
          </div>
          <EntityBaseTable
            :headers="routeHeaders"
            :fetcher="routesFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            data-testid="routes-table"
            empty-state-title="No routes"
            empty-state-message="Add a route to define how requests are matched and forwarded."
          >
            <template #name="{ row }">
              <span class="entity-name">{{ row.name }}</span>
            </template>
            <template #protocols="{ row }">
              <div class="tags-cell">
                <KBadge v-for="p in row.protocols" :key="p" appearance="neutral">{{ p }}</KBadge>
              </div>
            </template>
            <template #methods="{ row }">
              <div v-if="row.methods?.length" class="tags-cell">
                <KBadge v-for="m in row.methods" :key="m" appearance="neutral">{{ m }}</KBadge>
              </div>
              <span v-else class="cell-empty">Any</span>
            </template>
            <template #paths="{ row }">
              <div v-if="row.paths?.length" class="paths-cell">
                <span v-for="p in row.paths" :key="p" class="path-text">{{ p }}</span>
              </div>
              <span v-else class="cell-empty">—</span>
            </template>
            <template #enabled="{ row }">
              <KBadge :appearance="row.enabled ? 'success' : 'neutral'">
                {{ row.enabled ? 'Enabled' : 'Disabled' }}
              </KBadge>
            </template>
            <template #action-items="{ row }">
              <KDropdownItem @click="router.push({ name: 'gateway-route-edit', params: { id, routeId: row.id } })">
                Edit
              </KDropdownItem>
              <KDropdownItem danger has-divider @click="confirmDeleteSubEntity('route', row)">
                Delete
              </KDropdownItem>
            </template>
          </EntityBaseTable>
        </div>

        <!-- ── Consumers ─────────────────────────────────────────── -->
        <div v-else-if="activeTab === '#consumers'" class="sub-tab">
          <div class="sub-tab-header">
            <KInput
              v-model.trim="subEntityFilter"
              placeholder="Search consumers..."
              type="search"
              @update:model-value="subEntityCacheKey++"
            >
              <template #before>
                <SearchIcon decorative />
              </template>
            </KInput>
            <KButton @click="router.push({ name: 'gateway-consumer-create', params: { id } })">
              <AddIcon decorative />
              New consumer
            </KButton>
          </div>
          <EntityBaseTable
            :headers="consumerHeaders"
            :fetcher="consumersFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            data-testid="consumers-table"
            empty-state-title="No consumers"
            empty-state-message="Add a consumer to manage access and credentials."
          >
            <template #username="{ row }">
              <span class="entity-name">{{ row.username ?? '—' }}</span>
            </template>
            <template #custom_id="{ row }">
              {{ row.custom_id ?? '—' }}
            </template>
            <template #tags="{ row }">
              <div v-if="row.tags?.length" class="tags-cell">
                <KBadge v-for="tag in row.tags" :key="tag" appearance="neutral">{{ tag }}</KBadge>
              </div>
              <span v-else class="cell-empty">—</span>
            </template>
            <template #action-items="{ row }">
              <KDropdownItem @click="router.push({ name: 'gateway-consumer-edit', params: { id, consumerId: row.id } })">
                Edit
              </KDropdownItem>
              <KDropdownItem danger has-divider @click="confirmDeleteSubEntity('consumer', row)">
                Delete
              </KDropdownItem>
            </template>
          </EntityBaseTable>
        </div>

        <!-- ── Plugins ───────────────────────────────────────────── -->
        <div v-else-if="activeTab === '#plugins'" class="sub-tab">
          <div class="sub-tab-header">
            <KInput
              v-model.trim="subEntityFilter"
              placeholder="Search plugins..."
              type="search"
              @update:model-value="subEntityCacheKey++"
            >
              <template #before>
                <SearchIcon decorative />
              </template>
            </KInput>
            <KButton @click="router.push({ name: 'gateway-plugin-select', params: { id } })">
              <AddIcon decorative />
              New plugin
            </KButton>
          </div>
          <EntityBaseTable
            :headers="pluginHeaders"
            :fetcher="pluginsFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            data-testid="plugins-table"
            empty-state-title="No plugins"
            empty-state-message="Add a plugin to extend and protect your services."
          >
            <template #name="{ row }">
              <span class="entity-name">{{ PLUGIN_LABELS[row.name] ?? row.name }}</span>
            </template>
            <template #scope="{ row }">
              <span v-if="row.service_id" class="scope-text">{{ getServiceName(row.service_id) }}</span>
              <KBadge v-else appearance="neutral">Global</KBadge>
            </template>
            <template #enabled="{ row }">
              <KBadge :appearance="row.enabled ? 'success' : 'neutral'">
                {{ row.enabled ? 'Enabled' : 'Disabled' }}
              </KBadge>
            </template>
            <template #action-items="{ row }">
              <KDropdownItem @click="router.push({ name: 'gateway-plugin-edit', params: { id, pluginId: row.id } })">
                Edit
              </KDropdownItem>
              <KDropdownItem danger has-divider @click="confirmDeleteSubEntity('plugin', row)">
                Delete
              </KDropdownItem>
            </template>
          </EntityBaseTable>
        </div>

      </div>
    </template>

    <!-- ── Delete gateway modal ──────────────────────────────────── -->
    <KModal
      v-if="deleteModalVisible"
      :title="`Delete ${gateway?.name}?`"
      action-button-text="Delete"
      action-button-appearance="danger"
      cancel-button-text="Cancel"
      @cancel="deleteModalVisible = false"
      @proceed="handleDeleteGateway"
    >
      <p>This action cannot be undone. All services, routes, consumers, and plugins associated with this gateway will also be removed.</p>
    </KModal>

    <!-- ── Delete sub-entity modal ───────────────────────────────── -->
    <KModal
      v-if="deletingSubEntity"
      :title="`Delete ${deletingSubEntity.item.name ?? deletingSubEntity.item.username ?? 'this item'}?`"
      action-button-text="Delete"
      action-button-appearance="danger"
      cancel-button-text="Cancel"
      @cancel="deletingSubEntity = null"
      @proceed="handleDeleteSubEntity"
    >
      <p>This action cannot be undone.</p>
    </KModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon, AddIcon, SearchIcon } from '@kong/icons'
import {
  KButton, KDropdown, KDropdownItem, KSkeleton, KSkeletonBox,
  KTabs, KCopy, KBadge, KModal, KInput,
} from '@kong/kongponents'
import { format } from 'date-fns'
import type { Tab } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import AppAboutSection from '@/components/AppAboutSection.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import type { EntityBaseTableHeader } from '@/components/EntityBaseTable.vue'
import { useApiGatewayStore } from '@/composables/useApiGatewayStore'
import type { ApiGatewayClusterType, GatewayPluginName } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useApiGatewayStore()

const id = computed(() => route.params.id as string)
const gateway = computed(() => store.getById(id.value))

const CLUSTER_TYPE_LABELS: Record<ApiGatewayClusterType, string> = {
  CLUSTER_TYPE_HYBRID: 'Hybrid',
  CLUSTER_TYPE_K8S_INGRESS_CONTROLLER: 'KIC',
  CLUSTER_TYPE_SERVERLESS: 'Serverless',
}

const PLUGIN_LABELS: Record<GatewayPluginName, string> = {
  'key-auth': 'Key authentication',
  'oauth2': 'OAuth 2.0',
  'basic-auth': 'Basic auth',
}

const breadcrumbs = computed(() => [
  { key: 'api-gateway', text: 'API Gateway', to: { name: 'api-gateway-list' } },
  { key: 'current', text: gateway.value?.name || id.value },
])

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'MMM d, yyyy') } catch { return iso }
}

const formattedCreatedAt = computed(() => gateway.value?.created_at ? formatDate(gateway.value.created_at) : '')
const formattedUpdatedAt = computed(() => gateway.value?.updated_at ? formatDate(gateway.value.updated_at) : '')

// ── Tabs ───────────────────────────────────────────────────────────

const ROUTE_TO_TAB: Record<string, string> = {
  'api-gateway-overview': '#overview',
  'api-gateway-data-plane-nodes': '#data-plane-nodes',
  'api-gateway-services': '#services',
  'api-gateway-routes': '#routes',
  'api-gateway-consumers': '#consumers',
  'api-gateway-plugins': '#plugins',
}

const TAB_TO_ROUTE: Record<string, string> = {
  '#overview': 'api-gateway-overview',
  '#data-plane-nodes': 'api-gateway-data-plane-nodes',
  '#services': 'api-gateway-services',
  '#routes': 'api-gateway-routes',
  '#consumers': 'api-gateway-consumers',
  '#plugins': 'api-gateway-plugins',
}

const tabs: Tab[] = [
  { hash: '#overview', title: 'Overview' },
  { hash: '#data-plane-nodes', title: 'Data plane nodes' },
  { hash: '#services', title: 'Services' },
  { hash: '#routes', title: 'Routes' },
  { hash: '#consumers', title: 'Consumers' },
  { hash: '#plugins', title: 'Plugins' },
]

const activeTab = ref(ROUTE_TO_TAB[route.name as string] ?? '#overview')

watch(() => route.name, (name) => {
  const tab = ROUTE_TO_TAB[name as string]
  if (tab) activeTab.value = tab
})

const handleTabChange = (hash: string) => {
  const routeName = TAB_TO_ROUTE[hash]
  if (routeName && route.name !== routeName) {
    subEntityFilter.value = ''
    router.push({ name: routeName, params: { id: id.value } })
  }
}

// ── Table headers ──────────────────────────────────────────────────

const dataPlaneNodeHeaders: EntityBaseTableHeader[] = [
  { key: 'hostname', label: 'Hostname', sortable: true },
  { key: 'version', label: 'Version', hidable: true },
  { key: 'status', label: 'Status', hidable: true },
  { key: 'last_seen', label: 'Last seen', hidable: true },
]

const serviceHeaders: EntityBaseTableHeader[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'upstream', label: 'Upstream' },
  { key: 'enabled', label: 'Status', hidable: true },
  { key: 'tags', label: 'Tags', hidable: true },
]

const routeHeaders: EntityBaseTableHeader[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'protocols', label: 'Protocols', hidable: true },
  { key: 'methods', label: 'Methods', hidable: true },
  { key: 'paths', label: 'Paths', hidable: true },
  { key: 'enabled', label: 'Status', hidable: true },
]

const consumerHeaders: EntityBaseTableHeader[] = [
  { key: 'username', label: 'Username', sortable: true },
  { key: 'custom_id', label: 'Custom ID', hidable: true },
  { key: 'tags', label: 'Tags', hidable: true },
]

const pluginHeaders: EntityBaseTableHeader[] = [
  { key: 'name', label: 'Plugin', sortable: true },
  { key: 'scope', label: 'Applied to' },
  { key: 'enabled', label: 'Status', hidable: true },
]

// ── Sub-entity state ───────────────────────────────────────────────

const subEntityFilter = ref('')
const subEntityCacheKey = ref(0)

const getServiceName = (serviceId: string): string =>
  store.getServiceById(id.value, serviceId)?.name ?? serviceId

const dataPlaneNodesFetcher = async () => ({
  data: store.getDataPlaneNodes(id.value),
  total: store.getDataPlaneNodes(id.value).length,
})

const servicesFetcher = async () => {
  const all = store.getServices(id.value)
  const filtered = subEntityFilter.value
    ? all.filter(e => e.name.toLowerCase().includes(subEntityFilter.value.toLowerCase()))
    : all
  return { data: filtered, total: filtered.length }
}

const routesFetcher = async () => {
  const all = store.getRoutes(id.value)
  const filtered = subEntityFilter.value
    ? all.filter(e => e.name.toLowerCase().includes(subEntityFilter.value.toLowerCase()))
    : all
  return { data: filtered, total: filtered.length }
}

const consumersFetcher = async () => {
  const all = store.getConsumers(id.value)
  const q = subEntityFilter.value.toLowerCase()
  const filtered = q
    ? all.filter(e => e.username?.toLowerCase().includes(q) || e.custom_id?.toLowerCase().includes(q))
    : all
  return { data: filtered, total: filtered.length }
}

const pluginsFetcher = async () => {
  const all = store.getPlugins(id.value)
  const q = subEntityFilter.value.toLowerCase()
  const filtered = q
    ? all.filter(e => e.name.includes(q))
    : all
  return { data: filtered, total: filtered.length }
}

// ── Delete ─────────────────────────────────────────────────────────

const deleteModalVisible = ref(false)
const deletingSubEntity = ref<{ type: 'service' | 'route' | 'consumer' | 'plugin'; item: any } | null>(null)

const handleDeleteGateway = () => {
  store.remove(id.value)
  router.push({ name: 'api-gateway-list' })
}

const confirmDeleteSubEntity = (type: 'service' | 'route' | 'consumer' | 'plugin', item: any) => {
  deletingSubEntity.value = { type, item }
}

const handleDeleteSubEntity = () => {
  if (!deletingSubEntity.value) return
  const { type, item } = deletingSubEntity.value
  if (type === 'service') store.removeService(id.value, item.id)
  else if (type === 'route') store.removeRoute(id.value, item.id)
  else if (type === 'consumer') store.removeConsumer(id.value, item.id)
  else if (type === 'plugin') store.removePlugin(id.value, item.id)
  deletingSubEntity.value = null
  subEntityCacheKey.value++
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.api-gateway-view {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.api-gateway-loading {
  display: flex;
  flex-direction: column;
  gap: $kui-space-60;
}

.tab-content {
  margin-top: $kui-space-0;
}

.overview-tab {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.gateway-about {
  .context-card-badges {
    display: flex;
    flex-direction: column;
    gap: $kui-space-50;
  }

  .context-card-labels {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: $kui-space-30;
  }

  .labels-row {
    display: flex;
    flex-wrap: wrap;
    gap: $kui-space-20;
  }

  .sub-label {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-30;
  }

  .about-dates {
    display: flex;
    flex-direction: column;
    gap: $kui-space-20;
  }

  .about-date {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
  }
}

.sub-tab {
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;

  .sub-tab-header {
    align-items: center;
    display: flex;
    gap: $kui-space-40;
    justify-content: flex-end;

    > :first-child {
      flex: 1;
      max-width: 320px;
    }
  }
}

.entity-name {
  color: $kui-color-text;
  font-weight: $kui-font-weight-semibold;
}

.upstream-text {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-30;
  font-family: monospace;
}

.tags-cell {
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-20;
}

.paths-cell {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;

  .path-text {
    color: $kui-color-text-neutral;
    font-family: monospace;
    font-size: $kui-font-size-30;
  }
}

.scope-text {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-30;
}

.cell-empty {
  color: $kui-color-text-neutral;
}
</style>
