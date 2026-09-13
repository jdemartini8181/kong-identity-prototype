<template>
  <div class="auth-servers-list">
    <AppPageHeader
      title="Authorization servers"
      :breadcrumbs="breadcrumbs"
    >
      <template #icon-identity>
        <KeyIcon :size="14" decorative />
      </template>
      <template #actions>
        <LaunchLearningHubThroughBookIcon learning-hub-path="/global/learning-hub/identity" />
        <KButton
          data-testid="create-auth-server"
          @click="router.push({ name: 'auth-server-create' })"
        >
          <AddIcon decorative />
          New auth server
        </KButton>
      </template>
    </AppPageHeader>

    <EntityBaseTable
      :headers="headers"
      :fetcher="fetcher"
      :fetcher-cache-key="String(fetcherCacheKey)"
      :query="filterQuery"
      class="auth-servers-table"
      data-testid="auth-servers-table"
      enable-client-sort
      :error-message="errorMessage"
      @click:row="onRowClick"
      @state="handleStateChange"
    >
      <template #toolbar-filter>
        <KInput
          v-model.trim="filterQuery"
          data-testid="auth-server-filter"
          placeholder="Search auth servers..."
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

      <template #empty-state>
        <KEmptyState
          data-testid="auth-servers-empty-state"
          icon-variant="kong"
          title="No auth servers"
          message="Create your first auth server to get started."
          action-button-text="New auth server"
          @click-action="router.push({ name: 'auth-server-create' })"
        >
          <template #icon>
            <KeyIcon decorative />
          </template>
        </KEmptyState>
      </template>

      <template #name="{ row }">
        <span class="auth-server-name">{{ row.name }}</span>
      </template>

      <template #description="{ row }">
        <KTooltip
          v-if="row.description && row.description.length > 40"
          max-width="300"
          placement="bottom-start"
          :text="row.description"
        >
          <span class="auth-server-description">{{ row.description }}</span>
        </KTooltip>
        <span v-else>{{ row.description || '–' }}</span>
      </template>

      <template #action-items="{ row }">
        <KDropdownItem
          data-testid="view-auth-server"
          :item="{ label: 'View details', to: { name: 'auth-server-overview', params: { id: row.id } } }"
        />
        <KDropdownItem
          data-testid="edit-auth-server"
          :item="{ label: 'Edit', to: { name: 'auth-server-edit', params: { id: row.id } } }"
        />
        <KDropdownItem
          danger
          data-testid="delete-auth-server"
          has-divider
          @click="deletingServer = row"
        >
          Delete
        </KDropdownItem>
      </template>
    </EntityBaseTable>

    <DeleteAuthServerModal
      v-if="deletingServer"
      :auth-server="deletingServer"
      @close="deletingServer = null"
      @deleted="onDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon, KeyIcon, TableColumnsIcon } from '@kong/icons'
import { KButton, KInput, KEmptyState, KTooltip, KDropdownItem } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import type { EntityBaseTableHeader } from '@/components/EntityBaseTable.vue'
import DeleteAuthServerModal from '@/components/auth-servers/DeleteAuthServerModal.vue'
import LaunchLearningHubThroughBookIcon from '@/components/LaunchLearningHubThroughBookIcon.vue'
import { useAuthServerStore } from '@/composables/useAuthServerStore'
import type { AuthServer } from '@/types'

const router = useRouter()
const store = useAuthServerStore()

const breadcrumbs = [
  { key: 'identity', text: 'Identity', to: { name: 'auth-servers-list' } },
]

const headers: EntityBaseTableHeader[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'description', label: 'Description' },
  { key: 'audience', label: 'Audience' },
  { key: 'clients_count', label: 'Clients' },
  { key: 'scopes_count', label: 'Scopes' },
  { key: 'claims_count', label: 'Claims' },
]

const filterQuery = ref('')
const fetcherCacheKey = ref(0)
const errorMessage = ref<string | null>(null)
const deletingServer = ref<AuthServer | null>(null)

watch(filterQuery, () => { fetcherCacheKey.value++ })

const fetcher = async ({ page, pageSize }: { page: number; pageSize: number }) => {
  const all = filterQuery.value ? store.filter(filterQuery.value) : store.getAll()
  const start = ((page || 1) - 1) * (pageSize || 10)
  return {
    data: all.slice(start, start + (pageSize || 10)),
    total: all.length,
  }
}

const handleStateChange = (state: any) => {
  if (state === 'error') errorMessage.value = 'Failed to load auth servers.'
}

const onRowClick = (row: AuthServer) => {
  router.push({ name: 'auth-server-overview', params: { id: row.id } })
}

const onDeleted = () => {
  deletingServer.value = null
  fetcherCacheKey.value++
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.auth-servers-list {
  .auth-server-name {
    font-weight: $kui-font-weight-semibold;
  }

  .auth-server-description {
    display: inline-block;
    max-width: 30ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
