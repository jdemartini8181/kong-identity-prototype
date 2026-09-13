<template>
  <div class="auth-server-overview">
    <KSkeleton
      v-if="loading"
      :card-count="3"
      type="card"
    />
    <DashboardRenderer
      v-else
      v-model="dashboardDefinition"
      class="auth-server-overview-dashboard"
      data-testid="auth-server-overview-dashboard"
    >
      <!-- Empty states -->
      <template #empty-clients>
        <KEmptyState
          class="dashboard-tile-empty-state"
          data-testid="empty-state-clients"
          message="No clients have been added to this auth server."
        >
          <template #icon>
            <BadgeIcon decorative />
          </template>
          <template #title>
            <span class="title">Clients</span>
          </template>
          <template #action>
            <KButton
              appearance="tertiary"
              :to="{ name: 'auth-server-overview' }"
            >
              <AddIcon decorative />
              Add client
            </KButton>
          </template>
        </KEmptyState>
      </template>

      <template #empty-scopes>
        <KEmptyState
          class="dashboard-tile-empty-state"
          data-testid="empty-state-scopes"
          message="No scopes have been defined for this auth server."
        >
          <template #icon>
            <RuleIcon decorative />
          </template>
          <template #title>
            <span class="title">Scopes</span>
          </template>
          <template #action>
            <KButton
              appearance="tertiary"
              :to="{ name: 'auth-server-overview' }"
            >
              <AddIcon decorative />
              Add scope
            </KButton>
          </template>
        </KEmptyState>
      </template>

      <template #empty-claims>
        <KEmptyState
          class="dashboard-tile-empty-state"
          data-testid="empty-state-claims"
          message="No claims have been configured for this auth server."
        >
          <template #icon>
            <DataInfoAlertIcon decorative />
          </template>
          <template #title>
            <span class="title">Claims</span>
          </template>
          <template #action>
            <KButton
              appearance="tertiary"
              :to="{ name: 'auth-server-overview' }"
            >
              <AddIcon decorative />
              Add claim
            </KButton>
          </template>
        </KEmptyState>
      </template>

      <!-- Data tiles -->
      <template #tile-clients>
        <div class="auth-server-entity-overview-card" data-testid="tile-clients">
          <div class="header">
            <span class="title">Clients</span>
            <KButton appearance="tertiary">View all</KButton>
          </div>
          <span class="count">{{ clients.length }}</span>
          <KTableView
            :data="clients.slice(0, 3)"
            :headers="[{ key: 'name', label: 'Latest clients' }]"
            hide-pagination
          />
        </div>
      </template>

      <template #tile-scopes>
        <div class="auth-server-entity-overview-card" data-testid="tile-scopes">
          <div class="header">
            <span class="title">Scopes</span>
            <KButton appearance="tertiary">View all</KButton>
          </div>
          <span class="count">{{ scopes.length }}</span>
          <KTableView
            :data="scopes.slice(0, 3)"
            :headers="[{ key: 'name', label: 'Latest scopes' }]"
            hide-pagination
          />
        </div>
      </template>

      <template #tile-claims>
        <div class="auth-server-entity-overview-card" data-testid="tile-claims">
          <div class="header">
            <span class="title">Claims</span>
            <KButton appearance="tertiary">View all</KButton>
          </div>
          <span class="count">{{ claims.length }}</span>
          <KTableView
            :data="claims.slice(0, 3)"
            :headers="[{ key: 'name', label: 'Latest claims' }]"
            hide-pagination
          />
        </div>
      </template>
    </DashboardRenderer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { KButton, KEmptyState, KSkeleton, KTableView } from '@kong/kongponents'
import { AddIcon, BadgeIcon, RuleIcon, DataInfoAlertIcon } from '@kong/icons'
import DashboardRenderer from '@/components/DashboardRenderer.vue'
import type { DashboardConfig, TileConfig } from '@/components/DashboardRenderer.vue'
import { useAuthServerStore } from '@/composables/useAuthServerStore'
import type { AuthServerClient, AuthServerScope, AuthServerClaim } from '@/types'

const props = defineProps<{
  authServerId: string
}>()

const store = useAuthServerStore()
const loading = ref(true)

const clients = ref<AuthServerClient[]>([])
const scopes = ref<AuthServerScope[]>([])
const claims = ref<AuthServerClaim[]>([])

onMounted(() => {
  clients.value = store.getClients(props.authServerId)
  scopes.value = store.getScopes(props.authServerId)
  claims.value = store.getClaims(props.authServerId)
  loading.value = false
})

const tileOrder = computed((): string[] => {
  const tiles: string[] = []
  if (clients.value.length) tiles.push('tile-clients')
  else tiles.push('empty-clients')
  if (scopes.value.length) tiles.push('tile-scopes')
  else tiles.push('empty-scopes')
  if (claims.value.length) tiles.push('tile-claims')
  else tiles.push('empty-claims')
  return tiles
})

const dashboardDefinition = computed((): DashboardConfig => ({
  tiles: tileOrder.value.map<TileConfig>((tileId, index) => ({
    id: tileId,
    definition: {
      chart: { type: 'slottable', id: tileId },
      query: {},
    },
    layout: {
      position: { col: index * 2, row: 0 },
      size: { cols: 2, rows: 1, fit_to_content: true },
    },
  })),
}))
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.auth-server-overview-dashboard {
  .dashboard-tile-empty-state {
    padding: $kui-space-110 $kui-space-20;

    .title {
      text-transform: capitalize;
    }
  }

  .auth-server-entity-overview-card {
    display: flex;
    flex-direction: column;
    gap: $kui-space-70;
    padding: $kui-space-70;

    .header {
      align-items: center;
      display: flex;
      gap: $kui-space-20;
      justify-content: space-between;

      .title {
        font-size: $kui-font-size-40;
        font-weight: $kui-font-weight-bold;
        line-height: $kui-line-height-30;
        text-transform: capitalize;
      }
    }

    .count {
      font-size: $kui-font-size-70;
      font-weight: $kui-font-weight-bold;
      line-height: $kui-line-height-60;
    }
  }
}
</style>
