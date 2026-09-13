# Detail Page Template

A resource detail page with context card (AppAboutSection), tabs, configuration display, and related entity tables.

## Architecture (matches production)

```
┌──────────────────────────────────────────────────────┐
│ AppPageHeader (breadcrumbs + title + actions dropdown)│
│ (built-in margin-bottom: $kui-space-70)               │
├───────────────────────────────────────────────────────┤
│                                                        │
│ ┌── KAlert (conditional error) ────────────────────┐  │
│ │ margin-bottom: $kui-space-60                      │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌── AppAboutSection (context card) ────────────────┐  │
│ │ Title + timestamps + edit button                  │  │
│ │ KCopy badges (name, ID) + metadata               │  │
│ │ margin-bottom: $kui-space-70                      │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ ┌── KTabs ─────────────────────────────────────────┐  │
│ │ margin-top: $kui-space-40                         │  │
│ │ [ Configuration | Plugins | Analytics ]           │  │
│ │                                                    │  │
│ │ Tab: Configuration                                 │  │
│ │  ┌── KCard (config card) ──────────────────────┐  │  │
│ │  │ key-value rows (ConfigCardDisplay)           │  │  │
│ │  └─────────────────────────────────────────────┘  │  │
│ │                                                    │  │
│ │ Tab: Plugins                                       │  │
│ │  ┌── PluginsList (sub-component) ──────────────┐  │  │
│ │  │ EntityBaseTable with plugin data             │  │  │
│ │  └─────────────────────────────────────────────┘  │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ DeleteModal (sibling at bottom)                        │
└───────────────────────────────────────────────────────┘
```

## Key Patterns from Production

### Context Card: AppAboutSection

Production uses `AppAboutSection` (from `@kong-ui-public/app-layout`) for the "About" section. It handles title, timestamps, description, loading, and badge layout. Extract this to a sub-component.

### Tabs: Route-Based Hashes

Production tabs use route-based hashes so the URL reflects the active tab:
```typescript
const tabs = computed(() => [
  { hash: '#configuration', title: 'Configuration' },
  { hash: '#plugins', title: 'Plugins' },
  { hash: '#analytics', title: 'Analytics', disabled: !hasAnalytics.value },
])
```

### Configuration Display: EntityBaseConfigCard

Production uses `EntityBaseConfigCard` with a format selector (JSON/YAML/Terraform). For the prototype, use `KCard` + `ConfigCardDisplay` to render key-value rows.

### Actions: KDropdown in Header

Production puts Edit/Delete in a `KDropdown` with `trigger-text="Actions"` in the AppPageHeader `#actions` slot. Often extracted to a sub-component.

### Delete Modal: Sibling at Bottom

Delete modal is a sibling element at the bottom of the template, not nested inside any section.

## Code Template

```vue
<template>
  <div class="model-details-page">
    <AppPageHeader :breadcrumbs="breadcrumbs" :title="entity?.name || ''">
      <template #title-before>
        <SparklesIcon :color="KUI_COLOR_TEXT_DECORATIVE_AQUA" :size="KUI_ICON_SIZE_40" />
      </template>
      <template #actions>
        <KDropdown
          :kpop-attributes="{ placement: 'bottom-end' }"
          show-caret
          trigger-text="Actions"
        >
          <template #items>
            <KDropdownItem @click="handleEdit">Edit</KDropdownItem>
            <KDropdownItem danger has-divider @click="showDeleteModal = true">
              Delete
            </KDropdownItem>
          </template>
        </KDropdown>
      </template>
    </AppPageHeader>

    <!-- Loading state -->
    <KSkeleton v-if="isLoading" :delay-milliseconds="200" type="card" />

    <!-- Error state -->
    <KEmptyState
      v-else-if="hasError"
      action-button-text="Go back"
      icon-variant="error"
      message="Unable to load this resource."
      title="Something went wrong"
      @click-action="router.back()"
    />

    <!-- Content -->
    <template v-else-if="entity">
      <!-- Context card -->
      <section class="about-section">
        <AppAboutSection
          :created="formatDate(entity.created_at)"
          :description="entity.description"
          :modified="formatDate(entity.updated_at)"
          title="About model"
        >
          <template #actions>
            <KTooltip text="Edit">
              <KButton appearance="tertiary" icon @click="handleEdit">
                <EditIcon :color="KUI_COLOR_TEXT_PRIMARY" :size="KUI_ICON_SIZE_30" />
              </KButton>
            </KTooltip>
          </template>

          <div class="context-card-badges">
            <KCopy badge badge-label="Name:" :text="entity.name" truncate />
            <KCopy badge badge-label="ID:" :text="entity.id" truncate />
          </div>
        </AppAboutSection>
      </section>

      <!-- Tabs -->
      <KTabs v-model="activeTab" class="entity-tabs" :tabs="tabs">
        <!-- Configuration tab -->
        <template #configuration>
          <KCard title="Configuration">
            <ConfigCardDisplay :property-collections="configProperties" />
          </KCard>
        </template>

        <!-- Policies tab -->
        <template #policies>
          <PoliciesTable :policies="entity.policies || []" />
        </template>
      </KTabs>
    </template>

    <!-- Delete modal (sibling at bottom) -->
    <KPrompt
      v-if="showDeleteModal"
      action-button-text="Delete"
      destructive
      :message="`Are you sure you want to delete ${entity?.name}?`"
      title="Delete model"
      :visible="showDeleteModal"
      @cancel="showDeleteModal = false"
      @proceed="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  KUI_COLOR_TEXT_DECORATIVE_AQUA,
  KUI_COLOR_TEXT_PRIMARY,
  KUI_ICON_SIZE_40,
  KUI_ICON_SIZE_30,
} from '@kong/design-tokens'
import { SparklesIcon, EditIcon } from '@kong/icons'
import {
  KButton, KCard, KSkeleton, KEmptyState, KTabs,
  KDropdown, KDropdownItem, KTooltip, KCopy, KPrompt,
} from '@kong/kongponents'
import AppPageHeader from '@/components/AppPageHeader.vue'
import AppAboutSection from '@/components/AppAboutSection.vue'
import ConfigCardDisplay from '@/components/ConfigCardDisplay.vue'
import type { PropertyCollection } from '@/components/ConfigCardDisplay.vue'
import PoliciesTable from '@/components/PoliciesTable.vue'
import { useAIGatewayStore } from '@/composables/useAIGatewayStore'

const router = useRouter()
const route = useRoute()
const store = useAIGatewayStore()

const gatewayId = computed(() => route.params.gatewayId as string)
const modelId = computed(() => route.params.modelId as string)
const entity = computed(() => store.getModelById(gatewayId.value, modelId.value))
const isLoading = ref(false)
const hasError = ref(false)
const showDeleteModal = ref(false)

const breadcrumbs = computed(() => [
  { key: 'gateways', to: { name: 'ai-gateway-list' }, text: 'AI Gateways' },
  { key: 'gateway', to: { name: 'ai-gateway-details', params: { id: gatewayId.value } }, text: 'Gateway' },
  { key: 'models', to: { name: 'ai-gateway-models-list', params: { id: gatewayId.value } }, text: 'Models' },
  { key: 'current', text: entity.value?.name || '' },
])

const activeTab = ref('#configuration')
const tabs = [
  { hash: '#configuration', title: 'Configuration' },
  { hash: '#policies', title: 'Policies' },
]

const configProperties = computed<PropertyCollection[]>(() => [
  {
    items: [
      { key: 'provider', label: 'Provider', value: entity.value?.provider },
      { key: 'target_model', label: 'Target model', value: entity.value?.target_model },
      { key: 'route', label: 'Route', value: entity.value?.route },
      { key: 'status', label: 'Status', value: entity.value?.status, type: 'badge-status' },
    ],
  },
])

const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const handleEdit = () => {
  router.push({
    name: 'ai-gateway-model-edit',
    params: { gatewayId: gatewayId.value, modelId: modelId.value },
  })
}

const handleDelete = () => {
  store.deleteModel(gatewayId.value, modelId.value)
  showDeleteModal.value = false
  router.push({ name: 'ai-gateway-models-list', params: { id: gatewayId.value } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

// No root wrapper spacing. AppPageHeader handles its own margin.

.about-section {
  margin-bottom: $kui-space-70;
}

.entity-tabs {
  margin-top: $kui-space-40;
  width: 100% !important;

  // Production pattern: cards/sections inside tab panels get individual bottom margin.
  // Production uses `.k-card:not(:last-child)` when KCards are direct children.
  // Use `> *:not(:last-child)` when tab content has mixed children (sections, divs, cards).
  :deep(.k-tab-panel) {
    > *:not(:last-child) {
      margin-bottom: $kui-space-70;
    }
  }
}

.context-card-badges {
  align-items: center;
  column-gap: $kui-space-70;
  display: flex;
  flex-wrap: wrap;
  row-gap: $kui-space-30;
}
</style>
```

## Key Production Patterns

### AppAboutSection with edit button
```vue
<AppAboutSection :created="date" :modified="date" title="About model">
  <template #actions>
    <KTooltip text="Edit">
      <KButton appearance="tertiary" icon @click="handleEdit">
        <EditIcon :color="KUI_COLOR_TEXT_PRIMARY" :size="KUI_ICON_SIZE_30" />
      </KButton>
    </KTooltip>
  </template>
  <div class="context-card-badges">
    <KCopy badge badge-label="ID:" :text="entity.id" truncate />
  </div>
</AppAboutSection>
```

### Tabs with spacing and card margins
```scss
.entity-tabs {
  margin-top: $kui-space-40;
  width: 100% !important;

  // Cards/sections inside tab panels get individual bottom margin
  :deep(.k-tab-panel) {
    > *:not(:last-child) {
      margin-bottom: $kui-space-70;
    }
  }
}
```

No `padding-top` on tab content — KTabs handles spacing between the tab bar and panel. No `gap` — use individual `margin-bottom` on direct children.

### Configuration display
```vue
<KCard title="Configuration">
  <ConfigCardDisplay :property-collections="configProperties" />
</KCard>
```

### Error alert (before content)
```vue
<KAlert v-if="errorMessage" appearance="danger" class="entity-error" :message="errorMessage" />
```
```scss
.entity-error { margin-bottom: $kui-space-60; }
```

## Checklist

- [ ] Breadcrumbs as prop on AppPageHeader
- [ ] Actions dropdown in header (Edit, Delete)
- [ ] Loading state: KSkeleton
- [ ] Error state: KEmptyState with icon-variant="error"
- [ ] AppAboutSection for context card (timestamps, badges, edit button)
- [ ] `.about-section { margin-bottom: $kui-space-70 }`
- [ ] KTabs with `.entity-tabs { margin-top: $kui-space-40; width: 100% !important; }` and card spacing via `> *:not(:last-child) { margin-bottom: $kui-space-70; }` inside panels
- [ ] No `padding-top` or `gap` on tab content — individual `margin-bottom` only
- [ ] Configuration in KCard + ConfigCardDisplay
- [ ] Related entity tables in tab slots
- [ ] Delete modal as sibling at bottom (KPrompt)
- [ ] No root wrapper spacing
- [ ] All text sentence case
- [ ] All styling uses design tokens
