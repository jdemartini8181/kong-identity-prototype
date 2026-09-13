<template>
  <div class="dev-portal-application-view">
    <div v-if="!principal" class="loading">
      <KSkeletonBox height="2" width="10" />
      <KSkeleton />
    </div>
    <template v-else>
      <AppPageHeader :title="principal.name" :breadcrumbs="breadcrumbs" />

      <!-- About -->
      <div class="about-card">
        <h2 class="about-title">About</h2>
        <div class="about-rows">
          <div class="about-row">
            <span class="about-label">Owner</span>
            <span class="about-value">portal-admin</span>
          </div>
          <div class="about-row">
            <span class="about-label">Dev Portal ID</span>
            <KCopy badge :text="principal.dev_portal_id || ''" />
          </div>
          <div class="about-row">
            <span class="about-label">App ID</span>
            <KCopy badge :text="principal.id" />
          </div>
        </div>
      </div>

      <!-- App registrations -->
      <div class="registrations-card">
        <div class="registrations-header">
          <h3 class="registrations-title">App registrations</h3>
        </div>
        <EntityBaseTable
          :fetcher="fetcher"
          :fetcher-cache-key="fetcherCacheKey"
          :headers="tableHeaders"
          hide-card
          table-preferences-key="dev-portal-app-registrations"
        >
          <template #api="{ row }">{{ row.api }}</template>
          <template #linked_consumer="{ row }">
            <KBadge appearance="info">{{ row.linked_consumer }}</KBadge>
          </template>
          <template #request_date="{ row }">{{ row.request_date }}</template>
          <template #status="{ row }">
            <KBadge appearance="success">{{ row.status }}</KBadge>
          </template>
          <template #action-items>
            <KDropdownItem>View details</KDropdownItem>
          </template>
        </EntityBaseTable>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { KSkeleton, KSkeletonBox, KCopy, KBadge, KDropdownItem } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import { usePrincipalStore } from '@/composables/usePrincipalStore'

const route = useRoute()
const store = usePrincipalStore()

const principalId = computed(() => route.params.principalId as string)
const principal = computed(() => store.getById(principalId.value))

onMounted(() => {
  if (!principal.value) {
    store.seed()
  }
})

const breadcrumbs = computed(() => [
  { key: 'dev-portal', text: 'Dev Portal' },
  { key: 'portal-name', text: principal.value?.dev_portal_name || 'Dev Portal' },
  { key: 'access', text: 'Access and approvals' },
  { key: 'applications', text: 'Applications' },
  { key: 'current', text: principal.value?.name || '' },
])

const tableHeaders = [
  { key: 'api', label: 'API', sortable: true },
  { key: 'linked_consumer', label: 'Linked consumer' },
  { key: 'request_date', label: 'Request date', sortable: true },
  { key: 'status', label: 'Status' },
]

const fetcherCacheKey = computed(() =>
  (principal.value?.identity_sources || []).map(s => s.id).join(','),
)

async function fetcher() {
  const data = (principal.value?.identity_sources || [])
    .filter(s => s.type === 'consumer')
    .map((s, i) => ({
      id: s.id,
      api: s.api_name || `API ${i + 1}`,
      linked_consumer: s.consumer_id || '–',
      request_date: 'Apr 2, 2026',
      status: 'Approved',
    }))
  return { data, total: data.length }
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.dev-portal-application-view {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.loading {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

// ─── About card ───────────────────────────────────────────────────────────────

.about-card {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
  padding: $kui-space-70;
}

.about-title {
  color: $kui-color-text;
  font-size: $kui-font-size-50;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.015em;
  line-height: $kui-line-height-40;
  margin: $kui-space-0;
}

.about-rows {
  align-items: center;
  display: flex;
  gap: $kui-space-60;
}

.about-row {
  align-items: center;
  display: flex;
  gap: $kui-space-40;
}

.about-label {
  color: $kui-color-text-neutral;
  flex-shrink: 0;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-20;
}

.about-value {
  color: $kui-color-text;
  font-size: $kui-font-size-20;
  line-height: $kui-line-height-20;
}

// ─── App registrations ────────────────────────────────────────────────────────

.registrations-card {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  overflow: hidden;
}

.registrations-header {
  border-bottom: $kui-border-width-10 solid $kui-color-border;
  padding: $kui-space-60 $kui-space-70;
}

.registrations-title {
  color: $kui-color-text;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-bold;
  letter-spacing: -0.015em;
  line-height: $kui-line-height-30;
  margin: $kui-space-0;
}
</style>
