<template>
  <div class="consumer-form-page">
    <AppPageHeader
      :title="isEdit ? 'Edit consumer' : 'New consumer'"
      :breadcrumbs="breadcrumbs"
    />

    <EntityBaseForm
      :is-editing="isEdit"
      :can-submit="isFormValid"
      entity-type="consumer"
      :error-message="errorMessage"
      :save-button-text="isEdit ? 'Save' : 'Create'"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <EntityFormBlock
        :step="1"
        title="Consumer identity"
        description="Define the identity of this consumer. At least one of username or custom ID is required."
      >
        <KInput
          v-model.trim="form.username"
          data-testid="input-username"
          label="Username"
          :label-attributes="{ info: 'A unique username for this consumer.' }"
          placeholder="e.g., mobile-app"
        />

        <KInput
          v-model.trim="form.custom_id"
          data-testid="input-custom-id"
          label="Custom ID"
          :label-attributes="{ info: 'An external identifier for this consumer, useful for mapping to your own user management system.' }"
          placeholder="e.g., user-abc-123"
        />
      </EntityFormBlock>

      <EntityFormBlock
        :step="2"
        title="Tags"
        description="Add tags to organize and filter this consumer."
      >
        <div
          v-for="(tag, idx) in form.tags"
          :key="idx"
          class="list-input-row"
        >
          <KInput
            v-model.trim="form.tags[idx]"
            :data-testid="`tag-${idx}`"
            placeholder="e.g., production"
          />
          <KButton
            appearance="tertiary"
            class="remove-btn"
            @click="form.tags.splice(idx, 1)"
          >
            Remove
          </KButton>
        </div>
        <KButton
          appearance="tertiary"
          class="add-btn"
          data-testid="add-tag-btn"
          @click="form.tags.push('')"
        >
          <AddIcon decorative />
          Add tag
        </KButton>
      </EntityFormBlock>
    </EntityBaseForm>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KInput, KButton } from '@kong/kongponents'
import { AddIcon } from '@kong/icons'
import AppPageHeader from '@/components/AppPageHeader.vue'
import EntityBaseForm from '@/components/EntityBaseForm.vue'
import EntityFormBlock from '@/components/EntityFormBlock.vue'
import { useApiGatewayStore } from '@/composables/useApiGatewayStore'

const route = useRoute()
const router = useRouter()
const store = useApiGatewayStore()

const gatewayId = computed(() => route.params.id as string)
const consumerId = computed(() => route.params.consumerId as string | undefined)
const isEdit = computed(() => !!consumerId.value)
const gateway = computed(() => store.getById(gatewayId.value))
const existing = computed(() => isEdit.value ? store.getConsumerById(gatewayId.value, consumerId.value!) : undefined)

const form = reactive({
  username: existing.value?.username ?? '',
  custom_id: existing.value?.custom_id ?? '',
  tags: existing.value?.tags ? [...existing.value.tags] : [] as string[],
})

const errorMessage = ref('')
const isFormValid = computed(() => !!(form.username.trim() || form.custom_id.trim()))

const breadcrumbs = computed(() => [
  { key: 'api-gateway', text: 'API Gateway', to: { name: 'api-gateway-list' } },
  { key: 'gateway', text: gateway.value?.name ?? gatewayId.value, to: { name: 'api-gateway-consumers', params: { id: gatewayId.value } } },
  { key: 'action', text: isEdit.value ? 'Edit consumer' : 'New consumer' },
])

const handleSubmit = () => {
  errorMessage.value = ''
  try {
    const data = {
      username: form.username || undefined,
      custom_id: form.custom_id || undefined,
      tags: form.tags.filter(t => t.trim()),
    }
    if (isEdit.value && consumerId.value) {
      store.updateConsumer(gatewayId.value, consumerId.value, data)
    } else {
      store.createConsumer(gatewayId.value, data)
    }
    router.push({ name: 'api-gateway-consumers', params: { id: gatewayId.value } })
  } catch {
    errorMessage.value = 'An unexpected error occurred. Try again.'
  }
}

const handleCancel = () => {
  router.push({ name: 'api-gateway-consumers', params: { id: gatewayId.value } })
}
</script>

<style scoped lang="scss">
@use "@kong/design-tokens/tokens/scss/variables" as *;

.consumer-form-page {
  display: flex;
  flex-direction: column;
  gap: $kui-space-70;
}

.list-input-row {
  align-items: center;
  display: flex;
  gap: $kui-space-50;
  margin-bottom: $kui-space-40;

  > :first-child {
    flex: 1;
  }

  .remove-btn {
    color: $kui-color-text-danger;
    flex-shrink: 0;

    &:not(:disabled):hover {
      background: $kui-color-background-danger-weakest !important;
      color: $kui-color-text-danger !important;
    }
  }
}

.add-btn {
  align-self: flex-start;
}
</style>
