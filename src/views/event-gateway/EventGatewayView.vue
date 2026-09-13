<template>
  <div class="event-gateway-view">
    <div v-if="!gateway" class="event-gateway-loading">
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
                :item="{ label: 'Edit', to: { name: 'event-gateway-edit', params: { id } } }"
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

        <!-- ── Overview ─────────────────────────────────────────── -->
        <div v-if="activeTab === '#overview'" class="overview-tab">
          <AppAboutSection
            class="gateway-about"
            :description="gateway.description"
            title="About event gateway"
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
              <div v-if="gateway.min_runtime_version" class="context-card-version">
                <span class="sub-label">Min. DP version:</span>
                <KBadge>{{ gateway.min_runtime_version }}</KBadge>
              </div>
            </div>
          </AppAboutSection>
        </div>

        <!-- ── Data Plane Nodes ─────────────────────────────────── -->
        <div v-else-if="activeTab === '#data-plane-nodes'" class="sub-tab">
          <EntityBaseTable
            :headers="dataPlaneNodeHeaders"
            :fetcher="dataPlaneNodesFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            data-testid="data-plane-nodes-table"
            :empty-state-title="'No data plane nodes'"
            :empty-state-message="'Connect a data plane node to this event gateway to get started.'"
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

        <!-- ── Backend Clusters ─────────────────────────────────── -->
        <div v-else-if="activeTab === '#backend-clusters'" class="sub-tab">
          <div class="sub-tab-header">
            <KButton @click="showCreateBackendCluster = true">
              <AddIcon decorative />
              New backend cluster
            </KButton>
          </div>
          <EntityBaseTable
            :headers="subEntityHeaders"
            :fetcher="backendClustersFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            :query="subEntityFilter"
            data-testid="backend-clusters-table"
            :empty-state-title="'No backend clusters'"
            :empty-state-message="'Add a backend cluster to this event gateway.'"
          >
            <template #toolbar-filter>
              <KInput v-model.trim="subEntityFilter" placeholder="Search backend clusters..." type="search" @update:model-value="subEntityCacheKey++">
                <template #before><SearchIcon decorative /></template>
              </KInput>
            </template>
            <template #name="{ row }">
              <span class="entity-name">{{ row.name }}</span>
            </template>
            <template #labels="{ row }">
              <div v-if="row.labels && Object.keys(row.labels).length" class="labels-cell">
                <KBadge v-for="(val, key) in row.labels" :key="key" appearance="neutral">{{ key }}:{{ val }}</KBadge>
              </div>
              <span v-else class="cell-empty">—</span>
            </template>
            <template #updated_at="{ row }">{{ formatDate(row.updated_at) }}</template>
            <template #action-items="{ row }">
              <KDropdownItem danger @click="deletingSubEntity = { type: 'backendCluster', item: row }">Delete</KDropdownItem>
            </template>
          </EntityBaseTable>
        </div>

        <!-- ── Virtual Clusters ─────────────────────────────────── -->
        <div v-else-if="activeTab === '#virtual-clusters'" class="sub-tab">
          <div class="sub-tab-header">
            <KButton @click="router.push({ name: 'virtual-cluster-create', params: { id: id } })">
              <AddIcon decorative />
              New virtual cluster
            </KButton>
          </div>
          <EntityBaseTable
            :headers="subEntityHeaders"
            :fetcher="virtualClustersFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            :query="subEntityFilter"
            data-testid="virtual-clusters-table"
            :empty-state-title="'No virtual clusters'"
            :empty-state-message="'Add a virtual cluster to this event gateway.'"
          >
            <template #toolbar-filter>
              <KInput v-model.trim="subEntityFilter" placeholder="Search virtual clusters..." type="search" @update:model-value="subEntityCacheKey++">
                <template #before><SearchIcon decorative /></template>
              </KInput>
            </template>
            <template #name="{ row }">
              <span class="entity-name">{{ row.name }}</span>
            </template>
            <template #labels="{ row }">
              <div v-if="row.labels && Object.keys(row.labels).length" class="labels-cell">
                <KBadge v-for="(val, key) in row.labels" :key="key" appearance="neutral">{{ key }}:{{ val }}</KBadge>
              </div>
              <span v-else class="cell-empty">—</span>
            </template>
            <template #updated_at="{ row }">{{ formatDate(row.updated_at) }}</template>
            <template #action-items="{ row }">
              <KDropdownItem @click="router.push({ name: 'virtual-cluster-edit', params: { id: id, vcId: row.id } })">Edit</KDropdownItem>
              <KDropdownItem danger has-divider @click="deletingSubEntity = { type: 'virtualCluster', item: row }">Delete</KDropdownItem>
            </template>
          </EntityBaseTable>
        </div>

        <!-- ── Listeners ────────────────────────────────────────── -->
        <div v-else-if="activeTab === '#listeners'" class="sub-tab">
          <div class="sub-tab-header">
            <KButton @click="showCreateListener = true">
              <AddIcon decorative />
              New listener
            </KButton>
          </div>
          <EntityBaseTable
            :headers="subEntityHeaders"
            :fetcher="listenersFetcher"
            :fetcher-cache-key="String(subEntityCacheKey)"
            :query="subEntityFilter"
            data-testid="listeners-table"
            :empty-state-title="'No listeners'"
            :empty-state-message="'Add a listener to this event gateway.'"
          >
            <template #toolbar-filter>
              <KInput v-model.trim="subEntityFilter" placeholder="Search listeners..." type="search" @update:model-value="subEntityCacheKey++">
                <template #before><SearchIcon decorative /></template>
              </KInput>
            </template>
            <template #name="{ row }">
              <span class="entity-name">{{ row.name }}</span>
            </template>
            <template #labels="{ row }">
              <div v-if="row.labels && Object.keys(row.labels).length" class="labels-cell">
                <KBadge v-for="(val, key) in row.labels" :key="key" appearance="neutral">{{ key }}:{{ val }}</KBadge>
              </div>
              <span v-else class="cell-empty">—</span>
            </template>
            <template #updated_at="{ row }">{{ formatDate(row.updated_at) }}</template>
            <template #action-items="{ row }">
              <KDropdownItem danger @click="deletingSubEntity = { type: 'listener', item: row }">Delete</KDropdownItem>
            </template>
          </EntityBaseTable>
        </div>

        <!-- ── Resources ────────────────────────────────────────── -->
        <div v-else-if="activeTab === '#resources'" class="sub-tab">
          <KEmptyState icon-variant="kong" title="Resources" message="Schema registries, static keys, and TLS trust bundles are not yet implemented in this prototype." />
        </div>

      </div>
    </template>

    <!-- Delete gateway modal -->
    <KModal
      v-if="deleteModalVisible && gateway"
      :title="`Delete ${gateway.name}?`"
      action-button-text="Delete"
      action-button-appearance="danger"
      cancel-button-text="Cancel"
      @cancel="deleteModalVisible = false"
      @proceed="handleDeleteGateway"
    >
      <p>This action cannot be undone. All associated resources will be removed.</p>
    </KModal>

    <!-- Delete sub-entity modal -->
    <KModal
      v-if="deletingSubEntity"
      :title="`Delete ${deletingSubEntity.item.name}?`"
      action-button-text="Delete"
      action-button-appearance="danger"
      cancel-button-text="Cancel"
      @cancel="deletingSubEntity = null"
      @proceed="handleDeleteSubEntity"
    >
      <p>This action cannot be undone.</p>
    </KModal>

    <!-- Create backend cluster modal -->
    <KModal
      v-if="showCreateBackendCluster"
      title="New backend cluster"
      action-button-text="Create"
      cancel-button-text="Cancel"
      :action-button-disabled="!createForm.name.trim()"
      @cancel="closeCreateModal"
      @proceed="submitCreateBackendCluster"
    >
      <KInput v-model.trim="createForm.name" label="Name" placeholder="e.g., kafka-prod" required />
    </KModal>

    <!-- Create listener modal -->
    <KModal
      v-if="showCreateListener"
      title="New listener"
      action-button-text="Create"
      cancel-button-text="Cancel"
      :action-button-disabled="!createForm.name.trim()"
      @cancel="closeCreateModal"
      @proceed="submitCreateListener"
    >
      <KInput v-model.trim="createForm.name" label="Name" placeholder="e.g., public-kafka-listener" required />
    </KModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDownIcon, AddIcon, SearchIcon } from '@kong/icons'
import {
  KButton, KDropdown, KDropdownItem, KSkeleton, KSkeletonBox,
  KTabs, KCopy, KBadge, KEmptyState, KModal, KInput,
} from '@kong/kongponents'
import { format } from 'date-fns'
import type { Tab } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import AppAboutSection from '@/components/AppAboutSection.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import type { EntityBaseTableHeader } from '@/components/EntityBaseTable.vue'
import { useEventGatewayStore } from '@/composables/useEventGatewayStore'

const route = useRoute()
const router = useRouter()
const store = useEventGatewayStore()

const id = computed(() => route.params.id as string)
const gateway = computed(() => store.getById(id.value))

const breadcrumbs = computed(() => [
  { key: 'event-gateway', text: 'Event Gateway', to: { name: 'event-gateway-list' } },
  { key: 'current', text: gateway.value?.name || id.value },
])

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'MMM d, yyyy') } catch { return iso }
}

const formattedCreatedAt = computed(() => gateway.value?.created_at ? formatDate(gateway.value.created_at) : '')
const formattedUpdatedAt = computed(() => gateway.value?.updated_at ? formatDate(gateway.value.updated_at) : '')

// ── Tabs ───────────────────────────────────────────────────────────

const ROUTE_TO_TAB: Record<string, string> = {
  'event-gateway-overview': '#overview',
  'event-gateway-data-plane-nodes': '#data-plane-nodes',
  'event-gateway-backend-clusters': '#backend-clusters',
  'event-gateway-virtual-clusters': '#virtual-clusters',
  'event-gateway-listeners': '#listeners',
  'event-gateway-resources': '#resources',
}

const TAB_TO_ROUTE: Record<string, string> = {
  '#overview': 'event-gateway-overview',
  '#data-plane-nodes': 'event-gateway-data-plane-nodes',
  '#backend-clusters': 'event-gateway-backend-clusters',
  '#virtual-clusters': 'event-gateway-virtual-clusters',
  '#listeners': 'event-gateway-listeners',
  '#resources': 'event-gateway-resources',
}

const tabs: Tab[] = [
  { hash: '#overview', title: 'Overview' },
  { hash: '#data-plane-nodes', title: 'Data plane nodes' },
  { hash: '#backend-clusters', title: 'Backend clusters' },
  { hash: '#virtual-clusters', title: 'Virtual clusters' },
  { hash: '#listeners', title: 'Listeners' },
  { hash: '#resources', title: 'Resources' },
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

const subEntityHeaders: EntityBaseTableHeader[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'labels', label: 'Labels', hidable: true },
  { key: 'updated_at', label: 'Last modified', sortable: true, hidable: true },
]

// ── Sub-entity state ───────────────────────────────────────────────

const subEntityFilter = ref('')
const subEntityCacheKey = ref(0)

const dataPlaneNodesFetcher = async () => ({
  data: store.getDataPlaneNodes(id.value),
  total: store.getDataPlaneNodes(id.value).length,
})

const backendClustersFetcher = async () => {
  const all = store.getBackendClusters(id.value)
  const filtered = subEntityFilter.value
    ? all.filter(e => e.name.toLowerCase().includes(subEntityFilter.value.toLowerCase()))
    : all
  return { data: filtered, total: filtered.length }
}

const virtualClustersFetcher = async () => {
  const all = store.getVirtualClusters(id.value)
  const filtered = subEntityFilter.value
    ? all.filter(e => e.name.toLowerCase().includes(subEntityFilter.value.toLowerCase()))
    : all
  return { data: filtered, total: filtered.length }
}

const listenersFetcher = async () => {
  const all = store.getListeners(id.value)
  const filtered = subEntityFilter.value
    ? all.filter(e => e.name.toLowerCase().includes(subEntityFilter.value.toLowerCase()))
    : all
  return { data: filtered, total: filtered.length }
}

// ── Delete ─────────────────────────────────────────────────────────

const deleteModalVisible = ref(false)

const deletingSubEntity = ref<{ type: 'backendCluster' | 'virtualCluster' | 'listener'; item: any } | null>(null)

const handleDeleteGateway = () => {
  store.remove(id.value)
  router.push({ name: 'event-gateway-list' })
}

const handleDeleteSubEntity = () => {
  if (!deletingSubEntity.value) return
  const { type, item } = deletingSubEntity.value
  if (type === 'backendCluster') store.removeBackendCluster(id.value, item.id)
  else if (type === 'virtualCluster') store.removeVirtualCluster(id.value, item.id)
  else if (type === 'listener') store.removeListener(id.value, item.id)
  deletingSubEntity.value = null
  subEntityCacheKey.value++
}

// ── Create modals ──────────────────────────────────────────────────

const showCreateBackendCluster = ref(false)
const showCreateListener = ref(false)
const createForm = reactive({ name: '' })

const closeCreateModal = () => {
  showCreateBackendCluster.value = false
  showCreateListener.value = false
  createForm.name = ''
}

const submitCreateBackendCluster = () => {
  store.createBackendCluster(id.value, { name: createForm.name })
  closeCreateModal()
  subEntityCacheKey.value++
}

const submitCreateListener = () => {
  store.createListener(id.value, { name: createForm.name })
  closeCreateModal()
  subEntityCacheKey.value++
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.event-gateway-loading {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.tab-content {
  margin-top: $kui-space-70;
}

// ── Overview ───────────────────────────────────────────────────────

.gateway-about {
  :deep(.about-section-content) {
    align-items: center;
  }

  .about-dates {
    display: flex;
    flex-direction: column;
    gap: $kui-space-10;
  }

  .about-date {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    line-height: $kui-line-height-20;
  }
}

.context-card-badges {
  align-items: center;
  column-gap: $kui-space-70;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 100%;
  row-gap: $kui-space-30;
}

.context-card-labels,
.context-card-version {
  align-items: center;
  display: flex;
  gap: $kui-space-40;

  .sub-label {
    color: $kui-color-text-neutral;
    font-size: $kui-font-size-20;
    font-weight: $kui-font-weight-regular;
  }
}

.labels-row {
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-20;
}

// ── Sub-entity tabs ────────────────────────────────────────────────

.sub-tab {
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
}

.sub-tab-header {
  display: flex;
  justify-content: flex-end;
}

.entity-name {
  font-weight: $kui-font-weight-semibold;
}

.labels-cell {
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-20;
}

.cell-empty {
  color: $kui-color-text-neutral;
}
</style>
