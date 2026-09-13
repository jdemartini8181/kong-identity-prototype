<template>
  <div class="event-gateway-list">
    <AppPageHeader title="Event Gateway">
      <template #title-before>
        <EventGradientIcon
          class="header-title-icon"
          :color="KUI_COLOR_TEXT_DECORATIVE_AQUA"
          :size="KUI_ICON_SIZE_40"
          decorative
        />
      </template>
      <template #actions>
        <KButton
          v-if="hasSomeGateways"
          @click="router.push({ name: 'event-gateway-create' })"
        >
          <AddIcon decorative />
          New event gateway
        </KButton>
      </template>
    </AppPageHeader>

    <KCard class="event-gateway-list-card">
      <EntityBaseTable
        :headers="headers"
        :fetcher="fetcher"
        :fetcher-cache-key="String(fetcherCacheKey)"
        :query="filterQuery"
        data-testid="event-gateways-table"
        :hide-toolbar="!hasSomeGateways"
        @click:row="onRowClick"
        @state="handleTableState"
      >
        <template #toolbar-filter>
          <KInput
            v-model.trim="filterQuery"
            placeholder="Search event gateways..."
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
          <div class="custom-layout-cell">
            <EventGradientIcon class="cluster-icon" decorative />
            <div class="info-cell">
              <div class="gateway-name">{{ row.name }}</div>
              <div v-if="row.description" class="gateway-description">{{ row.description }}</div>
            </div>
          </div>
        </template>

        <template #nodes_total="{ row }">
          {{ row.nodes_total }}
        </template>

        <template #virtual_clusters_total="{ row }">
          {{ row.virtual_clusters_total }}
        </template>

        <template #labels="{ row }">
          <div v-if="row.labels && Object.keys(row.labels).length" class="labels-cell">
            <KBadge
              v-for="(val, key) in row.labels"
              :key="key"
              appearance="neutral"
            >{{ key }}:{{ val }}</KBadge>
          </div>
          <span v-else class="cell-empty">—</span>
        </template>

        <template #action-items="{ row }">
          <KDropdownItem
            :item="{ label: 'Edit', to: { name: 'event-gateway-edit', params: { id: row.id } } }"
          />
          <KDropdownItem danger has-divider @click="gatewayToDelete = row">
            Delete
          </KDropdownItem>
        </template>

        <template #empty-state>
          <KEmptyState
            icon-variant="kong"
            title="No event gateways"
            message="Create your first event gateway to get started."
            action-button-text="New event gateway"
            @click-action="router.push({ name: 'event-gateway-create' })"
          >
            <template #icon>
              <EventGradientIcon decorative />
            </template>
          </KEmptyState>
        </template>
      </EntityBaseTable>
    </KCard>

    <KModal
      v-if="gatewayToDelete"
      :title="`Delete ${gatewayToDelete.name}?`"
      action-button-text="Delete"
      action-button-appearance="danger"
      cancel-button-text="Cancel"
      @cancel="gatewayToDelete = null"
      @proceed="handleDelete"
    >
      <p>This action cannot be undone. All data plane nodes, virtual clusters, backend clusters, and listeners associated with this event gateway will also be removed.</p>
    </KModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { EventGradientIcon, AddIcon, SearchIcon, TableColumnsIcon } from '@kong/icons'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA, KUI_ICON_SIZE_40 } from '@kong/design-tokens'
import { KButton, KCard, KInput, KBadge, KEmptyState, KDropdownItem, KModal } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import type { EntityBaseTableHeader } from '@/components/EntityBaseTable.vue'
import { useEventGatewayStore } from '@/composables/useEventGatewayStore'
import type { EventGateway } from '@/types'

const router = useRouter()
const store = useEventGatewayStore()

const filterQuery = ref('')
const fetcherCacheKey = ref(0)
const gatewayToDelete = ref<EventGateway | null>(null)

const hasSomeGateways = computed(() => store.gateways.value.length > 0)

const headers: EntityBaseTableHeader[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'nodes_total', label: 'Data plane nodes', hidable: true },
  { key: 'virtual_clusters_total', label: 'Virtual clusters', hidable: true },
  { key: 'labels', label: 'Labels', hidable: true },
]

const handleTableState = (state: { hasData: boolean }) => {
  // used by hide-toolbar — EntityBaseTable handles this internally
}

const fetcher = async ({ page, pageSize }: { page: number; pageSize: number }) => {
  const all = filterQuery.value ? store.filter(filterQuery.value) : store.getAll()
  const start = ((page || 1) - 1) * (pageSize || 10)
  return {
    data: all.slice(start, start + (pageSize || 10)),
    total: all.length,
  }
}

const onRowClick = (row: EventGateway) => {
  router.push({ name: 'event-gateway-overview', params: { id: row.id } })
}

const handleDelete = () => {
  if (!gatewayToDelete.value) return
  store.remove(gatewayToDelete.value.id)
  gatewayToDelete.value = null
  fetcherCacheKey.value++
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.header-title-icon :deep(svg path) {
  color: currentColor;
  fill: currentColor;
}

.event-gateway-list-card {
  :deep(td) {
    height: 66px;
  }

  .custom-layout-cell {
    align-items: center;
    display: flex;
    width: 100%;

    .cluster-icon {
      flex-shrink: 0;
      margin-right: $kui-space-40;
    }

    .info-cell {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      width: 100%;

      .gateway-name {
        color: $kui-color-text;
        font-size: $kui-font-size-30;
        font-weight: $kui-font-weight-semibold;
        line-height: $kui-line-height-40;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .gateway-description {
        color: $kui-color-text-neutral-stronger;
        font-size: $kui-font-size-20;
        line-height: $kui-line-height-20;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .labels-cell {
    display: flex;
    flex-wrap: wrap;
    gap: $kui-space-20;
  }

  .cell-empty {
    color: $kui-color-text-neutral;
  }
}
</style>
