<template>
  <div class="principals-list">

    <!-- Table view -->
    <template v-if="hasPrincipals">
      <AppPageHeader title="Principals" :breadcrumbs="breadcrumbs">
        <template #icon-identity>
          <KeyIcon :size="14" decorative />
        </template>
        <template #actions>
          <LaunchLearningHubThroughBookIcon learning-hub-path="/global/learning-hub/identity" />
          <KButton appearance="primary" @click="createPrincipal">
            <AddIcon decorative />
            Create principal
          </KButton>
        </template>
      </AppPageHeader>

      <div class="table-wrapper">
        <EntityBaseTable
          :fetcher="fetcher"
          :fetcher-cache-key="fetcherCacheKey"
          :headers="tableHeaders"
          :query="searchQuery"
          hide-card
          table-preferences-key="principals"
          @click:row="handleRowClick"
          @update:search-input="searchQuery = $event"
        >
          <template #name="{ row }">
            <div class="name-cell">
              <span class="principal-name">{{ row.name }}</span>
              <WebIcon v-if="row.source === 'dev_portal'" :size="14" decorative class="name-cell-icon" />
            </div>
          </template>

          <template #identity_sources="{ row }">
            <span v-if="row.identity_sources?.length" class="auth-text">{{ getUniqueSourceLabels(row) }}</span>
            <span v-else class="cell-empty">–</span>
          </template>

          <template #metadata="{ row }">
            <div class="badge-cell">
              <template v-if="row.metadata?.length">
                <KBadge
                  v-for="(meta, i) in getVisibleMetadata(row)"
                  :key="i"
                  appearance="neutral"
                >{{ meta.key }}:{{ meta.value }}</KBadge>
                <KBadge v-if="getMetadataOverflow(row) > 0" appearance="neutral">
                  + {{ getMetadataOverflow(row) }}
                </KBadge>
              </template>
              <span v-else class="cell-empty">–</span>
            </div>
          </template>

          <template #labels="{ row }">
            <div class="badge-cell">
              <template v-if="Object.keys(row.labels || {}).length">
                <KBadge
                  v-for="([k, v], i) in getVisibleLabels(row)"
                  :key="i"
                  appearance="neutral"
                >{{ k }}:{{ v }}</KBadge>
                <KBadge v-if="getLabelOverflow(row) > 0" appearance="neutral">
                  + {{ getLabelOverflow(row) }}
                </KBadge>
              </template>
              <span v-else class="cell-empty">–</span>
            </div>
          </template>

          <template #action-items="{ row }">
            <KDropdownItem @click="handleRowClick(row)">View details</KDropdownItem>
            <KDropdownItem danger @click="handleDelete(row)">Delete</KDropdownItem>
          </template>
        </EntityBaseTable>
      </div>
    </template>

    <!-- Empty state (onboarding) -->
    <template v-else>

      <div class="empty-state-wrapper">
        <div class="empty-state-card">

          <div class="hero-image-area">
            <img
              src="@/assets/kong-identity-empty-state.png"
              alt="Kong Identity connects principals — applications, automated jobs, and integrations — to products including API Gateway, Event Gateway, and Dev Portal."
              class="hero-image"
            >
          </div>

          <div class="empty-state-content">
            <h1 class="empty-state-heading">Identity</h1>

            <p class="empty-state-description">
              A principal is how Kong Identity represents the services and applications that authenticate with your APIs. Create one to start securing access.
            </p>
            <div class="empty-state-actions">
              <KButton
                appearance="primary"
                size="large"
                data-testid="create-principal"
                @click="createPrincipal"
              >
                <AddIcon decorative />
                Create principal
              </KButton>
              <KButton
                appearance="secondary"
                size="large"
                data-testid="learn-more"
                @click="openLearningHub('identity')"
              >
                <BookIcon decorative />
                Learn more
              </KButton>
            </div>
          </div>

          <div class="use-cases">
            <div class="use-case-card">
              <AccountTreeIcon :size="20" decorative class="use-case-icon" />
              <div class="use-case-content">
                <h4 class="use-case-title">Centralize authentication</h4>
                <p class="use-case-description">
                  Define and manage authentication for every application and API from a single place.
                </p>
              </div>
            </div>
            <div class="use-case-card">
              <TransformationIcon :size="20" decorative class="use-case-icon" />
              <div class="use-case-content">
                <h4 class="use-case-title">Simplify authentication management</h4>
                <p class="use-case-description">
                  Principals are an alternative to consumers, making authentication easier to manage.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  AddIcon,
  BookIcon,
  AccountTreeIcon,
  TransformationIcon,
  KeyIcon,
  WebIcon,
} from '@kong/icons'
import { KButton, KBadge, KDropdownItem } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import LaunchLearningHubThroughBookIcon from '@/components/LaunchLearningHubThroughBookIcon.vue'
import { usePrincipalStore } from '@/composables/usePrincipalStore'
import { useLearningHub } from '@/composables/useLearningHub'
import type { Principal, PrincipalIdentitySource } from '@/types'

const router = useRouter()
const store = usePrincipalStore()
const { openTo: openLearningHub } = useLearningHub()

const breadcrumbs = [
  { key: 'identity', text: 'Identity', to: { name: 'principals-list' } },
]

const searchQuery = ref('')

const hasPrincipals = computed(() => store.principals.value.length > 0)

const fetcherCacheKey = computed(() =>
  store.principals.value.map(p => p.id).join(','),
)

const tableHeaders = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'identity_sources', label: 'Authentication' },
  { key: 'metadata', label: 'Metadata' },
  { key: 'labels', label: 'Labels' },
]

async function fetcher({ query }: { query?: string } = {}) {
  const items = query ? store.filter(query) : store.getAll()
  return { data: items, total: items.length }
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  key: 'API key',
  basic_auth: 'Basic auth',
  consumer: 'Consumer linking',
  external_identifier: 'External ID',
}

function getSourceTypeLabel(source: PrincipalIdentitySource): string {
  if (source.type === 'oauth') {
    return source.oauth_server_type === 'external'
      ? 'OAuth client (external)'
      : 'OAuth client (Kong)'
  }
  return SOURCE_TYPE_LABELS[source.type] || source.type
}

function getUniqueSourceLabels(row: Principal): string {
  const labels = [...new Set((row.identity_sources || []).map(getSourceTypeLabel))]
  return labels.join(', ')
}

const BADGE_MAX = 2

function getVisibleSources(row: Principal) {
  return (row.identity_sources || []).slice(0, BADGE_MAX)
}
function getSourceOverflow(row: Principal) {
  return Math.max(0, (row.identity_sources?.length ?? 0) - BADGE_MAX)
}

function getVisibleMetadata(row: Principal) {
  return (row.metadata || []).slice(0, BADGE_MAX)
}
function getMetadataOverflow(row: Principal) {
  return Math.max(0, (row.metadata?.length ?? 0) - BADGE_MAX)
}

function getVisibleLabels(row: Principal): [string, string][] {
  return Object.entries(row.labels || {}).slice(0, BADGE_MAX) as [string, string][]
}
function getLabelOverflow(row: Principal) {
  return Math.max(0, Object.keys(row.labels || {}).length - BADGE_MAX)
}

function handleRowClick(row: Principal) {
  router.push({ name: 'principal-detail', params: { id: row.id } })
}

function handleDelete(row: Principal) {
  store.remove(row.id)
}

function createPrincipal() {
  router.push({ name: 'principal-create' })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.principals-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

// ─── Table view ───────────────────────────────────────────────────────────────

.table-wrapper {
  flex: 1;
  margin: 0 0 $kui-space-90;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  overflow: hidden;
  padding: $kui-space-60;
}

.name-cell {
  align-items: center;
  display: flex;
  gap: $kui-space-30;
}

.name-cell-icon {
  color: $kui-color-text-neutral;
  flex-shrink: 0;
}

.principal-name {
  color: $kui-color-text;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
}

.auth-text {
  color: $kui-color-text;
  font-size: $kui-font-size-30;
}

.badge-cell {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-30;
}

.cell-empty {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-30;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

.empty-state-wrapper {
  align-items: flex-start;
  display: flex;
  justify-content: center;
  padding: $kui-space-80;
}

.empty-state-card {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border-transparent;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-90;
  max-width: 742px;
  overflow: hidden;
  padding: $kui-space-110;
  width: 100%;
}

.hero-image-area {
  border-radius: $kui-border-radius-20;
  overflow: hidden;
}

.hero-image {
  display: block;
  width: 100%;
}

.empty-state-content {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $kui-space-60;
  text-align: center;
}


.empty-state-heading {
  color: $kui-color-text;
  font-size: $kui-font-size-80;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.02em;
  line-height: $kui-line-height-60;
  margin: $kui-space-0;
}

.empty-state-description {
  color: $kui-color-text-neutral-strong;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
  max-width: 540px;
}

.empty-state-actions {
  display: flex;
  gap: $kui-space-50;
  justify-content: center;
}

.use-cases {
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-70;
  justify-content: center;
}

.use-case-card {
  background-color: $kui-color-background-neutral-weakest;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
  height: 160px;
  justify-content: flex-start;
  overflow: hidden;
  padding: $kui-space-70;
  width: 312px;
}

.use-case-icon {
  color: $kui-color-text-neutral-strong;
  flex-shrink: 0;
}

.use-case-title {
  color: $kui-color-text;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.use-case-description {
  color: $kui-color-text-neutral;
  display: -webkit-box;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
  max-height: 60px;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>
