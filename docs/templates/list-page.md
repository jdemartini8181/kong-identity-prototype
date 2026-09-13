# List Page Template

A resource list page with search, table, empty state, and action buttons.

## Architecture (matches production)

```
┌─────────────────────────────────────────────────────┐
│ AppPageHeader (breadcrumbs prop + title + actions)   │
│ (built-in margin-bottom: $kui-space-70)              │
├──────────────────────────────────────────────────────┤
│                                                       │
│ Option A: Full-page empty state (v-if no data at all) │
│  ┌── KEmptyState or custom EmptyState component ───┐ │
│  │   icon + title + message + CTA                   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│ Option B: Table (v-else, or v-show)                   │
│  ┌── KCard ─────────────────────────────────────────┐ │
│  │  KTableData                                       │ │
│  │   ┌─ #toolbar ─────────────────────────────────┐ │ │
│  │   │ EntityFilter (search) + [Create] button    │ │ │
│  │   ├─────────────────────────────────────────────┤ │ │
│  │   │ #name  │ #status │ #provider │ #action-items│ │ │
│  │   ├─────────────────────────────────────────────┤ │ │
│  │   │ #empty-state (when filters return 0)        │ │ │
│  │   └─────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────┘ │
│                                                       │
│ DeleteModal (sibling at bottom)                       │
└──────────────────────────────────────────────────────┘
```

## Key Patterns from Production

### Empty State: Two Levels

1. **Full-page empty state** — shown when entity has zero records AND no filters applied. Rendered BEFORE/INSTEAD of the table, not inside it. Often a custom component with illustration.
2. **In-table empty state** — shown when filters return zero results. Rendered via `#empty-state` slot inside KTableData. Uses `KEmptyState` with "Clear search" action.

Production uses `useTableState` to track this:
```typescript
const { handleStateChange, hideTableToolbar: shouldShowEmptyState } = useTableState(() => filterString.value)
```

### Table: KTableData in KCard

Production wraps `KTableData` inside `KCard` directly — NOT through `EntityBaseTable`. The `EntityBaseTable` from `@kong-ui-public/entities-shared` is used by external entity packages, but pages in `konnect-ui-apps` often use `KTableData` directly for more control.

For the prototype, use `EntityBaseTable` (our shim already wraps KCard + KTableData + toolbar).

### Toolbar: EntityFilter or KInput

Production uses `EntityFilter` for the search input. For the prototype, use `KInput` with search icon in the `#toolbar-filter` slot.

### Action Items: EntityTableRowActionDropdown

Production extracts the row action dropdown to its own component. For the prototype, use inline `KDropdownItem` in the `#action-items` slot.

## Code Template

```vue
<template>
  <div class="models-list-page">
    <AppPageHeader :breadcrumbs="breadcrumbs" title="Models">
      <template #title-before>
        <BotIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" :size="KUI_ICON_SIZE_40" />
      </template>
      <template #actions>
        <KButton
          v-if="!shouldShowEmptyState"
          appearance="primary"
          @click="router.push({ name: 'ai-gateway-model-create', params: { id: gatewayId } })"
        >
          <AddIcon decorative />
          New model
        </KButton>
      </template>
    </AppPageHeader>

    <!-- Full-page empty state (no data at all, no filters) -->
    <div v-if="shouldShowEmptyState && !searchQuery">
      <KEmptyState
        action-button-text="Create model"
        icon-variant="kong"
        message="Create your first model to get started."
        title="No models yet"
        @click-action="router.push({ name: 'ai-gateway-model-create', params: { id: gatewayId } })"
      />
    </div>

    <!-- Table (has data, or filtering) -->
    <EntityBaseTable
      v-show="!shouldShowEmptyState || searchQuery"
      :fetcher="fetcher"
      :headers="tableHeaders"
      :hide-toolbar="shouldShowEmptyState"
      :is-loading="isLoading"
      :query="searchQuery"
      table-preferences-key="models-list"
      @click:row="handleRowClick"
      @state="handleStateChange"
      @update:search-input="searchQuery = $event"
    >
      <template #toolbar-filter>
        <KInput
          v-model.trim="searchQuery"
          placeholder="Filter by name"
          type="search"
        >
          <template #before>
            <SearchIcon decorative />
          </template>
        </KInput>
      </template>

      <template #toolbar-button>
        <KButton
          appearance="primary"
          @click="router.push({ name: 'ai-gateway-model-create', params: { id: gatewayId } })"
        >
          <AddIcon decorative />
          New model
        </KButton>
      </template>

      <!-- Name column: icon + name + optional description -->
      <template #name="{ row }">
        <div class="custom-layout-cell">
          <SparklesIcon :size="KUI_ICON_SIZE_30" class="entity-icon" />
          <div class="info-cell">
            <div class="k-table-cell-title truncated">{{ row.name }}</div>
            <div v-if="row.description" class="k-table-cell-description truncated">
              {{ row.description }}
            </div>
          </div>
        </div>
      </template>

      <template #status="{ row }">
        <KBadge :appearance="row.status === 'active' ? 'success' : 'neutral'">
          {{ row.status }}
        </KBadge>
      </template>

      <!-- Action items dropdown -->
      <template #action-items="{ row }">
        <KDropdownItem @click="handleEdit(row)">Edit</KDropdownItem>
        <KDropdownItem
          danger
          has-divider
          @click="entityToDelete = row"
        >
          Delete
        </KDropdownItem>
      </template>

      <!-- In-table empty state (filters returned 0) -->
      <template #empty-state>
        <KEmptyState
          action-button-text="Clear search"
          icon-variant="search"
          message="No results match your filter criteria."
          title="No results found"
          @click-action="searchQuery = ''"
        />
      </template>
    </EntityBaseTable>

    <!-- Delete modal (sibling, outside table) -->
    <KPrompt
      v-if="entityToDelete"
      action-button-text="Delete"
      destructive
      :message="`Are you sure you want to delete ${entityToDelete.name}?`"
      title="Delete model"
      :visible="!!entityToDelete"
      @cancel="entityToDelete = null"
      @proceed="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { KUI_COLOR_TEXT_DECORATIVE_AQUA, KUI_ICON_SIZE_40, KUI_ICON_SIZE_30 } from '@kong/design-tokens'
import { BotIcon, AddIcon, SearchIcon, SparklesIcon } from '@kong/icons'
import { KButton, KInput, KBadge, KEmptyState, KDropdownItem, KPrompt } from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseTable from '@/components/EntityBaseTable.vue'
import { useAIGatewayStore } from '@/composables/useAIGatewayStore'

const router = useRouter()
const route = useRoute()
const store = useAIGatewayStore()

const gatewayId = computed(() => route.params.id as string)
const searchQuery = ref('')
const isLoading = ref(false)
const shouldShowEmptyState = ref(false)
const entityToDelete = ref<any>(null)

const items = computed(() => store.getModelsByGateway(gatewayId.value))

const breadcrumbs = computed(() => [
  { key: 'gateways', to: { name: 'ai-gateway-list' }, text: 'AI Gateways' },
  { key: 'details', to: { name: 'ai-gateway-details', params: { id: gatewayId.value } }, text: 'Gateway' },
  { key: 'models', text: 'Models' },
])

const tableHeaders = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'provider', label: 'Provider' },
  { key: 'created_at', label: 'Created at', sortable: true },
]

const fetcher = async () => ({
  data: items.value,
  total: items.value.length,
})

// Track table state for empty state logic
const handleStateChange = (state: any) => {
  shouldShowEmptyState.value = !state.hasData
}

const handleRowClick = (row: any) => {
  router.push({
    name: 'ai-gateway-model-details',
    params: { gatewayId: gatewayId.value, modelId: row.id },
  })
}

const handleEdit = (row: any) => {
  router.push({
    name: 'ai-gateway-model-edit',
    params: { gatewayId: gatewayId.value, modelId: row.id },
  })
}

const handleDelete = () => {
  if (entityToDelete.value) {
    store.deleteModel(gatewayId.value, entityToDelete.value.id)
    entityToDelete.value = null
  }
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

// No spacing on root wrapper — AppPageHeader handles its own margin.
// Table is the next sibling with no extra margin needed.

.entity-icon {
  color: $kui-color-text-primary;
  flex-shrink: 0;
  margin-right: $kui-space-40;
}
</style>
```

## Key Production Patterns

### Name column with icon + multi-line
```vue
<template #name="{ row }">
  <div class="custom-layout-cell">
    <Icon class="entity-icon" />
    <div class="info-cell">
      <div class="k-table-cell-title truncated">{{ row.name }}</div>
      <div v-if="row.description" class="k-table-cell-description truncated">
        {{ row.description }}
      </div>
    </div>
  </div>
</template>
```

### Hide toolbar when empty (production pattern)
```vue
<EntityBaseTable :hide-toolbar="shouldShowEmptyState" />
```

### Create button visibility
```vue
<!-- Hide in header when showing full-page empty state -->
<KButton v-if="!shouldShowEmptyState" ...>New model</KButton>
```

### Delete modal as sibling
```vue
<!-- Outside the table, at bottom of template -->
<KPrompt v-if="entityToDelete" ... @cancel="entityToDelete = null" @proceed="handleDelete" />
```

## Checklist

- [ ] Breadcrumbs passed as prop to AppPageHeader
- [ ] Create button conditionally hidden when full-page empty state shows
- [ ] Two-level empty state: full-page (no data) + in-table (filtered)
- [ ] `hide-toolbar` prop set when showing empty state
- [ ] `@state` handler tracks whether table has data
- [ ] Name column uses `.custom-layout-cell` + `.info-cell` pattern with `.truncated`
- [ ] Action items in `#action-items` slot (not inline buttons)
- [ ] Delete modal as sibling element (KPrompt or custom modal)
- [ ] No root wrapper spacing — AppPageHeader manages its own margin
- [ ] All text sentence case per content guidelines
- [ ] All styling uses design tokens
