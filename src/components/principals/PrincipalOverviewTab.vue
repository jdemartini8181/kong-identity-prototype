<template>
  <div class="overview-cards">

    <!-- Authentication card -->
    <div class="overview-card">
      <div v-if="!(isDevPortal && groupedSources.length === 0)" class="overview-card-header">
        <AccountTreeIcon :size="24" decorative class="card-header-icon" />
        <span class="card-title">Authentication</span>
        <KButton v-if="isDevPortal" appearance="tertiary" size="small" @click="navigateToDevPortalApp">
          View in Dev Portal<ExternalLinkIcon :size="14" decorative />
        </KButton>
        <KButton v-else appearance="tertiary" size="small" @click="emit('navigate', 'authentication')">View all</KButton>
      </div>

      <!-- Dev portal with no sources: standard empty state layout -->
      <template v-if="isDevPortal && groupedSources.length === 0">
        <div class="card-empty-state">
          <AccountTreeIcon :size="32" decorative class="card-empty-icon" />
          <p class="card-empty-title">Authentication</p>
          <p class="card-empty-description">This principal is associated with a Dev Portal application. Manage linked consumers on the application. Linked consumers are displayed here for reference.</p>
          <KButton appearance="tertiary" size="small" @click="navigateToDevPortalApp">
            View application<ExternalLinkIcon :size="14" decorative />
          </KButton>
        </div>
      </template>

      <!-- Normal display: count + table -->
      <template v-else>
        <p class="card-count">{{ identitySourceCount }}</p>

        <div class="card-table">
          <!-- Dev portal: grouped rows with count -->
          <template v-if="isDevPortal">
            <div
              v-for="group in groupedSources"
              :key="group.label"
              class="table-row"
            >
              <button class="table-cell table-cell--link" @click="navigateToDevPortalApp">
                {{ group.label }}<ExternalLinkIcon :size="12" decorative class="link-icon" />
              </button>
              <span class="table-cell table-cell--right">{{ group.count }}</span>
            </div>
          </template>

          <!-- Regular principal: individual rows -->
          <template v-else>
            <div
              v-for="source in principal.identity_sources"
              :key="source.id"
              class="table-row"
            >
              <span class="table-cell">{{ SOURCE_TYPE_LABELS[source.type] }}</span>
              <span class="table-cell table-cell--right table-cell--truncate">{{ getCredentialDisplay(source) }}</span>
            </div>
            <div class="table-row table-row--add">
              <KButton appearance="tertiary" size="small" @click="slideoutVisible = true">
                <AddIcon decorative />
                Add authentication
              </KButton>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- Metadata card -->
    <div class="overview-card">
      <div class="overview-card-header">
        <MetadataIcon :size="24" decorative class="card-header-icon" />
        <span class="card-title">Metadata</span>
        <KButton appearance="tertiary" size="small" @click="emit('navigate', 'metadata')">View all</KButton>
      </div>

      <p class="card-count">{{ metadataCount }}</p>

      <div class="card-table">
        <div
          v-for="(meta, i) in principal.metadata"
          :key="i"
          class="table-row"
        >
          <KBadge appearance="neutral">{{ meta.key }}: {{ meta.value }}</KBadge>
        </div>
        <div class="table-row table-row--add">
          <KButton appearance="tertiary" size="small">
            <AddIcon decorative />
            Add metadata
          </KButton>
        </div>
      </div>
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
import { AddIcon, AccountTreeIcon, MetadataIcon, ExternalLinkIcon } from '@kong/icons'
import { KButton, KBadge } from '@kong/kongponents'
import { nanoid } from 'nanoid'
import AddIdentitySourceSlideout from '@/components/principals/AddIdentitySourceSlideout.vue'
import { usePrincipalStore } from '@/composables/usePrincipalStore'
import type { Principal, PrincipalIdentitySource } from '@/types'

const props = defineProps<{ principal: Principal }>()
const emit = defineEmits<{ (e: 'navigate', tab: string): void }>()

const router = useRouter()

const store = usePrincipalStore()
const slideoutVisible = ref(false)

const SOURCE_TYPE_LABELS: Record<string, string> = {
  key: 'Key',
  basic_auth: 'Basic auth',
  oauth: 'OAuth client',
  consumer: 'Consumer linking',
  external_identifier: 'External identifier',
}

const isDevPortal = computed(() => props.principal.source === 'dev_portal')

const groupedSources = computed(() => {
  const counts: Record<string, number> = {}
  for (const source of props.principal.identity_sources || []) {
    const label = SOURCE_TYPE_LABELS[source.type] || source.type
    counts[label] = (counts[label] || 0) + 1
  }
  return Object.entries(counts).map(([label, count]) => ({ label, count }))
})

function getCredentialDisplay(source: PrincipalIdentitySource): string {
  switch (source.type) {
    case 'key':
      return source.key_id || '–'
    case 'basic_auth':
      return source.username || '–'
    case 'oauth':
      if (source.oauth_server_type === 'external') {
        return source.issuer || '–'
      }
      return source.oauth_client || '–'
    case 'consumer':
      return source.consumer_id || '–'
    case 'external_identifier':
      return source.ext_name && source.ext_value
        ? `${source.ext_name}: ${source.ext_value}`
        : source.ext_name || '–'
    default:
      return '–'
  }
}

function handleSourceAdded(source: Omit<PrincipalIdentitySource, 'id'>) {
  const existing = props.principal.identity_sources || []
  store.update(props.principal.id, {
    identity_sources: [...existing, { id: `is-${nanoid(6)}`, ...source }],
  })
}

const identitySourceCount = computed(() => props.principal.identity_sources?.length ?? 0)
const metadataCount = computed(() => props.principal.metadata?.length ?? 0)

function navigateToDevPortalApp() {
  const { href } = router.resolve({ name: 'dev-portal-application', params: { principalId: props.principal.id } })
  window.open(href, '_blank')
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.overview-cards {
  display: flex;
  gap: $kui-space-70;
}

.overview-card {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: $kui-space-70;
  min-width: 0;
  overflow: hidden;
  padding: $kui-space-70;
}

.overview-card-header {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
  width: 100%;

  .card-header-icon {
    color: $kui-color-text-primary;
    flex-shrink: 0;
  }
}

.card-title {
  color: $kui-color-text;
  flex: 1;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.015em;
  line-height: $kui-line-height-30;
  min-width: 0;
}

.card-count {
  color: $kui-color-text;
  font-feature-settings: 'lnum' 1, 'tnum' 1;
  font-size: $kui-font-size-70;
  font-weight: $kui-font-weight-bold;
  line-height: $kui-line-height-60;
  margin: $kui-space-0;
}

// ─── Card empty state ─────────────────────────────────────────────────────────

.card-empty-state {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
  padding: $kui-space-60 0;
  text-align: center;
  width: 100%;
}

.card-empty-icon {
  color: $kui-color-text-neutral;
}

.card-empty-title {
  color: $kui-color-text;
  font-size: $kui-font-size-50;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.015em;
  line-height: $kui-line-height-40;
  margin: $kui-space-0;
}

.card-empty-description {
  color: $kui-color-text-neutral-stronger;
  font-size: $kui-font-size-40;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}

// ─── Table ────────────────────────────────────────────────────────────────────

.card-table {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.table-row {
  align-items: center;
  border-bottom: $kui-border-width-10 solid $kui-color-border;
  display: flex;
  gap: $kui-space-40;
  height: 39px;

  &--header {
    height: 41px;

    .table-cell {
      color: $kui-color-text-neutral-stronger;
      font-size: $kui-font-size-30;
      font-weight: $kui-font-weight-semibold;
      line-height: $kui-line-height-30;
    }
  }

  &--add {
    // Remove bottom border from last row
    border-bottom: none;
  }
}

.table-cell {
  color: $kui-color-text;
  flex: 1;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
  min-width: 0;

  &--right {
    text-align: right;
  }

  &--link {
    align-items: center;
    background: none;
    border: none;
    color: $kui-color-text-primary;
    cursor: pointer;
    display: inline-flex;
    gap: $kui-space-20;
    padding: $kui-space-0;
    text-align: left;

    &:hover {
      text-decoration: underline;
    }
  }

  &--truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
