<template>
  <div class="principal-config-tab">

    <section class="config-section">
      <h3 class="config-section-title">General information</h3>
      <div class="config-rows">
        <div class="config-row">
          <span class="config-row-label">Name</span>
          <span class="config-row-value">{{ principal.name }}</span>
        </div>
        <hr class="config-separator">
        <div class="config-row">
          <span class="config-row-label">Description</span>
          <span class="config-row-value config-row-value--muted">
            {{ principal.description || '—' }}
          </span>
        </div>
        <hr class="config-separator">
        <div class="config-row">
          <span class="config-row-label">ID</span>
          <KCopy badge :text="principal.id" />
        </div>
        <template v-if="Object.keys(principal.labels || {}).length">
          <hr class="config-separator">
          <div class="config-row">
            <span class="config-row-label">Labels</span>
            <div class="labels-wrap">
              <KBadge
                v-for="[key, value] in Object.entries(principal.labels || {})"
                :key="key"
                appearance="neutral"
              >
                {{ key }}: {{ value }}
              </KBadge>
            </div>
          </div>
        </template>
        <hr class="config-separator">
        <div class="config-row">
          <span class="config-row-label">Created</span>
          <span class="config-row-value config-row-value--muted">{{ formattedCreatedAt }}</span>
        </div>
        <template v-if="principal.updated_at">
          <hr class="config-separator">
          <div class="config-row">
            <span class="config-row-label">Last updated</span>
            <span class="config-row-value config-row-value--muted">{{ formattedUpdatedAt }}</span>
          </div>
        </template>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { KCopy, KBadge } from '@kong/kongponents'
import { format } from 'date-fns'
import type { Principal } from '@/types'

const props = defineProps<{ principal: Principal }>()

const formattedCreatedAt = computed(() => {
  try {
    return format(new Date(props.principal.created_at), 'MMM d, yyyy, h:mm a')
  } catch {
    return props.principal.created_at
  }
})

const formattedUpdatedAt = computed(() => {
  if (!props.principal.updated_at) return ''
  try {
    return format(new Date(props.principal.updated_at), 'MMM d, yyyy, h:mm a')
  } catch {
    return props.principal.updated_at
  }
})
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.principal-config-tab {
  display: flex;
  flex-direction: column;
  gap: $kui-space-80;
  max-width: 640px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: $kui-space-50;
}

.config-section-title {
  color: $kui-color-text;
  font-size: $kui-font-size-40;
  font-weight: $kui-font-weight-semibold;
  margin: $kui-space-0;
}

.config-rows {
  background-color: $kui-color-background;
  border: $kui-border-width-10 solid $kui-color-border;
  border-radius: $kui-border-radius-20;
  overflow: hidden;
}

.config-row {
  align-items: baseline;
  display: flex;
  gap: $kui-space-50;
  padding: $kui-space-50 $kui-space-60;
}

.config-row-label {
  color: $kui-color-text-neutral;
  flex-shrink: 0;
  font-size: $kui-font-size-30;
  width: 140px;
}

.config-row-value {
  color: $kui-color-text;
  font-size: $kui-font-size-30;
  font-weight: $kui-font-weight-semibold;
  word-break: break-all;

  &--muted {
    color: $kui-color-text-neutral-strong;
    font-weight: $kui-font-weight-regular;
  }
}

.config-separator {
  border: none;
  border-top: $kui-border-width-10 solid $kui-color-border;
  margin: $kui-space-0;
}

.labels-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: $kui-space-30;
}
</style>
