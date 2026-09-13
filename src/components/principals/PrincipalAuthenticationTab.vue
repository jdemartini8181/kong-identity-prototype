<template>
  <div class="auth-tab">
    <!-- Dev portal principal with no sources: standard empty state layout -->
    <div v-if="isDevPortal && !hasSources" class="table-wrapper dev-portal-empty-wrapper">
      <div class="dev-portal-empty-state">
        <AccountTreeIcon :size="32" decorative class="dev-portal-empty-icon" />
        <p class="dev-portal-empty-title">Authentication</p>
        <p class="dev-portal-empty-message">
          This principal is associated with a Dev Portal application. Manage linked consumers on the application. Linked consumers are displayed here for reference.
        </p>
        <KButton appearance="tertiary" @click="openDevPortalApp">
          View application<ExternalLinkIcon :size="14" decorative />
        </KButton>
      </div>
    </div>

    <!-- Table for all other cases -->
    <div v-else class="table-wrapper">
      <EntityBaseTable
        :fetcher="fetcher"
        :fetcher-cache-key="fetcherCacheKey"
        :headers="tableHeaders"
        :query="searchQuery"
        hide-card
        table-preferences-key="principal-authentication"
        @update:search-input="searchQuery = $event"
      >
        <template #toolbar-filter>
          <KInput
            v-model.trim="searchQuery"
            placeholder="Search"
            type="search"
            class="search-input"
          >
            <template #before>
              <SearchIcon decorative />
            </template>
          </KInput>
        </template>

        <template #type="{ row }">
          {{ getTypeLabel(row) }}
        </template>

        <template #details="{ row }">
          <div class="details-cell">
            <span
              v-for="(item, i) in getDetailItems(row)"
              :key="i"
              class="detail-item"
            >
              <span class="detail-label">{{ item.label }}:</span>
              <span class="detail-value">{{ item.value }}</span>
            </span>
            <span v-if="!getDetailItems(row).length" class="cell-empty">–</span>
          </div>
        </template>

        <template #action-items="{ row }">
          <KDropdownItem danger @click="deleteSource(row)">Delete</KDropdownItem>
        </template>
      </EntityBaseTable>
    </div>
  </div>

  <AddIdentitySourceSlideout
    v-model:visible="slideoutVisible"
    @add="handleSourceAdded"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { SearchIcon, ExternalLinkIcon, AccountTreeIcon } from '@kong/icons'
import { KInput, KDropdownItem, KButton } from '@kong/kongponents'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import AddIdentitySourceSlideout from '@/components/principals/AddIdentitySourceSlideout.vue'
import { usePrincipalStore } from '@/composables/usePrincipalStore'
import { nanoid } from 'nanoid'
import type { Principal, PrincipalIdentitySource } from '@/types'

const props = defineProps<{ principal: Principal }>()

const router = useRouter()
const isDevPortal = computed(() => props.principal.source === 'dev_portal')
const hasSources = computed(() => (props.principal.identity_sources?.length ?? 0) > 0)

function openDevPortalApp() {
  const { href } = router.resolve({ name: 'dev-portal-application', params: { principalId: props.principal.id } })
  window.open(href, '_blank')
}

const store = usePrincipalStore()
const slideoutVisible = ref(false)
const searchQuery = ref('')

const tableHeaders = [
  { key: 'type', label: 'Authentication type', sortable: true },
  { key: 'details', label: 'Details' },
]

const fetcherCacheKey = computed(() =>
  (props.principal.identity_sources || []).map(s => s.id).join(','),
)

const SOURCE_TYPE_LABELS: Record<string, string> = {
  key: 'Key',
  basic_auth: 'Basic auth',
  consumer: 'Consumer linking',
  external_identifier: 'External identifier',
}

function getTypeLabel(source: PrincipalIdentitySource): string {
  if (source.type === 'oauth') {
    return source.oauth_server_type === 'external'
      ? 'OAuth client (external)'
      : 'OAuth client (Kong)'
  }
  return SOURCE_TYPE_LABELS[source.type] || source.type
}

interface DetailItem { label: string; value: string }

function getDetailItems(source: PrincipalIdentitySource): DetailItem[] {
  switch (source.type) {
    case 'key':
      return source.key_id ? [{ label: 'Key ID', value: source.key_id }] : []
    case 'basic_auth':
      return source.username ? [{ label: 'Username', value: source.username }] : []
    case 'oauth':
      if (source.oauth_server_type === 'external') {
        const items: DetailItem[] = []
        if (source.issuer) items.push({ label: 'Issuer', value: source.issuer })
        if (source.client_id) items.push({ label: 'Client ID', value: source.client_id })
        return items
      }
      {
        const items: DetailItem[] = []
        if (source.auth_server) items.push({ label: 'Auth server', value: source.auth_server })
        if (source.oauth_client) items.push({ label: 'Client name', value: source.oauth_client })
        return items
      }
    case 'consumer': {
      const items: DetailItem[] = []
      if (source.control_plane) items.push({ label: 'Control plane', value: source.control_plane })
      if (source.consumer_id) items.push({ label: 'Consumer', value: source.consumer_id })
      return items
    }
    case 'external_identifier':
      return source.ext_name
        ? [{ label: source.ext_name, value: source.ext_value || '–' }]
        : []
    default:
      return []
  }
}

async function fetcher({ query }: { query?: string } = {}) {
  const sources = props.principal.identity_sources || []
  const q = (query || '').toLowerCase().trim()
  const filtered = q
    ? sources.filter(s => {
        const label = getTypeLabel(s).toLowerCase()
        const details = getDetailItems(s)
          .map(d => `${d.label} ${d.value}`)
          .join(' ')
          .toLowerCase()
        return label.includes(q) || details.includes(q)
      })
    : sources
  return { data: filtered, total: filtered.length }
}

function handleSourceAdded(source: Omit<PrincipalIdentitySource, 'id'>) {
  const existing = props.principal.identity_sources || []
  store.update(props.principal.id, {
    identity_sources: [...existing, { id: `is-${nanoid(6)}`, ...source }],
  })
}

defineExpose({ openSlideout: () => { slideoutVisible.value = true } })

function deleteSource(source: PrincipalIdentitySource) {
  const existing = props.principal.identity_sources || []
  store.update(props.principal.id, {
    identity_sources: existing.filter(s => s.id !== source.id),
  })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.table-wrapper {
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  overflow: hidden;
  padding: $kui-space-60;
}

.search-input {
  width: 300px;
}

.details-cell {
  display: flex;
  flex-direction: column;
  gap: $kui-space-10;
}

.detail-item {
  display: flex;
  font-size: $kui-font-size-30;
  gap: $kui-space-20;
  line-height: $kui-line-height-30;
}

.detail-label {
  color: $kui-color-text-neutral;
  flex-shrink: 0;
}

.detail-value {
  color: $kui-color-text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-empty {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-30;
}

.dev-portal-empty-wrapper {
  align-items: center;
  display: flex;
  justify-content: center;
}

.dev-portal-empty-state {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
  padding: $kui-space-100 $kui-space-80;
  text-align: center;
}

.dev-portal-empty-icon {
  color: $kui-color-text-neutral;
}

.dev-portal-empty-title {
  color: $kui-color-text;
  font-size: $kui-font-size-50;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.015em;
  line-height: $kui-line-height-40;
  margin: $kui-space-0;
}

.dev-portal-empty-message {
  color: $kui-color-text-neutral-stronger;
  font-size: $kui-font-size-40;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
  max-width: 331px;
}
</style>
