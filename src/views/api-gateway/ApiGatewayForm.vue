<template>
  <div class="api-gateway-form-page">
    <AppPageHeader
      :title="isEdit ? 'Edit gateway' : 'New gateway'"
      :breadcrumbs="breadcrumbs"
    />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      entity-type="gateway"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <EntityFormBlock
        :step="1"
        title="Gateway details"
        description="Provide a name, description, and cluster type for this gateway."
      >
        <KInput
          v-model.trim="form.name"
          data-testid="input-name"
          label="Name"
          placeholder="e.g., production-gateway"
          required
        />

        <KTextArea
          v-model.trim="form.description"
          :character-limit="false"
          data-testid="input-description"
          label="Description"
          placeholder="e.g., Primary API gateway for production traffic."
          resizable
          :rows="2"
        />

        <div class="field-group">
          <KLabel>Cluster type</KLabel>
          <div class="radio-options">
            <KRadio
              v-model="form.cluster_type"
              card
              card-orientation="horizontal"
              description="Mix of cloud-hosted control plane and self-managed data planes."
              label="Hybrid"
              selected-value="CLUSTER_TYPE_HYBRID"
            />
            <KRadio
              v-model="form.cluster_type"
              card
              card-orientation="horizontal"
              description="Kong Gateway running as a Kubernetes ingress controller."
              label="KIC"
              selected-value="CLUSTER_TYPE_K8S_INGRESS_CONTROLLER"
            />
            <KRadio
              v-model="form.cluster_type"
              card
              card-orientation="horizontal"
              description="Fully managed, serverless Kong Gateway."
              label="Serverless"
              selected-value="CLUSTER_TYPE_SERVERLESS"
            />
          </div>
        </div>
      </EntityFormBlock>

      <EntityFormBlock
        :step="2"
        title="Labels"
        description="Add key-value labels to organize and filter this gateway."
      >
        <div
          v-for="(label, idx) in form.labels"
          :key="idx"
          class="label-row"
        >
          <KInput
            v-model.trim="label.key"
            :data-testid="`label-key-${idx}`"
            label="Key"
            placeholder="e.g., env"
          />
          <KInput
            v-model.trim="label.value"
            :data-testid="`label-value-${idx}`"
            label="Value"
            placeholder="e.g., production"
          />
          <KButton
            appearance="tertiary"
            class="remove-label-btn"
            :data-testid="`remove-label-${idx}`"
            @click="removeLabel(idx)"
          >
            Remove
          </KButton>
        </div>
        <KButton
          appearance="tertiary"
          class="add-label-btn"
          data-testid="add-label-btn"
          @click="addLabel"
        >
          <AddIcon decorative />
          Add label
        </KButton>
      </EntityFormBlock>
    </EntityBaseForm>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KTextArea, KLabel, KRadio, KButton } from '@kong/kongponents'
import { AddIcon } from '@kong/icons'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useApiGatewayStore } from '@/composables/useApiGatewayStore'
import type { ApiGatewayClusterType } from '@/types'

const route = useRoute()
const router = useRouter()
const store = useApiGatewayStore()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)
const existing = computed(() => isEdit.value ? store.getById(id.value!) : undefined)

const labelEntries = Object.entries(existing.value?.labels ?? {}).map(([key, value]) => ({ key, value }))

const form = reactive({
  name: existing.value?.name ?? '',
  description: existing.value?.description ?? '',
  cluster_type: (existing.value?.cluster_type ?? 'CLUSTER_TYPE_HYBRID') as ApiGatewayClusterType,
  labels: labelEntries.length > 0 ? labelEntries : [] as { key: string; value: string }[],
})

const errorMessage = ref('')
const isFormValid = computed(() => !!form.name.trim())

const breadcrumbs = computed(() => [
  { key: 'api-gateway', text: 'API Gateway', to: { name: 'api-gateway-list' } },
  { key: 'action', text: isEdit.value ? 'Edit gateway' : 'New gateway' },
])

const addLabel = () => form.labels.push({ key: '', value: '' })
const removeLabel = (idx: number) => form.labels.splice(idx, 1)

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    const labels = form.labels
      .filter(l => l.key.trim())
      .reduce((acc, l) => ({ ...acc, [l.key.trim()]: l.value.trim() }), {} as Record<string, string>)
    const data = {
      name: form.name,
      description: form.description || undefined,
      cluster_type: form.cluster_type,
      labels: Object.keys(labels).length > 0 ? labels : undefined,
    }
    if (isEdit.value && id.value) {
      store.update(id.value, data)
      router.push({ name: 'api-gateway-overview', params: { id: id.value } })
    } else {
      const created = store.create(data)
      router.push({ name: 'api-gateway-overview', params: { id: created.id } })
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = () => {
  if (isEdit.value && id.value) {
    router.push({ name: 'api-gateway-overview', params: { id: id.value } })
  } else {
    router.push({ name: 'api-gateway-list' })
  }
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.api-gateway-form-page {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: $kui-space-40;
}

.radio-options {
  display: flex;
  gap: $kui-space-70;
}

.label-row {
  align-items: flex-end;
  display: flex;
  gap: $kui-space-50;

  > :first-child,
  > :nth-child(2) {
    flex: 1;
  }

  .remove-label-btn {
    color: $kui-color-text-danger;
    flex-shrink: 0;
    margin-bottom: $kui-space-0;

    &:not(:disabled):hover {
      background: $kui-color-background-danger-weakest !important;
      color: $kui-color-text-danger !important;
    }
  }
}

.add-label-btn {
  align-self: flex-start;
}
</style>
