<template>
  <div class="metadata-tab">
    <div class="metadata-card">
      <!-- Column headers -->
      <div class="metadata-header-row">
        <span class="col-label">Key</span>
        <span class="col-spacer" />
        <span class="col-label col-label--value">Value</span>
        <span class="col-remove-spacer" />
      </div>

      <!-- Rows -->
      <div
        v-for="(row, i) in localRows"
        :key="i"
        class="metadata-row"
      >
        <KInput
          v-model="row.key"
          class="key-input"
          placeholder="e.g., environment"
          @input="markDirty"
        />
        <span class="colon">:</span>
        <KSelect
          v-model="row.value_type"
          :items="VALUE_TYPE_OPTIONS"
          class="type-select"
          @change="markDirty"
        />
        <KInput
          v-model="row.value"
          class="value-input"
          placeholder="Value"
          @input="markDirty"
        />
        <button class="remove-btn" aria-label="Remove row" @click="removeRow(i)">
          <CloseIcon :size="16" decorative />
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="!localRows.length" class="empty-row">
        <span class="empty-text">No metadata. Add a key-value pair to get started.</span>
      </div>

      <!-- Add row -->
      <div class="add-row">
        <KButton appearance="tertiary" size="small" @click="addRow">
          <AddIcon decorative />
          Add metadata
        </KButton>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <KButton
        appearance="primary"
        :disabled="!isDirty"
        @click="saveChanges"
      >
        Save changes
      </KButton>
      <KButton
        appearance="secondary"
        :disabled="!isDirty"
        @click="discardChanges"
      >
        Discard changes
      </KButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { AddIcon, CloseIcon } from '@kong/icons'
import { KButton, KInput, KSelect } from '@kong/kongponents'
import { usePrincipalStore } from '@/composables/usePrincipalStore'
import type { Principal, PrincipalMetadata } from '@/types'

const props = defineProps<{ principal: Principal }>()

const store = usePrincipalStore()
const isDirty = ref(false)

const VALUE_TYPE_OPTIONS = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
]

type LocalRow = { key: string; value: string; value_type: 'string' | 'number' | 'boolean' | 'date_time' | 'list' }

function toLocalRows(metadata: PrincipalMetadata[] | undefined): LocalRow[] {
  return (metadata || []).map(m => ({ ...m }))
}

const localRows = ref<LocalRow[]>(toLocalRows(props.principal.metadata))

watch(
  () => props.principal.metadata,
  (next) => {
    if (!isDirty.value) {
      localRows.value = toLocalRows(next)
    }
  },
)

function markDirty() {
  isDirty.value = true
}

function addRow() {
  localRows.value.push({ key: '', value: '', value_type: 'string' })
  isDirty.value = true
}

function removeRow(index: number) {
  localRows.value.splice(index, 1)
  isDirty.value = true
}

function saveChanges() {
  const clean = localRows.value
    .filter(r => r.key.trim())
    .map(r => ({ key: r.key.trim(), value: r.value, value_type: r.value_type }))
  store.update(props.principal.id, { metadata: clean as PrincipalMetadata[] })
  localRows.value = toLocalRows(clean as PrincipalMetadata[])
  isDirty.value = false
}

function discardChanges() {
  localRows.value = toLocalRows(props.principal.metadata)
  isDirty.value = false
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.metadata-tab {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.metadata-card {
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-30;
  display: flex;
  flex-direction: column;
  gap: $kui-space-60;
  padding: $kui-space-70;
}

// ─── Header row ───────────────────────────────────────────────────────────────

.metadata-header-row {
  align-items: center;
  display: flex;
  gap: $kui-space-50;
}

.col-label {
  color: $kui-color-text-neutral-stronger;
  flex: 1;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
  line-height: $kui-line-height-30;
  max-width: 220px;

  &--value {
    flex: 2;
    max-width: unset;
  }
}

.col-spacer {
  // colon spacer + type select width = ~12px + 12px + 120px
  width: 156px;
  flex-shrink: 0;
}

.col-remove-spacer {
  flex-shrink: 0;
  width: 28px;
}

// ─── Data rows ────────────────────────────────────────────────────────────────

.metadata-row {
  align-items: center;
  display: flex;
  gap: $kui-space-50;
}

.key-input {
  flex: 1;
  max-width: 220px;
  min-width: 0;
}

.colon {
  color: $kui-color-text-neutral;
  flex-shrink: 0;
  font-size: $kui-font-size-40;
}

.type-select {
  flex-shrink: 0;
  width: 120px;
}

.value-input {
  flex: 2;
  min-width: 0;
}

.remove-btn {
  align-items: center;
  background: none;
  border: none;
  color: $kui-color-text-neutral;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 28px;
  justify-content: center;
  padding: $kui-space-0;
  width: 28px;

  &:hover {
    color: $kui-color-text-danger;
  }
}

// ─── Empty / add row ──────────────────────────────────────────────────────────

.empty-row {
  padding: $kui-space-50 $kui-space-0;
}

.empty-text {
  color: $kui-color-text-neutral;
  font-size: $kui-font-size-30;
  line-height: $kui-line-height-30;
}

.add-row {
  padding-top: $kui-space-10;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

.form-actions {
  display: flex;
  gap: $kui-space-50;
}
</style>
