<template>
  <div class="auth-server-entities-list">
    <AppPageHeader :title="config.title" :breadcrumbs="breadcrumbs">
      <template #actions>
        <LaunchLearningHubThroughBookIcon :learning-hub-path="learningHubPath" />
        <KButton @click="router.push(createRoute)">
          <AddIcon decorative />
          New {{ config.singular }}
        </KButton>
      </template>
    </AppPageHeader>

    <EntityBaseTable
      :headers="config.headers"
      :fetcher="fetcher"
      :fetcher-cache-key="String(fetcherCacheKey)"
      :query="filterQuery"
      :data-testid="`${config.entityType}-table`"
      @click:row="() => {}"
    >
      <template #toolbar-filter>
        <KInput
          v-model.trim="filterQuery"
          :placeholder="`Search ${config.title.toLowerCase()}...`"
          type="search"
          @update:model-value="fetcherCacheKey++"
        >
          <template #before>
            <SearchIcon decorative />
          </template>
        </KInput>
      </template>

      <template #toolbar-button>
        <KButton appearance="tertiary" aria-label="Show/hide columns">
          <TableColumnsIcon decorative />
        </KButton>
      </template>

      <template #name="{ row }">
        <span class="entity-name">{{ row.name }}</span>
      </template>

      <template #empty-state>
        <KEmptyState
          icon-variant="kong"
          :title="`No ${config.title.toLowerCase()}`"
          :message="`Add ${config.singular} to this auth server to get started.`"
          :action-button-text="`New ${config.singular}`"
          @click-action="router.push(createRoute)"
        >
          <template #icon>
            <component :is="config.emptyIcon" decorative />
          </template>
        </KEmptyState>
      </template>

      <template #action-items="{ row }">
        <KDropdownItem @click="router.push(editRoute(row.id))">
          Edit
        </KDropdownItem>
        <KDropdownItem danger has-divider @click="deletingEntity = row">
          Delete
        </KDropdownItem>
      </template>
    </EntityBaseTable>

    <KModal
      v-if="deletingEntity"
      :title="`Delete ${deletingEntity.name}?`"
      action-button-text="Delete"
      action-button-appearance="danger"
      cancel-button-text="Cancel"
      @cancel="deletingEntity = null"
      @proceed="handleDelete"
    >
      <p>This action cannot be undone.</p>
    </KModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SearchIcon, RuleIcon, DataInfoAlertIcon, BadgeIcon, TableColumnsIcon, AddIcon } from '@kong/icons'
import { KButton, KInput, KEmptyState, KDropdownItem, KModal } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import type { EntityBaseTableHeader } from '@/components/EntityBaseTable.vue'
import LaunchLearningHubThroughBookIcon from '@/components/LaunchLearningHubThroughBookIcon.vue'
import { useAuthServerStore } from '@/composables/useAuthServerStore'

const route = useRoute()
const router = useRouter()
const store = useAuthServerStore()

const id = computed(() => route.params.id as string)
const authServer = computed(() => store.getById(id.value))

type EntityConfig = {
  title: string
  singular: string
  entityType: string
  headers: EntityBaseTableHeader[]
  emptyIcon: any
  getData: (authServerId: string) => any[]
  createRoute: string
  editRoute: string
  deleteHandler: (authServerId: string, entityId: string) => void
}

const ENTITY_CONFIGS: Record<string, EntityConfig> = {
  'auth-server-scopes': {
    title: 'Scopes',
    singular: 'scope',
    entityType: 'scopes',
    headers: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description' },
    ],
    emptyIcon: RuleIcon,
    getData: (serverId) => store.getScopes(serverId),
    createRoute: 'auth-server-scope-create',
    editRoute: 'auth-server-scope-edit',
    deleteHandler: (serverId, entityId) => store.removeScope(serverId, entityId),
  },
  'auth-server-claims': {
    title: 'Claims',
    singular: 'claim',
    entityType: 'claims',
    headers: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'claim_type', label: 'Type' },
    ],
    emptyIcon: DataInfoAlertIcon,
    getData: (serverId) => store.getClaims(serverId),
    createRoute: 'auth-server-claim-create',
    editRoute: 'auth-server-claim-edit',
    deleteHandler: (serverId, entityId) => store.removeClaim(serverId, entityId),
  },
  'auth-server-clients': {
    title: 'Clients',
    singular: 'client',
    entityType: 'clients',
    headers: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'created_at', label: 'Created' },
    ],
    emptyIcon: BadgeIcon,
    getData: (serverId) => store.getClients(serverId),
    createRoute: 'auth-server-client-create',
    editRoute: 'auth-server-client-edit',
    deleteHandler: (serverId, entityId) => store.removeClient(serverId, entityId),
  },
}

const config = computed((): EntityConfig =>
  ENTITY_CONFIGS[route.name as string] ?? ENTITY_CONFIGS['auth-server-scopes'],
)

const LEARNING_HUB_PATHS: Record<string, string> = {
  'auth-server-scopes': '/global/learning-hub/scopes',
  'auth-server-claims': '/global/learning-hub/claims',
  'auth-server-clients': '/global/learning-hub/clients',
}

const learningHubPath = computed(() =>
  LEARNING_HUB_PATHS[route.name as string] ?? '/global/learning-hub/identity',
)

const createRoute = computed(() => ({
  name: config.value.createRoute,
  params: { id: id.value },
}))

const editRoute = (entityId: string) => ({
  name: config.value.editRoute,
  params: { id: id.value, entityId },
})

const breadcrumbs = computed(() => [
  { key: 'identity', text: 'Identity', to: { name: 'auth-servers-list' } },
  { key: 'auth-servers', text: 'Authorization servers', to: { name: 'auth-servers-list' } },
  { key: 'server', text: authServer.value?.name || id.value, to: { name: 'auth-server-overview', params: { id: id.value } } },
  { key: 'current', text: config.value.title },
])

const filterQuery = ref('')
const fetcherCacheKey = ref(0)
const deletingEntity = ref<any>(null)

watch(filterQuery, () => { fetcherCacheKey.value++ })
watch(() => route.name, () => {
  filterQuery.value = ''
  fetcherCacheKey.value++
})

const fetcher = async ({ page, pageSize }: { page: number; pageSize: number }) => {
  const all = config.value.getData(id.value)
  const filtered = filterQuery.value
    ? all.filter((item: any) => item.name.toLowerCase().includes(filterQuery.value.toLowerCase()))
    : all
  const start = ((page || 1) - 1) * (pageSize || 10)
  return {
    data: filtered.slice(start, start + (pageSize || 10)),
    total: filtered.length,
  }
}

const handleDelete = () => {
  if (!deletingEntity.value) return
  config.value.deleteHandler(id.value, deletingEntity.value.id)
  deletingEntity.value = null
  fetcherCacheKey.value++
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.auth-server-entities-list {
  .entity-name {
    font-weight: $kui-font-weight-semibold;
  }
}
</style>
